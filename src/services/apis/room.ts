import { useDefineApi } from "@/stores/useDefineApi";
import type { MEMBER_ROLE, MEMBER_STATUS, MyInfo, RoomInfo, RoomList } from "@/types/Room";
import type { ROLE } from "@/types/User";

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
    name: string;
    creator: string;
    needPassword: boolean;
    peopleNum: number;
    enabledGuest: boolean;
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
    status: MEMBER_STATUS;
    role: MEMBER_ROLE;
    permissions: number;
    adminPermissions: number;
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
      "X-Room-Id": string;
    };
  },
  {
    hidden: boolean;
    disable_join_new_user: boolean;
    join_need_review: boolean;
    user_default_permissions: number;
    guest_permissions: number;
    can_get_movie_list: boolean;
    can_add_movie: boolean;
    can_delete_movie: boolean;
    can_edit_movie: boolean;
    can_set_current_movie: boolean;
    can_set_current_status: boolean;
    can_send_chat_message: boolean;
  }
>({
  method: "GET"
});

// 房间内用户列表
export const userListApi = useDefineApi<
  {
    headers: {
      Authorization: string;
      "X-Room-Id": string;
    };
    params: {
      page: number;
      max: number;
      sort: "join" | "name";
      order: string;

      status?: string;
      role: string;
      search: "all" | "name" | "id";
      keyword: string;
    };
    url: string;
  },
  {
    list: {
      userId: string;
      username: string;
      role: ROLE;
      joinAt: number;
      onlineCount: number;
      roomId: string;
      permissions: number;
      adminPermissions: number;
    }[];
    total: number;
  }
>({});

// 我的信息
export const myInfoApi = useDefineApi<
  {
    headers: {
      Authorization: string;
      "X-Room-Id": string;
    };
  },
  MyInfo
>({
  url: "/api/room/me",
  method: "GET"
});

// 房间信息
export const roomInfoApi = useDefineApi<
  {
    headers: {
      Authorization: string;
      "X-Room-Id": string;
    };
  },
  RoomInfo
>({
  url: "/api/room/info",
  method: "GET"
});

// 更新房间密码
export const updateRoomPasswordApi = useDefineApi<
  {
    data: {
      password: string;
    };
    headers: {
      Authorization: string;
      "X-Room-Id": string;
    };
  },
  {}
>({
  url: "/api/room/admin/pwd",
  method: "POST"
});

// 检查房间密码
export const checkRoomPasswordApi = useDefineApi<
  {
    data: {
      password: string;
    };
    headers: {
      Authorization: string;
      "X-Room-Id": string;
    };
  },
  {
    valid: boolean;
  }
>({
  url: "/api/room/pwd/check",
  method: "POST"
});

// 修改房间设置
export const updateSettingApi = useDefineApi<
  {
    headers: {
      Authorization: string;
      "X-Room-Id": string;
    };
    data: Record<string, any>;
  },
  any
>({
  url: "/api/room/admin/settings",
  method: "POST"
});

// 封禁用户
export const banUserApi = useDefineApi<
  {
    headers: {
      Authorization: string;
      "X-Room-Id": string;
    };
    data: {
      id: string;
    };
  },
  any
>({
  url: "/api/room/admin/members/ban",
  method: "POST"
});

// 解封用户
export const unbanUserApi = useDefineApi<
  {
    headers: {
      Authorization: string;
      "X-Room-Id": string;
    };
    data: {
      id: string;
    };
  },
  any
>({
  url: "/api/room/admin/members/unban",
  method: "POST"
});

// 允许加入
export const approveUserApi = useDefineApi<
  {
    headers: {
      Authorization: string;
      "X-Room-Id": string;
    };
    data: {
      id: string;
    };
  },
  any
>({
  url: "/api/room/admin/members/approve",
  method: "POST"
});

export const deleteUserApi = useDefineApi<
  {
    headers: {
      Authorization: string;
      "X-Room-Id": string;
    };
    data: {
      id: string;
    };
  },
  any
>({
  url: "/api/room/admin/members/delete",
  method: "POST"
});

// 设置为管理员
export const setAdminApi = useDefineApi<
  {
    headers: {
      Authorization: string;
      "X-Room-Id": string;
    };
    data: {
      id: string;
    };
  },
  any
>({
  url: "/api/room/admin/members/admin",
  method: "POST"
});

// 设置为普通成员
export const setMemberApi = useDefineApi<
  {
    headers: {
      Authorization: string;
      "X-Room-Id": string;
    };
    data: {
      id: string;
    };
  },
  any
>({
  url: "/api/room/admin/members/member",
  method: "POST"
});

// 设置普通成员组的权限
export const setMemberPermitApi = useDefineApi<
  {
    headers: {
      Authorization: string;
      "X-Room-Id": string;
    };
    data: {
      id: string;
      permissions: number;
    };
  },
  any
>({
  url: "/api/room/admin/members/member/permissions",
  method: "POST"
});

// 设置管理员组的权限
export const setAdminPermitApi = useDefineApi<
  {
    headers: {
      Authorization: string;
      "X-Room-Id": string;
    };
    data: {
      id: string;
      adminPermissions: number;
    };
  },
  any
>({
  url: "/api/room/admin/members/admin/permissions",
  method: "POST"
});
