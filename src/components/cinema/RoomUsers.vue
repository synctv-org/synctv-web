<script lang="ts" setup>
import { computed, ref } from "vue";
import { ElNotification } from "element-plus";
import { Search } from "@element-plus/icons-vue";
import { useLocalStorage } from "@vueuse/core";
import { useRouteParams } from "@vueuse/router";
import { ROLE, role, MEMBER_STATUS, memberStatus } from "@/types/Room";
import {
  userListApi,
  banUserApi,
  unBanUserApi,
  setAdminApi,
  setMemberApi
} from "@/services/apis/room";
import { useRoomApi, useRoomPermission } from "@/hooks/useRoom";
import { RoomAdminPermission, RoomMemberPermission } from "@/types/Room";
import UserPermission from "./UserPermission.vue";

const open = ref(false);
const roomID = useRouteParams<string>("roomId");
const roomToken = useLocalStorage(`room-${roomID.value}-token`, "");
const openDrawer = async () => {
  open.value = true;
  await getUserListApi();
};

const userPermissionDialog = ref<InstanceType<typeof UserPermission>>();
const { myInfo } = useRoomApi(roomID.value);
const { hasAdminPermission } = useRoomPermission();
const can = (p: RoomAdminPermission) => {
  if (!myInfo.value) return;
  const myP = myInfo.value.adminPermissions;
  return hasAdminPermission(myP, p);
};

const rolesFilter = computed(() => {
  const v = Object.values(role);
  return v.filter((r) => r !== role[ROLE.Unknown]);
});

const memberStatusFilter = computed(() => {
  const v = Object.values(memberStatus);
  return v.filter((r) => r !== memberStatus[MEMBER_STATUS.Unknown]);
});

const isAdmin = computed(() => myInfo.value!.role >= ROLE.Admin);
const totalItems = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);
const order = ref("desc");
const sort = ref<"join" | "name">("name");
const keyword = ref("");
const search = ref<"all" | "name" | "id">("all");
const role_ = ref("");
const status_ = ref("");
const { state, execute: reqUserListApi, isLoading: userListLoading } = userListApi();
const getUserListApi = async () => {
  try {
    const url = isAdmin.value ? "/api/room/admin/members" : "/api/room/members";
    await reqUserListApi({
      headers: {
        Authorization: roomToken.value
      },
      params: {
        page: currentPage.value,
        max: pageSize.value,
        sort: sort.value,
        order: order.value,

        role: role_.value,
        status: status_.value,
        search: search.value,
        keyword: keyword.value
      },
      url
    });
    if (state.value) {
      totalItems.value = state.value.total;
    }
  } catch (err: any) {
    console.error(err);
    ElNotification({
      title: "获取用户列表失败",
      type: "error",
      message: err.response?.data.error || err.message
    });
  }
};

