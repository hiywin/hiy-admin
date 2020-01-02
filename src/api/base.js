/**
 * 接口域名管理
 */
const base = {
  hiys: "https://localhost:5001/v1/api",
  hiy: "http://192.168.124.5:5000/v1/api",
  sms: process.env.NODE_ENV === "production" ? "" : "/devApi"
};

export default base;
