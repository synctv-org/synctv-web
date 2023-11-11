<script setup lang="ts">
import router from "@/router";
</script>
<template>
  <div class="text-center">
   <el-empty>
    <template #image>
      <div></div>
    </template>
    <template #description>
      <div style="font-size:12rem">
        🔞
      </div>
      <p>403 禁止访问</p>
    </template>
    <button class="btn" @click="router.push('/')">返回首页</button>
   </el-empty>
  </div>
</template>
