<script setup lang="ts">
import { onMounted, ref } from "vue";
import { ElNotification, ElMessage } from "element-plus";
import { OAuth2Platforms, loginWithOAuth2 } from "@/services/apis/auth";
import { useRouteQuery } from "@vueuse/router";
import { userStore } from "@/stores/user";
import router from "@/router/index";

// 获取可用的 OAuth2 平台
const { execute: reqOAuth2PlatformsApi, state: OAuth2Platforms_ } = OAuth2Platforms();
const getOAuth2Platforms = async () => {
  try {
    await reqOAuth2PlatformsApi();
  } catch (err: any) {
    console.error(err);
    ElNotification({
      title: "错误",
      message: err.response.data.error || err.message,
      type: "error"
    });
  }
};
</script>

<template>
  <div class="card">
    <div class="card-title">可用的 Oauth2 平台</div>
    <div
      class="card-body grid gap-5 grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6"
    >
     
    </div>
  </div>
</template>
