<script lang="ts" setup>
import { computed, ref } from "vue";
import { ElNotification } from "element-plus";
import { roomSettingsApi } from "@/services/apis/room";
import { updateRoomPasswordApi, delRoomApi } from "@/services/apis/room";
import { useLocalStorage } from "@vueuse/core";
import { useRouteParams } from "@vueuse/router";
import { useSettings, type settingType } from "@/hooks/useSettings";
import { useUpdateRoomSettings } from "@/hooks/useUpdateSettings";
import { parsePermissions, strLengthLimit } from "@/utils";
import { useRoomApi, useRoomPermission } from "@/hooks/useRoom";
import { ROLE, RoomAdminPermission, RoomMemberPermission } from "@/types/Room";

const open = ref(false);
const roomID = useRouteParams<string>("roomId");
const roomPwd = useLocalStorage(`room-${roomID.value}-pwd`, "");
const { defaultCinemaSettings } = useSettings();
const settings = ref<Map<string, settingType>>(defaultCinemaSettings);
const openDrawer = async () => {
  open.value = true;
  password.value = roomPwd.value;
  await getRoomSettings();
};

const Props = defineProps<{
  token: string;
  roomId: string;
}>();

const { myInfo } = useRoomApi(Props.roomId);
const { hasAdminPermission, roomMemberPermissionKeys, roomMemberPermissionKeysTranslate } =
  useRoomPermission();
const can = (p: RoomAdminPermission) => {
  if (!myInfo.value) return;
  const myP = myInfo.value.adminPermissions;
  return hasAdminPermission(myP, p);
};
const isAdmin = computed(() => myInfo.value!.role >= ROLE.Admin);

const { state, execute, isReady } = roomSettingsApi();
const getRoomSettings = async () => {
  try {
    const url = isAdmin.value ? "/api/room/admin/settings" : "/api/room/settings";
    await execute({
      headers: {
        Authorization: Props.token,
        "X-Room-Id": Props.roomId
      },
      url
    });
    if (!state.value) return;
    userDefaultPermissions.value = parsePermissions(state.value.user_default_permissions, "member");
    guestPermissions.value = parsePermissions(state.value.guest_permissions, "member");
    for (const setting in state.value) {
      if (settings.value.has(setting)) {
        settings.value.set(setting, {
          value: (state.value as any)[setting],
          name: settings.value.get(setting)!.name
        });
      }
      // else {
      //   settings.value.set(setting, {
      //     value: (state.value as any)[setting],
      //     name: setting
      //   });
      // }
    }

    // 删除state中不存在的设置
    for (const setting of settings.value.keys()) {
      if (!(setting in state.value)) {
        settings.value.delete(setting);
      }
    }
  } catch (err: any) {
    console.error(err);
    ElNotification({
      title: "获取设置列表失败",
      type: "error",
      message: err.response?.data.error || err.message
    });
  }
};

// 更新房间设置
const { updateSet } = useUpdateRoomSettings(Props.token, Props.roomId);

// 更新房间密码
const password = ref("");
const { state: newToken, execute: reqUpdateRoomPasswordApi } = updateRoomPasswordApi();
const changePassword = async () => {
  try {
    strLengthLimit(password.value, 32);
    await reqUpdateRoomPasswordApi({
      data: {
        password: password.value
      },
      headers: {
        Authorization: Props.token,
        "X-Room-Id": Props.roomId
      }
    });

    if (newToken.value) {
      ElNotification({
        title: "更新成功",
        type: "success"
      });
      roomPwd.value = password.value;
      setTimeout(() => {
        window.location.reload();
      }, 500);
    }
  } catch (err: any) {
    console.error(err);
    ElNotification({
      title: "更新失败",
      message: err.response.data.error || err.message,
      type: "error"
    });
  }
};

// 删除房间
const { execute: reqDelRoomApi, isLoading: delRoomBtnLoading } = delRoomApi();
const deleteRoom = async () => {
  try {
    await reqDelRoomApi({
      data: {
        roomId: roomID.value
      },
      headers: {
        Authorization: Props.token,
        "X-Room-Id": Props.roomId
      }
    });

    ElNotification({
      title: "删除成功",
      type: "success"
    });
    localStorage.removeItem(`room-${roomID.value}-pwd`);
    setTimeout(() => {
      window.location.href = window.location.origin;
    }, 500);
  } catch (err: any) {
    console.error(err);
    ElNotification({
      title: "删除失败",
      message: err.response?.data.error || err.message,
      type: "error"
    });
  }
};

