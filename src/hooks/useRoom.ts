import { ref } from "vue";
import { ElNotification } from "element-plus";
import { userStore } from "@/stores/user";
import router from "@/router";
import { myRoomListApi } from "@/services/apis/user";
import { userRoomListApi } from "@/services/apis/admin";
import { joinRoomApi, checkRoomApi, roomListApi, hotRoom } from "@/services/apis/room";
import { strLengthLimit } from "@/utils";

// 获取用户信息
const { info, token } = userStore();

export const useRoomApi = (roomId: string) => {
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
          Authorization: token.value
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

  // 房间列表
  const totalItems = ref(0);
  const currentPage = ref(1);
  const pageSize = ref(10);
  const order = ref("desc");
  const sort = ref("name");
  const keyword = ref("");
  const search = ref("all");
  const status = ref("");
  const { state: roomList, execute: reqRoomList } = roomListApi();
  const getRoomList = async (showMsg = false) => {
    try {
      await reqRoomList({
        params: {
          page: currentPage.value,
          max: pageSize.value,
          sort: sort.value,
          order: order.value,
          search: "all",
          keyword: ""
        }
      });

      if (roomList.value) {
        totalItems.value = roomList.value.total;
      }

      showMsg &&
        ElNotification({
          title: "更新列表成功",
          type: "success"
        });
    } catch (err: any) {
      console.error(err.message);
      ElNotification({
        title: "错误",
        message: err.response.data.error || err.message,
        type: "error"
      });
    }
  };

  // 我创建的房间列表
  const { state: myRoomList, execute: reqMyRoomList } = myRoomListApi();
  const getMyRoomList = async (showMsg = false) => {
    try {
      await reqMyRoomList({
        params: {
          page: currentPage.value,
          max: pageSize.value,
          sort: sort.value,
          order: order.value,
          search: search.value,
          keyword: keyword.value,
          status: status.value
        },
        headers: {
          Authorization: token.value
        }
      });

      if (myRoomList.value) {
        totalItems.value = myRoomList.value.total;
      }

      showMsg &&
        ElNotification({
          title: "更新列表成功",
          type: "success"
        });
    } catch (err: any) {
      console.error(err.message);
      ElNotification({
        title: "错误",
        message: err.response.data.error || err.message,
        type: "error"
      });
    }
  };

  // 用户房间列表
  const {
    state: userRoomList,
    execute: reqUserRoomListApi,
    isLoading: userRoomListLoading
  } = userRoomListApi();
  const getUserRoomList = async (showMsg = false, userId: string) => {
    try {
      await reqUserRoomListApi({
        headers: {
          Authorization: token.value
        },
        params: {
          page: currentPage.value,
          max: pageSize.value,
          sort: sort.value,
          order: order.value,
          status: status.value,
          search: search.value,
          keyword: keyword.value,
          id: userId
        }
      });

      if (userRoomList.value) {
        totalItems.value = userRoomList.value.total;
      }

      showMsg &&
        ElNotification({
          title: "更新列表成功",
          type: "success"
        });
    } catch (err: any) {
      console.error(err.message);
      ElNotification({
        title: "错误",
        message: err.response.data.error || err.message,
        type: "error"
      });
    }
  };

  // 热度榜
  const { state: hotRoomList, execute: reqHotRoomList } = hotRoom();
  const getHotRoomList = async (showMsg = false) => {
    try {
      await reqHotRoomList({
        params: {
          page: currentPage.value,
          max: pageSize.value
        }
      });

      if (hotRoomList.value) {
        totalItems.value = hotRoomList.value.total;
      }

      showMsg &&
        ElNotification({
          title: "更新列表成功",
          type: "success"
        });
    } catch (err: any) {
      console.error(err.message);
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
    joinRoomInfo,

    totalItems,
    currentPage,
    pageSize,
    order,
    sort,
    keyword,
    search,
    status,
    getRoomList,
    roomList,

    getMyRoomList,
    myRoomList,

    getUserRoomList,
    userRoomList,
    userRoomListLoading,

    getHotRoomList,
    hotRoomList
  };
};
