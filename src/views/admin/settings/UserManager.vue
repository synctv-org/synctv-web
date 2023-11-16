<script lang="ts" setup>
import { onMounted, ref } from "vue";
import { ElNotification, ElMessage } from "element-plus";
import { userStore } from "@/stores/user";
import {
  userListApi,
  banUserApi,
  unBanUserApi,
  addAdminApi,
  delAdminApi
} from "@/services/apis/admin";
import userRooms from "@/components/admin/dialogs/userRooms.vue";
import { ROLE, role } from "@/types/User";

const props = defineProps<{
  title: string;
}>();

const userRoomsDialog = ref<InstanceType<typeof userRooms>>();
const getRole = (rawRole: ROLE) => role[rawRole];

const { token } = userStore();
const totalItems = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);
const order = ref("createdAt");
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

// 封禁 / 解封 用户
const banUser = async (id: string, is: boolean) => {
  try {
    const config = {
      headers: {
        Authorization: token.value
      },
      data: {
        id: id
      }
    };
    is ? await banUserApi().execute(config) : await unBanUserApi().execute(config);
    ElNotification({
      title: `${is ? "封禁" : "解封"}成功`,
      type: "success"
    });
    await getUserListApi();
  } catch (err: any) {
    console.error(err);
    ElNotification({
      title: "错误",
      type: "error",
      message: err.response.data.error || err.message
    });
  }
};

// 设管理
const setAdmin = async (id: string, is: boolean) => {
  try {
    const config = {
      headers: {
        Authorization: token.value
      },
      data: {
        id: id
      }
    };
    is ? await addAdminApi().execute(config) : await delAdminApi().execute(config);
    ElNotification({
      title: "设置成功",
      type: "success"
    });
    await getUserListApi();
  } catch (err: any) {
    console.error(err);
    ElNotification({
      title: "错误",
      type: "error",
      message: err.response.data.error || err.message
    });
  }
};

// 查看用户房间
const getUserRoom = async (id: string) => {
  userRoomsDialog.value?.openDialog(id);
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
        <el-table-column prop="username" label="用户名" width="200" />
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
          <template #default="scope">
            <button
              class="btn btn-dense mr-2"
              href="javascript:;"
              @click="getUserRoom(scope.row.id)"
            >
              详情
            </button>
            <el-dropdown>
              <button class="btn btn-dense btn-warning" href="javascript:;">操作</button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item
                    v-if="scope.row.role !== ROLE.Banned"
                    @click="banUser(scope.row.id, true)"
                  >
                    封禁
                  </el-dropdown-item>
                  <el-dropdown-item v-else @click="banUser(scope.row.id, false)"
                    >解封</el-dropdown-item
                  >
                  <el-dropdown-item
                    v-if="scope.row.role < ROLE.Admin"
                    @click="setAdmin(scope.row.id, true)"
                    >设为管理</el-dropdown-item
                  >
                  <el-dropdown-item v-else @click="setAdmin(scope.row.id, false)"
                    >取消管理身份</el-dropdown-item
                  >
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>

  <userRooms ref="userRoomsDialog" />
</template>