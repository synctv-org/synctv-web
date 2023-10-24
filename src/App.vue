<script setup lang="ts">
import { onMounted } from "vue";
import Header from "./components/Header.vue";
import { RouterView } from "vue-router";
import { roomStore } from "@/stores/room";

onMounted(() => {
  if (localStorage.getItem("userToken")) return (roomStore().login = true);
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
