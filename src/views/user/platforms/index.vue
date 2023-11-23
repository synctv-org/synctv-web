<script setup lang="ts">
import bilibili from "./bilibili.vue";
</script>

<template>
  <div class="card">
    <div class="card-title">可用平台</div>
    <div
      class="card-body grid gap-5 grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6"
    >
      <bilibili />
    </div>
  </div>
</template>
