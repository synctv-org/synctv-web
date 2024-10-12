import { ElNotification } from "element-plus";
import { updateSettingApi as updateAdminSettingApi } from "@/services/apis/admin";
import { updateSettingApi as updateRoomSettingApi } from "@/services/apis/room";
import { ref } from "vue";

export const useUpdateAdminSettings = (token: string) => {
  const { state, isLoading, execute } = updateAdminSettingApi();
  const updatingKeys = ref<Set<string>>(new Set());

  const updateSet = async (key: string, value: any) => {
    const data: Record<string, any> = {};
    data[key] = value;
    updatingKeys.value.add(key);
    try {
      await execute({
        headers: {
          Authorization: token
        },
        data: data
      });
    } catch (err: any) {
      console.error(err.message);
      ElNotification({
        title: `${key} 设置失败`,
        message: err.response?.data.error || err.message,
        type: "error"
      });
    } finally {
      updatingKeys.value.delete(key);
    }
  };

  const isUpdating = (key: string) => updatingKeys.value.has(key);

  return {
    state,
    isLoading,
    updateSet,
    isUpdating
  };
};

export const useUpdateRoomSettings = (token: string, roomId: string) => {
  const { state, isLoading, execute } = updateRoomSettingApi();
  const updatingKeys = ref<Set<string>>(new Set());

  const updateSet = async (key: string, value: any) => {
    const data: Record<string, any> = {};
    data[key] = value;
    updatingKeys.value.add(key);
    try {
      await execute({
        headers: {
          Authorization: token,
          "X-Room-Id": roomId
        },
        data: data
      });
    } catch (err: any) {
      console.error(err.message);
      ElNotification({
        title: `${key} 设置失败`,
        message: err.response?.data.error || err.message,
        type: "error"
      });
    } finally {
      updatingKeys.value.delete(key);
    }
  };

  const isUpdating = (key: string) => updatingKeys.value.has(key);

  return {
    state,
    isLoading,
    updateSet,
    isUpdating
  };
};
