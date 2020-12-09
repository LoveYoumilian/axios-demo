import qs from 'qs';
import parseHeaders from 'parse-headers';
import { AxiosRequestConfig, AxiosResponse } from './types';
import AxiosInterceptorManager, {
  Interceptor,
} from './AxiosInterceptorManager';
let defaults: AxiosRequestConfig = {
  method: 'get',
  timeout: 0,
  headers: {
    common: {
      //针对所以的方法请求生效
      accept: 'application/json', // 指定告诉服务器返回JSON格式
      name: 'testName',
    },
  },
  transformRequest: (data: any, headers: any) => {
    headers['common']['content-type'] = 'application/json';
    return JSON.stringify(data);
  },
  transformResponse: (response: any) => {
    return response?.data || null;
  },
};
let getStyleMethods = ['get', 'head', 'delete', 'options'];
getStyleMethods.forEach((method: string) => {
  defaults.headers![method] = {};
});
let postStyleMethods = ['post', 'put', 'patch'];
postStyleMethods.forEach((method: string) => {
  defaults.headers![method] = {
    'content-type': 'application/json',
  };
});
let allMethods = [...getStyleMethods, ...postStyleMethods];
export default class Axios<T> {
  public defaults: AxiosRequestConfig = defaults;

  public interceptor = {
    request: new AxiosInterceptorManager<AxiosRequestConfig>(),
    response: new AxiosInterceptorManager<AxiosResponse<T>>(),
  };
  // T用来限制相应对象response里的data类型
  request(
    config: AxiosRequestConfig
  ): Promise<AxiosRequestConfig | AxiosResponse<T>> {
    console.log('defaults', defaults);
    // config = Object.assign(this.defaults, config);
    config.headers = Object.assign(this.defaults.headers, config.headers);
    console.log('config', config);

    if (config.transformRequest && config.data) {
      config.data = config.transformRequest(config.data, config.headers);
    }
    const chain: Array<
      Interceptor<AxiosRequestConfig> | Interceptor<AxiosResponse<T>>
    > = [
      {
        onFulfilled: this.dispatchRequest,
        onReject: (error: any) => error,
      },
    ];
    this.interceptor.request.interceptorList.forEach(
      //向数组左侧添加一个元素
      (interceptor: Interceptor<AxiosRequestConfig> | null) => {
        interceptor && chain.unshift(interceptor);
      }
    );
    this.interceptor.response.interceptorList.forEach(
      //向数组右侧添加一个元素
      (interceptor: Interceptor<AxiosResponse<T>> | null) => {
        interceptor && chain.push(interceptor);
      }
    );
    // let promise: Promise<AxiosRequestConfig> = Promise.resolve(config);
    let promise: any = Promise.resolve(config);
    while (chain.length) {
      const { onFulfilled, onReject } = chain.shift()!;
      promise = promise.then(onFulfilled, onReject);
    }
    return promise;
    // console.log('this',this.interceptor.request.interceptorList)
  }
  //定义一个派发请求的方法
  dispatchRequest<T>(config: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return new Promise<AxiosResponse<T>>((resolve, reject) => {
      let { method, url, params, headers, data, timeout } = config;
      // 创建一个连接对象
      let request = new XMLHttpRequest();
      if (params) {
        params = qs.stringify(params);
        url += (url!.indexOf('?') > 0 ? '&' : '?') + params;
      }
      // 打开连接
      request.open(method!, url!, true);
      request.responseType = 'json';
      // 指定一个状态变更函数
      request.onreadystatechange = () => {
        if (request.readyState === 4 && request.status !== 0) {
          if (request.status >= 200 && request.status < 300) {
            // debugger
            let response: AxiosResponse<T> = {
              data: request.response || request.responseText,
              status: request.status,
              statusText: request.statusText,
              headers: parseHeaders(request.getAllResponseHeaders()),
              config,
              request,
            };
            debugger;
            if (config.transformResponse) {
              response = config.transformResponse(response);
            }
            resolve(response);
          } else {
            reject(`Error:Request failed with status code ${request.status}`);
          }
        }
      };
      // if (headers) {
      //   for (let key in headers) {
      //     request.setRequestHeader(key, headers[key]);
      //   }
      // }
      if (headers) {
        for (let key in headers) {
          if (key === 'common' || allMethods.includes(key)) {
            if (key === 'common' || key === config.method) {
              for (const key2 in headers[key]) {
                request.setRequestHeader(key2, headers[key][key2]);
              }
            }
          } else {
            request.setRequestHeader(key, headers[key]);
          }
        }
      }
      let body: string | null = null;
      if (data) {
        body = JSON.stringify(data);
      }
      request.onerror = () => {
        reject(new Error('net::ERR_INTERNET_DISCONNECTED'));
      };
      if (timeout) {
        request.timeout = timeout;
        request.ontimeout = () => {
          reject(new Error(`Error: timeout of ${timeout}ms exceeded`));
        };
      }
      if (config.cancelToken) {
        config.cancelToken.then((message: string) => {
          request.abort();
          reject(message);
        });
      }
      //发送连接
      request.send(body);
    });
  }
}
