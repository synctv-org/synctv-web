import { computed, ref } from "vue";
import { ROLE, type BaseUserInfo } from "@/types/User";
import { ElNotification } from "element-plus";
import { userInfo } from "@/services/apis/user";
import { createGlobalState, useStorage } from "@vueuse/core";

export const userStore = createGlobalState(() => {
  const { execute } = userInfo();

  const token = useStorage<string>("userToken", "");
  const updateToken = (_token: string) => {
    token.value = _token;
  };

  const isLogin = computed(() => token.value !== "");
  const info = ref<BaseUserInfo>();

  // const isAdmin = computed(() => info.value?.role === ROLE.Admin);
  // const isRoot = computed(() => info.value?.role === ROLE.Root);

  const getUserInfo = async (userInfo?: BaseUserInfo) => {
    if (userInfo) {
      info.value = userInfo;
    } else {
      try {
        const state = await execute({
          headers: {
            Authorization: token.value
          }
        });
        if (state.value) {
          info.value = state.value;
        }
      } catch (err: any) {
        console.error(err);
        ElNotification({
          title: "错误",
          message: err.response.data.error || err.message,
          type: "error"
        });
      }
    }
  };

  return {
    getUserInfo,
    info,
    token,
    updateToken,
    isLogin
  };
});
