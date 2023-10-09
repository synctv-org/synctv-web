<script setup lang="ts">
import { roomStore } from "@/stores/room";
import RoomList from "@/components/RoomList.vue";
import { isDev } from "@/utils/utils";
const room = roomStore();
</script>

<template>
  <div class="text-center">
    <h1 class="text-3xl">首页</h1>
    <br />
    <RoomList />
    <br />
    <p class="text-zinc-400">*开发中页面，可能是最终品质</p>
    <p>&copy; Copyright 2023 SyncTV all right reserved</p>
  </div>
</template>
