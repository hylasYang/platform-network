import { CreateBaseNetworkConfig, CommonRequest, BaseNetwork, ReportRequest, IBizConfig } from '../types';
import { buildErrorMess, buildUrlParams, getTime, urlParser, log } from './utils';
import { BASE_REQUEST_ERROR } from './const';
import createAPI from './api';
import getPlatfromRequest from './platform';

/**
 * 获取业务错误码配置
 */
const getMergeBizConfig = (bizConfig: any, domain: string) => {
  if (!bizConfig || typeof bizConfig.codeKey === 'undefined' || typeof bizConfig.codeNormal === 'undefined') {
    return;
  }

  // 错误码字段
  let codeKey = bizConfig.codeKey;
  // 业务正常码
  let codeNormal = bizConfig.codeNormal;
  // 错误文案字段
  let msgKey = bizConfig.msgKey;
  // 服务端追踪码字段
  let traceKey = bizConfig.traceKey;

  if (!bizConfig.byDomain || !bizConfig.byDomain[domain]) {
    return {
      codeKey,
      codeNormal,
      msgKey,
      traceKey,
    };
  }

  // 指定当前域名的业务错误码配置
  if (bizConfig.byDomain[domain].codeKey) {
    codeKey = bizConfig.byDomain[domain].codeKey;
  }
  if (bizConfig.byDomain[domain].codeNormal) {
    codeNormal = bizConfig.byDomain[domain].codeNormal;
  }
  if (bizConfig.byDomain[domain].msgKey) {
    msgKey = bizConfig.byDomain[domain].msgKey;
  }
  if (bizConfig.byDomain[domain].traceKey) {
    traceKey = bizConfig.byDomain[domain].traceKey;
  }

  return {
    codeKey,
    codeNormal,
    msgKey,
    traceKey,
  };
};

/**
 * 获取错误上报配置
 */
const getMergeErrorReportConfig = (errorReportConfig: any) => {
  if (!errorReportConfig) {
    return;
  }

  const { url, params } = errorReportConfig;

  return {
    url,
    params: (typeof params === 'function' ? params() : params) || {},
  };
};

/**
 * 业务异常判断
 */
const assertBizError = (res: any, bizConfig: IBizConfig) => {
  if (!bizConfig || typeof bizConfig.codeNormal === 'undefined') {
    return false;
  }

  const resCode = res.data?.[bizConfig.codeKey];

  if (typeof resCode === 'undefined') {
    return false;
  }

  // 统一转数组判断
  const codeNormal: any =
    Object.prototype.toString.call(bizConfig.codeNormal) === '[object Array]'
      ? bizConfig.codeNormal
      : [bizConfig.codeNormal];

  return !codeNormal.includes(resCode);
};

/**
 * 创建网络请求实例
 */
