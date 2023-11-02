<script setup lang="ts">
import { ref } from "vue";
import { getBiliBiliQRCode, veriBiliBiliQRCode } from "@/services/apis/vendor";
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
          ElMessage.success("登录成功");
          clearInterval(getQRCodeStatus);
        }
      }
    } catch (err: any) {
      if (err.response.data.error === "qr code expired") {
        ElMessage.error("二维码已过期，请重新获取");
        clearInterval(getQRCodeStatus);
        return;
      }
      console.error(err);
    }
  }, 2000);
};

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
          v-if="biliQRCode && biliQRCodeReady"
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
        <p v-else>二维码加载失败，请重试</p>
        <h2 class="text-base text-center">
          请使用 <a href="https://app.bilibili.com/" target="_blank">哔哩哔哩客户端</a>
          <br />
          扫码登陆
          <br />
        </h2>
      </el-col>
      <el-col :md="14">
        <h2 class="text-xl font-semibold">短信登录</h2>
      </el-col>
    </el-row>

    <template #footer>
      <button class="btn mr-2" @click="closeDialog">取消</button>
      <!-- <button class="btn btn-success" @click="bindBilibili">我已登录</button> -->
    </template>
  </el-dialog>
</template>
