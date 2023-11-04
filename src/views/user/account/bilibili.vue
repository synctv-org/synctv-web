<script setup lang="ts">
import { ref } from "vue";
import {
  getBiliBiliQRCode,
  veriBiliBiliQRCode,
  getBiliBiliCaptcha,
  getBiliBiliPhoneCode,
  veriBiliBiliPhoneCode
} from "@/services/apis/vendor";
import QRCodeVue3 from "qrcode-vue3";
import { roomStore } from "@/stores/room";
import { ElMessage, ElNotification } from "element-plus";
const { isDarkMode } = roomStore();
const userToken = localStorage.getItem("userToken") ?? "";

const dialog = ref(false);
let getQRCodeStatus: number;
const { state: biliQRCode, execute: reqQRCode, isReady: biliQRCodeReady } = getBiliBiliQRCode();

const useBilibiliLogin = async () => {
  dialog.value = true;
  if (!(window as any).captchaObj) {
    geCaptcha();
  }

  // 获取二维码
  try {
    await reqQRCode({
      headers: {
        Authorization: userToken
      }
    });
    verifyQRCode();
  } catch (err: any) {
    console.error(err);
  }
};

// 验证二维码
const { state: biliQRCodeStatus, execute: reqVeriBiliBiliQRCode } = veriBiliBiliQRCode();
const verifyQRCode = () => {
  if (getQRCodeStatus) clearInterval(getQRCodeStatus);
  getQRCodeStatus = setInterval(async () => {
    try {
      await reqVeriBiliBiliQRCode({
        headers: {
          Authorization: userToken
        },
        data: {
          key: biliQRCode.value?.key
        }
      });
      if (biliQRCodeStatus.value) {
        if (biliQRCodeStatus.value.status === "success") {
          closeDialog();
          ElMessage.success("绑定成功");
          clearInterval(getQRCodeStatus);
        }
        if (biliQRCodeStatus.value.status === "expired") {
          ElMessage.error("二维码已过期，请重新获取");
          clearInterval(getQRCodeStatus);
          return;
        }
      }
    } catch (err: any) {
      console.error(err);
    }
  }, 2000);
};

// 获取人机验证
const { state: biliCaptcha, execute: reqBiliBiliCaptcha } = getBiliBiliCaptcha();
const geCaptcha = async () => {
  try {
    await reqBiliBiliCaptcha({
      headers: {
        Authorization: userToken
      }
    });
    if (biliCaptcha.value) {
      // 调用 initGeetest 进行初始化
      // 参数1：配置参数
      // 参数2：回调，回调的第一个参数验证码对象，之后可以使用它调用相应的接口
      (window as any).initGeetest(
        {
          // 以下 4 个配置参数为必须，不能缺少
          gt: biliCaptcha.value.gt,
          challenge: biliCaptcha.value.challenge,
          offline: false, // 表示用户后台检测极验服务器是否宕机
          new_captcha: true, // 用于宕机时表示是新验证码的宕机

          product: "popup", // 产品形式，包括：float，popup
          width: "100%",
          https: true
        },
        function captchaHandler(captchaObj: any) {
          (window as any).captchaObj = captchaObj;
          captchaObj.appendTo("#captcha");
        }
      );
    }
  } catch (err: any) {
    console.error(err);
  }
};

// 发送手机验证码
const phone = ref<number>();
const SMSTime = ref(60);
let SMSTimer: number;
const { state: phoneCode, execute: reqBiliBiliPhoneCode } = getBiliBiliPhoneCode();
const sendCode = async () => {
  let result = (window as any).captchaObj.getValidate();
  if (!result) return ElMessage.error("请先完成人机验证！");
  if (!phone.value) return ElMessage.error("请填写手机号！");
  const geetest_validate = result.geetest_validate;
  try {
    await reqBiliBiliPhoneCode({
      headers: {
        Authorization: userToken
      },
      data: {
        token: biliCaptcha.value!.token,
        challenge: biliCaptcha.value!.challenge,
        validate: geetest_validate,
        telephone: phone.value.toString()
      }
    });
    if (phoneCode.value) {
      ElMessage.success("验证码已发送！");
    }
  } catch (err: any) {
    console.error(err);
    ElNotification({
      title: "错误",
      message: err.response.data.error || err.message,
      type: "error"
    });
  }

  if (SMSTimer) clearInterval(SMSTimer);
  SMSTime.value = 60;
  SMSTimer = setInterval(() => {
    SMSTime.value--;
    if (SMSTime.value <= 0) {
      clearInterval(SMSTimer);
    }
  }, 1000);
};

