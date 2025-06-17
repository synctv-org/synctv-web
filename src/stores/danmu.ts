import { defineStore } from "pinia";
import { useStorage } from "@vueuse/core";

export const danmuStore = defineStore("danmukuStore", () => {
  // 是否显示边框
  const danmuBorder = useStorage<boolean>("danmukuBorder", localStorage.danmukuBorder === "false");

  // 是否显示弹幕前面的用户名
  const displayUsername = useStorage<boolean>(
    "displayUsername",
    localStorage.displayUserName === "true"
  );

  // TODO 弹幕长度限制 由房间设置决定 此处只实现获取
  const maxLength = ((): number => {
    const _maxLength = 123;
    return _maxLength;
  })();

  return {
    danmuBorder,
    displayUsername
  };
});
