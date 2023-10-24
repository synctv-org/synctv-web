<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouteQuery, useRouteParams } from "@vueuse/router";
import { ElNotification, ElMessage } from "element-plus";
import { roomStore } from "@/stores/room";
import router from "@/router/index";
import { oAuth2Callback, userInfo } from "@/services/apis/auth";

const room = roomStore();

const code = useRouteQuery("code");
const state = useRouteQuery("state");
const platform = useRouteParams("platform");
const { state: userToken, execute } = oAuth2Callback();
const isLoading = ref(true);
const redirect = async () => {
  try {
    await execute({
      data: {
        code: code.value as string,
        state: state.value as string
      },
      url: "/oauth2/callback/" + platform.value
    });

    if (userToken.value) {
      localStorage.setItem("userToken", userToken.value.token);
      await getUserInfo();
    }
  } catch (err: any) {
    console.error(err);
    ElNotification({
      title: "错误",
      message: err.response.data.error || err.message,
      type: "error"
    });
  }
};

const getUserInfo = async () => {
  const { state, execute } = userInfo();
  try {
    await execute({
      headers: {
        Authorization: userToken.value?.token ?? ""
      }
    });
    if (state.value) {
      isLoading.value = false;
      localStorage.setItem("uname", state.value.username);
      room.login = true;
      ElNotification({
        title: "登录成功",
        type: "success"
      });
      router.push("/");
    }
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
  await redirect();
});
</script>

<template>
  <div class="room">
    <div class="login-box w-full">
      <h1 class="text-[28px] font-bold" v-if="isLoading">正在验证数据...</h1>
      <h1 class="text-[28px] font-bold" v-else>登陆成功，正在重定向...</h1>
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
