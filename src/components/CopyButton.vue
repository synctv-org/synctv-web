<script setup lang="ts">
import { DocumentCopy } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";

const props = defineProps<{
  size?: string;
  value: string;
}>();

const copy = async () => {
  if (!navigator.clipboard) return ElMessage.error("您当前的浏览器不支持 Clipboard API");
  try {
    await navigator.clipboard.writeText(props.value);
    ElMessage.success("复制成功");
  } catch (error) {
    ElMessage.error("复制失败：" + error);
  }
};
</script>

<template>
  <el-tooltip>
    <template #content>复制</template>
    <el-button :icon="DocumentCopy" :size="size" circle @click="copy" />
  </el-tooltip>
</template>
