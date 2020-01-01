<template>
  <div id="login">
    {{ msg }}
  </div>
</template>
<script>
export default {
  data() {
    return {
      msg: "登陆"
    };
  }
};
</script>
<style lang="scss" scoped>
#login {
  height: 100vh;
  background-color: #344a5f;
}
</style>
