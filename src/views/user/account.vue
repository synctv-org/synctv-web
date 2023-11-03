<script setup lang="ts">
import { ref } from "vue";
import { getBiliBiliQRCode, veriBiliBiliQRCode, getBiliBiliCaptcha } from "@/services/apis/vendor";
import QRCodeVue3 from "qrcode-vue3";
import { roomStore } from "@/stores/room";
import { ElMessage } from "element-plus";
const { isDarkMode } = roomStore();
const userToken = localStorage.getItem("userToken") ?? "";

const bili_login_dialog = ref(false);
let getQRCodeStatus: number;
const {
  state: biliQRCode,
  execute: reqBiliBiliQRCode,
  isReady: biliQRCodeReady
} = getBiliBiliQRCode();

const useBilibiliLogin = async () => {
  bili_login_dialog.value = true;
  // 获取二维码
  try {
    await reqBiliBiliQRCode({
      headers: {
        Authorization: userToken
      }
    });
    vBiliQRCode();
  } catch (err: any) {
    console.error(err);
  }
};

// 验证二维码
const { state: biliQRCodeStatus, execute: reqVeriBiliBiliQRCode } = veriBiliBiliQRCode();
const vBiliQRCode = () => {
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
          bili_login_dialog.value = false;
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
const getBiliCaptcha = async () => {
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
          width: "300px",
          https: true

          // 更多前端配置参数说明请参见：http://docs.geetest.com/install/client/web-front/
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

function validate() {
  var result = (window as any).captchaObj.getValidate();
  if (!result) {
    alert("请先完成验证！");
    return;
  }
  alert("OK");
  // do sth
}

const closeDialog = () => {
  bili_login_dialog.value = false;
  clearInterval(getQRCodeStatus);
};
</script>

<template>
  <div class="card">
    <div class="card-title">账户绑定</div>
    <div class="card-body">
      <!-- TODO: is bind? -->
      <button class="btn" @click="useBilibiliLogin()">哔哩哔哩</button>
    </div>
  </div>
  <el-dialog
    v-model="bili_login_dialog"
    destroy-on-close
    draggable
    title="登录 哔哩哔哩"
    class="rounded-lg dark:bg-zinc-800"
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
          myclass="mx-auto px-10 py-5"
        />
        <p
          v-else-if="biliQRCodeStatus && biliQRCodeStatus.status === 'expired'"
          class="mx-auto px-10 py-5 text-center"
        >
          二维码加载失败或已过期，请重试。
          <br />
          <a href="javascript:;" @click="useBilibiliLogin">重新加载二维码</a>
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
        <h2 class="text-xl font-semibold">短信登录</h2>
        <input type="number" class="l-input" placeholder="手机号" />
        <input type="number" class="l-input" placeholder="短信验证码" />
        <div id="captcha"></div>
        <button class="btn" @click="getBiliCaptcha">发送验证码</button>

        <button class="btn btn-success" @click="validate">登录</button>
      </el-col>
    </el-row>

    <template #footer>
      <button class="btn mr-2" @click="closeDialog">取消</button>
    </template>
  </el-dialog>
</template>
