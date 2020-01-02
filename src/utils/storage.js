/**
 * 本地缓存
 */
let storage = {
  set(key, value) {
    if (localStorage.getItem(key) != null) {
      localStorage.removeItem(key);
    }
    localStorage.setItem(key, JSON.stringify(value));
  },
  get(key) {
    if (localStorage.getItem(key) != null) {
      return JSON.parse(localStorage.getItem(key));
    } else {
      return "";
    }
  },
  remove(key) {
    if (localStorage.getItem(key) != null) {
      localStorage.removeItem(key);
    }
  }
};

export default storage;
