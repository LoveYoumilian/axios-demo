import Axios from './Axios';
import { AxiosInstance } from './types';
import { CancelToken, isCancel } from './cancel';
// 创建一个axios实例 axios就是一个函数
const creatInstance = (): AxiosInstance => {
  let context = new Axios(); //this指针上下文
  let instance = Axios.prototype.request.bind(context); //让request的方法的this永远指向context,也就是new Axios()
  instance = Object.assign(instance, Axios.prototype, context); //把Axios的类的实例和类的原型上的方法都拷贝到instance上,也就是request的方法上
  return instance as AxiosInstance;
};
let axios = creatInstance();
axios.cancelToken = new CancelToken();
axios.isCancel = isCancel;
export default axios;
export * from './types';
