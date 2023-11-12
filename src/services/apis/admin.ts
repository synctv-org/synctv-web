import { useDefineApi } from "@/stores/useDefineApi";

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
  url: "/api/admin/users"
});
