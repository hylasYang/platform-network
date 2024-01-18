/**
 * 获取指定平台请求方法
 */
import { CreateBaseNetworkConfig, PlatfromRequest } from '../../types';

export default function getPlatfromRequest(createBaseNetworkConfig: CreateBaseNetworkConfig): PlatfromRequest {
  let platfromRequest;

  switch (createBaseNetworkConfig.platform) {
    case 'wx':
      platfromRequest = require('./wx').default;
      break;
    case 'weex':
      platfromRequest = require('./weex').default;
      break;
    case 'uni':
      platfromRequest = require('./uni').default;
      break;
    default:
      platfromRequest = require('./web').default;
      break;
  }

  return platfromRequest(createBaseNetworkConfig);
}
