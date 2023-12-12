<script setup lang="ts">
import { ref, shallowRef, type Component, onMounted } from "vue";
import RoomList from "@/components/RoomList.vue";
import { userStore } from "@/stores/user";
import { ElNotification } from "element-plus";
import { logOutApi } from "@/services/apis/auth";
import Platforms from "./platforms/index.vue";
import Account from "./account/index.vue";
import UserPassword from "@/components/user/dialogs/password.vue";
import Uname from "@/components/user/dialogs/username.vue";
import { ROLE, role } from "@/types/User";
import { useTimeAgo } from "@vueuse/core";

const { info, token } = userStore();
const pwdDialog = ref<InstanceType<typeof UserPassword>>();
const unameDialog = ref<InstanceType<typeof Uname>>();
const logout = async () => {
  localStorage.clear();
  ElNotification({
    title: "登出成功",
    type: "success"
  });
  setTimeout(() => (window.location.href = "/"), 1000);
};

const logoff = async () => {
  try {
    await logOutApi().execute({
      headers: {
        Authorization: token.value
      }
    });
    localStorage.clear();
    ElNotification({
      title: "注销成功",
      type: "success"
    });
    setTimeout(() => (window.location.href = "/"), 1000);
  } catch (err: any) {
    console.error(err);
    ElNotification({
      title: "注销失败",
      message: err.response.data.error || err.message,
      type: "error"
    });
  }
};

interface Tabs {
  name: string;
  component: Component;
}

const tabs: Tabs[] = [
  {
    name: "我的房间",
    component: RoomList
  },
  {
    name: "平台绑定",
    component: Platforms
  },
  {
    name: "账户绑定",
    component: Account
  }
];

const activeTab = shallowRef<Tabs>({
  name: "我的房间",
  component: RoomList
});

const switchTab = (tab: Tabs) => {
  activeTab.value = tab;
};

onMounted(() => {});
</script>

<template>
  <div class="md:w-9/12 mx-auto">
    <el-row :gutter="20">
      <el-col :lg="7" :md="9" class="mb-6 max-sm:my-2">
        <div class="card mb-5">
          <div class="card-title">个人信息</div>
          <div class="card-body">
            <table>
              <tbody></tbody>
              <colgroup>
                <col width="100" />
              </colgroup>
              <tbody>
                <tr>
                  <td>用户名</td>
                  <td>
                    {{ info?.username }}
                    <span class="ml-2 cursor-pointer" @click="unameDialog?.openDialog">✏️</span>
                  </td>
                </tr>
                <tr>
                  <td>权限组</td>
                  <td>
                    {{ role[info?.role ?? 0] }}
                  </td>
                </tr>
                <tr>
                  <td>注册时间</td>
                  <td>
                    {{ info && useTimeAgo(new Date(info.createdAt)).value }}
                  </td>
                </tr>
                <tr v-if="info!.role! >= ROLE.Admin">
                  <td>后台管理</td>
                  <td>
                    <RouterLink to="/admin">点我进入</RouterLink>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div class="card">
          <div class="card-title">操作</div>
          <div class="card-body pb-5">
            <button class="btn btn-warning w-full mb-3" @click="pwdDialog?.openDialog">
              修改密码
            </button>
            <el-popconfirm title="确定登出？" @confirm="logout">
              <template #reference>
                <button class="btn w-full mb-3">退出登录</button>
              </template>
            </el-popconfirm>
            <el-popconfirm title="注销后，你的所有数据将会被清除" @confirm="logoff">
              <template #reference>
                <button class="btn btn-error w-full">注销账号</button>
              </template>
            </el-popconfirm>
          </div>
        </div>
      </el-col>
      <el-col :lg="17" :md="15" class="mb-6 max-sm:my-2">
        <div class="card mb-6 max-sm:mb-1">
          <div class="card-title tabs pb-4">
            <span
              v-for="tab in tabs"
              :key="tab.name"
              class="first:ml-0 last:mr-0 mx-2 cursor-pointer"
              :class="activeTab.name === tab.name && 'active-tab'"
              @click="switchTab(tab)"
              >{{ tab.name }}</span
            >
          </div>
        </div>
        <component :is="activeTab.component" :is-my-room="true" />
      </el-col>
    </el-row>
  </div>

  <UserPassword ref="pwdDialog" />
  <Uname ref="unameDialog" />
</template>
