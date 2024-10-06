<script setup lang="ts">
import { onMounted, ref } from "vue";
import { ElNotification, ElMessage, ElTabs, ElTabPane } from "element-plus";
import { indexStore } from "@/stores";
import { OAuth2Platforms, loginWithOAuth2, LoginApi } from "@/services/apis/auth";
import { userInfo } from "@/services/apis/user";
import { useRouteQuery } from "@vueuse/router";
import { strLengthLimit, getAppIcon } from "@/utils";
import { userStore } from "@/stores/user";
import router from "@/router/index";
import { oauth2Platforms } from "@/services/apis/auth";

const { settings } = indexStore();

const formData = ref({
  username: localStorage.getItem("uname") || "",
  email: localStorage.getItem("email") || "",
  password: localStorage.getItem("password") || ""
});
const savePwd = ref(false);
const activeTab = ref("username");

const redirect = useRouteQuery("redirect");
console.log("redirect: ", (redirect.value as string) ?? "");

const { getUserInfo: updateUserInfo, updateToken } = userStore();
const { execute: reqLoginApi, state: loginData } = LoginApi();
const login = async () => {
  if (activeTab.value === "username" && (!formData.value?.username || !formData.value?.password))
    return ElMessage.error("请填写用户名和密码");
  if (activeTab.value === "email" && (!formData.value?.email || !formData.value?.password))
    return ElMessage.error("请填写邮箱和密码");

  try {
    for (const key in formData.value) {
      strLengthLimit(key, 32);
    }
    await reqLoginApi({
      data: {
        username: activeTab.value === "username" ? formData.value.username : "",
        email: activeTab.value === "email" ? formData.value.email : "",
        password: formData.value.password
      }
    });
    if (!loginData.value)
      return ElNotification({
        title: "错误",
        message: "服务器并未返回token",
        type: "error"
      });

    updateToken(loginData.value.token);
    localStorage.setItem("uname", formData.value.username);
    localStorage.setItem("email", formData.value.email);
    localStorage.setItem("password", savePwd.value ? formData.value.password : "");

    const state = await userInfo().execute({
      headers: {
        Authorization: loginData.value?.token ?? ""
      }
    });

    if (state.value) {
      updateUserInfo(state.value);
      localStorage.setItem("uname", state.value.username);
      localStorage.setItem("email", state.value.email);
      ElNotification({
        title: "登录成功",
        type: "success"
      });

      router.replace((redirect.value as string) || "/");
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
      data: {
        redirect: (redirect.value as string) ?? ""
      },
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
    <form @submit.prevent="login" class="login-box">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="用户名登录" name="username">
          <input
            class="l-input"
            type="text"
            v-model="formData.username"
            placeholder="用户名"
            required
          />
        </el-tab-pane>
        <el-tab-pane label="邮箱登录" name="email">
          <input
            class="l-input"
            type="email"
            v-model="formData.email"
            placeholder="邮箱"
            required
          />
        </el-tab-pane>
      </el-tabs>
      <br />
      <input
        class="l-input"
        type="password"
        v-model="formData.password"
        placeholder="密码"
        required
      />
      <br />
      <div class="text-sm"><b>注意：</b>所有输入框最大只可输入32个字符</div>
      <div>
        <input class="w-auto" type="checkbox" v-model="savePwd" />
        <label title="明文保存到本机哦~">&nbsp;记住密码</label>

        <a
          v-if="settings?.emailEnable"
          class="ml-4"
          href="javascript:;"
          @click="router.push('/auth/reset')"
          >重置密码</a
        >
      </div>
      <button type="submit" class="btn m-[10px]">登录</button>
      <div v-if="settings?.emailEnable">
        还没有账号？<a class="ml-2" href="javascript:;" @click="router.push('/auth/register')"
          >立即注册</a
        >
      </div>
    </form>
    <br />
    <div
      v-if="OAuth2Platforms_?.enabled && OAuth2Platforms_.enabled.length > 0"
      class="sm:w-96 w-full m-auto"
    >
      <h4 class="text-[18px] font-bold">使用第三方平台登录</h4>
      <button
        v-for="item in OAuth2Platforms_?.enabled"
        :class="`inline-flex items-center btn ${
          oauth2Platforms[item] ? oauth2Platforms[item].class : 'btn-black'
        } m-[10px] hover:px-[10px]`"
        @click="useOAuth2(item)"
      >
        <el-image class="w-4 mr-2 rounded-lg" :src="getAppIcon(item)"> </el-image>
        {{ oauth2Platforms[item] ? oauth2Platforms[item].name : item }}
      </button>
    </div>
  </div>
</template>

<style lang="less" scoped>
.room {
  text-align: center;
  margin-top: 5vmax;

  .login-box {
    @apply sm:w-96 w-full m-auto;

    input {
      width: 70%;

      &:hover {
        padding: 10px 15px;
        width: 74%;
      }
    }

    .btn {
      width: 70%;
      padding: 10px 15px;

      &:hover {
        padding: 12px 15px;
      }
    }
  }
}
</style>
