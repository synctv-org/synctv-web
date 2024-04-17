<script lang="ts" setup>
import { ref } from "vue";
import { ElNotification } from "element-plus";
import { roomSettingsApi } from "@/services/apis/room";
import { updateRoomPasswordApi, delRoomApi } from "@/services/apis/room";
import { useLocalStorage } from "@vueuse/core";
import { useRouteParams } from "@vueuse/router";
import { useSettings, type settingType } from "@/hooks/useSettings";
import { useUpdateSettings } from "@/hooks/useUpdateSettings";
import { strLengthLimit } from "@/utils";

const open = ref(false);
const roomID = useRouteParams<string>("roomId");
const roomToken = useLocalStorage(`room-${roomID.value}-token`, "");
const roomPwd = useLocalStorage(`room-${roomID.value}-pwd`, "");
const { defaultCinemaSettings } = useSettings();
const settings = ref<Map<string, settingType>>(defaultCinemaSettings);
const openDrawer = async () => {
  open.value = true;
  password.value = roomPwd.value;
  await getRoomSettings();
};

const { state, execute, isReady } = roomSettingsApi();
const getRoomSettings = async () => {
  try {
    await execute({
      headers: {
        Authorization: roomToken.value
      }
    });
    if (!state.value) return;

    for (const setting in state.value) {
      if (settings.value.has(setting)) {
        settings.value.set(setting, {
          value: (state.value as any)[setting],
          name: settings.value.get(setting)!.name
        });
      } else {
        settings.value.set(setting, {
          value: (state.value as any)[setting],
          name: setting
        });
      }
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
const { updateSet } = useUpdateSettings("room", roomToken.value);

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
      headers: { Authorization: roomToken.value }
    });

    if (newToken.value) {
      ElNotification({
        title: "更新成功",
        type: "success"
      });
      roomToken.value = newToken.value.token;
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
      headers: { Authorization: roomToken.value }
    });

    ElNotification({
      title: "删除成功",
      type: "success"
    });
    localStorage.removeItem(`room-${roomID.value}-token`);
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
              @click="updateSet(setting[0], setting[1].value)"
            />
            <el-input
              v-else
              v-model.trim.lazy="setting[1].value"
              :placeholder="setting[1].placeholder"
              :disabled="setting[1].disabled"
              :type="setting[1].isTextarea ? 'textarea' : 'text'"
              @change="updateSet(setting[0], setting[1].value)"
            >
              <template #append v-if="setting[1].append">{{ setting[1].append }}</template>
            </el-input>
          </el-form-item>
          <el-form-item label="房间密码">
            <el-input v-model.trim.lazy="password" show-password>
              <template #append>
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
    <template #footer>
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
