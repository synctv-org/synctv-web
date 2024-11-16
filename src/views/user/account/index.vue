<script setup lang="ts">
import { onMounted, ref } from "vue";
import { ElNotification, ElMessage } from "element-plus";
import {
  oAuth2Platforms,
  bindOAuth2Api,
  unbindOAuth2Api,
  unbindEmailApi
} from "@/services/apis/user";
import { userStore } from "@/stores/user";
import { getAppIcon } from "@/utils";
import BindEmail from "@/components/user/dialogs/email.vue";
import { indexStore } from "@/stores";

const { settings } = indexStore();

const { token, info, getUserInfo } = userStore();
const bindEmailDialog = ref<InstanceType<typeof BindEmail>>();
interface ProviderType {
  name: string;
  providerUserId: string;
  createdAt: number;
}

const bind = ref<ProviderType[]>([]);
const unbind = ref<ProviderType[]>([]);

// 获取可用的 OAuth2 平台
const { execute: reqOAuth2PlatformsApi, state, isLoading: pLoading } = oAuth2Platforms();
const getProviders = async () => {
  try {
    bind.value.splice(0, bind.value.length);
    unbind.value.splice(0, unbind.value.length);
    await reqOAuth2PlatformsApi({
      headers: {
        Authorization: token.value
      }
    });

    if (state.value) {
      for (const key in state.value) {
        if (state.value[key].createdAt === 0) {
          unbind.value.push({
            name: key,
            providerUserId: state.value[key].providerUserId,
            createdAt: state.value[key].createdAt
          });
        } else {
          bind.value.push({
            name: key,
            providerUserId: state.value[key].providerUserId,
            createdAt: state.value[key].createdAt
          });
        }
      }
    }
  } catch (err: any) {
    console.error(err);
    ElNotification({
      title: "获取失败",
      message: err.response?.data.error || err.message,
      type: "error"
    });
  }
};

// 绑定 OAuth2
const bindOAuth2 = async (platform: string) => {
  const { execute, state } = bindOAuth2Api();
  try {
    await execute({
      headers: {
        Authorization: token.value
      },
      data: {
        redirect: "/user/me"
      },
      url: "/oauth2/bind/" + platform
    });
    if (state.value) window.location.href = state.value.url;
  } catch (err: any) {
    console.error(err);
    ElNotification({
      title: "错误",
      message: err.response?.data.error || err.message,
      type: "error"
    });
  }
};

// 解绑 OAuth2
const unbindOAuth2 = async (platform: string) => {
  const { execute } = unbindOAuth2Api();
  try {
    await execute({
      headers: {
        Authorization: token.value
      },
      url: "/oauth2/unbind/" + platform
    });
    ElMessage.success(`平台 ${platform} 解绑成功`);
    await getProviders();
  } catch (err: any) {
    console.error(err);
    ElNotification({
      title: "错误",
      message: err.response?.data.error || err.message,
      type: "error"
    });
  }
};

// 解绑邮箱
const unbindEmail = async () => {
  const { execute, state } = unbindEmailApi();
  try {
    await execute({
      headers: {
        Authorization: token.value
      }
    });
    ElMessage.success("邮箱解绑成功");
    await getUserInfo();
  } catch (err: any) {
    console.error(err);
    ElNotification({
      title: "错误",
      message: err.response?.data.error || err.message,
      type: "error"
    });
  }
};

onMounted(async () => {
  await getProviders();
});
</script>

<template>
  <div class="card mb-5" v-if="settings?.emailEnable || info?.email">
    <div class="card-title">邮箱绑定</div>
    <div class="card-body pb-4">
      <p v-if="!info?.email" class="-mt-2 mb-2">绑定邮箱后，可以使用该邮箱进行重置密码操作</p>
      <div>
        <h3 v-if="info?.email">
          <b>当前绑定邮箱：</b>
          <span class="text-green-500 mr-4">{{ info?.email }}</span>
          <el-popconfirm title="你确定要解除绑定吗？" @confirm="unbindEmail">
            <template #reference>
              <a class="text-red-500" href="javascript:;">💥解除绑定</a>
            </template>
          </el-popconfirm>
          <a
            v-if="settings?.emailEnable"
            href="javascript:;"
            @click="bindEmailDialog?.openDialog"
            style="margin-left: 10px"
            >换绑</a
          >
        </h3>
        <a
          v-else
          v-if="settings?.emailEnable"
          href="javascript:;"
          @click="bindEmailDialog?.openDialog"
          >立即绑定</a
        >
      </div>
    </div>
  </div>
  <div class="card mb-5">
    <div class="card-title">第三方账号绑定</div>
    <div class="card-body pb-4">
      <p class="-mt-2 mb-2">
        使用以下任一方式都可以登录到您的 SyncTV 帐号，避免由于某个帐号失效导致无法登录
      </p>
      <el-table :data="bind" v-loading="pLoading" style="width: 100%">
        <el-table-column prop="name" label="绑定平台">
          <template #default="scope">
            <span class="capitalize">
              {{ scope.row.name }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="providerUserId" label="账号ID" />
        <el-table-column prop="createdAt" label="绑定时间">
          <template #default="scope">
            {{ new Date(scope.row.createdAt).toLocaleString() }}
          </template>
        </el-table-column>
        <el-table-column fixed="right" label="操作">
          <template #default="scope">
            <el-popconfirm title="你确定要解除绑定吗？" @confirm="unbindOAuth2(scope.row.name)">
              <template #reference>
                <el-button type="warning"> 解除绑定 </el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
  <div class="card" v-if="unbind.length > 0">
    <div class="card-title">你还可以<span class="text-red-500">绑定</span>以下账号</div>
    <div
      class="card-body pb-4 grid gap-5 grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6"
    >
      <div
        class="app-list-item"
        v-for="(item, i) in unbind"
        :key="i"
        @click="bindOAuth2(item.name)"
      >
        <el-image class="e-image" :src="getAppIcon(item.name)"> </el-image>
        <div class="mb-5">
          <a href="javascript:;" class="text-inherit capitalize truncate">{{ item.name }}</a>
        </div>
      </div>
    </div>
  </div>

  <BindEmail ref="bindEmailDialog" @updateUInfo="getUserInfo" />
</template>
