import { ref } from "vue";
import { ElNotification } from "element-plus";
import { userStore } from "@/stores/user";
import router from "@/router";
import { joinRoomApi, checkRoomApi } from "@/services/apis/room";
import { strLengthLimit } from "@/utils";

// 获取用户信息
const { isLogin, info } = userStore();

export const useRoomApi = (roomId: string, userToken: string) => {
  // 检查房间状态
  const { state: thisRoomInfo, execute: reqCheckRoomApi } = checkRoomApi();
  const checkRoom = async (pwd: string) => {
    try {
      await reqCheckRoomApi({
        params: {
          roomId: roomId
        }
      });
      if (thisRoomInfo.value) {
        if (info.value?.username === thisRoomInfo.value.creator) {
          return await joinRoom({ roomId, password: pwd });
        }
        if (thisRoomInfo.value.needPassword) {
          if (pwd) return await joinRoom({ roomId, password: pwd });
        } else {
          return await joinRoom({ roomId, password: pwd });
        }
      }
    } catch (err: any) {
      console.error(err);
      ElNotification({
        title: "错误",
        message: err.response.data.error || err.message,
        type: "error"
      });
    }
  };

  // 加入房间
  const { state: joinRoomInfo, execute: reqJoinRoomApi } = joinRoomApi();
  const joinRoom = async (formData: { roomId: string; password: string }) => {
    if (!formData.roomId) {
      ElNotification({
        title: "错误",
        message: "请填写表单完整",
        type: "error"
      });
      return;
    }
    for (const key in formData) {
      strLengthLimit(key, 32);
    }
    try {
      await reqJoinRoomApi({
        data: formData,
        headers: {
          Authorization: userToken
        }
      });
      if (!joinRoomInfo.value)
        return ElNotification({
          title: "错误",
          message: "服务器并未返回token",
          type: "error"
        });
      localStorage.setItem(`room-${joinRoomInfo.value.roomId}-token`, joinRoomInfo.value?.token);
      ElNotification({
        title: "加入成功",
        type: "success"
      });

      router.replace(`/cinema/${joinRoomInfo.value.roomId}`);
    } catch (err: any) {
      console.error(err);
      ElNotification({
        title: "错误",
        message: err.response.data.error || err.message,
        type: "error"
      });
    }
  };

  return {
    checkRoom,
    thisRoomInfo,

    joinRoom,
    joinRoomInfo
  };
};
