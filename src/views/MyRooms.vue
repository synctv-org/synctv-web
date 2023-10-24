<script setup lang="ts">
import RoomList from "@/components/RoomList.vue";
</script>
<template>
  <RoomList :is-my-room="true" />
</template>

<style lang="less" scoped>
.room {
  text-align: center;
  margin-top: 5vmax;

  .login-box {
    // width: 443px;
    margin: auto;

    .btn {
      padding: 10px 15px;

      &:hover {
        padding: 12px 15px;
      }
    }
  }
}
</style>
