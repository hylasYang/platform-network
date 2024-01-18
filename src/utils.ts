/**
 * 获取url参数
 */
export const getUrlParams = (url: string) => {
  const params: any = {};

  if (!url.includes('?')) {
    return params;
  }

  const paramsUrl = url.split('?')[1];
  paramsUrl.split('&').forEach((item) => {
    const arr = item.split('=');
    params[arr[0]] = arr[1];
  });

  return params;
};

/**
 * 构建url字符串
 * @param {string} url
 * @param {Object} param
 * @returns
 */
export const buildUrlParams = (url: string, params: any) => {
  if (!params || Object.prototype.toString.call(params) !== '[object Object]') {
    return url;
  }

  const path = url.split('?')[0];

  const queryParams = {
    ...getUrlParams(url),
    ...params,
  };

  const arr: Array<any> = [];
  Object.keys(queryParams).forEach((key) => {
    if (queryParams[key] === void 0 || queryParams[key] === null) {
      return true;
    }

    arr.push(`${key}=${queryParams[key]}`);
  });

  return arr.length ? `${path}?${arr.join('&')}` : path;
};

/**
 * url解析
 */
export const urlParser = (url: string) => {
  const urlMatch = url.match(/^(\w+):\/\/([^/]+)(.*)$/);

  if (!urlMatch) {
    return {};
  }

  return {
    hostname: urlMatch[2],
    pathname: urlMatch[3].split('?')[0],
    search: urlMatch[3].indexOf('?') >= 0 ? urlMatch[3].substring(urlMatch[3].indexOf('?')) : '',
  };
};

/**
 * 获取指定格式的时间
 */
export const getTime = (format = 'YYYYMMDDHHmmss'): string => {
  if (!format) {
    return '';
  }

  const now = new Date();

  const obj = {
    'Y+': now.getFullYear(),
    'M+': now.getMonth() + 1,
    'D+': now.getDate(),
    'H+': now.getHours(),
    'm+': now.getMinutes(),
    's+': now.getSeconds(),
    'ms+': now.getMilliseconds(),
  };

  let dateText = format;
  Object.keys(obj).forEach((key) => {
    let val = `${(obj as any)[key]}`;
    if (val.length === 1) {
      val = `0${val}`;
    }

    dateText = dateText.replace(new RegExp(`(${key})`), val);
  });

  return dateText;
};

export const buildErrorMess = (obj: any) => {
  return Object.keys(obj)
    .map((key) => `${key}=${obj[key]}`)
    .join(',');
};

/**
 * 日志打印
 */
export const log = (...args: any) => {
  try {
    // 某些老设备上，这一行代码会导致浏览器报 Illegal_Invocation 错误
    console.log.apply(this, [`[BaseNetwork Time: ${getTime('HH:mm:ss ms')}] ===>>>`, ...args]);
  } catch (e) {
    console.log(`[BaseNetwork Time: ${getTime('HH:mm:ss ms')}] ===>>>`, ...args);
  }
};
