<template>
  <div id="login">
    <div class="login-wrap">
      <ul class="menu-tab">
        <li
          v-for="item in menuTab"
          :class="{ current: item.current }"
          :key="item.id"
          @click="toggleMenu(item)"
        >
          {{ item.txt }}
        </li>
      </ul>
      <!--表单-->
      <el-form
        :model="ruleForm"
        status-icon
        :rules="rules"
        ref="loginForm"
        class="login-form"
      >
        <el-form-item prop="username" class="item-form">
          <label for="username">邮箱</label>
          <el-input
            id="username"
            type="text"
            v-model="ruleForm.username"
            autocomplete="off"
          ></el-input>
        </el-form-item>
        <el-form-item prop="password" class="item-form">
          <label for="password">密码</label>
          <el-input
            id="password"
            type="password"
            v-model="ruleForm.password"
            autocomplete="off"
          ></el-input>
        </el-form-item>
        <el-form-item
          prop="passwords"
          class="item-form"
          v-show="module === 'register'"
        >
          <label for="passwords">重复密码</label>
          <el-input
            id="passwords"
            type="password"
            v-model="ruleForm.passwords"
            autocomplete="off"
          ></el-input>
        </el-form-item>
        <el-form-item prop="code" class="item-form">
          <label for="code">验证码</label>
          <el-row :gutter="10">
            <el-col :span="15">
              <el-input id="code" v-model="ruleForm.code"></el-input>
            </el-col>
            <el-col :span="9">
              <el-button
                type="success"
                class="block"
                @click="getSms()"
                :disabled="codeButton.status"
                >{{ codeButton.text }}</el-button
              >
            </el-col>
          </el-row>
        </el-form-item>
        <el-form-item>
          <el-button
            type="danger"
            class="login-top block"
            @click="submitForm('loginForm')"
            :disabled="loginButtonStatus"
            >{{ module === "login" ? "登陆" : "注册" }}</el-button
          >
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>
<script>
import api from "@/api/index";
import { reactive, ref, onMounted } from "@vue/composition-api";
import {
  stripScript,
  validatePass,
  validateEmail,
  validateVCode
} from "@/utils/validate";

