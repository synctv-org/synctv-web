<script lang="ts" setup>
import { ref, reactive, onMounted } from "vue";
import { ElNotification, ElMessage } from "element-plus";
import { userStore } from "@/stores/user";
import { userSettingsApi } from "@/services/apis/admin";
import { useUpdateSettings } from "@/hooks/useUpdateSettings";

const props = defineProps<{
  title: string;
}>();

const { token } = userStore();
const { state, isLoading, updateSet } = useUpdateSettings();
const userSetsForm = ref({
  disable_user_signup: false,
  signup_need_review: false
});

const getUserSettings = async () => {
  const { state, execute } = userSettingsApi();
  try {
    await execute({
      headers: {
        Authorization: token.value
      }
    });
    if (state.value) {
      userSetsForm.value = state.value;
    }
  } catch (err: any) {
    console.error(err);
    ElNotification({
      title: "获取用户设置列表失败",
      type: "error",
      message: err.response.data.error || err.message
    });
  }
};

const updateUserSettings = async () => {
  updateSet(userSetsForm.value);
  await getUserSettings();
};

onMounted(async () => {
  await getUserSettings();
});
</script>

<template>
  <el-row :gutter="20">
    <el-col :xs="24" :md="12">
      <div class="card">
        <div class="card-title">登陆注册</div>
        <div class="card-body">
          <el-form :inline="true">
            <el-form-item label="禁止用户注册">
              <el-switch v-model="userSetsForm.disable_user_signup" />
            </el-form-item>
            <el-form-item label="注册需要审核">
              <el-switch v-model="userSetsForm.signup_need_review" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="updateUserSettings" :loading="isLoading">
                保存
              </el-button>
            </el-form-item>
          </el-form>
        </div>
      </div>
    </el-col>
  </el-row>
</template>