export default function createBaseNetwork(createBaseNetworkConfig: CreateBaseNetworkConfig<any> = {}): BaseNetwork {
  createBaseNetworkConfig.timeout = createBaseNetworkConfig.timeout || 10000;
  createBaseNetworkConfig.baseURL = createBaseNetworkConfig.baseURL || '';

  // 创建请求方法
  const platfromRequest = getPlatfromRequest(createBaseNetworkConfig);

  /**
   * 请求方法 - 错误上报
   */
  const reportRequest: ReportRequest = async (url, data): Promise<any> => {
    return platfromRequest({
      url,
      method: 'POST',
      data: {
        time: getTime(),
        act: 'error',
        logtype: 'error',
        ...data,
      },
    });
  };

  /**
   * 请求方法 - 通用
   */
  const commonRequest: CommonRequest = async (requestConfig, count = 0) => {
    const { url, params, ...restRequestConfig } = requestConfig;

    // 合并配置信息（实例创建时的 && 请求时添加的）
    const mergeConfig = { ...createBaseNetworkConfig, ...restRequestConfig };
    const { baseURL, errorReportConfig, bizConfig, retryConfig } = mergeConfig;

    /** 请求地址（含域名） */
    const requestUrl = buildUrlParams(url.startsWith('http') ? url : baseURL + url, params);
    /** 请求地址拆解 */
    const urlParseParams = urlParser(requestUrl);

    /** 错误上报配置 */
    const mergeErrorReportConfig = getMergeErrorReportConfig(errorReportConfig);

    return platfromRequest({ ...restRequestConfig, url: requestUrl })
      .then((res: any) => {
        const mergeBizConfig = getMergeBizConfig(bizConfig, urlParseParams.hostname);
        const hasBizErr = assertBizError(res, mergeBizConfig);
        // 业务异常
        if (hasBizErr) {
          res.hasError = BASE_REQUEST_ERROR.BIZ_ERROR;

          log('业务异常:', mergeBizConfig, res, requestConfig);

          // 错误上报 - 业务异常
          if (mergeErrorReportConfig) {
            reportRequest(mergeErrorReportConfig.url, {
              errorCode: '2050204',
              errorMess: buildErrorMess({
                request_method: requestConfig.method,
                request_uri: requestUrl,
                request_domain: urlParseParams.hostname,
                request_path: urlParseParams.pathname,
                request_param: urlParseParams.search,
                request_data: requestConfig.method === 'POST' ? JSON.stringify(requestConfig.data) : '',
                response_status: '200',
                response: res.responseText,
                trace_id: mergeBizConfig.traceKey ? res.data?.[mergeBizConfig.traceKey] : '',
                reason: mergeBizConfig.msgKey ? res.data?.[mergeBizConfig.msgKey] : '',
              }),
              serverCode: res.data?.[mergeBizConfig.codeKey],
              ext1: urlParseParams.pathname,
              ext2: '200',
              ext3: urlParseParams.hostname,
              ext4: requestUrl,
              ...mergeErrorReportConfig.params,
            });
          }

          return res;
        }

        res.hasError = BASE_REQUEST_ERROR.SUCCESS;
        return res;
      })
      .catch((err: any) => {
        log('网络异常:', err, requestConfig);
        // 错误上报 - 网络异常
        if (mergeErrorReportConfig) {
          reportRequest(mergeErrorReportConfig.url, {
            errorCode: '2050203',
            errorMess: buildErrorMess({
              request_method: requestConfig.method,
              request_uri: requestUrl,
              request_domain: urlParseParams.hostname,
              request_path: urlParseParams.pathname,
              request_param: urlParseParams.search,
              request_data: requestConfig.method === 'POST' ? JSON.stringify(requestConfig.data) : '',
              response_status: err?.responseStatus || '-1',
              response: err?.responseText,
              trace_id: '',
              reason: '',
            }),
            ext1: urlParseParams.pathname,
            ext2: err?.responseStatus || '-1',
            ext3: urlParseParams.hostname,
            ext4: requestUrl,
            ...mergeErrorReportConfig.params,
          });
        }

        // 重试配置
        const retryValue = retryConfig && retryConfig[urlParseParams.hostname];
        if (retryValue) {
          // 类型为number，则用当前域名重试
          if (typeof retryValue === 'number' && retryValue > count) {
            log('请求重试:', requestUrl, count + 1);
            return commonRequest({ ...restRequestConfig, url: requestUrl }, count + 1);
          }

          // 类型为数组，则替换新的域名重试
          if (Object.prototype.toString.call(retryValue) === '[object Array]' && (retryValue as Array<string>)[count]) {
            const retryUrl = (retryValue as Array<string>)[count] + urlParseParams.pathname + urlParseParams.search;

            log('请求重试:', retryUrl, count + 1);
            return commonRequest({ ...restRequestConfig, url: retryUrl }, count + 1);
          }
        }

        err.retry = count;
        err.hasError = BASE_REQUEST_ERROR.NETWORK_ERROR;

        return err;
      });
  };

  return createAPI(commonRequest);
}
