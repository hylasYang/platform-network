import { CreateBaseNetworkConfig, BaseNetworkRequestConfig, PlatfromRequest } from '../../types';

declare const weex: any;

type IAnyObject = Record<string, any>;
interface RequestCallbackResult {
  /** number, 返回的状态码 */
  status: number;
  /** 如果状态码在 200-299 之间就为 true */
  ok: boolean;
  /** 状态描述文本 */
  statusText: string;
  /** 返回的数据 */
  data: string;
  /**  HTTP 响应头 */
  header: IAnyObject;
}

const stream = weex.requireModule('stream') || {};

export default function platfromRequest(baseConfig: CreateBaseNetworkConfig<any>): PlatfromRequest {
  const baseNetworkRequest: PlatfromRequest = async (requestConfig: BaseNetworkRequestConfig) => {
    const mergeConfig = { ...baseConfig, ...requestConfig };
    const { url, data, headers, timeout, method } = mergeConfig;

    return new Promise((resolve, reject) => {
      // 请求超时
      const timer = setTimeout(() => {
        clearTimeout(timer);
        reject({
          error: new Error('Timeout'),
          responseText: '',
          responseStatus: 'timeout-unknow',
        });
      }, timeout);

      stream
        .fetch(
          {
            url,
            body: data,
            headers,
            method,
            // 强制使用text
            type: 'text',
          },
          (res: RequestCallbackResult) => {
            clearTimeout(timer);

            // 网络异常
            if (!res.ok) {
              reject({
                ...res,
                responseText: '',
                responseStatus: res.status,
              });
              return;
            }

            resolve({
              ...res,
              responseText: res.data,
            });
          },
        )
        .catch((error: any) => {
          clearTimeout(timer);

          reject({
            error,
            responseText: '',
            responseStatus: '',
          });
        });
    });
  };

  return baseNetworkRequest;
}
