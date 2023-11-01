<script setup lang="ts">
import { reactive, ref, type Component, onMounted } from "vue";
import RoomList from "@/components/RoomList.vue";
import { userStore } from "@/stores/user";
import { ElNotification } from "element-plus";
import { logOutApi } from "@/services/apis/auth";
import { userInfo } from "@/services/apis/user";

import account from "./account.vue";

const user = userStore();

const getUserInfo = async () => {
  const { state, execute } = userInfo();
  try {
    await execute({
      headers: {
        Authorization: localStorage.userToken
      }
    });
    if (state.value) {
      user.info = state.value;
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

const logout = async () => {
  localStorage.removeItem("userToken");
  for (const i in localStorage) {
    if (i.startsWith("room") && i.endsWith("token")) {
      localStorage.removeItem(i);
    }
  }
  ElNotification({
    title: "登出成功",
    type: "success"
  });
  setTimeout(() => (window.location.href = "/"), 1000);
};

const logoff = async () => {
  const { execute, state } = logOutApi();
  try {
    await execute({
      headers: {
        Authorization: localStorage.userToken
      }
    });
    if (state.value) {
      localStorage.removeItem("userToken");
      for (const i in localStorage) {
        if (i.startsWith("room") && i.endsWith("token")) {
          localStorage.removeItem(i);
        }
      }
      ElNotification({
        title: "注销成功",
        type: "success"
      });
      setTimeout(() => (window.location.href = "/"), 1000);
    }
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
    name: "账户绑定",
    component: account
  }
];

const activeTab = reactive<Tabs>({
  name: "我的房间",
  component: RoomList
});

const switchTab = (tab: Tabs) => {
  activeTab.name = tab.name;
  activeTab.component = tab.component;
};

onMounted(() => {
  getUserInfo();
});
</script>

<template>
  <div class="md:w-9/12 mx-auto">
    <el-row :gutter="20">
      <el-col :lg="7" :md="9" class="mb-6 max-sm:my-2">
        <div class="card mb-6">
          <div class="card-title">个人信息</div>
          <div class="card-body">
            <table>
              <tbody></tbody>
              <colgroup>
                <col width="100" />
              </colgroup>
              <tbody>
                <!-- <tr>
                  <td>ID</td>
                  <td>
                    {{ user.info?.id }}
                  </td>
                </tr> -->
                <tr>
                  <td>用户名</td>
                  <td>{{ user.info?.username }}</td>
                </tr>
                <tr>
                  <td>权限组</td>
                  <td>
                    {{ user.info?.role }}
                  </td>
                </tr>
                <tr>
                  <td>注册时间</td>
                  <td>
                    {{ user.info && new Date(user.info.createdAt).toLocaleString() }}
                  </td>
                </tr>
                <tr v-if="user.info?.role === 'admin'">
                  <td>后台管理</td>
                  <td>
                    <a href="/admin">点击进入</a>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div class="card">
          <div class="card-title">操作</div>
          <div class="card-body pb-5">
            <el-popconfirm title="确定登出？" @confirm="logout">
              <template #reference>
                <button class="btn w-full mb-3" @click="">退出登录</button>
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
        <div class="card mb-6">
          <div class="card-title tabs">
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
</template>
