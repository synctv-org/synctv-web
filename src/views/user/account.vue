<script setup lang="ts">
import { ref } from "vue";
import { getBiliBiliQRCode, loginBiliBili } from "@/services/apis/vendor";
import QRCodeVue3 from "qrcode-vue3";
import { roomStore } from "@/stores/room";
import { ElMessage } from "element-plus";
const { isDarkMode } = roomStore();
const userToken = localStorage.getItem("userToken") ?? "";

const bili_login_dialog = ref(false);

const { state: biliQRCode, execute: reqBiliBiliQRCode } = getBiliBiliQRCode();
const loginBili = async () => {
  bili_login_dialog.value = true;
  try {
    await reqBiliBiliQRCode({
      headers: {
        Authorization: userToken
      }
    });
  } catch (err: any) {
    console.error(err);
  }
};

const bindBilibili = async () => {
  const { execute } = loginBiliBili();
  try {
    await execute({
      data: {
        key: biliQRCode.value?.key ?? ""
      },
      headers: {
        Authorization: userToken
      }
    });
    ElMessage.success("绑定成功");
    bili_login_dialog.value = false;
  } catch (err: any) {
    console.error(err);
  }
};
</script>

<template>
  <div class="card">
    <div class="card-title">账户绑定</div>
    <div class="card-body">
      <!-- TODO: is bind? -->
      <button class="btn" @click="loginBili()">哔哩哔哩</button>
    </div>
  </div>
  <el-dialog
    v-model="bili_login_dialog"
    title="扫码登陆"
    width="443px"
    class="rounded-lg dark:bg-zinc-800"
  >
    <QRCodeVue3
      v-if="biliQRCode"
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
      myclass="mx-auto"
    />
    <template #footer>
      <button class="btn mr-2" @click="bili_login_dialog = false">取消</button>
      <button class="btn btn-success" @click="bindBilibili">我已登录</button>
    </template>
  </el-dialog>
</template>
