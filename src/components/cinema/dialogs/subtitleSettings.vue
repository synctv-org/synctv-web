<template>
  <el-dialog v-model="dialogVisible" title="字幕设置" width="400px" :before-close="handleClose">
    <div class="subtitle-settings">
      <div class="setting-group">
        <label class="setting-label">字幕大小</label>
        <el-radio-group v-model="currentSize" @change="handleSizeChange">
          <el-radio value="small">小</el-radio>
          <el-radio value="medium">中</el-radio>
          <el-radio value="large">大</el-radio>
          <el-radio value="extraLarge">特大</el-radio>
        </el-radio-group>
        <div class="size-preview">
          <span :style="{ fontSize: previewSize + 'px' }">字幕预览效果</span>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">关闭</el-button>
        <el-button type="primary" @click="handleConfirm">确定</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useLocalStorage } from "@vueuse/core";

interface SubtitleSettingsProps {
  modelValue: boolean;
}

interface SubtitleSettingsEmits {
  (e: "update:modelValue", value: boolean): void;
  (e: "sizeChange", size: string): void;
}

const props = defineProps<SubtitleSettingsProps>();
const emit = defineEmits<SubtitleSettingsEmits>();

// 字幕大小预设
const subtitleSizePresets = {
  small: 14,
  medium: 18,
  large: 24,
  extraLarge: 32
};

// 从localStorage读取设置
const savedSize = useLocalStorage("subtitle-size", "medium");
const currentSize = ref(savedSize.value);

// 计算预览大小
const previewSize = computed(() => {
  return subtitleSizePresets[currentSize.value as keyof typeof subtitleSizePresets] || 18;
});

// 对话框显示状态
const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value)
});

// 处理大小变化
const handleSizeChange = (size: string) => {
  currentSize.value = size;
};

// 关闭对话框
const handleClose = () => {
  dialogVisible.value = false;
};

// 确认设置
const handleConfirm = () => {
  savedSize.value = currentSize.value;
  emit("sizeChange", currentSize.value);
  handleClose();
};

// 监听外部设置变化
watch(
  () => savedSize.value,
  (newSize) => {
    currentSize.value = newSize;
  }
);
</script>

<style scoped>
.subtitle-settings {
  padding: 20px 0;
}

.setting-group {
  margin-bottom: 20px;
}

.setting-label {
  display: block;
  margin-bottom: 10px;
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.size-preview {
  margin-top: 15px;
  padding: 10px;
  background-color: var(--el-bg-color-page);
  border-radius: 4px;
  text-align: center;
  border: 1px solid var(--el-border-color);
}

.size-preview span {
  color: var(--el-text-color-primary);
  font-weight: 500;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
