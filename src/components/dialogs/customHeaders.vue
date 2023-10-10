<script setup lang="ts">
import { onMounted, ref } from "vue";
import { ElNotification, ElMessage } from "element-plus";

const props = defineProps<{
  customHeader: any;
}>();

const header = ref({ ...props.customHeader });

const emit = defineEmits([""]);

const open = ref(false);
const openDialog = () => {
  open.value = true;
};

const removeItem = (key: any) => {
  delete header.value[key];
};

const addItem = () => {
  // header.value[""] = "";
};

const submit = async () => {
  try {
    emit("");
    open.value = false;
    return ElNotification({
      type: "success",
      title: "设置成功"
    });
  } catch (err: any) {
    console.error(err.message);
    return ElNotification({
      type: "error",
      title: "错误",
      message: err.message
    });
  }
};

defineExpose({
  openDialog
});

onMounted(() => {});
</script>

<template>
  <el-dialog v-model="open" title="自定义 header" width="70vh" class="rounded-lg dark:bg-zinc-800">
    <div class="grid grid-cols-5 gap-4 mb-2 text-center">
      <div class="col-span-2">键</div>
      <div class="col-span-2">值</div>
      <div>操作</div>
    </div>
    <div class="grid grid-cols-5 gap-4 mb-2" v-for="(j, k) in header">
      <div class="col-span-2">
        <input type="text" class="l-input py-1 m-0 px-2 w-full" :value="k" />
      </div>
      <div class="col-span-2">
        <input type="text" class="l-input py-1 m-0 px-2 w-full" :value="j" />
      </div>
      <div class="text-center">
        <button class="btn btn-dense btn-error" @click="removeItem(k)">移除</button>
      </div>
    </div>
    <button class="btn w-full" @click="addItem()">添加</button>

    <template #footer>
      <button class="btn mr-4" @click="open = false">取消</button>
      <button class="btn btn-success" @click="submit()">保存</button>
    </template>
  </el-dialog>
</template>
