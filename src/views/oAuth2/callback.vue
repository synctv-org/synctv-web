<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouteQuery } from "@vueuse/router";
import { ElNotification, ElMessage } from "element-plus";
import { roomStore } from "@/stores/room";
import router from "@/router/index";
import { getGithubUseInfo } from "@/services/apis/auth";

const room = roomStore();

const code = useRouteQuery("code");
const state = useRouteQuery("state");

const redirect = async () => {
  const { state: userToken, execute } = getGithubUseInfo();
  try {
    await execute({
      data: {
        code: code.value as string,
        state: state.value as string
      }
    });
    if (userToken.value) {
      localStorage.setItem("userToken", userToken.value.token);
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
  console.log(code.value, state.value);
});
</script>

<template>
  <div class="room">
    <div class="login-box w-full">
      <h1 class="text-[28px] font-bold">登陆成功，正在重定向...</h1>
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