// 验证手机验证码
const code = ref<number>();
const verifyPhoneCode = async () => {
  const { execute, isReady } = veriBiliBiliPhoneCode();
  if (!phoneCode.value) return ElMessage.error("请先完成人机验证！");
  if (!phone.value) return ElMessage.error("请填写手机号！");
  if (!code.value) return ElMessage.error("请填写验证码！");
  try {
    await execute({
      headers: {
        Authorization: userToken
      },
      data: {
        telephone: phone.value.toString(),
        captchaKey: phoneCode.value!.captchaKey,
        code: code.value.toString()
      }
    });
    if (isReady.value) {
      closeDialog();
      ElMessage.success("绑定成功");
      clearInterval(SMSTimer);
    }
  } catch (err: any) {
    console.error(err);
    ElMessage.error(err.response.data.error || err.message);
  }
};

const closeDialog = () => {
  dialog.value = false;
  clearInterval(getQRCodeStatus);
  clearInterval(SMSTimer);
  SMSTime.value = 60;
  phone.value = code.value = NaN;
};
</script>

<template>
  <div
    class="app-list-item hover:bg-pink-100 dark:hover:bg-neutral-700"
    @click="useBilibiliLogin()"
  >
    <img src="/src/assets/appIcons/bilibili.png" />
    <div class="mt-3">
      <a href="javascript:;" class="text-inherit">哔哩哔哩</a>
    </div>
  </div>

  <el-dialog
    v-model="dialog"
    destroy-on-close
    draggable
    title="登录 哔哩哔哩"
    class="rounded-lg dark:bg-zinc-800 max-sm:w-full"
    @closed="closeDialog"
  >
    <el-row :gutter="20">
      <el-col :md="10">
        <h2 class="text-xl text-center font-semibold">扫描二维码登录</h2>
        <QRCodeVue3
          v-if="
            biliQRCode &&
            biliQRCodeReady &&
            biliQRCodeStatus &&
            biliQRCodeStatus.status !== 'expired'
          "
          :width="400"
          :height="400"
          :value="biliQRCode.url"
          :qrOptions="{ typeNumber: 0, mode: 'Byte', errorCorrectionLevel: 'H' }"
          :imageOptions="{ hideBackgroundDots: true, imageSize: 0.4, margin: 0 }"
          :dotsOptions="{
            type: 'square',
            color: '#f472b6',
            gradient: {
              type: 'linear',
              rotation: 45,
              colorStops: [
                { offset: 0, color: '#f472b6' },
                { offset: 1, color: '#fb7185' }
              ]
            }
          }"
          :backgroundOptions="{ color: isDarkMode ? '#27272a' : '#ffffff' }"
          :cornersSquareOptions="{ type: 'square', color: '#f87171' }"
          :cornersDotOptions="{ type: undefined, color: '#4ade80' }"
          myclass="mx-auto px-10 py-5 max-sm:w-52 max-md:w-56"
        />
        <p
          v-else-if="biliQRCodeStatus && biliQRCodeStatus.status === 'expired'"
          class="mx-auto px-10 py-5 text-center"
        >
          二维码加载失败或已过期，请重试
          <br />
          <a
            href="javascript:;"
            @click="
              useBilibiliLogin();
              ElMessage.info('加载中...');
            "
            >重新加载二维码</a
          >
        </p>
        <p v-else class="mx-auto px-10 py-5 text-center">二维码加载中，请稍后...</p>
        <h2 class="text-base text-center">
          请使用 <a href="https://app.bilibili.com/" target="_blank">哔哩哔哩客户端</a>
          <br />
          扫码登陆
          <br />
        </h2>
      </el-col>
      <el-col :md="14">
        <div class="text-center max-lg:mt-5">
          <h2 class="text-xl font-semibold mb-5">短信登录</h2>
          <div class="w-4/5 mx-auto">
            <input
              type="number"
              class="l-input block w-full m-0 my-[10px]"
              placeholder="手机号"
              v-model="phone"
            />
            <input
              type="number"
              class="l-input block w-full m-0 my-[10px]"
              placeholder="短信验证码"
              v-model="code"
            />
            <div class="my-[10px] w-full" id="captcha"></div>

            <div class="my-[10px] w-full flex flex-wrap justify-between text-base">
              <button class="btn px-6" @click="sendCode" v-if="SMSTime === 60">发送验证码</button>
              <button class="btn px-6" @click="sendCode" v-else :disabled="SMSTime > 0">
                重新发送 {{ 0 < SMSTime && SMSTime <= 60 ? SMSTime : "" }}
              </button>
              <button class="btn btn-success px-7 py-2" @click="verifyPhoneCode">登录</button>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>

    <template #footer>
      <button class="btn mr-2" @click="closeDialog">取消</button>
    </template>
  </el-dialog>
</template>
