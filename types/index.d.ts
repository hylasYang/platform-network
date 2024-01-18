/**
 * 请求方法类型
 */
export type Method =
  | 'get'
  | 'GET'
  | 'delete'
  | 'DELETE'
  | 'head'
  | 'HEAD'
  | 'options'
  | 'OPTIONS'
  | 'post'
  | 'POST'
  | 'put'
  | 'PUT'
  | 'patch'
  | 'PATCH';

/**
 * 请求头
 */
type CommonRequestHeadersList = 'Accept' | 'Content-Length' | 'User-Agent' | 'Content-Encoding' | 'Authorization';

export type CommonRequestHeaderValue = string | string[] | number | boolean | null;

type ContentType =
  | 'text/html'
  | 'text/plain'
  | 'multipart/form-data'
  | 'application/json'
  | 'application/x-www-form-urlencoded'
  | 'application/octet-stream';

export type RequestHeaders = Partial<
  {
    [Key in CommonRequestHeadersList]: CommonRequestHeaderValue;
  } & {
    'Content-Type': ContentType;
  }
>;

/**
 * 重试配置
 */
export interface IRetryConfig {
  [propName: string]: Array<string> | number;
}

/**
 * 根据域名指定业务错误码配置
 */
interface ByDomainBizConfig {
  [propName: string]: IBizConfig;
}

/**
 * 业务错误码配置
 */
export interface IBizConfig {
  /** 错误码key */
  codeKey?: string;
  /** 错误码正常值 */
  codeNormal?: number | string | Array<number | string>;
  /** 业务异常原因key */
  msgKey?: string;
  /** 业务异常追踪号key */
  traceKey?: string;
  /** 根据域名指定错误码配置 */
  byDomain?: ByDomainBizConfig;
}

/**
 * 错误上报配置
 */
export interface IErrorReportConfig {
  /** 错误上报地址 */
  url: string;
  /** 错误上报参数 */
  params: () => any;
}

/**
 * 网络平台类型
 */
export type platformType = 'web' | 'wx' | 'weex' | 'uni';

/**
 * 创建网络请求实例配置
 */
export interface CreateBaseNetworkConfig<D = any> {
  /** 平台类型: web, wx, weex, uni */
  platform?: platformType;

  /** `baseURL` 将自动加在 `url` 前面，除非 `url` 是一个绝对 URL。 */
  baseURL?: string;

  /** 即将被发送的自定义请求头 */
  headers?: RequestHeaders;

  /** 超时时间 */
  timeout?: number;

  /** 服务器响应的数据类型 */
  responseType?: ResponseType;

  /** 重试配置，数字为当前域名重试次数，数组为可重试的域名列表 */
  retryConfig?: IRetryConfig;

  /** 业务错误码配置 */
  bizConfig?: IBizConfig;

  /** 错误上报配置 */
  errorReportConfig?: D;
}

/**
 * 网络请求配置
 */
export interface BaseNetworkRequestConfig<D = any> extends CreateBaseNetworkConfig {
  url?: string;
  method?: Method | string;
  params?: any;
  data?: D;
}

/**
 * 网络请求响应体
 */
export interface BaseNetworkResponse<T = any, D = any> {
  /** 服务器响应内容 */
  data: T;
  /** 服务器响应内容文本格式 */
  responseText: string;
  /** 来自服务器响应的 HTTP 状态码 */
  status: number;
  /** 服务器响应的头 */
  headers?: any;
  /** 当次请求的配置信息 */
  config?: D;
  /** 网络请求实例（区分平台） */
  request?: any;
  /** 开发者服务器返回的 cookies，格式为字符串数组 */
  cookies?: Array<string>;
  /** 服务器返回的http状态码，异常时才有 */
  responseStatus?: string;
  /** 是否错误，0:成功，1:业务异常，-1:网络异常 */
  hasError?: number;
}

/**
 * 平台网络请求方法
 */
export type PlatfromRequest = (config: BaseNetworkRequestConfig<any>) => Promise<BaseNetworkResponse>;

/**
 * 错误上报网络请求方法
 */
export type ReportRequest = (url: string, data: any) => Promise<any>;

/**
 * 通用网络请求方法
 */
export type CommonRequest = (requestConfig: BaseNetworkRequestConfig<any>, count?: number) => Promise<any>;

/**
 * 网络请求实例化对象方法的配置
 */
export type BaseNetworkMethodConfig = Omit<CreateBaseNetworkConfig, 'platform'>;

/**
 * 网络请求实例
 */
export interface BaseNetwork {
  get(url: string, params?: any, config?: BaseNetworkMethodConfig): Promise<BaseNetworkResponse>;
  post(url: string, data?: any, config?: BaseNetworkMethodConfig): Promise<BaseNetworkResponse>;
  put(url: string, data?: any, config?: BaseNetworkMethodConfig): Promise<BaseNetworkResponse>;
  delete(url: string, params?: any, config?: BaseNetworkMethodConfig): Promise<BaseNetworkResponse>;
  patch(url: string, data?: any, config?: BaseNetworkMethodConfig): Promise<BaseNetworkResponse>;
  head(url: string, params?: any, config?: BaseNetworkMethodConfig): Promise<BaseNetworkResponse>;
  options(url: string, params?: any, config?: BaseNetworkMethodConfig): Promise<BaseNetworkResponse>;
  jsonp(url: string, params?: any): Promise<BaseNetworkResponse>;
}
