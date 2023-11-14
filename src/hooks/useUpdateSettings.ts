import { ElNotification } from "element-plus";
import { updateSettingApi } from "@/services/apis/admin";
import { userStore } from "@/stores/user";

const { token } = userStore();

export const useUpdateSettings = () => {
  const { state, isLoading, execute } = updateSettingApi();

  const updateSet = async (key: string, value: any) => {
    const data: Record<string, any> = {};
    data[key] = value;
    try {
      await execute({
        headers: {
          Authorization: token.value
        },
        data: data
      });
    } catch (err: any) {
      console.error(err.message);
      ElNotification({
        title: `${key} 设置失败`,
        message: err.response ? err.response.data.error : err.message,
        type: "error"
      });
    }
  };

  return {
    state,
    isLoading,
    updateSet
  };
};
