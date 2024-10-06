<script setup lang="ts">
import { onMounted, ref, computed } from "vue";
import { ElNotification, ElMessage, ElMessageBox } from "element-plus";
import { indexStore } from "@/stores";
import { userStore } from "@/stores/user";
import router from "@/router/index";
import { userInfo } from "@/services/apis/user";
import {
  useEmailRegisterApi,
  getRegCaptchaApi,
  sendRegCodeApi,
  usePasswordRegisterApi,
  loginWithOAuth2,
  OAuth2SignupEnabled,
  oauth2Platforms
} from "@/services/apis/auth";
import { strLengthLimit, getAppIcon } from "@/utils";
import type { EmailRegForm, RegForm } from "@/types";

const {
  settings,
  isPasswordSignupAllowed,
  isEmailSignupAllowed,
  isOAuth2SignupAllowed,
  isAnySignupAllowed
} = indexStore();
const { getUserInfo: updateUserInfo, updateToken } = userStore();

const { state: userToken, execute: emailRegisterApi } = useEmailRegisterApi();
const { state: captcha, execute: getRegCaptcha, isLoading: captchaLoading } = getRegCaptchaApi();
const { execute: sendRegCode, isLoading: sendRegCodeLoading } = sendRegCodeApi();
const { execute: passwordRegisterApi } = usePasswordRegisterApi();
const { state: oauth2SignupEnabled, execute: getOAuth2SignupEnabled } = OAuth2SignupEnabled();
const { execute: loginOAuth2 } = loginWithOAuth2();

const formData = ref<EmailRegForm & { captchaID: string; answer: string }>({
  email: "",
  password: "",
  captcha: "",
  captchaID: "",
  answer: ""
});

const passwordFormData = ref<RegForm>({
  username: "",
  password: ""
});

const emailProvider = ref(settings?.emailWhitelistEnabled && settings?.emailWhitelist[0]);
const confirmPwd = ref("");
const registerType = ref<"password" | "email" | "oauth2">(
  isPasswordSignupAllowed ? "password" : isEmailSignupAllowed ? "email" : "oauth2"
);

const toSendRegCode = async () => {
  try {
    if (!formData.value.email || !formData.value.answer)
      return ElMessage.error("请填写邮箱或图形验证码");
    const email = settings?.emailWhitelistEnabled
      ? `${formData.value.email}@${emailProvider.value}`
      : formData.value.email;
    const v = await ElMessageBox.confirm(
      `我们将发送验证码到此邮箱：${email}，请确认该邮箱地址是否正确`,
      "警告",
      {
        confirmButtonText: "准确无误！",
        cancelButtonText: "搞错了...",
        type: "warning"
      }
    );
    if (v !== "confirm") return;
    await sendRegCode({
      data: {
        email,
        captchaID: formData.value.captchaID,
        answer: formData.value.answer
      }
    });
    ElMessage.success("验证码发送成功");
  } catch (err: any) {
    console.error(err);
    ElNotification({
      title: "错误",
      message: err.response.data.error || err.message,
      type: "error"
    });
  }
};

const regDisable = ref(false);
const toRegister = async () => {
  if (registerType.value === "email") {
    if (
      !formData.value.email ||
      !formData.value.password ||
      !formData.value.captcha ||
      !formData.value.answer
    ) {
      return ElMessage.error("请填写表单完整");
    }
    if (formData.value.password !== confirmPwd.value)
      return ElMessage.error("两次输入的密码不一致");
    try {
      regDisable.value = true;
      for (const key in formData.value) {
        strLengthLimit(key, 32);
      }
      const email = settings?.emailWhitelistEnabled
        ? `${formData.value.email}@${emailProvider.value}`
        : formData.value.email;
      await emailRegisterApi({
        data: {
          email,
          password: formData.value.password,
          captcha: formData.value.captcha
        }
      });
      if (!userToken.value)
        return ElNotification({
          title: "错误",
          message: "服务器并未返回token",
          type: "error"
        });
      ElNotification({
        title: "注册成功",
        message: "正在尝试自动登录",
        type: "success"
      });
      resetForm();
      updateToken(userToken.value.token);

      const state = await userInfo().execute({
        headers: {
          Authorization: userToken.value?.token ?? ""
        }
      });

      if (state.value) {
        updateUserInfo(state.value);
        localStorage.setItem("uname", state.value.username);
        ElNotification({
          title: "登录成功",
          type: "success"
        });

        router.replace("/");
      }
    } catch (err: any) {
      console.error(err);
      ElNotification({
        title: "错误",
        message: err.response.data.error || err.message,
        type: "error"
      });
    } finally {
      regDisable.value = false;
    }
  } else if (registerType.value === "password") {
    if (!passwordFormData.value.username || !passwordFormData.value.password) {
      return ElMessage.error("请填写表单完整");
    }
    if (passwordFormData.value.password !== confirmPwd.value)
      return ElMessage.error("两次输入的密码不一致");
    try {
      regDisable.value = true;
      for (const key in passwordFormData.value) {
        strLengthLimit(key, 32);
      }
      const result = await passwordRegisterApi({
        data: passwordFormData.value
      });
      if (!result || !result.value?.token)
        return ElNotification({
          title: "错误",
          message: "注册失败",
          type: "error"
        });
      ElNotification({
        title: "注册成功",
        message: "正在尝试自动登录",
        type: "success"
      });
      resetForm();
      updateToken(result.value?.token);
      router.replace("/");
    } catch (err: any) {
      console.error(err);
      ElNotification({
        title: "错误",
        message: err.response.data.error || err.message,
        type: "error"
      });
    } finally {
      regDisable.value = false;
    }
  }
};

