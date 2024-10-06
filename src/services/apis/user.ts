import { useDefineApi } from "@/stores/useDefineApi";
import type { MEMBER_STATUS, RoomList } from "@/types/Room";
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
export const myRoomListApi = useDefineApi<
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

// 修改密码
export const changePasswordApi = useDefineApi<
  {
    headers: { Authorization: string };
    data: {
      password: string;
    };
  },
  {
    token: string;
  }
>({
  url: "/api/user/password",
  method: "POST"
});

// 修改用户名
export const changeUNameApi = useDefineApi<
  {
    headers: { Authorization: string };
    data: {
      username: string;
    };
  },
  any
>({
  url: "/api/user/username",
  method: "POST"
});

// 获取可用的 OAuth2 平台
export const oAuth2Platforms = useDefineApi<
  {
    headers: { Authorization: string };
  },
  {
    [platform: string]: {
      providerUserID: string;
      createdAt: number;
    };
  }
>({
  url: "/api/user/providers",
  method: "GET"
});

// 绑定 OAuth2
export const bindOAuth2Api = useDefineApi<
  {
    headers: { Authorization: string };
    data?: {
      redirect: string;
    };
    url: string;
  },
  {
    time: number;
    url: string;
  }
>({
  method: "POST"
});

// 解绑 OAuth2
export const unbindOAuth2Api = useDefineApi<
  {
    headers: { Authorization: string };
    url: string;
  },
  any
>({
  method: "POST"
});

// 获取 绑定邮箱 验证码
export const getBindEmailCaptchaApi = useDefineApi<
  {
    headers: {
      Authorization: string;
    };
  },
  {
    captchaID: string;
    captchaBase64: string;
  }
>({
  url: "/api/user/bind/email/captcha",
  method: "GET"
});

// 发送 绑定邮箱 验证码
export const sendBindEmailCodeApi = useDefineApi<
  {
    headers: {
      Authorization: string;
    };
    data: {
      email: string;
      captchaID: string;
      answer: string;
    };
  },
  any
>({
  url: "/api/user/bind/email/captcha",
  method: "POST"
});

// 绑定邮箱
export const bindEmailApi = useDefineApi<
  {
    headers: {
      Authorization: string;
    };
    data: {
      email: string;
      captcha: string;
    };
  },
  any
>({
  url: "/api/user/bind/email",
  method: "POST"
});

// 解绑邮箱
export const unbindEmailApi = useDefineApi<
  {
    headers: {
      Authorization: string;
    };
  },
  any
>({
  url: "/api/user/unbind/email",
  method: "POST"
});

export const joinedRoomApi = useDefineApi<
  {
    params: {
      roomId: string;
    };
    headers: {
      Authorization: string;
    };
  },
  {
    joined: boolean;
    status: MEMBER_STATUS;
  }
>({
  url: "/api/user/room/joined",
  method: "GET"
});
