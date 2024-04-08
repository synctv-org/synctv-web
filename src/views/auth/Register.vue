<script setup lang="ts">
import { onMounted, ref } from "vue";
import { ElNotification, ElMessage, ElMessageBox } from "element-plus";
import { userStore } from "@/stores/user";
import router from "@/router/index";
import { userInfo } from "@/services/apis/user";
import { useEmailRegisterApi, getRegCaptchaApi, sendRegCodeApi } from "@/services/apis/auth";
import { strLengthLimit } from "@/utils";
import type { EmailRegForm } from "@/types";

const { getUserInfo: updateUserInfo, updateToken } = userStore();

const { state: userToken, execute: emailRegisterApi } = useEmailRegisterApi();
const { state: captcha, execute: getRegCaptcha, isLoading: captchaLoading } = getRegCaptchaApi();
const { execute: sendRegCode, isLoading: sendRegCodeLoading } = sendRegCodeApi();

const formData = ref<EmailRegForm & { captchaID: string; answer: string }>({
  email: "",
  password: "",
  captcha: "",
  captchaID: "",
  answer: ""
});

const toSendRegCode = async () => {
  try {
    if (!formData.value.email || !formData.value.answer)
      return ElNotification({
        title: "错误",
        message: "请填写邮箱或图形验证码",
        type: "error"
      });
    const v = await ElMessageBox.confirm(
      `我们将发送验证码到此邮箱：${formData.value.email}，请确认该邮箱地址是否正确`,
      "警告",
      {
        confirmButtonText: "准确无误！",
        cancelButtonText: "搞错了...",
        type: "warning"
      }
    );
    if (v !== "confirm") return;

    await sendRegCode({
      data: formData.value
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
  if (
    !formData.value.email ||
    !formData.value.password ||
    !formData.value.captcha ||
    !formData.value.answer
  ) {
    return ElNotification({
      title: "错误",
      message: "请填写表单完整",
      type: "error"
    });
  }
  try {
    regDisable.value = true;
    for (const key in formData.value) {
      strLengthLimit(key, 32);
    }
    await emailRegisterApi({
      data: formData.value
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
};

const refreshRegCaptcha = async () => {
  await getRegCaptcha();
  if (captcha.value) formData.value.captchaID = captcha.value.captchaID;
};

const resetForm = () =>
  (formData.value = {
    email: "",
    password: "",
    captcha: "",
    captchaID: "",
    answer: ""
  });

onMounted(async () => await refreshRegCaptcha());
</script>

<template>
  <div class="room">
    <form @submit.prevent="" class="reg-box">
      <input
        class="l-input a-input"
        type="email"
        v-model="formData.email"
        placeholder="邮箱"
        required
      />
      <br />
      <input
        class="l-input a-input"
        type="password"
        v-model="formData.password"
        placeholder="密码"
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

      <br />
      <div class="text-sm"><b>注意：</b>所有输入框最大只可输入32个字符</div>
      <button class="btn m-[10px]" @click="toRegister" :disabled="regDisable">完成注册</button>
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
