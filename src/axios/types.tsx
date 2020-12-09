import AxiosInterceptorManager, {
  Interceptor,
} from './AxiosInterceptorManager';
type Methods =
  | 'get'
  | 'GET'
  | 'post'
  | 'POST'
  | 'delete'
  | 'DELETE'
  | 'put'
  | 'PUT'
  | 'options'
  | 'OPTIONS'
  | 'patch'
  | 'PATCH';
export interface AxiosRequestConfig {
  url?: string;
  method?: Methods;
  params?: Record<string, any> | any;
  headers?: Record<string, any>;
  data?: Record<string, any>;
  timeout?: number;
  transformRequest?: (data: any, headers: any) => any;
  transformResponse?: (data: any) => any;
  cancelToken?:any;
  isCancel?: any;
}
//修饰Axios.prototype.request的这个方法
export interface AxiosInstance {
  //Promise的泛型T代表此promise变成成功状态后的resolve的值  resolve(value)
  <T = any>(config: AxiosRequestConfig): Promise<AxiosResponse<T>>;
  interceptor: {
    request: AxiosInterceptorManager<AxiosRequestConfig>;
    response: AxiosInterceptorManager<AxiosResponse>;
  };
  cancelToken: any;
  isCancel: any;
}
export interface AxiosResponse<T = any> {
  // 返回体的接口
  data: T;
  status: number;
  statusText: string;
  headers?: Record<string, any>;
  config?: AxiosRequestConfig;
  request?: XMLHttpRequest;
}
