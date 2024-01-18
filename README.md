# 网络组件库

`platform-network` 是大屏前端统一的网络组件库，支持网络请求重试、异常上报等能力。

按使用场景可分为以下 4 种：

- `Vue`、`React`、`原生 js` 框架
- `uniapp` 框架
- `W2A` 框架
- `微信小程序` 框架

## 安装

使用 `npm`：

```bash
npm install platform-network
```

使用 `script`（全局创建了 `createBaseNetwork` 方法）：

```bash
<script src="//lib/platform-network.js"></script>
```

## 使用

创建实例：

```js
import createBaseNetwork from 'platform';

const baseNetwork = createBaseNetwork({
  baseURL: 'https://test.com',
  timeout: 10000,
});
```

发起 GET 请求：

```js
// get请求，第2个参数作为url参数
baseNetwork
  .get('/userInfo', {
    ticket: 'xxx',
  })
  .then((res) => {
    console.log('请求成功：', res);
  })
  .catch((err) => {
    console.log('请求失败：', err);
  });
```

发起 POST 请求：

```js
// post请求，第2个参数作为body参数
baseNetwork
  .post('/useInfo', {
    ticket: '692C5567939832F7ABCF08DA768DC27A',
    invoker: 'jmcp',
  })
  .then((res) => {
    console.log('请求成功：', res);
  })
  .catch((err) => {
    console.log('请求失败：', err);
  });
```

## API

### 创建请求实例

#### createBaseNetwork(createBaseNetworkConfig): `BaseNetwork`

```js
const baseNetwork = createBaseNetwork({
  /** 平台类型: web, wx, weex, uni */
  platform: 'web'

  /** 自动加在 `url` 前面，除非 `url` 是一个绝对 URL。 */
  baseURL: "https://test.com",

  /** 即将被发送的自定义请求头 */
  headers: {'X-Requested-With': 'XMLHttpRequest'},

  /** 超时时间 */
  timeout: 10000,

  /** 服务器响应的数据类型 */
  responseType: 'json'

  /** 域名重试配置，根据域名指定，指定参数可以为数组，可以为数字 */
  retryConfig: {
    "test.com": [
      "https://test1.com",
      "https://test2.com",
    ],
    // "test.com": 2,
  },

  // 业务错误码配置
  bizConfig: {
    /** 错误码key */
    codeKey: "code",
    /** 错误码正常值，支持用数组配置多个 */
    codeNormal: 0,
    // codeNormal: [0, 1],
    /** 业务异常原因key */
    msgKey: "msg",
    /** 业务异常追踪号key */
    traceKey: "seqid",
    /** 根据域名指定错误码配置 */
    byDomain: {
      "test.com": {
        codeKey: "code",
        codeNormal: 0,
      },
    },
  },

  // 错误上报配置
  errorReportConfig: {
    /** 错误上报地址 */
    url: "https://report.com/dispatcher.do",
    /** 错误上报参数，需要返回对象 */
    params: function () {
      return {
        act: "error",
        logtype: "error",
      };
    },
  },
});
```

### 实例方法

以下是`BaseNetwork`实例的方法，指定的配置 `config` 将与创建实例的配置合并且覆盖。

##### baseNetwork.get(url, params, config);

##### baseNetwork.post(url, data, config);

##### baseNetwork.put(url, data, config);

##### baseNetwork.delete(url, params, config);

##### baseNetwork.patch(url, data, config);

##### baseNetwork.head(url, params, config);

##### baseNetwork.options(url, params, config);

##### baseNetwork.jsonp(url, params);

### 请求配置

实例方法只有 `url` 是必需的，`params` 为 `URL` 参数，`data` 是作为请求主体被发送的数据。

实例方法的 `config` 支持的属性如下：

- baseURL
- headers
- timeout
- responseType
- retryConfig
- bizConfig
- errorReportConfig

### 响应结构

单个请求的响应包含以下信息:

```js
{
  /** 服务器响应内容 */
  data: {},

  /** 服务器响应内容文本格式 */
  responseText: '',

  /** 服务器响应的 HTTP 状态码 */
  status: 200,

  /** 服务器响应的头 */
  headers: {},

  /** 当次请求的配置信息 */
  config: {},

  /** 网络请求实例（区分平台） */
  request: {},

  /** 开发者服务器返回的 cookies，格式为字符串数组 */
  cookies: [],

  /** 服务器返回的http状态码，异常时才有 */
  responseStatus: '',

  /** 是否错误，0:成功，1:业务异常，-1:网络异常 */
  hasError: 0,
}
```

### 网络请求重试

当且仅当网络异常时触发，默认关闭，需要根据域名指定是否重试，支持数字和数组（数组项为重试域名）。

#### 网络请求重试打开方式

创建实例时：

```js
const baseNetwork = createBaseNetwork({
  retryConfig: {
    'test.com': ['https://test1.com', 'https://test2.com'],
    // "test.com": 2,
  },
});
```

单词请求时：

```js
baseNetwork.get(
  '/userInfo',
  {
    ticket: 'xxx',
  },
  {
    retryConfig: {
      'test.com': ['https://test1.com', 'https://test2.com'],
      // "test.com": 2,
    },
  },
);
```

### 错误上报

单次请求发生`网络异常`或`业务异常`时触发上报，默认关闭，配置`errorReportConfig`即可打开上报。

#### 网络异常（2050203）

当接口请求出现的网络异常时，且配置了`errorReportConfig`时，则自动触发`网络异常`上报。

可能出现网络异常的场景如下：

- 无法拿到 HTTP 状态码（比如跨域、超时、中止等原因）
- 拿到 HTTP 状态码不为 200

#### 业务异常（2050204）

请求后端接口时，服务端报的各类业务异常（不包括用户网络异常情况），需要同时配置 `errorReportConfig` 和 `bizConfig`打开上报。

#### 业务异常上报时机：

需要前端开发根据当前业务场景判别上报。

不需要上报：

- 该异常需要代码逻辑处理
- 该异常为不需要前端处理的非正常业务场景（比如验证码过期等）

需要上报：

- 若该异常前端无法处理（比如二维码参数失效，前端无法拿到完整的二维码参数，导致后续流程无法继续）
- 前后端解耦异常
