<script lang="ts" setup>
import { computed, ref } from "vue";
import { ElMessage, ElMessageBox, ElNotification } from "element-plus";
import { RoomMemberPermission, RoomAdminPermission, useRoomPermission } from "@/hooks/useRoom";
import { setMemberPermitApi, setAdminPermitApi } from "@/services/apis/room";
import { useLocalStorage } from "@vueuse/core";
import { useRouteParams } from "@vueuse/router";
interface Option {
  key: number | string;
  label: string;
  disabled: boolean;
}

const open = ref(false);
const mP = ref<number[]>([]);
const aP = ref<number[]>([]);
const userId = ref("");
const openDialog = async (
  uid: string,
  memberPermissions: RoomMemberPermission,
  adminPermissions: RoomAdminPermission
) => {
  open.value = true;
  mP.value = parseMemberPermissions(memberPermissions);
  aP.value = parseMemberPermissions(adminPermissions);
  userId.value = uid;
};

const roomID = useRouteParams<string>("roomId");
const roomToken = useLocalStorage(`room-${roomID.value}-token`, "");
const {
  roomMemberPermissionKeys,
  roomMemberPermissionKeysTranslate,
  roomAdminPermissionKeys,
  roomAdminPermissionKeysTranslate
} = useRoomPermission();
const tabs = ref<"default" | "admin">("default");

function parseMemberPermissions(permissions: number) {
  let result: number[] = [];

  for (let permission in RoomMemberPermission) {
    if (!isNaN(Number(permission))) {
      if ((permissions & Number(permission)) !== 0) {
        result.push(Number(permission));
      }
    }
  }

  return result;
}

const memberPermissionKeys = roomMemberPermissionKeys.map((key) => ({
  key: key.value,
  label: roomMemberPermissionKeysTranslate[key.value as unknown as RoomMemberPermission],
  disabled: false
}));
const mPermissions = computed(() => mP.value.reduce((total, permission) => total | permission, 0));

const adminPermissionKeys = roomAdminPermissionKeys.map((key) => ({
  key: key.value,
  label: roomAdminPermissionKeysTranslate[key.value as unknown as RoomAdminPermission],
  disabled: false
}));
const aPermissions = computed(() => aP.value.reduce((total, permission) => total | permission, 0));
const saveBtnLoading = ref(false);
const setPermit = async () => {
  try {
    saveBtnLoading.value = true;
    const config = {
      headers: {
        Authorization: roomToken.value
      },
      data: {
        id: userId.value
      } as {
        id: string;
        adminPermissions?: RoomAdminPermission;
        permissions?: RoomMemberPermission;
      }
    };
    if (tabs.value === "admin") {
      config.data.adminPermissions = aPermissions.value;
      await setAdminPermitApi().execute(config as any);
    } else {
      config.data.permissions = mPermissions.value;
      await setMemberPermitApi().execute(config as any);
    }

    ElNotification({
      title: "设置成功",
      type: "success"
    });
  } catch (err: any) {
    console.error(err);
    ElNotification({
      title: "错误",
      type: "error",
      message: err.response?.data.error || err.message
    });
  } finally {
    saveBtnLoading.value = false;
  }
};

defineExpose({
  openDialog
});
</script>

<template>
  <el-dialog v-model="open" title="用户权限分配" width="fit-content">
    <el-tabs v-model="tabs" class="-mt-8">
      <el-tab-pane label="默认权限" name="default">
        <el-transfer v-model="mP" :data="memberPermissionKeys" :titles="['权限节点', '已选权限']" />
      </el-tab-pane>
      <el-tab-pane label="管理权限" name="admin">
        <el-transfer v-model="aP" :data="adminPermissionKeys" :titles="['权限节点', '已选权限']" />
      </el-tab-pane>
    </el-tabs>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="open = false">关闭</el-button>
        <el-button type="primary" @click="setPermit" :loading="saveBtnLoading"> 保存 </el-button>
      </div>
    </template>
  </el-dialog>
</template>
