<script setup lang="ts">
import RoomList from "@/components/RoomList.vue";
</script>
<template>
  <div class="text-center">
    <div class="lg:w-9/12 mx-auto">
      <RoomList :is-my-room="false" :is-hot="false">
        <template #title>房间列表</template>
      </RoomList>
    </div>
  </div>
</template>
