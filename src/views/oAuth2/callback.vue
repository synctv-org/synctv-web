<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouteQuery, useRouteParams } from "@vueuse/router";
import { ElNotification, ElMessage } from "element-plus";
import { userStore } from "@/stores/user";
import router from "@/router/index";
import { oAuth2Callback, OAuth2CallbackType } from "@/services/apis/auth";
import { userInfo } from "@/services/apis/user";
import { ROLE } from "@/types/User";

const { getUserInfo: updateUserInfo, updateToken } = userStore();

const code = useRouteQuery("code");
const state = useRouteQuery("state");
const platform = useRouteParams("platform");
const { state: callbackData, execute } = oAuth2Callback();
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

    if (!callbackData.value) {
      ElNotification({
        title: "错误",
        message: "服务器并未返回数据",
        type: "error"
      });
      return;
    }

    if (callbackData.value.type === OAuth2CallbackType.AUTH) {
      // 处理登录逻辑
      switch (callbackData.value.role) {
        case ROLE.Banned:
          ElNotification({
            title: "错误",
            message: "您的账号已被封禁",
            type: "error"
          });
          break;
        case ROLE.Pending:
          ElNotification({
            title: "错误",
            message: "您的账号正在审核中",
            type: "warning"
          });
          break;
        case ROLE.User:
        case ROLE.Admin:
        case ROLE.Root:
          break;
        default:
          ElNotification({
            title: "错误",
            message: callbackData.value.message || "登录失败",
            type: "error"
          });
          break;
      }
      updateToken(callbackData.value.token);
      await getUserInfo();
    } else if (callbackData.value.type === OAuth2CallbackType.BIND) {
      // 处理绑定逻辑
      ElNotification({
        title: "成功",
        message: "OAuth2账号绑定成功",
        type: "success"
      });
      isLoading.value = false;
      router.replace(callbackData.value.redirect || "/");
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
  try {
    const state = await userInfo().execute({
      headers: {
        Authorization: callbackData.value?.token ?? ""
      }
    });
    if (state.value) {
      updateUserInfo(state.value);
      isLoading.value = false;
      localStorage.setItem("uname", state.value.username);
      ElNotification({
        title: "登录成功",
        type: "success"
      });

      router.replace(callbackData.value?.redirect || "/");
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
      <h1 class="text-[28px] font-bold" v-else>
        {{
          callbackData?.type === OAuth2CallbackType.AUTH ? "登录成功" : "OAuth2账号绑定成功"
        }}，正在重定向...
      </h1>
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