// 封禁 / 解封 用户
const banUser = async (id: string, is: boolean) => {
  try {
    const config = {
      headers: {
        Authorization: roomToken.value
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
const setAdmin = async (
  id: string,
  mP: RoomMemberPermission,
  aP: RoomAdminPermission,
  is: boolean
) => {
  try {
    const config = {
      headers: {
        Authorization: roomToken.value
      },
      data: {
        id: id
      } as {
        id: string;
        adminPermissions?: RoomAdminPermission;
        permissions?: RoomMemberPermission;
      }
    };
    if (is) {
      config.data.adminPermissions = aP;
      await setAdminApi().execute(config);
    } else {
      config.data.permissions = mP;
      await setMemberApi().execute(config);
    }
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

defineExpose({
  openDrawer
});
</script>

<template>
  <el-drawer
    v-model="open"
    title="用户列表"
    direction="rtl"
    append-to-body
    size="80%"
    style="max-width: 870px"
  >
    <template #default>
      <div class="mb-2">
        <el-tooltip effect="dark" content="权限组" placement="top">
          <el-select
            v-model="role_"
            class="max-lg:mb-2 max-lg:w-full"
            placeholder="权限组"
            style="width: 110px"
            @change="getUserListApi()"
          >
            <el-option label="ALL" value="" />
            <el-option v-for="r in rolesFilter" :label="r" :value="r.toLowerCase()" />
          </el-select>
        </el-tooltip>
        <el-tooltip v-if="isAdmin" effect="dark" content="状态" placement="top">
          <el-select
            v-model="status_"
            class="max-lg:mb-2 max-lg:w-full"
            placeholder="状态"
            style="width: 110px"
            @change="getUserListApi()"
          >
            <el-option label="ALL" value="" />
            <el-option v-for="r in memberStatusFilter" :label="r" :value="r.toLowerCase()" />
          </el-select>
        </el-tooltip>

        <el-input
          class="w-fit max-lg:w-full"
          v-model="keyword"
          placeholder="搜索"
          @keyup.enter="getUserListApi()"
          required
        >
          <template #prepend>
            <el-select
              v-model="search"
              @change="getUserListApi()"
              placeholder="Select"
              style="width: 90px"
            >
              <el-option label="综合" value="all" />
              <el-option label="名称" value="name" />
              <el-option label="ID" value="id" />
            </el-select>
          </template>
          <template #append>
            <el-button :icon="Search" @click="getUserListApi()" />
          </template>
        </el-input>
      </div>
      <el-table
        :data="state?.list"
        v-loading="userListLoading"
        style="width: 100%"
        :loading="userListLoading"
      >
        <el-table-column prop="username" label="用户名" width="160" />
        <el-table-column prop="id" label="ID" width="50">
          <template #default="scope">
            <CopyButton size="small" :value="scope.row.userId" />
          </template>
        </el-table-column>
        <el-table-column prop="role" label="在线状态" width="90">
          <template #default="scope">
            <el-tag v-if="scope.row.isOnline" type="success"> 在线 </el-tag>
            <el-tag v-else type="error"> 离线 </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="role" label="权限组" width="90">
          <template #default="scope">
            <a
              href="javascript:;"
              @click="
                can(RoomAdminPermission.PermissionSetUserPermission) &&
                  userPermissionDialog?.openDialog(
                    scope.row.userId,
                    scope.row.permissions,
                    scope.row.adminPermissions
                  )
              "
            >
              {{ role[scope.row.role as ROLE] }}</a
            >
          </template>
        </el-table-column>
        <el-table-column prop="role" label="状态" width="90">
          <template #default="scope">
            {{ memberStatus[scope.row.status as MEMBER_STATUS] }}
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="加入时间" width="160">
          <template #default="scope">
            {{ new Date(scope.row.joinAt).toLocaleString() }}
          </template>
        </el-table-column>
        <el-table-column fixed="right" label="操作">
          <template #default="scope" v-if="isAdmin">
            <el-button
              v-if="
                can(RoomAdminPermission.PermissionApprovePendingMember) &&
                scope.row.status === MEMBER_STATUS.Pending
              "
              type="success"
            >
              允许加入
            </el-button>
            <div v-else>
              <el-button
                v-if="
                  can(RoomAdminPermission.PermissionBanRoomMember) &&
                  scope.row.status === MEMBER_STATUS.Banned
                "
                type="warning"
                @click="banUser(scope.row.userId, false)"
              >
                解封
              </el-button>

              <div v-else class="phone-button">
                <el-button
                  v-if="
                    can(RoomAdminPermission.PermissionBanRoomMember) &&
                    scope.row.role !== ROLE.Creator &&
                    scope.row.userId !== myInfo?.userId
                  "
                  type="danger"
                  plain
                  @click="banUser(scope.row.userId, true)"
                >
                  封禁
                </el-button>

                <el-button
                  v-if="scope.row.role < ROLE.Admin"
                  type="primary"
                  @click="
                    setAdmin(
                      scope.row.userId,
                      scope.row.permissions,
                      scope.row.adminPermissions,
                      true
                    )
                  "
                >
                  设为管理
                </el-button>
                <el-button
                  v-else-if="
                    scope.row.role === ROLE.Admin &&
                    scope.row.role !== ROLE.Creator &&
                    myInfo?.role === ROLE.Creator
                  "
                  type="warning"
                  @click="
                    setAdmin(
                      scope.row.userId,
                      scope.row.permissions,
                      scope.row.adminPermissions,
                      false
                    )
                  "
                >
                  取消管理
                </el-button>
              </div>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </template>
    <template #footer>
      <div class="flex flex-wrap justify-between">
        <div class="text-base mr-2 max-xl:my-2">
          排序方式：<el-select
            v-model="sort"
            class="mr-2"
            placeholder="排序方式"
            @change="getUserListApi()"
            style="width: 150px"
          >
            <el-option label="用户名" value="name" />
            <el-option label="加入时间" value="join" />
          </el-select>
          <button
            class="btn btn-dense"
            @click="
              order === 'desc' ? (order = 'asc') : (order = 'desc');
              getUserListApi();
            "
          >
            {{ order === "asc" ? "👆" : "👇" }}
          </button>
        </div>

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
    </template>
  </el-drawer>

  <!-- 用户权限编辑对话框 -->
  <UserPermission ref="userPermissionDialog" @updateUserList="getUserListApi" />
</template>
