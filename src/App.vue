<script setup lang="ts">
import { onMounted } from "vue";
import Header from "./components/Header.vue";
import { RouterView } from "vue-router";
import { ElNotification } from "element-plus";
import { userStore } from "@/stores/user";
import { roomStore } from "@/stores/room";
import { userInfo as userInfoApi } from "@/services/apis/auth";

const { state: userInfo_, execute: reqUserInfo } = userInfoApi();
const userState = userStore();

const initApp = async () => {
  try {
    await reqUserInfo({
      headers: {
        Authorization: localStorage.getItem("userToken") || ""
      }
    });
    if (userInfo_.value) {
      userState.userInfo = userInfo_.value;
      roomStore().login = true;
    }
  } catch (err: any) {
    console.error(err);
  }
};

onMounted(() => {
  initApp();
});
</script>

<template>
  <Header />
  <el-container>
    <el-main>
      <RouterView />
    </el-main>
  </el-container>
</template>
