/**
 * axios封装
 */
import axios from "axios";
import storage from "./storage";
import router from "@/router";
import { Message } from "element-ui";

/**
 * 跳转登录页
 * 携带当前页面路由，以期在登录页面完成登录后返回当前页面
 */
const toLogin = () => {
  router.replace({
    path: "/login",
    query: {
      redirect: router.currentRoute.fullPath
    }
  });
};

/**
 * 请求失败后的错误统一处理
 * @param {Number} status 请求失败的状态码
 */
const errorHandle = (status, other) => {
  //状态码判断
  switch (status) {
    // 401: 未登录状态，跳转登录页
    case 401:
      Message.warning("请先登录");
      toLogin();
      break;
    // 403 token过期
    // 清除token并跳转登录页
    case 403:
      Message.warning("登录过期，请重新登录");
      storage.remove("token");
      setTimeout(() => {
        toLogin();
      }, 1000);
      break;
    // 404请求不存在
    case 404:
      Message.warning("请求的资源不存在");
      break;
    default:
      Message.warning(other);
  }
};

/**
 * 创建axios实例
 */
let http = axios.create({
  timeout: 30 * 1000,
  headers: {
    "Content-Type": "application/json;charset=UTF-8"
  }
});

/**
 * 请求拦截器
 * 每次请求前，如果存在token则在请求头中携带token
 */
http.interceptors.request.use(
  config => {
    // 登录流程控制中，根据本地是否存在token判断用户的登录情况
    // 但是即使token存在，也有可能token是过期的，所以在每次的请求头中携带token
    // 后台根据携带的token判断用户的登录情况，并返回给我们对应的状态码
    // 而后我们可以在响应拦截器中，根据状态码进行一些统一的操作。
    const token = storage.get("token");
    token && (config.headers.Authorization = "Bearer " + token);
    return config;
  },
  error => Promise.error(error)
);

/**
 * 响应拦截器
 */
http.interceptors.response.use(
  //请求成功
  res => (res.status === 200 ? Promise.resolve(res) : Promise.reject(res)),
  //请求失败
  error => {
    const { response } = error;
    if (response) {
      //请求已发出，但是不在2xx范围
      errorHandle(response.status, response.data.message);
      return Promise.reject(response);
    } else {
      // 处理断网的情况
      // eg:请求超时或断网时，更新state的network状态
      // network状态在app.vue中控制着一个全局的断网提示组件的显示隐藏
      // 关于断网组件中的刷新重新获取数据，会在断网组件中说明
      if (!window.navigator.onLine) {
        Message.warning("网路已断开");
      } else {
        Message.warning("无法连接服务器");
        return Promise.reject(error);
      }
    }
  }
);

export default http;
