import { ref } from "vue";
import { defineStore } from "pinia";
import type { BaseUserInfo } from "@/types/User";

export const userStore = defineStore("userStore", () => {
  const info = ref<BaseUserInfo>();

  return {
    info
  };
});
