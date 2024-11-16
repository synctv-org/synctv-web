<script setup lang="ts">
import { ref, reactive } from "vue";
import { ElMessage, ElMessageBox, ElNotification } from "element-plus";
import type { FormInstance, FormRules } from "element-plus";
import { getBindEmailCaptchaApi, sendBindEmailCodeApi, bindEmailApi } from "@/services/apis/user";
import { indexStore } from "@/stores";
import { userStore } from "@/stores/user";

const { settings } = indexStore();
const { token } = userStore();
const emit = defineEmits(["updateUInfo"]);
interface FormData {
  email: string;
  captcha: string;
  captchaId: string;
  answer: string;
}

const open = ref(false);
const openDialog = async () => {
  open.value = true;
  await refreshCaptcha();
};
defineExpose({ openDialog });

const formDataRef = ref<FormInstance>();
const formData = reactive<FormData>({
  email: "",
  captcha: "",
  captchaId: "",
  answer: ""
});
const rules = reactive<FormRules<FormData>>({
  email: [{ required: true, message: "请输入邮箱", trigger: "blur" }],
  answer: [{ required: true, message: "请输入图形验证码", trigger: "blur" }],
  captcha: [{ required: true, message: "请输入邮箱验证码", trigger: "blur" }]
});
const emailProvider = ref(settings?.emailWhitelistEnabled && settings?.emailWhitelist[0]);

const {
  state: captcha,
  execute: getBindEmailCaptcha,
  isLoading: captchaLoading
} = getBindEmailCaptchaApi();
const { execute: sendBindEmailCode, isLoading: sendBindEmailCodeLoading } = sendBindEmailCodeApi();
const { execute: bindEmail, isLoading: bindEmailLoading } = bindEmailApi();

const toSendEmailCode = async () => {
  try {
    if (!formData.email || !formData.answer) return ElMessage.error("请填写邮箱或图形验证码");
    const email = settings?.emailWhitelistEnabled
      ? `${formData.email}@${emailProvider.value}`
      : formData.email;
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
    await sendBindEmailCode({
      headers: {
        Authorization: token.value
      },
      data: {
        email,
        captchaId: formData.captchaId,
        answer: formData.answer
      }
    });
    ElMessage.success("验证码发送成功");
  } catch (err: any) {
    console.error(err);
    ElNotification({
      title: "错误",
      message: err.response?.data.error || err.message,
      type: "error"
    });
  }
};

const changeEmail = async () => {
  if (!formDataRef.value) return;
  const validate = await formDataRef.value?.validate();
  if (!validate) return;
  try {
    const email = settings?.emailWhitelistEnabled
      ? `${formData.email}@${emailProvider.value}`
      : formData.email;
    await bindEmail({
      headers: {
        Authorization: token.value
      },
      data: {
        email,
        captcha: formData.captcha
      }
    });
    ElMessage.success("邮箱绑定成功");
    emit("updateUInfo");
    open.value = false;
  } catch (err: any) {
    console.error(err);
    ElNotification({
      title: "错误",
      message: err.response?.data.error || err.message,
      type: "error"
    });
  }
};

const refreshCaptcha = async () => {
  await getBindEmailCaptcha({
    headers: {
      Authorization: token.value
    }
  });
  if (captcha.value) formData.captchaId = captcha.value.captchaId;
};
</script>

<template>
  <el-dialog
    v-model="open"
    title="绑定邮箱"
    :close-on-click-modal="false"
    class="rounded-lg dark:bg-zinc-800 w-2/6 max-sm:w-full"
  >
    <template #default>
      <el-form ref="formDataRef" :model="formData" :rules="rules" label-width="100px" status-icon>
        <el-form-item label="邮箱" prop="email">
          <el-input
            v-if="settings?.emailWhitelistEnabled"
            v-model="formData.email"
            type="email"
            clearable
          >
            <template #append>
              <el-select v-model="emailProvider" placeholder="请选择" style="width: 130px">
                <el-option
                  v-for="i in settings.emailWhitelist"
                  :key="i"
                  :value="i"
                  :label="`@${i}`"
                />
              </el-select>
            </template>
          </el-input>
          <el-input v-else v-model="formData.email" type="email" clearable />
        </el-form-item>
        <el-form-item label="图形验证码" prop="answer">
          <el-input v-model="formData.answer" type="text" clearable />
        </el-form-item>
        <el-form-item>
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
            @click="refreshCaptcha"
          />
        </el-form-item>
        <el-form-item label="邮箱验证码" prop="captcha">
          <el-input v-model="formData.captcha" type="text" clearable>
            <template #append>
              <el-button @click="toSendEmailCode" :loading="sendBindEmailCodeLoading">
                {{ sendBindEmailCodeLoading ? "发送中" : "发送验证码" }}
              </el-button>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="changeEmail" :loading="bindEmailLoading">
            确定
          </el-button>
          <el-button @click="formDataRef?.resetFields()">重置</el-button>
        </el-form-item>
      </el-form>
    </template>
  </el-dialog>
</template>
