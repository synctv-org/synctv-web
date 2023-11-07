<script setup lang="ts">
import Header from "./components/Header.vue";
import { RouterView } from "vue-router";
</script>

<template>
  <Header />
  <el-container>
    <el-main>
      <RouterView />
    </el-main>
  </el-container>
</template>
