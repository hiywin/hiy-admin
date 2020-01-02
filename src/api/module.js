/**
 * 系统管理 模块接口列表
 */
import base from "./base.js"; //导入接口域名列表
import http from "@/utils/http.js"; //导入http中创建的axios实例

const sys = {
  getSysModules() {
    return http.get(base.hiy + "/sysmodule/get_sys_modules");
  },
  getSysMudulesPage(data) {
    return http.post(
      base.hiy + "/sysmodule/get_sys_modules_page",
      JSON.stringify(data)
    );
  }
};

export default sys;
