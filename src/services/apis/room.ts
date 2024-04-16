import { useDefineApi } from "@/stores/useDefineApi";
import type { RoomList } from "@/types/Room";

// 房间列表
export const roomListApi = useDefineApi<
  // request
  {
    params: {
      page: number;
      max: number;
      sort: string;
      order: string;
    };
  },
  // response 服务器返回的 data: {}里面的内容
  {
    list: RoomList[] | null;
    total: number;
  }
>({
  url: "/api/room/list",
  method: "GET"
});

// 创建房间
export const createRoomApi = useDefineApi<
  // request
  {
    data: {
      roomName: string;
      password: string;
      settings: {
        hidden: boolean;
      };
    };
    headers: { Authorization: string };
  },
  // response 服务器返回的 data: {}里面的内容
  {
    roomId: string;
    token: string;
  }
>({
  url: "/api/room/create",
  method: "POST"
});

// 检查房间状态
export const checkRoomApi = useDefineApi<
  {
    params: {
      roomId: string;
    };
  },
  {
    creator: string;
    needPassword: boolean;
    peopleNum: number;
  }
>({
  url: "/api/room/check"
});

// 加入房间
export const joinRoomApi = useDefineApi<
  // request
  {
    data: {
      roomId: string;
      password: string;
    };
    headers: {
      Authorization: string;
    };
  },
  // response
  {
    roomId: string;
    token: string;
  }
>({
  url: "/api/room/login",
  method: "POST"
});

// 删除房间
export const delRoomApi = useDefineApi<
  {
    data: {
      roomId: string;
    };
    headers: { Authorization: string };
  },
  {}
>({
  url: "/api/room/admin/delete",
  method: "POST"
});

// 更新房间密码
export const updateRoomPasswordApi = useDefineApi<
  {
    data: {
      password: string;
    };
    headers: { Authorization: string };
  },
  {
    token: string;
  }
>({
  url: "/api/room/admin/pwd",
  method: "POST"
});

// 热度榜
export const hotRoom = useDefineApi<
  {
    params: {
      page: number;
      max: number;
    };
  },
  {
    list: RoomList[] | null;
    total: number;
  }
>({
  url: "/api/room/hot",
  method: "GET"
});

// 获取房间设置
export const roomSettingsApi = useDefineApi<
  {
    headers: {
      Authorization: string;
    };
  },
  {
    hidden: boolean;
    disable_join_new_user: boolean;
    join_need_review: boolean;
    user_default_permissions: number;
    can_get_movie_list: boolean;
    can_add_movie: boolean;
    can_delete_movie: boolean;
    can_edit_movie: boolean;
    can_set_current_movie: boolean;
    can_set_current_status: boolean;
    can_send_chat_message: boolean;
  }
>({
  url: "/api/room/admin/settings",
  method: "GET"
});

// 修改房间设置
export const updateSettingApi = useDefineApi<
  {
    headers: {
      Authorization: string;
    };
    data: Record<string, any>;
  },
  any
>({
  url: "/api/room/admin/settings",
  method: "POST"
});
