<script lang="ts" setup>
import { computed, onMounted, ref } from "vue";
import { ElNotification, ElMessage } from "element-plus";
import { userStore } from "@/stores/user";
import { userListApi } from "@/services/apis/admin";
import { ROLE, role } from "@/types/User";

const props = defineProps<{
  title: string;
}>();

const getRole = (rawRole: ROLE) => role[rawRole];

const { token } = userStore();
const totalItems = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);
const order = ref("name");
const sort = ref("desc");
const { state, execute: reqUserListApi } = userListApi();
const getUserListApi = async () => {
  try {
    await reqUserListApi({
      headers: {
        Authorization: token.value
      },
      params: {
        page: currentPage.value,
        max: pageSize.value,
        sort: sort.value,
        order: order.value,

        role: "",
        search: "all",
        keyword: ""
      }
    });
    if (state.value) {
      totalItems.value = state.value.total;
    }
  } catch (err: any) {
    console.error(err);
    ElNotification({
      title: "获取用户列表失败",
      type: "error",
      message: err.response.data.error || err.message
    });
  }
};

onMounted(async () => {
  await getUserListApi();
});
</script>

<template>
  <div class="card">
    <div class="card-title">{{ props.title }}</div>
    <div class="card-body">
      <el-table :data="state?.list" style="width: 100%">
        <el-table-column fixed prop="username" label="用户名" width="200" />
        <el-table-column prop="id" label="ID" />
        <el-table-column prop="role" label="权限组" width="120">
          <template #default="scope">
            {{ getRole(scope.row.role) }}
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="注册时间">
          <template #default="scope">
            {{ new Date(scope.row.createdAt).toLocaleString() }}
          </template>
        </el-table-column>
        <el-table-column fixed="right" label="操作">
          <template #default>
            <el-button link type="primary">[封禁]</el-button>
            <el-button link type="primary">[解封]</el-button>
            <el-button link type="primary">[设为管理]</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>
