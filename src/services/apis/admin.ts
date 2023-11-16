import { useDefineApi } from "@/stores/useDefineApi";
import type { RoomList } from "@/types/Room";

// 获取房间设置
export const roomSettings = useDefineApi<
  {
    headers: {
      Authorization: string;
    };
  },
  {
    create_room_need_review: boolean;
    disable_create_room: boolean;
    room_must_need_pwd: boolean;
    room_ttl: number;
  }
>({
  url: "/api/admin/settings/room",
  method: "GET"
});

// 添加管理员
export const addAdminApi = useDefineApi<
  {
    headers: {
      Authorization: string;
    };
    data: {
      id: string;
    };
  },
  any
>({
  url: "/api/admin/admin/add",
  method: "POST"
});

// 取消管理员身份
export const delAdminApi = useDefineApi<
  {
    headers: {
      Authorization: string;
    };
    data: {
      id: string;
    };
  },
  any
>({
  url: "/api/admin/admin/delete",
  method: "POST"
});

// 获取用户列表
export const userListApi = useDefineApi<
  {
    headers: {
      Authorization: string;
    };
    params: {
      page: number;
      max: number;
      sort: string;
      order: string;

      role: string;
      search: string;
      keyword: string;
    };
  },
  {
    list: {
      id: string;
      username: string;
      role: number;
      createdAt: number;
    }[];
    total: number;
  }
>({
  url: "/api/admin/user/list"
});

// 封禁用户
export const banUserApi = useDefineApi<
  {
    headers: {
      Authorization: string;
    };
    data: {
      id: string;
    };
  },
  any
>({
  url: "/api/admin/user/ban",
  method: "POST"
});

// 解封用户
export const unBanUserApi = useDefineApi<
  {
    headers: {
      Authorization: string;
    };
    data: {
      id: string;
    };
  },
  any
>({
  url: "/api/admin/user/unban",
  method: "POST"
});

// 允许用户注册
export const approveUserApi = useDefineApi<
  {
    headers: {
      Authorization: string;
    };
    data: {
      id: string;
    };
  },
  any
>({
  url: "/api/admin/user/approve",
  method: "POST"
});

// 获取用户创建的房间
export const userRoomListApi = useDefineApi<
  {
    headers: {
      Authorization: string;
    };
    params: {
      page: number;
      max: number;
      sort: string;
      order: string;
      search: string;
      keyword: string;
      id: string;
    };
  },
  {
    list: RoomList[] | null;
    total: number;
  }
>({
  url: "/api/admin/user/rooms",
  method: "GET"
});

// 获取所有设置
export const allSettingsApi = useDefineApi<
  {
    headers: {
      Authorization: string;
    };
  },
  Record<string, Record<string, any>>
>({
  url: "/api/admin/settings",
  method: "GET"
});

// 获取用户相关设置、
export const userSettingsApi = useDefineApi<
  {
    headers: {
      Authorization: string;
    };
  },
  {
    [key: string]: any;
  }
>({
  url: "/api/admin/settings/user",
  method: "GET"
});

// 获取房间相关设置
export const roomSettingsApi = useDefineApi<
  {
    headers: {
      Authorization: string;
    };
  },
  {
    [key: string]: any;
  }
>({
  url: "/api/admin/settings/room",
  method: "GET"
});

// 修改相关设置
export const updateSettingApi = useDefineApi<
  {
    headers: {
      Authorization: string;
    };
    data: Record<string, any>;
  },
  any
>({
  url: "/api/admin/settings",
  method: "POST"
});

// 获取房间列表
export const roomListApi = useDefineApi<
  {
    headers: {
      Authorization: string;
    };
    params: {
      page: number;
      max: number;
      sort: string;
      order: string;
    };
  },
  {
    list: RoomList[] | null;
    total: number;
  }
>({
  url: "/api/admin/room/list",
  method: "GET"
});

// 封禁房间
export const banRoomApi = useDefineApi<
  {
    headers: {
      Authorization: string;
    };
    data: {
      id: string;
    };
  },
  any
>({
  url: "/api/admin/room/ban",
  method: "POST"
});

// 解封房间
export const unBanRoomApi = useDefineApi<
  {
    headers: {
      Authorization: string;
    };
    data: {
      id: string;
    };
  },
  any
>({
  url: "/api/admin/room/unban",
  method: "POST"
});

// 允许房间创建
export const approveRoomApi = useDefineApi<
  {
    headers: {
      Authorization: string;
    };
    data: {
      id: string;
    };
  },
  any
>({
  url: "/api/admin/room/approve",
  method: "POST"
});
