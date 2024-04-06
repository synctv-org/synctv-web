import { ref } from "vue";
import { ElNotification } from "element-plus";
import { createGlobalState } from "@vueuse/core";
import { getPublicSettings } from "@/services/apis/auth";

export const indexStore = createGlobalState(() => {
  const { execute, state } = getPublicSettings();

  const settings = ref();

  const getSiteOptions = async () => {
    try {
      await execute();
      if (state.value) {
        settings.value = state.value;
      }
    } catch (err: any) {
      console.error(err);
      ElNotification({
        title: "错误",
        message: err.response?.data.error || err.message,
        type: "error"
      });
    }
  };

  return {
    getSiteOptions
  };
});
