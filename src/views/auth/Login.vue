<script setup lang="ts">
import { ref } from "vue";
import { ElNotification, ElMessage } from "element-plus";
import { roomStore } from "@/stores/room";
import router from "@/router/index";
import { oAuth2WithGithub } from "@/services/apis/auth";
const room = roomStore();

const formData = ref({
  username: localStorage.getItem("uname") || "",
  password: localStorage.getItem("password") || ""
});
const savePwd = ref(false);

const useGithub = async () => {
  const { state, execute } = oAuth2WithGithub();
  try {
    await execute();
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
</script>

<template>
  <div class="room">
    <div class="login-box w-full">
      <h1 class="text-[28px] font-bold">请选择登陆方式</h1>
      <button class="btn btn-black m-[10px]" @click="useGithub()">使用 Github 账号登录</button>
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
