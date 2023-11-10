<script lang="ts" setup>
const props = defineProps<{
  title: string;
}>();
</script>

<template>
  <div class="card">
    <div class="card-title">{{ props.title }}</div>
    <div class="card-body">啊啊啊</div>
  </div>
</template>
