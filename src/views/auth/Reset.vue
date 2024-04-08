<script setup lang="ts">
import { onMounted, ref } from "vue";
import { ElNotification, ElMessage, ElMessageBox } from "element-plus";
import { indexStore } from "@/stores";
import { userStore } from "@/stores/user";
import router from "@/router/index";
import { userInfo } from "@/services/apis/user";
import { resetPasswordApi, getResetCaptchaApi, sendResetCodeApi } from "@/services/apis/auth";
import { useRouteQuery } from "@vueuse/router";
import { strLengthLimit } from "@/utils";
import type { EmailRegForm } from "@/types";

const { settings } = indexStore();
const { getUserInfo: updateUserInfo, updateToken } = userStore();

const { state: userToken, execute: reqResetPasswordApi } = resetPasswordApi();
const { state: captcha, execute: getRegCaptcha, isLoading: captchaLoading } = getResetCaptchaApi();
const { execute: sendResetCode, isLoading: sendResetCodeLoading } = sendResetCodeApi();

const _captcha = useRouteQuery("captcha");
const _email = useRouteQuery("email");
const step = ref(1);
const formData = ref<EmailRegForm & { captchaID: string; answer: string }>({
  email: "",
  password: "",
  captcha: "",
  captchaID: "",
  answer: ""
});
const emailProvider = ref(settings?.emailWhitelistEnabled && settings?.emailWhitelist[0]);

const toSendResetCode = async () => {
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

    await sendResetCode({
      data: {
        email,
        captchaID: formData.value.captchaID,
        answer: formData.value.answer
      }
    });

    ElMessage.success("验证码发送成功");
    step.value++;
  } catch (err: any) {
    console.error(err);
    ElNotification({
      title: "错误",
      message: err.response.data.error || err.message,
      type: "error"
    });
  }
};

const btnDisable = ref(false);
const toReset = async () => {
  if (!formData.value.email || !formData.value.password || !formData.value.captcha) {
    return ElMessage.error("请填写表单完整");
  }
  try {
    btnDisable.value = true;
    for (const key in formData.value) {
      strLengthLimit(key, 32);
    }
    const email = settings?.emailWhitelistEnabled
      ? `${formData.value.email}@${emailProvider.value}`
      : formData.value.email;
    await reqResetPasswordApi({
      data: {
        email,
        password: formData.value.password,
        captcha: formData.value.captcha
      }
    });
    console.log(userToken.value);
    if (!userToken.value)
      return ElNotification({
        title: "错误",
        message: "服务器并未返回token",
        type: "error"
      });
    ElNotification({
      title: "重置成功",
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
    btnDisable.value = false;
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

onMounted(async () => {
  if (!_captcha.value && !_email.value) await refreshRegCaptcha();
  else {
    step.value = 2;
    formData.value.email = _email.value as string;
    formData.value.captcha = _captcha.value as string;
  }
});
</script>

<template>
  <div class="room">
    <form @submit.prevent="" class="reg-box">
      <div v-if="step === 1">
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
        />

        <br />

        <input
          class="l-input a-input"
          type="text"
          v-model="formData.answer"
          placeholder="图形验证码"
          required
        />
        <div>
          <el-image v-if="captchaLoading">
            <template #error>
              <div>Loading...</div>
            </template>
          </el-image>
          <el-image
            v-else
            class="cursor-pointer"
            title="点击刷新"
            :src="captcha?.captchaBase64"
            @click="refreshRegCaptcha"
          >
            <template #error>
              <div class="text-red-600">验证码加载失败</div>
            </template>
          </el-image>
        </div>
        <button
          class="btn m-[10px]"
          @click="toSendResetCode"
          :disabled="btnDisable"
          v-if="!sendResetCodeLoading"
        >
          下一步
        </button>
        <button class="btn m-[10px]" v-else disabled>正在发送...</button>
      </div>

      <div v-if="step === 2">
        <input
          class="l-input a-input"
          type="text"
          v-model="formData.captcha"
          placeholder="邮箱验证码"
          required
        />
        <br />
        <input
          class="l-input a-input"
          type="password"
          v-model="formData.password"
          placeholder="新的密码"
          required
        />
        <br />
        <div class="text-sm"><b>注意：</b>所有输入框最大只可输入32个字符</div>
        <button class="btn m-[10px]" @click="toReset" :disabled="btnDisable">完成重置</button>
      </div>
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
