/**
 * 系统管理 模块接口列表
 */
import base from "./base.js"; //导入接口域名列表
import http from "@/utils/http.js"; //导入http中创建的axios实例

const test = {
  get_something() {
    return http.get(base.hiy + "/test/get_something");
  }
};

export default test;
