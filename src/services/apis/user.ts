import { useDefineApi } from "@/stores/useDefineApi";
import type { RoomList } from "@/types/Room";

// 我创建的房间，列表
export const myRoomList = useDefineApi<
  {
    params: {
      page: number;
      max: number;
      sort: string;
      order: string;
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
