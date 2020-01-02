/**
 * login 模块接口列表
 */
import base from "./base.js"; //导入接口域名列表
import http from "@/utils/http.js"; //导入http中创建的axios实例

const account = {
  //获取验证码
  getSms(params) {
    return http.post(base.sms + "/getSms/", params);
  },
  //登录
  login(params) {
    return http.post(base.hiy + "/account/login", JSON.stringify(params));
  }
};

export default account;
