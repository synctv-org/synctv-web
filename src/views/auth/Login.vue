<script setup lang="ts">
import { onMounted, ref } from "vue";
import { ElNotification, ElMessage } from "element-plus";
import { OAuth2Platforms, loginWithOAuth2 } from "@/services/apis/auth";

const platforms: { [key: string]: { name: string; class: string } } = {
  github: {
    name: "Github",
    class: "btn-black"
  },
  microsoft: {
    name: "Microsoft",
    class: "btn-default"
  },
  google: {
    name: "Google",
    class: "btn-warning"
  }
};

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

const { state, execute } = loginWithOAuth2();
const useOAuth2 = async (platform: string) => {
  try {
    await execute({
      url: "/oauth2/login/" + platform
    });
    if (state.value) window.location.href = state.value.url;
  } catch (err: any) {
    console.error(err);
    ElNotification({
      title: "错误",
      message: err.response.data.error || err.message,
      type: "error"
    });
  }
};

onMounted(async () => {
  await getOAuth2Platforms();
});
</script>

<template>
  <div class="room">
    <div class="login-box w-full">
      <h1 class="text-[28px] font-bold">请选择登陆方式</h1>
      <button
        v-for="item in OAuth2Platforms_?.enabled"
        :class="`btn ${platforms[item] ? platforms[item].class : ''} m-[10px]`"
        @click="useOAuth2(item)"
      >
        使用 {{ platforms[item] ? platforms[item].name : item }} 账号登录
      </button>
    </div>
  </div>
</template>

<style lang="less" scoped>
.room {
  text-align: center;
  margin-top: 5vmax;

  .login-box {
    // width: 443px;
    margin: auto;

    .btn {
      padding: 10px 15px;

      &:hover {
        padding: 12px 15px;
      }
    }
  }
}
</style>
