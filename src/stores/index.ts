import { computed, ref } from "vue";
import { ElNotification } from "element-plus";
import { getPublicSettings } from "@/services/apis/auth";
import { defineStore } from "pinia";
import type { PublicSettings } from "@/types";

export const indexStore = defineStore("indexStore", () => {
  const { execute, state } = getPublicSettings();

  const settings = ref<PublicSettings>();

  const isPasswordSignupAllowed = computed(() => !settings?.value?.passwordDisableSignup);
  const isEmailSignupAllowed = computed(
    () => settings?.value?.emailEnable && !settings?.value?.emailDisableSignup
  );
  const isOAuth2SignupAllowed = computed(() => !settings?.value?.oauth2DisableSignup);
  const isAnySignupAllowed = computed(
    () => isPasswordSignupAllowed.value || isEmailSignupAllowed.value || isOAuth2SignupAllowed.value
  );

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
    getSiteOptions,
    settings,
    isPasswordSignupAllowed,
    isEmailSignupAllowed,
    isOAuth2SignupAllowed,
    isAnySignupAllowed
  };
});
