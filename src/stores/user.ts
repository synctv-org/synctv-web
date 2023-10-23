import { ref } from "vue";
import { defineStore } from "pinia";

export const userStore = defineStore("userStore", () => {
  const userInfo = ref<{
    username: string;
  }>();

  return {
    userInfo
  };
});
