<script setup lang="ts">
import { ref } from "vue";
import { getEmbyBinds, getEmbyAccountInfo, logoutEmby, loginEmbyApi } from "@/services/apis/vendor";
import CopyButton from "@/components/CopyButton.vue";
import { userStore } from "@/stores/user";
import { ElMessage, ElNotification } from "element-plus";
import { getAppIcon } from "@/utils";

const { token: userToken } = userStore();

const bindDialog = ref(false);
const loginDialog = ref(false);
const infoDialog = ref(false);
const emby = ref({
  host: "",
  username: "",
  password: "",
  apikey: ""
});

// 获取已经绑定的账号
const { state: binds, execute: reqBinds, isLoading: getBindsLoading } = getEmbyBinds();
const getBinds = async () => {
  try {
    await reqBinds({
      headers: {
        Authorization: userToken.value
      }
    });
  } catch (err: any) {
    console.error(err);
    ElMessage.error(err.response.data.error || err.message);
  }
};

// 获取账号信息
const {
  state: accountInfo,
  execute: reqAccountInfo,
  isLoading: getEmbyAccountInfoLoading
} = getEmbyAccountInfo();
const getAccountInfo = async (serverID: string) => {
  try {
    infoDialog.value = true;
    await reqAccountInfo({
      headers: {
        Authorization: userToken.value
      },
      params: {
        serverID
      }
    });
  } catch (err: any) {
    console.error(err);
    ElMessage.error(err.response.data.error || err.message);
  }
};

const openDialog = async () => {
  bindDialog.value = true;
  await getBinds();
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
      await getBinds();
      closeLoginDialog();
    }
  } catch (err: any) {
    console.error(err);
    ElMessage.error(err.response.data.error || err.message);
  }
};

const embyLogout = async (serverId: string) => {
  const { execute } = logoutEmby();
  try {
    await execute({
      headers: {
        Authorization: userToken.value
      },
      data: {
        serverId
      }
    });
    ElNotification({
      type: "success",
      title: "解绑成功"
    });
    await getBinds();
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

  <!-- 账号列表 -->
  <el-dialog
    v-model="bindDialog"
    destroy-on-close
    draggable
    title="Emby 绑定列表"
    class="rounded-lg dark:bg-zinc-800 max-sm:w-full"
  >
    <div class="-mt-5">
      <el-table :data="binds" v-loading="getBindsLoading">
        <el-table-column prop="serverID" label="serverID">
          <template #default="scope">
            <div class="flex overflow-hidden text-ellipsis max-w-[260px]">
              <span class="truncate mr-1">{{ scope.row.serverID }}</span>
              <CopyButton size="small" :value="scope.row.serverID" />
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="host" label="地址">
          <template #default="scope">
            <div class="flex overflow-hidden text-ellipsis max-w-[250px]">
              <span class="truncate mr-1">{{ scope.row.host }}</span>
              <CopyButton size="small" :value="scope.row.host" />
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="operation" label="操作" width="120">
          <template #default="scope">
            <el-popconfirm
              width="220"
              confirm-button-text="是"
              cancel-button-text="否"
              title="你确定要解除绑定吗？"
              @confirm="embyLogout(scope.row.serverID)"
            >
              <template #reference>
                <el-button link type="danger" size="small"> 解绑 </el-button>
              </template>
            </el-popconfirm>

            <el-button link type="primary" size="small" @click="getAccountInfo(scope.row.serverID)">
              详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-button class="mt-4" style="width: 100%" @click="loginDialog = true">添加账号</el-button>
    </div>
  </el-dialog>

  <!-- 登录 -->
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
        @keyup.enter="embyLogin"
      />
      <input
        class="l-input block w-full m-0 my-4"
        placeholder="APIKEY"
        type="text"
        v-model.lazy="emby.apikey"
        @keyup.enter="embyLogin"
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

  <!-- 账号信息 -->
  <el-dialog
    v-model="infoDialog"
    destroy-on-close
    draggable
    title="Emby 账号信息"
    class="rounded-lg dark:bg-zinc-800 w-1/5 max-sm:w-full"
  >
    <div class="text-center -my-3" v-loading="getEmbyAccountInfoLoading">
      <p class="text-base mb-1">服务器名称：{{ accountInfo?.info.serverName }}</p>
      <p class="text-base mb-1">版本：{{ accountInfo?.info.version }}</p>
    </div>
  </el-dialog>
</template>
