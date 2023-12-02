<script setup lang="ts">
import { ref, reactive } from "vue";
import { ElNotification } from "element-plus";
import type { FormInstance, FormRules } from "element-plus";
import { changeUNameApi } from "@/services/apis/user";
import { userStore } from "@/stores/user";

const { token, getUserInfo } = userStore();

interface FormData {
  username: string;
}

const open = ref(false);
const openDialog = async () => {
  open.value = true;
};
defineExpose({ openDialog });

const formDataRef = ref<FormInstance>();
const formData = reactive<FormData>({
  username: ""
});
const rules = reactive<FormRules<FormData>>({
  username: [
    { required: true, message: "请输入用户名", trigger: "blur" },
    { min: 1, max: 32, message: "长度在 1 ~ 32 之间", trigger: "blur" }
  ]
});

const { execute, isLoading } = changeUNameApi();
const changeUName = async () => {
  try {
    await formDataRef.value?.validate(async (valid, fields) => {
      if (valid) {
        await execute({
          headers: {
            Authorization: token.value
          },
          data: formData
        });
        ElNotification({
          title: "修改成功",
          type: "success"
        });
        open.value = false;
        formDataRef.value?.resetFields();
        await getUserInfo()
      }
    });
  } catch (err: any) {
    console.error(err.message);
    ElNotification({
      title: "错误",
      message: err.response.data.error || err.message,
      type: "error"
    });
  }
};
</script>

<template>
  <el-dialog
    v-model="open"
    title="修改密码"
    :close-on-click-modal="false"
    class="rounded-lg dark:bg-zinc-800 w-2/6 max-sm:w-full"
  >
    <template #default>
      <el-form ref="formDataRef" :model="formData" :rules="rules" @submit.prevent="changeUName" label-width="80px" status-icon>
        <el-form-item label="新用户名" prop="username">
          <el-input v-model="formData.username" type="text" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="changeUName" :loading="isLoading"> 确定修改 </el-button>
          <el-button @click="formDataRef?.resetFields()">重置</el-button>
        </el-form-item>
      </el-form>
    </template>
  </el-dialog>
</template>
