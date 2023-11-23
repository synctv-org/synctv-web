<script setup lang="ts">
import { ref, reactive, computed } from "vue";
import { ElNotification } from "element-plus";
import type { FormInstance, FormRules } from "element-plus";
import { newUserApi } from "@/services/apis/admin";
import { userStore } from "@/stores/user";
import { ROLE, role } from "@/types/User";

const { token, isLogin } = userStore();
const emits = defineEmits(["updateUserList"]);
const roles = computed(() =>
  Object.fromEntries(
    Object.entries(role).filter(
      ([key, value]) => value !== role[ROLE.Visitor] && value !== role[ROLE.Unknown]
    )
  )
);

interface FormData {
  username: string;
  password: string;
  role: ROLE;
}

const open = ref(false);
const openDialog = async () => {
  open.value = true;
};
defineExpose({ openDialog });

const formDataRef = ref<FormInstance>();
const formData = reactive<FormData>({
  username: "",
  password: "",
  role: ROLE.User
});
const rules = reactive<FormRules<FormData>>({
  username: [{ required: true, message: "请输入用户名", trigger: "blur" }],
  password: [{ required: true, message: "请输入密码", trigger: "blur" }],
  role: [{ required: true, message: "请选择用户组", trigger: "blur" }]
});

const { execute, isLoading } = newUserApi();
const newUser = async () => {
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
          title: `创建成功`,
          type: "success"
        });
        formDataRef.value?.resetFields()
        emits('updateUserList')
        open.value = false;
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
    title="新建用户"
    :close-on-click-modal="false"
    class="rounded-lg dark:bg-zinc-800 w-2/6 max-sm:w-full"
  >
    <template #default>
      <el-form ref="formDataRef" :model="formData" :rules="rules" label-width="70px" status-icon>
        <el-form-item label="用户名" prop="username">
          <el-input v-model="formData.username" type="text" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="formData.password" type="text" />
        </el-form-item>
        <el-form-item label="权限组" prop="role">
          <el-select v-model="formData.role" class="w-full" placeholder="权限组">
            <el-option v-for="(k, i) in roles" :label="k" :value="Number(i)" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="newUser" :loading="isLoading"> 创建 </el-button>
          <el-button @click="formDataRef?.resetFields()">重置</el-button>
        </el-form-item>
      </el-form>
    </template>
  </el-dialog>
</template>
