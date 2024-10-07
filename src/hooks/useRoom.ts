import { ref } from "vue";
import { ElNotification } from "element-plus";
import { userStore } from "@/stores/user";
import { roomStore } from "@/stores/room";
import router from "@/router";
import { myRoomListApi, joinedRoomApi, myJoinedRoomListApi } from "@/services/apis/user";
import { userRoomListApi } from "@/services/apis/admin";
import { joinRoomApi, checkRoomApi, roomListApi, hotRoom, myInfoApi } from "@/services/apis/room";
import { strLengthLimit } from "@/utils";
import { storeToRefs } from "pinia";
import { RoomMemberPermission, RoomAdminPermission, MEMBER_STATUS } from "@/types/Room";

// 获取用户信息
const { info, token, isLogin } = userStore();
const { myInfo } = storeToRefs(roomStore());

export const useRoomApi = () => {
  const { state: thisRoomInfo, execute: reqCheckRoomApi } = checkRoomApi();
  const joinRoom = async (roomId: string, pwd: string) => {
    await reqCheckRoomApi({
      params: {
        roomId: roomId
      }
    });
    if (!thisRoomInfo.value) return;

    if (thisRoomInfo.value.enabledGuest) {
      router.replace(`/cinema/${roomId}`);
      return;
    } else if (isLogin.value) {
      if (info.value?.username === thisRoomInfo.value.creator) {
        router.replace(`/cinema/${roomId}`);
        return;
      }

      if (thisRoomInfo.value.needPassword && !pwd) {
        throw new Error("该房间需要密码，请输入密码");
      }

      return await _joinRoom({ roomId, password: pwd });
    } else {
      router.replace({
        name: "login",
        query: {
          redirect: router.currentRoute.value.fullPath
        }
      });
      throw new Error("请先登录");
    }
  };

  // 加入房间
  const { state: joinRoomInfo, execute: reqJoinRoomApi } = joinRoomApi();
  const { state: joinedRoom, execute: reqJoinedRoomApi } = joinedRoomApi();
  const _joinRoom = async (formData: { roomId: string; password: string }) => {
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
      await reqJoinedRoomApi({
        params: {
          roomId: formData.roomId
        },
        headers: {
          Authorization: token.value
        }
      });
      if (joinedRoom.value!.joined) {
        switch (joinedRoom.value!.status) {
          case MEMBER_STATUS.Pending:
            ElNotification({
              title: "错误",
              message: "等待管理员通过",
              type: "warning"
            });
            break;
          case MEMBER_STATUS.Banned:
            ElNotification({
              title: "错误",
              message: "你已被管理员封禁",
              type: "error"
            });
            break;
          case MEMBER_STATUS.Active:
            ElNotification({
              title: "加入成功",
              type: "success"
            });
            if (formData.password)
              localStorage.setItem(`room-${formData.roomId}-pwd`, formData.password);
            router.replace(`/cinema/${formData.roomId}`);
            break;
          default:
            ElNotification({
              title: "错误",
              message: "未知错误",
              type: "error"
            });
            break;
        }
        return;
      }
      await reqJoinRoomApi({
        data: formData,
        headers: {
          Authorization: token.value
        }
      });
      if (!joinRoomInfo.value) {
        ElNotification({
          title: "错误",
          message: "服务器并未返回数据",
          type: "error"
        });
        return;
      }
      switch (joinRoomInfo.value.status) {
        case MEMBER_STATUS.Pending:
          ElNotification({
            title: "错误",
            message: "等待管理员通过",
            type: "warning"
          });
          break;
        case MEMBER_STATUS.Banned:
          ElNotification({
            title: "错误",
            message: "你已被管理员封禁",
            type: "error"
          });
          break;
        case MEMBER_STATUS.Active:
          ElNotification({
            title: "加入成功",
            type: "success"
          });
          if (formData.password)
            localStorage.setItem(`room-${formData.roomId}-pwd`, formData.password);
          router.replace(`/cinema/${formData.roomId}`);
          break;
        default:
          ElNotification({
            title: "错误",
            message: "未知错误",
            type: "error"
          });
          break;
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
          search: search.value,
          keyword: keyword.value
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

  // 我加入的房间列表
  const { state: myJoinedRoomList, execute: reqMyJoinedRoomList } = myJoinedRoomListApi();
  const getMyJoinedRoomList = async (showMsg = false) => {
    try {
      await reqMyJoinedRoomList({
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

      if (myJoinedRoomList.value) {
        totalItems.value = myJoinedRoomList.value.total;
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

  // 我的信息
  const { state: _myInfo, execute: reqMyInfoApi } = myInfoApi();
  const getMyInfo = async (roomId: string) => {
    await reqMyInfoApi({
      headers: {
        Authorization: token.value,
        "X-Room-Id": roomId
      }
    });

    if (_myInfo.value) {
      myInfo.value = _myInfo.value;
    }
  };

  return {
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

    getMyJoinedRoomList,
    myJoinedRoomList,

    getUserRoomList,
    userRoomList,
    userRoomListLoading,

    getHotRoomList,
    hotRoomList,

    getMyInfo,
    myInfo
  };
};

export const useRoomPermission = () => {
  // member
  const hasMemberPermission = (
    p: RoomMemberPermission | undefined,
    permission: RoomMemberPermission
  ) => {
    if (!p) return;
    return (p & permission) === permission;
  };

  const myMemberPermissions = (p: RoomMemberPermission) => {
    let permissions = [];
    for (let i = 0; i < 7; i++) {
      if ((p & (1 << i)) != 0) {
        permissions.push(RoomMemberPermission[1 << i]);
      }
    }
    return permissions;
  };

  const roomMemberPermissionKeysTranslate: Record<RoomMemberPermission, string> = {
    [RoomMemberPermission.NoPermission]: "无权限",
    // [RoomMemberPermission.DefaultPermissions]: "默认权限",
    // [RoomMemberPermission.AllPermissions]: "所有权限",
    [RoomMemberPermission.PermissionGetMovieList]: "获取影片列表",
    [RoomMemberPermission.PermissionAddMovie]: "添加影片",
    [RoomMemberPermission.PermissionDeleteMovie]: "删除影片",
    [RoomMemberPermission.PermissionEditMovie]: "编辑影片",
    [RoomMemberPermission.PermissionSetCurrentMovie]: "老板换碟",
    [RoomMemberPermission.PermissionSetCurrentStatus]: "同步视频进度",
    [RoomMemberPermission.PermissionSendChatMessage]: "聊天和弹幕"
  };

  const roomMemberPermissionKeys = Object.keys(RoomMemberPermission)
    .filter((key) => typeof RoomMemberPermission[key as any] === "number")
    .filter(
      (key) =>
        // key !== "DefaultPermissions" &&
        // key !== "AllPermissions" &&
        key !== "NoPermission"
    )
    .map((key) => ({ text: key, value: RoomMemberPermission[key as any] }));

  // admin
  const hasAdminPermission = (p: RoomAdminPermission, permission: RoomAdminPermission) =>
    (p & permission) == permission;

  const myAdminPermissions = (p: RoomAdminPermission) => {
    let permissions = [];
    for (let i = 0; i < 6; i++) {
      if ((p & (1 << i)) != 0) {
        permissions.push(RoomAdminPermission[1 << i]);
      }
    }
    return permissions;
  };

  const roomAdminPermissionKeys = Object.keys(RoomAdminPermission)
    .filter((key) => typeof RoomAdminPermission[key as any] === "number")
    .filter(
      (key) =>
        // key !== "DefaultAdminPermissions" &&
        // key !== "AllAdminPermissions" &&
        key !== "NoAdminPermission"
    )
    .map((key) => ({ text: key, value: RoomAdminPermission[key as any] }));

  const roomAdminPermissionKeysTranslate = {
    [RoomAdminPermission.NoAdminPermission]: "无管理员权限",
    // [RoomAdminPermission.DefaultAdminPermissions]: "默认管理员权限",
    // [RoomAdminPermission.AllAdminPermissions]: "所有管理员权限",
    [RoomAdminPermission.PermissionApprovePendingMember]: "允许通过加入房间",
    [RoomAdminPermission.PermissionBanRoomMember]: "封禁房间成员",
    [RoomAdminPermission.PermissionSetUserPermission]: "修改成员权限",
    [RoomAdminPermission.PermissionSetRoomSettings]: "修改房间设置",
    [RoomAdminPermission.PermissionSetRoomPassword]: "修改房间密码",
    [RoomAdminPermission.PermissionDeleteRoom]: "删除房间"
  };

  return {
    // member
    hasMemberPermission,
    myMemberPermissions,
    roomMemberPermissionKeys,
    roomMemberPermissionKeysTranslate,

    // admin
    hasAdminPermission,
    myAdminPermissions,
    roomAdminPermissionKeys,
    roomAdminPermissionKeysTranslate
  };
};