const refreshRegCaptcha = async () => {
  await getRegCaptcha();
  if (captcha.value) formData.value.captchaID = captcha.value.captchaID;
};

const resetForm = () => {
  formData.value = {
    email: "",
    password: "",
    captcha: "",
    captchaID: "",
    answer: ""
  };
  passwordFormData.value = {
    username: "",
    password: ""
  };
  confirmPwd.value = "";
};

const handleOAuth2Login = async (platform: string) => {
  try {
    const result = await loginOAuth2({
      url: `/oauth2/login/${platform}`,
      data: {
        redirect: `${window.location.origin}/oauth2/callback`
      }
    });
    if (result.value?.url) {
      window.location.href = result.value.url;
    }
  } catch (error) {
    console.error(error);
    ElNotification({
      title: "错误",
      message: "OAuth2登录失败",
      type: "error"
    });
  }
};

onMounted(async () => {
  if (!isAnySignupAllowed) {
    ElNotification({
      title: "提示",
      message: "暂不允许注册",
      type: "warning"
    });
    router.push("/auth/login");
  } else {
    await refreshRegCaptcha();
    if (isOAuth2SignupAllowed) {
      await getOAuth2SignupEnabled();
    }
  }
});
</script>

<template>
  <div v-if="isAnySignupAllowed" class="room">
    <div class="mb-4">
      <el-radio-group v-model="registerType">
        <el-radio-button v-if="isPasswordSignupAllowed" label="password"
          >账号密码注册</el-radio-button
        >
        <el-radio-button v-if="isEmailSignupAllowed" label="email">邮箱注册</el-radio-button>
        <el-radio-button v-if="isOAuth2SignupAllowed" label="oauth2">第三方注册</el-radio-button>
      </el-radio-group>
    </div>
    <form @submit.prevent="" class="reg-box">
      <template v-if="registerType === 'email'">
        <div
          v-if="settings?.emailWhitelistEnabled"
          class="l-input m-0 -mb-[14px] flex justify-between mx-auto"
          style="width: 70%"
        >
          <input
            v-model="formData.email"
            class="bg-transparent transition-all duration-500 outline-none focus:outline-none w-3/5"
            type="text"
            placeholder="邮箱"
            required
            autocomplete="off"
          />
          <select class="w-3/2" v-model="emailProvider" placeholder="请选择">
            <option v-for="i in settings.emailWhitelist" :key="i" :value="i">@{{ i }}</option>
          </select>
        </div>
        <input
          v-else
          class="l-input a-input"
          type="email"
          v-model="formData.email"
          placeholder="邮箱"
          required
          autocomplete="off"
        />
        <br />
        <input
          class="l-input a-input"
          type="password"
          v-model="formData.password"
          placeholder="密码"
          required
          autocomplete="new-password"
        />
        <br />
        <input
          class="l-input a-input"
          type="password"
          v-model="confirmPwd"
          placeholder="确认密码"
          required
        />
        <br />
        <input
          class="l-input a-input"
          type="text"
          v-model="formData.answer"
          placeholder="图形验证码"
          required
        />
        <div v-if="captchaLoading">
          <el-image>
            <template #error>
              <div>Loading...</div>
            </template>
          </el-image>
        </div>

        <el-image
          v-else
          class="cursor-pointer"
          title="点击刷新"
          :src="captcha?.captchaBase64"
          @click="refreshRegCaptcha"
        />
        <div class="l-input m-0 my-[10px] flex justify-between mx-auto" style="width: 70%">
          <input
            type="text"
            class="bg-transparent transition-all duration-500 outline-none focus:outline-none w-3/5"
            placeholder="邮箱验证码"
            v-model="formData.captcha"
            required
          />
          <button class="text-blue-500 w-2/5" @click="toSendRegCode" v-if="!sendRegCodeLoading">
            发送验证码
          </button>
          <button class="text-blue-500 w-2/5" v-else disabled>正在发送...</button>
        </div>
      </template>
      <template v-else-if="registerType === 'password'">
        <input
          class="l-input a-input"
          type="text"
          v-model="passwordFormData.username"
          placeholder="用户名"
          required
          autocomplete="off"
        />
        <br />
        <input
          class="l-input a-input"
          type="password"
          v-model="passwordFormData.password"
          placeholder="密码"
          required
          autocomplete="new-password"
        />
        <br />
        <input
          class="l-input a-input"
          type="password"
          v-model="confirmPwd"
          placeholder="确认密码"
          required
        />
      </template>
      <template v-else-if="registerType === 'oauth2'">
        <button
          v-for="item in oauth2SignupEnabled?.signupEnabled"
          :class="`inline-flex items-center btn ${
            oauth2Platforms[item] ? oauth2Platforms[item].class : 'btn-black'
          } m-[10px] hover:px-[10px]`"
          @click="handleOAuth2Login(item)"
        >
          <el-image class="w-4 mr-2 rounded-lg" :src="getAppIcon(item)"> </el-image>
          {{ oauth2Platforms[item] ? oauth2Platforms[item].name : item }}
        </button>
      </template>
      <div class="text-sm"><b>注意：</b>所有输入框最大只可输入32个字符</div>
      <button
        v-if="registerType !== 'oauth2'"
        class="btn m-[10px]"
        @click="toRegister"
        :disabled="regDisable"
      >
        完成注册
      </button>
    </form>
  </div>
</template>

<style lang="less" scoped>
.room {
  text-align: center;
  margin-top: 5vmax;

  .reg-box {
    @apply sm:w-96 w-full m-auto;

    .a-input {
      width: 70%;

      &:hover {
        padding: 10px 15px;
        width: 74%;
      }
    }

    .btn {
      width: 70%;
      padding: 10px 15px;

      &:hover {
        padding: 12px 15px;
      }
    }
  }
}
</style>
