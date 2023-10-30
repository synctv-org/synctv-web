import { ref } from "vue";
import { defineStore } from "pinia";
import type { BaseUserInfo } from "@/types/User";

export const userStore = defineStore("userStore", () => {
  const userInfo = ref<BaseUserInfo>();

  return {
    userInfo
  };
});