export default {
  name: "login",
  // setup(props, context) {
  //解构写法
  setup(props, { refs, root }) {
    //这里放置data数据、生命周期、自定义的函数
    /**
     * 验证函数
     */
    let validateUserName = (rule, value, callback) => {
      if (value === "") {
        callback(new Error("请输入用户名"));
      } else if (validateEmail(value)) {
        callback(new Error("用户名格式有误"));
      } else {
        callback();
      }
    };
    let validatePassword = (rule, value, callback) => {
      //过滤特殊字符
      ruleForm.password = stripScript(value);
      value = ruleForm.password;
      if (value === "") {
        callback(new Error("请输入密码"));
      } else if (validatePass(value)) {
        callback(new Error("密码为6至20位数字+字母"));
      } else {
        callback();
      }
    };
    let validatePasswords = (rule, value, callback) => {
      //如果module为login时不做验证
      if (module.value === "login") {
        callback();
      }
      //过滤特殊字符
      ruleForm.passwords = stripScript(value);
      value = ruleForm.passwords;
      if (value === "") {
        callback(new Error("请输入密码"));
      } else if (value != ruleForm.password) {
        callback(new Error("重复密码不正确"));
      } else {
        callback();
      }
    };
    let checkCode = (rule, value, callback) => {
      //过滤特殊字符
      ruleForm.code = stripScript(value);
      value = ruleForm.code;
      if (value === "") {
        callback(new Error("请输入验证码"));
      } else if (validateVCode(value)) {
        callback(new Error("验证码格式有误"));
      } else {
        callback();
      }
    };
    /**
     * 声明数据
     */
    const menuTab = reactive([
      { txt: "登陆", current: true, type: "login" },
      { txt: "注册", current: false, type: "register" }
    ]);
    const module = ref("login");
    const loginButtonStatus = ref(true);
    const codeButton = reactive({
      status: false,
      text: "获取验证码"
    });
    const timer = ref(null);
    const ruleForm = reactive({
      username: "",
      password: "",
      passwords: "",
      code: ""
    });
    const rules = reactive({
      username: [{ validator: validateUserName, trigger: "blur" }],
      password: [{ validator: validatePassword, trigger: "blur" }],
      passwords: [{ validator: validatePasswords, trigger: "blur" }],
      code: [{ validator: checkCode, trigger: "blur" }]
    });

    /**
     * 声明函数
     */
    const toggleMenu = data => {
      refs["loginForm"].resetFields();
      menuTab.forEach(elem => {
        elem.current = false;
      });
      data.current = true;
      module.value = data.type;
    };
    /**
     * 获取验证码
     */
    const getSms = () => {
      if (ruleForm.username == "") {
        root.$message.error("邮箱不能为空！");
        return false;
      }
      if (validateEmail(ruleForm.username)) {
        root.$message.error("邮箱格式有误！");
        return false;
      }
      codeButton.status = true;
      codeButton.text = "发送中";
      api.account
        .getSms({ username: ruleForm.username, module: module.value })
        .then(res => {
          console.log(res);
          if (res.data.resCode == 0) {
            root.$message({
              message: res.data.message,
              type: "success"
            });
            countDown(60);
            loginButtonStatus.value = false;
          } else {
            root.$message.error(res.data.message);
          }
        })
        .catch(err => {
          console.log(err);
        });
    };
    /**
     * 倒计时
     */
    const countDown = number => {
      let time = number;
      timer.value = setInterval(() => {
        time--;
        if (time === 0) {
          clearInterval(timer.value);
          codeButton.status = false;
          codeButton.text = "再次获取";
        } else {
          codeButton.text = `倒计时${time}秒`;
        }
      }, 1000);
    };
    /**
     * 提交表单
     */
    const submitForm = formName => {
      root.$router.push({
        name: "Console"
      });
      console.log(formName);

      // refs[formName].validate(valid => {
      //   if (valid) {
      //     if (module.value === "register") {
      //       api.account
      //         .registerCode({
      //           username: ruleForm.username,
      //           password: ruleForm.password,
      //           code: ruleForm.code,
      //           module: module.value
      //         })
      //         .then(res => {
      //           if (res.data.resCode === 0) {
      //             root.$message({
      //               message: res.data.message,
      //               type: "sucess"
      //             });
      //           } else {
      //             root.$message.error(res.data.message);
      //           }
      //         })
      //         .catch(err => {
      //           console.log(err);
      //         });
      //     } else {
      //       api.account
      //         .login({
      //           LoginName: ruleForm.username,
      //           Password: ruleForm.password
      //         })
      //         .then(res => {
      //           console.log(res);
      //         })
      //         .catch(err => {
      //           console.log(err);
      //         });
      //     }
      //   } else {
      //     console.log("error submit!!");
      //     return false;
      //   }
      // });
    };
    /**
     * 生命周期
     */
    onMounted(() => {});
    /**
     * 将声明的函数全部return
     */
    return {
      menuTab,
      module,
      loginButtonStatus,
      countDown,
      codeButton,
      toggleMenu,
      getSms,
      submitForm,
      ruleForm,
      rules
    };
  }
};
</script>
<style lang="scss" scoped>
#login {
  height: 100vh;
  background-color: #344a5f;
}
.login-wrap {
  width: 330px;
  margin: auto;
}
.menu-tab {
  text-align: center;
  li {
    display: inline-block;
    width: 88px;
    line-height: 36px;
    font-size: 14px;
    color: #fff;
    border-radius: 2px;
    cursor: pointer;
  }
  .current {
    background-color: rgba(0, 0, 0, 0.1);
  }
}
.login-form {
  margin-top: 29px;
  label {
    display: block;
    font-size: 14px;
    color: #fff;
    margin-bottom: 3px;
  }
  .item-form {
    margin-bottom: 3px;
  }
  .block {
    display: block;
    width: 100%;
  }
}
.login-top {
  margin-top: 19px;
}
</style>
