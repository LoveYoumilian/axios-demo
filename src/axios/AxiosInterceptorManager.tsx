interface OnFulfilled<T> {
  (value: T): T | Promise<T>;
}
interface OnReject {
  (error: any): any;
}
export interface Interceptor<T> { //某一个拦截器
  onFulfilled?: OnFulfilled<T>;
  onReject?: OnReject;
}
// interface AxiosInterceptorManager<T> {
//   use(
//     onFulfilled?: OnFulfilled<T>,
//     onReject?: OnReject
//   ): number;
//   eject(id: number): void;
// }
// T可能是AxiosRequestConfig,也可能是AxiosResponse
class InterceptorManager<T> {
  public interceptorList: Array<Interceptor<T> | null> = [];
  use(
    onFulfilled?: (config: T) => T | Promise<T>,
    onReject?: (error: any) => any
  ): number {
    this.interceptorList.push({
      onFulfilled,
      onReject,
    });
    return this.interceptorList.length - 1;
  }
  eject(id: number): void {
    if (this.interceptorList[id]) {
      this.interceptorList[id] = null;
    }
  }
}
export default InterceptorManager;
