<script setup lang="ts">
import Header from "./components/Header.vue";
import { RouterView } from "vue-router";
import { roomStore } from "./stores/room";
const room = roomStore();

localStorage.login === "true" ? (room.login = true) : false;
</script>

<template>
  <Header />
  <el-container>
    <el-main>
      <RouterView />
    </el-main>
  </el-container>
</template>
