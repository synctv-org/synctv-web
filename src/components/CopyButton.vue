<script setup lang="ts">
import { toCopy } from "@/utils";
import { DocumentCopy } from "@element-plus/icons-vue";

const props = defineProps<{
  size?: string;
  value: string;
}>();
</script>

<template>
  <el-tooltip>
    <template #content>复制</template>
    <el-button :icon="DocumentCopy" :size="size" circle @click="toCopy(props.value)" />
  </el-tooltip>
</template>
