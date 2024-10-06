<script setup lang="ts">
import RoomList from "@/components/RoomList.vue";
</script>

<template>
  <div class="text-center">
    <h1 class="text-3xl">首页</h1>
    <br />
    <div class="xl:w-6/12 lg:w-7/12 md:w-9/12 mx-auto">
      <RoomList :is-my-room="false" :is-hot="true" :is-joined-room="false">
        <template #title>热度榜</template>
      </RoomList>
    </div>
    <br />
    <p>
      &copy; Copyright {{ new Date().getFullYear() }}
      <a href="https://github.com/synctv-org" target="_blank">SyncTV</a> all right reserved
    </p>
  </div>
</template>
