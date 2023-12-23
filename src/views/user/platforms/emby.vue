<script setup lang="ts">
import { ref } from "vue";
import { getEmbyAccountInfo, logoutEmby, loginEmbyApi } from "@/services/apis/vendor";
import { userStore } from "@/stores/user";
import { ElMessage, ElNotification } from "element-plus";
import { getAppIcon } from "@/utils";

const { token: userToken } = userStore();

const loginDialog = ref(false);
const infoDialog = ref(false);
const emby = ref({
  host: "",
  username: "",
  password: "",
  apikey: ""
});

// 获取账号信息
const { state: accountInfo, execute: reqAccountInfo } = getEmbyAccountInfo();
const getAccountInfo = async () => {
  try {
    await reqAccountInfo({
      headers: {
        Authorization: userToken.value
      }
    });
  } catch (err: any) {
    console.error(err);
    ElMessage.error(err.response.data.error || err.message);
  }
};

const openDialog = async () => {
  await getAccountInfo();
  if (accountInfo.value?.isLogin) {
    infoDialog.value = true;
  } else {
    loginDialog.value = true;
  }
};

const { execute: loginEmby, isLoading: embyLoginLoading, isReady: embyLoginReady } = loginEmbyApi();
const embyLogin = async () => {
  try {
    await loginEmby({
      headers: {
        Authorization: userToken.value
      },
      data: emby.value
    });
    if (embyLoginReady.value) {
      ElMessage.success("绑定成功");
      closeLoginDialog();
    }
  } catch (err: any) {
    console.error(err);
    ElMessage.error(err.response.data.error || err.message);
  }
};

const embyLogout = async () => {
  const { execute } = logoutEmby();
  try {
    await execute({
      headers: {
        Authorization: userToken.value
      }
    });
    ElNotification({
      type: "success",
      title: "解绑成功"
    });
    infoDialog.value = false;
  } catch (err: any) {
    console.error(err);
    ElNotification({
      type: "error",
      title: "错误",
      message: err.response.data.error || err.message
    });
  }
};

const closeLoginDialog = () => {
  loginDialog.value = false;
  emby.value.password = "";
  emby.value.username = "";
  emby.value.host = "";
  emby.value.apikey = "";
};
</script>

<template>
  <div class="app-list-item hover:bg-green-50 dark:hover:bg-neutral-700" @click="openDialog()">
    <el-image class="e-image" :src="getAppIcon('emby')"> </el-image>
    <div class="mb-5">
      <a href="javascript:;" class="text-inherit">Emby</a>
    </div>
  </div>

  <el-dialog
    v-model="loginDialog"
    destroy-on-close
    draggable
    title="登录 Emby"
    class="rounded-lg dark:bg-zinc-800 max-sm:w-full md:w-3/4 lg:w-2/5 xl:w-1/3"
    @closed="closeLoginDialog"
  >
    <div class="text-center max-lg:mt-5">
      <input class="l-input block w-full m-0 mb-4" placeholder="Emby 地址" v-model="emby.host" />
      <input
        class="l-input block w-full m-0 my-4"
        placeholder="用户名"
        v-model.lazy="emby.username"
      />
      <input
        class="l-input block w-full m-0 my-4"
        placeholder="密码"
        type="password"
        v-model.lazy="emby.password"
      />
      <input
        class="l-input block w-full m-0 my-4"
        placeholder="APIKEY"
        type="text"
        v-model.lazy="emby.apikey"
      />

      <div class="flex flex-wrap justify-between text-base">
        <button class="btn" @click="closeLoginDialog">取消</button>
        <button v-if="!embyLoginLoading" class="btn btn-success px-7" @click="embyLogin">
          登录
        </button>
        <button v-else class="btn btn-success px-7" disabled>登录中...</button>
      </div>
    </div>
  </el-dialog>

  <el-dialog
    v-model="infoDialog"
    destroy-on-close
    draggable
    title="Emby 账号信息"
    class="rounded-lg dark:bg-zinc-800 w-1/5 max-sm:w-full"
  >
    <div class="text-center -my-3">
      <p class="text-base mb-1">服务器名称：{{ accountInfo?.info.serverName }}</p>
      <p class="text-base mb-1">版本：{{ accountInfo?.info.version }}</p>
      <el-popconfirm
        width="220"
        confirm-button-text="是"
        cancel-button-text="否"
        title="你确定要解除绑定吗？"
        @confirm="embyLogout()"
      >
        <template #reference>
          <button class="btn btn-error">解除绑定</button>
        </template>
      </el-popconfirm>
    </div>
  </el-dialog>
</template>
