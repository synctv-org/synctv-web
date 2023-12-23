<script setup lang="ts">
import { ref } from "vue";
import { getAListAccountInfo, logoutAList, loginAListApi } from "@/services/apis/vendor";
import { userStore } from "@/stores/user";
import { ElMessage, ElNotification } from "element-plus";
import { getAppIcon } from "@/utils";
import sha256 from "crypto-js/sha256";
import hex from "crypto-js/enc-hex";

const { token: userToken } = userStore();

const loginDialog = ref(false);
const infoDialog = ref(false);
const aList = ref({
  host: "",
  username: "",
  hashedPassword: ""
});

// 获取账号信息
const { state: accountInfo, execute: reqAccountInfo } = getAListAccountInfo();
const getAccountInfo = async () => {
  try {
    await reqAccountInfo({
      headers: {
        Authorization: userToken.value
      }
    });
    if (accountInfo.value) {
      console.log(accountInfo.value);
    }
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

const {
  execute: loginAList,
  isLoading: aListLoginLoading,
  isReady: aListLoginReady
} = loginAListApi();
const aListLogin = async () => {
  try {
    aList.value.hashedPassword = hex.stringify(
      sha256(aList.value.hashedPassword + "-https://github.com/alist-org/alist")
    );
    await loginAList({
      headers: {
        Authorization: userToken.value
      },
      data: aList.value
    });
    if (aListLoginReady.value) {
      ElMessage.success("绑定成功");
      closeLoginDialog();
    }
  } catch (err: any) {
    console.error(err);
    ElMessage.error(err.response.data.error || err.message);
  }
};

const aListLogout = async () => {
  const { execute } = logoutAList();
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
  aList.value.hashedPassword = "";
  aList.value.username = "";
  aList.value.host = "";
};
</script>

<template>
  <div class="app-list-item hover:bg-teal-50 dark:hover:bg-neutral-700" @click="openDialog()">
    <el-image class="e-image" :src="getAppIcon('alist')"> </el-image>
    <div class="mb-5">
      <a href="javascript:;" class="text-inherit">AList</a>
    </div>
  </div>

  <el-dialog
    v-model="loginDialog"
    destroy-on-close
    draggable
    title="登录 AList"
    class="rounded-lg dark:bg-zinc-800 max-sm:w-full md:w-3/4 lg:w-2/5 xl:w-1/3"
    @closed="closeLoginDialog"
  >
    <div class="text-center -mt-5">
      <p class="mb-4"><b>注意：</b>仅支持3.25.0及以上版本</p>
      <input class="l-input block w-full m-0 my-4" placeholder="AList 地址" v-model="aList.host" />
      <input
        class="l-input block w-full m-0 my-4"
        placeholder="用户名"
        v-model.lazy="aList.username"
      />
      <input
        class="l-input block w-full m-0 my-4"
        placeholder="密码"
        type="password"
        v-model.lazy="aList.hashedPassword"
      />

      <div class="flex flex-wrap justify-between text-base">
        <button class="btn" @click="closeLoginDialog">取消</button>
        <button v-if="!aListLoginLoading" class="btn btn-success px-7" @click="aListLogin">
          登录
        </button>
        <button v-else class="btn btn-success px-7" disabled>登录中...</button>
      </div>
    </div>

    <!-- <template #footer> </template> -->
  </el-dialog>

  <el-dialog
    v-model="infoDialog"
    destroy-on-close
    draggable
    title="AList 账号信息"
    class="rounded-lg dark:bg-zinc-800 w-1/5 max-sm:w-full"
  >
    <div class="text-center -my-3">
      <p class="text-base mb-1">ID：{{ accountInfo?.info.id }}</p>
      <p class="text-base mb-1">用户名：{{ accountInfo?.info.username }}</p>
      <p class="text-base mb-1">权限：{{ accountInfo?.info.permission }}</p>
      <p class="text-base mb-1">根目录：{{ accountInfo?.info.base_path }}</p>
      <el-popconfirm
        width="220"
        confirm-button-text="是"
        cancel-button-text="否"
        title="你确定要解除绑定吗？"
        @confirm="aListLogout()"
      >
        <template #reference>
          <button class="btn btn-error">解除绑定</button>
        </template>
      </el-popconfirm>
    </div>
  </el-dialog>
</template>
