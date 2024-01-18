import axios, { CreateAxiosDefaults } from 'axios';
import { CreateBaseNetworkConfig, PlatfromRequest, BaseNetworkRequestConfig, BaseNetworkResponse } from '../../types';

const jsonpAdapter = require('axios-jsonp');

export default function platfromRequest(createBaseNetworkConfig: CreateAxiosDefaults): PlatfromRequest {
  const instance = axios.create(createBaseNetworkConfig);

  // 请求拦截
  instance.interceptors.request.use(
    function (config) {
      // 在发送请求之前做些什么
      return config;
    },
    function (error) {
      // 对请求错误做些什么
      return Promise.reject(error);
    },
  );

  // 响应拦截
  instance.interceptors.response.use(
    function (response) {
      // 2xx 范围内的状态码都会触发该函数。
      // 对响应数据做点什么
      return response;
    },
    function (error) {
      // 超出 2xx 范围的状态码都会触发该函数。
      // 对响应错误做点什么
      return Promise.reject(error);
    },
  );

  /**
   * jsonp请求
   */
  const jsonp = async (requestConfig: BaseNetworkRequestConfig): Promise<BaseNetworkResponse> => {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        clearTimeout(timer);
        reject({
          error: new Error('Timeout'),
          responseText: '',
          responseStatus: 'timeout-unknow',
        });
      }, requestConfig.timeout || instance.defaults.timeout);

      instance
        .request({
          url: requestConfig.url,
          adapter: jsonpAdapter,
          params: requestConfig.params,
        })
        .then((res) => {
          clearTimeout(timer);
          resolve({
            data: res.data,
            responseText: JSON.stringify(res.data),
            status: res.status,
            headers: res.headers,
          });
        })
        .catch((error) => {
          clearTimeout(timer);
          reject({
            error,
            responseText: '',
            responseStatus: 'jsonp-unknow',
          });
        });
    });
  };

  /**
   * 通用请求
   */
  const request = async (requestConfig: CreateBaseNetworkConfig): Promise<BaseNetworkResponse> => {
    return new Promise((resolve, reject) => {
      instance
        .request(requestConfig as any)
        .then((res) => {
          resolve({
            data: res.data,
            responseText: JSON.stringify(res.data),
            status: res.status,
            headers: res.headers,
            config: res.config,
            request: res.request,
          });
        })
        .catch((err) => {
          reject({
            ...err,
            responseText: err.request?.response,
            responseStatus: err.response?.status,
          });
        });
    });
  };

  const baseNetworkRequest: PlatfromRequest = async (requestConfig: BaseNetworkRequestConfig) => {
    if (requestConfig.method === 'JSONP') {
      return jsonp(requestConfig);
    }

    return request(requestConfig);
  };

  return baseNetworkRequest;
}
