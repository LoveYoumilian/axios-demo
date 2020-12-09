// import axios, { AxiosResponse} from 'axios';
import axios, { AxiosResponse, AxiosRequestConfig } from './axios';
const CancelToken = axios.cancelToken;
const isCancel = axios.isCancel;
const source = CancelToken.source();
const baseUrl = 'http://localhost:8080';
interface User {
  name: string;
  passWord: number;
}
const user: User = {
  name: 'daBao',
  passWord: 123456,
};
axios.interceptor.request.use(
  (config: AxiosRequestConfig): AxiosRequestConfig => {
    config.headers && (config.headers.name += '1');
    return config;
  }
);
axios.interceptor.request.use(
  (config: AxiosRequestConfig): AxiosRequestConfig => {
    config.headers && (config.headers.name += '2');
    return config;
  }
);
axios.interceptor.request.use((config: AxiosRequestConfig):
  | AxiosRequestConfig
  | Promise<AxiosRequestConfig> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      config.headers && (config.headers.name += '3');
      resolve(config);
    }, 1000);
  });
});
let response = axios.interceptor.response.use((response: AxiosResponse) => {
  response?.data && response.data.name && (response.data.name += 1);
  return response;
});
axios.interceptor.response.use((response: AxiosResponse) => {
  response?.data && response.data.name && (response.data.name += 2);
  return response;
});
axios.interceptor.response.eject(response);
// axios.interceptors.request
// axios({
//   method: 'get',
//   url: baseUrl + '/get',
//   params: user,
// })
//   .then((response: AxiosResponse) => {
//     console.log(response);
//     return response.data;
//   })
//   .catch((error: any) => {
//     console.log(error);
//   });
// setTimeout(() => {
//   axios({
//     method: 'post',
//     url: baseUrl + '/post',
//     headers: {
//       'content-type': 'application/json',
//     },
//     data: user,
//     // params: user,
//   })
//     .then((response: AxiosResponse) => {
//       console.log(response);
//       return response.data;
//     })
//     .catch((error: any) => {
//       console.log(error);
//     });
// }, 300);
// 错误处理
// setTimeout(() => {
axios<User>({
  method: 'post',
  url: baseUrl + '/post',
  // url: baseUrl + '/post_timeout?timeout=2000',
  // url: baseUrl + '/post_status?code=400',
  headers: {
    // 'content-type': 'application/json',
    // name: 'dabao',
  },
  data: user,
  timeout: 1000,
  transformRequest: (data: '', headers: '') => {
    return null;
  },
  transformResponse: (data: '') => {
    return null;
  },
  // params:user
})
  .then((response: AxiosResponse<User>) => {
    console.log(response);
    return response?.data || '';
  })
  .catch((error: any) => {
    if (isCancel(error)) {
      console.log('isCancel取消请求', error);
    } else {
      console.log(error);
    }
    console.log(error);
  });
// }, 5000);
source.cancel('用户取消了请求');
