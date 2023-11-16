import { useDefineApi } from "@/stores/useDefineApi";
import type { RoomList } from "@/types/Room";
import type { BaseUserInfo } from "@/types/User";

// 获取个人信息
export const userInfo = useDefineApi<
  {
    headers: { Authorization: string };
  },
  BaseUserInfo
>({
  url: "/api/user/me",
  method: "GET"
});

// 我创建的房间，列表
export const myRoomList = useDefineApi<
  {
    params: {
      page: number;
      max: number;
      sort: string;
      order: string;
      search: string;
      keyword: string;
      status: string;
    };
    headers: { Authorization: string };
  },
  {
    list: RoomList[] | null;
    total: number;
  }
>({
  url: "/api/user/rooms",
  method: "GET"
});
