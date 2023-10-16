<script setup lang="ts">
import { onMounted, ref, reactive } from "vue";
import { ElNotification, ElMessage } from "element-plus";

const props = defineProps<{
  customHeader: any;
}>();

const rArray = reactive<{ [propName: string]: string }[]>([]);

Object.keys(props.customHeader).map((key: any) => {
  rArray.push({ [key]: props.customHeader[key] });
});

const emit = defineEmits(["updateHeaders"]);

const open = ref(false);
const openDialog = () => {
  open.value = true;
};

const removeItem = (key: any) => {
  rArray.splice(key, 1);
};

const addItem = () => {
  rArray.push({ "": "" });
};

const updateItemKey = (j: string | number, i: number, e: any) => {
  rArray[i][e.target.value] = rArray[i][j];
  delete rArray[i][j];
};

const updateItemVal = (j: string | number, i: number, e: any) => {
  rArray[i][j] = e.target.value;
};

const submit = async () => {
  try {
    const merged = rArray.reduce((result, currentObj) => {
      return { ...result, ...currentObj };
    }, {});

    emit("updateHeaders", merged);
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
  <el-dialog
    v-model="open"
    title="自定义 header"
    class="rounded-lg dark:bg-zinc-800 w-3/7 max-sm:w-full"
  >
    <div class="grid grid-cols-5 gap-4 mb-2 text-center">
      <div class="col-span-2">键</div>
      <div class="col-span-2">值</div>
      <div>操作</div>
    </div>
    <div v-for="(item, i) in rArray" :key="i">
      <div v-for="(k, j) in item" :key="k" class="grid grid-cols-5 gap-4 mb-2">
        <div class="col-span-2">
          <!-- J->键 -->
          <!-- k->值 -->
          <input
            type="text"
            class="l-input py-1 m-0 px-2 w-full"
            :value="j"
            @change="updateItemKey(j, i, $event)"
          />
        </div>
        <div class="col-span-2">
          <input
            type="text"
            class="l-input py-1 m-0 px-2 w-full"
            :value="k"
            @change="updateItemVal(j, i, $event)"
          />
        </div>
        <div class="text-center">
          <button class="btn btn-dense btn-error" @click="removeItem(i)">移除</button>
        </div>
      </div>
    </div>
    <button class="btn w-full" @click="addItem()">添加</button>

    <template #footer>
      <button class="btn mr-4" @click="open = false">取消</button>
      <button class="btn btn-success" @click="submit()">保存</button>
    </template>
  </el-dialog>
</template>
