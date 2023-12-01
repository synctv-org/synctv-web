<script setup lang="ts">
import { onMounted, ref } from "vue";
import { ElNotification, ElMessage } from "element-plus";
import { OAuth2Platforms, loginWithOAuth2, LoginApi } from "@/services/apis/auth";
import { userInfo } from "@/services/apis/user";
import { useRouteQuery } from "@vueuse/router";
import { strLengthLimit } from "@/utils/utils";
import { userStore } from "@/stores/user";
import router from "@/router/index";
import { getAppIcon } from "@/utils/utils";

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
    class: "btn-white"
  },
  feishuSSO: {
    name: "飞书SSO",
    class: "btn-white"
  },
  xiaomi: {
    name: "小米",
    class: "btn-white"
  },
  baidu: {
    name: "百度",
    class: "btn-white"
  },
  'baidu-netdisk': {
    name: "百度网盘",
    class: "btn-white"
  },
  gitee: {
    name: "Gitee",
    class: "btn-error"
  },
  gitlab: {
    name: "GitLab",
    class: "btn-error"
  },
  qq: {
    name: "QQ",
    class: "btn-default"
  },
};

const formData = ref({
  username: localStorage.getItem("uname") || "",
  password: localStorage.getItem("password") || ""
});
const savePwd = ref(false);

const redirect = useRouteQuery("redirect");
console.log("redirect: ", (redirect.value as string) ?? "");

const { getUserInfo: updateUserInfo, updateToken } = userStore();
const { execute: reqLoginApi, state: loginData } = LoginApi();
const login = async () => {
  if (formData.value?.username === "" || formData.value?.password === "") {
    ElNotification({
      title: "错误",
      message: "请填写表单完整",
      type: "error"
    });
    return;
  }
  try {
    for (const key in formData.value) {
      strLengthLimit(key, 32);
    }
    await reqLoginApi({
      data: formData.value
    });
    if (!loginData.value)
      return ElNotification({
        title: "错误",
        message: "服务器并未返回token",
        type: "error"
      });

    updateToken(loginData.value.token);
    localStorage.setItem("uname", formData.value.username);
    localStorage.setItem("password", savePwd.value ? formData.value.password : "");

    const state = await userInfo().execute({
      headers: {
        Authorization: loginData.value?.token ?? ""
      }
    });

    if (state.value) {
      updateUserInfo(state.value);
      localStorage.setItem("uname", state.value.username);
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
    <form @submit.prevent="" class="login-box">
      <input
        class="l-input"
        type="text"
        v-model="formData.username"
        placeholder="用户名"
        required
      />
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
      </div>
      <button class="btn m-[10px]" @click="login">登录</button>
    </form>
    <br />
    <div class="sm:w-96 w-full m-auto">
      <h4 class="text-[18px] font-bold">使用第三方平台登录</h4>
      <button
        v-for="item in OAuth2Platforms_?.enabled"
        :class="`inline-flex  items-center btn ${platforms[item] ? platforms[item].class : 'btn-black'} m-[10px] hover:px-[10px]`"
        @click="useOAuth2(item)"
      >
        <el-image class="w-4 mr-2 rounded-lg" :src="getAppIcon(item)">
          <template #error>
            <img src="@/assets/appIcons/default.webp" class="w-full" />
          </template>
        </el-image>
        {{ platforms[item] ? platforms[item].name : item }}
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
