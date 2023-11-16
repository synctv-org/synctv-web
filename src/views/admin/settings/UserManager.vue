<script lang="ts" setup>
import { computed, onMounted, ref } from "vue";
import { ElNotification, ElMessage } from "element-plus";
import { Search } from "@element-plus/icons-vue";
import { userStore } from "@/stores/user";
import {
  userListApi,
  banUserApi,
  unBanUserApi,
  addAdminApi,
  delAdminApi,
  approveUserApi
} from "@/services/apis/admin";
import CopyButton from "@/components/CopyButton.vue";
import userRooms from "@/components/admin/dialogs/userRooms.vue";
import { ROLE, role } from "@/types/User";

const props = defineProps<{
  title: string;
}>();

const userRoomsDialog = ref<InstanceType<typeof userRooms>>();
const getRole = (rawRole: ROLE) => role[rawRole];
const roles = computed(() => {
  const v = Object.values(role);
  return v.filter((r) => r !== role[ROLE.Visitor] && r !== role[ROLE.Unknown]);
});

const { token } = userStore();
const totalItems = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);
const order = ref("createdAt");
const sort = ref("desc");
const keyword = ref("");
const search = ref("all");
const role_ = ref("");
const { state, execute: reqUserListApi, isLoading: userListLoading } = userListApi();
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

        role: role_.value,
        search: search.value,
        keyword: keyword.value
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

// 允许用户注册
const { execute: approveUser, isLoading: approveLoading } = approveUserApi();
const approve = async (id: string) => {
  try {
    await approveUser({
      headers: {
        Authorization: token.value
      },
      data: {
        id: id
      }
    });
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

onMounted(async () => {
  await getUserListApi();
});
</script>

<template>
  <div class="card">
    <div class="card-title flex flex-wrap justify-between items-center">
      <div>
        {{ props.title }}
      </div>

      <div>
        <el-select
          v-model="role_"
          placeholder="权限组"
          style="width: 90px"
          @change="getUserListApi()"
        >
          <el-option label="ALL" value="" />
          <el-option v-for="r in roles" :label="r" :value="r.toLowerCase()" />
        </el-select>
        <el-input
          class="w-fit"
          v-model="keyword"
          placeholder="搜索"
          @keyup.enter="getUserListApi()"
          required
        >
          <template #prepend>
            <el-select v-model="search" placeholder="Select" style="width: 90px">
              <el-option label="综合" value="all" />
              <el-option label="名称" value="name" />
              <el-option label="ID" value="roomId" />
            </el-select>
          </template>
          <template #append>
            <el-button :icon="Search" @click="getUserListApi()" />
          </template>
        </el-input>
      </div>

      <div class="text-base">
        排序方式：<el-select
          v-model="order"
          class="mr-2"
          placeholder="排序方式"
          @change="getUserListApi()"
        >
          <el-option label="用户名" value="username" />
          <el-option label="注册时间" value="createdAt" />
        </el-select>
        <button
          class="btn btn-dense"
          @click="
            sort === 'desc' ? (sort = 'asc') : (sort = 'desc');
            getUserListApi();
          "
        >
          {{ sort === "asc" ? "👆" : "👇" }}
        </button>
      </div>
    </div>
    <div class="card-body">
      <el-table :data="state?.list" v-loading="userListLoading" style="width: 100%">
        <el-table-column prop="username" label="用户名" width="200" />
        <el-table-column prop="id" label="ID" width="120">
          <template #default="scope">
            <div class="flex overflow-hidden text-ellipsis max-w-[100px]">
              <span class="truncate">{{ scope.row.id }}</span>
              <CopyButton size="small" :value="scope.row.id" />
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="role" label="权限组" width="120">
          <template #default="scope">
            {{ getRole(scope.row.role) }}
          </template>
        </el-table-column>
        <el-table-column prop="roomList" label="房间列表" width="120">
          <template #default="scope">
            <el-button type="primary" plain @click="getUserRoom(scope.row.id)"> 查看 </el-button>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="注册时间">
          <template #default="scope">
            {{ new Date(scope.row.createdAt).toLocaleString() }}
          </template>
        </el-table-column>
        <el-table-column fixed="right" label="操作">
          <template #default="scope">
            <el-button
              v-if="scope.row.role === ROLE.Pending"
              type="success"
              @click="approve(scope.row.id)"
              :loading="approveLoading"
            >
              通过注册
            </el-button>
            <div v-else>
              <el-button
                v-if="scope.row.role === ROLE.Banned"
                type="warning"
                @click="banUser(scope.row.id, false)"
              >
                解封
              </el-button>

              <div v-else>
                <el-button type="danger" @click="banUser(scope.row.id, true)"> 封禁 </el-button>

                <el-button
                  v-if="scope.row.role < ROLE.Admin"
                  type="primary"
                  @click="setAdmin(scope.row.id, true)"
                >
                  设为管理
                </el-button>

                <el-button v-else type="warning" @click="setAdmin(scope.row.id, false)">
                  取消管理身份
                </el-button>
              </div>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class="card-footer flex flex-wrap justify-between overflow-hidden">
      <el-button type="success" @click="getUserListApi()" :loading="userListLoading"
        >更新列表</el-button
      >

      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :pager-count="5"
        layout="sizes, prev, pager, next, jumper"
        :total="totalItems"
        @size-change="getUserListApi()"
        @current-change="getUserListApi()"
        class="flex-wrap"
      />
    </div>
  </div>

  <userRooms ref="userRoomsDialog" />
</template>
