/**
 * 网络请求实例化对象
 */
import { BaseNetwork, CommonRequest } from '../types';

export default function createAPI(commonRequest: CommonRequest): BaseNetwork {
  return {
    get(url: string, params = {}, config = {}) {
      return commonRequest({
        url,
        method: 'GET',
        params,
        ...config,
      });
    },
    post(url: string, data = {}, config = {}) {
      return commonRequest({
        url,
        method: 'POST',
        data,
        ...config,
      });
    },
    put(url: string, data = {}, config = {}) {
      return commonRequest({
        url,
        method: 'PUT',
        data,
        ...config,
      });
    },
    delete(url: string, params = {}, config = {}) {
      return commonRequest({
        url,
        method: 'DELETE',
        params,
        ...config,
      });
    },
    patch(url: string, data = {}, config = {}) {
      return commonRequest({
        url,
        method: 'PATCH',
        data,
        ...config,
      });
    },
    head(url: string, params = {}, config = {}) {
      return commonRequest({
        url,
        method: 'HEAD',
        params,
        ...config,
      });
    },
    options(url: string, params = {}, config = {}) {
      return commonRequest({
        url,
        method: 'OPTIONS',
        params,
        ...config,
      });
    },
    jsonp(url: string, params = {}) {
      return commonRequest({
        url,
        method: 'JSONP',
        params,
      });
    },
  };
}
