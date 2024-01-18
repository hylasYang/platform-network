import { CreateBaseNetworkConfig, BaseNetworkRequestConfig, PlatfromRequest } from '../../types';

declare const uni: any;

type IAnyObject = Record<string, any>;

interface RequestProfile {
  /** SSL建立完成的时间,如果不是安全连接,则值为 0 */
  SSLconnectionEnd: number;
  /** SSL建立连接的时间,如果不是安全连接,则值为 0 */
  SSLconnectionStart: number;
  /** HTTP（TCP） 完成建立连接的时间（完成握手），如果是持久连接，则与 fetchStart 值相等。注意如果在传输层发生了错误且重新建立连接，则这里显示的是新建立的连接完成的时间。注意这里握手结束，包括安全连接建立完成、SOCKS 授权通过 */
  connectEnd: number;
  /** HTTP（TCP） 开始建立连接的时间，如果是持久连接，则与 fetchStart 值相等。注意如果在传输层发生了错误且重新建立连接，则这里显示的是新建立的连接开始的时间 */
  connectStart: number;
  /** DNS 域名查询完成的时间，如果使用了本地缓存（即无 DNS 查询）或持久连接，则与 fetchStart 值相等 */
  domainLookupEnd: number;
  /** DNS 域名查询开始的时间，如果使用了本地缓存（即无 DNS 查询）或持久连接，则与 fetchStart 值相等 */
  domainLookupStart: number;
  /** 评估当前网络下载的kbps */
  downstreamThroughputKbpsEstimate: number;
  /** 评估的网络状态 slow 2g/2g/3g/4g */
  estimate_nettype: string;
  /** 组件准备好使用 HTTP 请求抓取资源的时间，这发生在检查本地缓存之前 */
  fetchStart: number;
  /** 协议层根据多个请求评估当前网络的 rtt（仅供参考） */
  httpRttEstimate: number;
  /** 当前请求的IP */
  peerIP: string;
  /** 当前请求的端口 */
  port: number;
  /** 收到字节数 */
  receivedBytedCount: number;
  /** 最后一个 HTTP 重定向完成时的时间。有跳转且是同域名内部的重定向才算，否则值为 0 */
  redirectEnd: number;
  /** 第一个 HTTP 重定向发生时的时间。有跳转且是同域名内的重定向才算，否则值为 0 */
  redirectStart: number;
  /** HTTP请求读取真实文档结束的时间 */
  requestEnd: number;
  /** HTTP请求读取真实文档开始的时间（完成建立连接），包括从本地读取缓存。连接错误重连时，这里显示的也是新建立连接的时间 */
  requestStart: number;
  /** HTTP 响应全部接收完成的时间（获取到最后一个字节），包括从本地读取缓存 */
  responseEnd: number;
  /** HTTP 开始接收响应的时间（获取到第一个字节），包括从本地读取缓存 */
  responseStart: number;
  /** 当次请求连接过程中实时 rtt */
  rtt: number;
  /** 发送的字节数 */
  sendBytesCount: number;
  /** 是否复用连接 */
  socketReused: boolean;
  /** 当前网络的实际下载kbps */
  throughputKbps: number;
  /** 传输层根据多个请求评估的当前网络的 rtt（仅供参考） */
  transportRttEstimate: number;
}

interface RequestSuccessCallbackResult {
  /** 开发者服务器返回的 cookies，格式为字符串数组
   *
   * 最低基础库： `2.10.0` */
  cookies: string[];
  /** 开发者服务器返回的数据 */
  data: string | IAnyObject | ArrayBuffer;
  /** 开发者服务器返回的 HTTP Response Header
   *
   * 最低基础库： `1.2.0` */
  header: IAnyObject;
  /** 网络请求过程中一些调试信息
   *
   * 最低基础库： `2.10.4` */
  profile: RequestProfile;
  /** 开发者服务器返回的 HTTP 状态码 */
  statusCode: number;
  errMsg: string;
}

interface GeneralCallbackResult {
  errMsg: string;
  errno?: number;
}

export default function platfromRequest(baseConfig: CreateBaseNetworkConfig<any>): PlatfromRequest {
  const baseNetworkRequest: PlatfromRequest = async (requestConfig: BaseNetworkRequestConfig) => {
    const mergeConfig = { ...baseConfig, ...requestConfig };
    const { url, data, headers, timeout, method, responseType } = mergeConfig;

    return new Promise((resolve, reject) => {
      uni.request({
        url,
        data,
        header: headers,
        timeout,
        method,
        responseType: responseType,
        success(res: RequestSuccessCallbackResult) {
          // statusCode非200，网络异常
          if (res.statusCode !== 200) {
            reject({
              ...res,
              responseText: '',
              responseStatus: res.statusCode,
            });
            return;
          }

          resolve({
            data: res.data,
            responseText: JSON.stringify(res.data),
            status: res.statusCode,
            headers: res.header,
            cookies: res.cookies,
          });
        },
        fail: (err: GeneralCallbackResult) => {
          reject({
            ...err,
            responseText: '',
            responseStatus: `xcx-${err.errno || ''}`,
          });
        },
      });
    });
  };

  return baseNetworkRequest;
}
