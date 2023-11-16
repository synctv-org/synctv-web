<script lang="ts" setup>
import { onMounted, ref } from "vue";
import { ElNotification, ElMessage } from "element-plus";
import { userStore } from "@/stores/user";
import {
  roomListApi,
  banRoomApi,
  unBanRoomApi,
  addAdminApi,
  delAdminApi
} from "@/services/apis/admin";
import CopyButton from "@/components/CopyButton.vue";
import { RoomStatus, roomStatus } from "@/types/Room";

const props = defineProps<{
  title: string;
}>();

const getStatus = (rawStatus: RoomStatus) => roomStatus[rawStatus];

const { token } = userStore();
const totalItems = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);
const order = ref("createdAt");
const sort = ref("desc");
const { state, execute: reqRoomListApi, isLoading: roomListLoading } = roomListApi();
const getRoomListApi = async () => {
  try {
    await reqRoomListApi({
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
      title: "获取房间列表失败",
      type: "error",
      message: err.response.data.error || err.message
    });
  }
};

// 封禁 / 解封 房间
const { execute: ban, isLoading: banLoading } = banRoomApi();
const { execute: unBan, isLoading: unBanLoading } = unBanRoomApi();
const banRoom = async (id: string, is: boolean) => {
  try {
    const config = {
      headers: {
        Authorization: token.value
      },
      data: {
        id: id
      }
    };
    is ? await ban(config) : await unBan(config);
    ElNotification({
      title: `${is ? "封禁" : "解封"}成功`,
      type: "success"
    });
    await getRoomListApi();
  } catch (err: any) {
    console.error(err);
    ElNotification({
      title: "错误",
      type: "error",
      message: err.response.data.error || err.message
    });
  }
};

// 允许创建
const approveCreate = async (id: string, is: boolean) => {
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
    await getRoomListApi();
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
  await getRoomListApi();
});
</script>

<template>
  <div class="card">
    <div class="card-title">
      {{ props.title }}
      <el-button>刷新列表</el-button>
    </div>
    <div class="card-body">
      <el-table :data="state?.list" v-loading="roomListLoading" style="width: 100%">
        <el-table-column prop="roomName" label="房间名" width="150" />
        <el-table-column prop="roomId" label="ID" width="120">
          <template #default="scope">
            <div class="flex overflow-hidden text-ellipsis max-w-[100px]">
              <span class="truncate">{{ scope.row.roomId }}</span>
              <CopyButton size="small" :value="scope.row.roomId" />
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="creator" label="创建人">
          <template #default="scope">
            {{ scope.row.creator }}
          </template>
        </el-table-column>
        <el-table-column prop="peopleNum" label="在线人数" width="80">
          <template #default="scope">
            <el-tag disabled :type="scope.row.peopleNum > 0 ? 'success' : 'danger'">
              {{ scope.row.peopleNum }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="needPassword" label="密码保护" width="100">
          <template #default="scope">
            <el-tag disabled :type="scope.row.needPassword ? 'danger' : 'success'">
              {{ scope.row.needPassword ? "有密码" : "无密码" }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间">
          <template #default="scope">
            {{ new Date(scope.row.createdAt).toLocaleString() }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            {{ getStatus(scope.row.status) }}
          </template>
        </el-table-column>
        <el-table-column fixed="right" label="操作">
          <template #default="scope">
            <el-button
              v-if="scope.row.status !== RoomStatus.Banned"
              type="danger"
              :loading="banLoading"
              @click="banRoom(scope.row.roomId, true)"
            >
              封禁
            </el-button>
            <el-button
              v-else
              type="warning"
              :loading="unBanLoading"
              @click="banRoom(scope.row.roomId, false)"
            >
              解封
            </el-button>
            <el-button
              v-if="scope.row.status === RoomStatus.Pending"
              type="success"
              :loading="banLoading"
              @click="banRoom(scope.row.roomId, true)"
            >
              允许创建
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>

  <userRooms ref="userRoomsDialog" />
</template>