const userDefaultPermissions = ref<number[]>([]);
const computedUserDefaultPermissions = computed(() =>
  userDefaultPermissions.value.reduce((total, permission) => total | permission, 0)
);

const guestPermissions = ref<number[]>([]);
const computedGuestPermissions = computed(() =>
  guestPermissions.value.reduce((total, permission) => total | permission, 0)
);

defineExpose({
  openDrawer
});
</script>

<template>
  <el-drawer
    v-model="open"
    title="房间设置"
    direction="rtl"
    append-to-body
    size="80vmin"
    style="max-width: 520px"
  >
    <template #default>
      <div v-loading="!isReady">
        <el-form :inline="false" label-width="190px" label-position="left">
          <el-form-item v-for="setting in settings">
            <template #label>
              <p :title="setting[1].comment">
                {{ setting[1].name || setting[0] }}
              </p>
            </template>
            <el-switch
              v-if="typeof setting[1].value === 'boolean'"
              v-model="setting[1].value"
              :disabled="!can(RoomAdminPermission.PermissionSetRoomSettings)"
              @change="updateSet(setting[0], setting[1].value)"
            />
            <el-input
              v-else
              v-model.trim.lazy="setting[1].value"
              :placeholder="setting[1].placeholder"
              :disabled="!can(RoomAdminPermission.PermissionSetRoomSettings) && setting[1].disabled"
              :type="setting[1].isTextarea ? 'textarea' : 'text'"
              @change="updateSet(setting[0], setting[1].value)"
            >
              <template #append v-if="setting[1].append">{{ setting[1].append }}</template>
            </el-input>
          </el-form-item>
          <el-form-item label="用户默认权限">
            <div class="flex">
              <el-select
                v-model="userDefaultPermissions"
                multiple
                collapse-tags
                collapse-tags-tooltip
                :disabled="!isAdmin && !can(RoomAdminPermission.PermissionSetRoomSettings)"
              >
                <el-option
                  v-for="(item, i) in roomMemberPermissionKeys"
                  :key="i"
                  :label="
                    roomMemberPermissionKeysTranslate[item.value as unknown as RoomMemberPermission]
                  "
                  :value="item.value"
                />
              </el-select>
              <el-button
                v-if="isAdmin && can(RoomAdminPermission.PermissionSetRoomSettings)"
                @click="updateSet('user_default_permissions', computedUserDefaultPermissions)"
                >更新</el-button
              >
            </div>
          </el-form-item>
          <el-form-item label="访客权限">
            <div class="flex">
              <el-select
                v-model="guestPermissions"
                multiple
                collapse-tags
                collapse-tags-tooltip
                :disabled="!isAdmin && !can(RoomAdminPermission.PermissionSetRoomSettings)"
              >
                <el-option
                  v-for="(item, i) in roomMemberPermissionKeys"
                  :key="i"
                  :label="
                    roomMemberPermissionKeysTranslate[item.value as unknown as RoomMemberPermission]
                  "
                  :value="item.value"
                />
              </el-select>
              <el-button
                v-if="isAdmin && can(RoomAdminPermission.PermissionSetRoomSettings)"
                @click="updateSet('guest_permissions', computedGuestPermissions)"
                >更新</el-button
              >
            </div>
          </el-form-item>
          <el-form-item label="房间密码">
            <el-input v-model.trim.lazy="password" show-password>
              <template #append v-if="can(RoomAdminPermission.PermissionSetRoomPassword)">
                <el-popconfirm
                  width="220"
                  confirm-button-text="是"
                  cancel-button-text="否"
                  title="更新密码后，所有人将会被踢下线！"
                  @confirm="changePassword"
                >
                  <template #reference>
                    <el-button>更新</el-button>
                  </template>
                </el-popconfirm>
              </template>
            </el-input>
          </el-form-item>
        </el-form>
      </div>
    </template>
    <template #footer v-if="can(RoomAdminPermission.PermissionDeleteRoom)">
      <div style="flex: auto">
        <el-popconfirm
          width="220"
          confirm-button-text="是"
          cancel-button-text="否"
          title="你确定要删除这个房间吗？!"
          @confirm="deleteRoom"
        >
          <template #reference>
            <el-button type="danger" :loading="delRoomBtnLoading">删除房间</el-button>
          </template>
        </el-popconfirm>
      </div>
    </template>
  </el-drawer>
</template>
