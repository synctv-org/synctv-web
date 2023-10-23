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
      hidden: boolean;
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

// 加入房间
export const joinRoomApi = useDefineApi<
  // request
  {
    data: {
      roomId: string;
      password: string;
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
  url: "/api/room/delete",
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
  url: "/api/room/pwd",
  method: "POST"
});
