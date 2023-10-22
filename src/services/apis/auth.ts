import { useDefineApi } from "@/stores/useDefineApi";

// 注册
export const RegisterApi = useDefineApi<
  {
    data: {
      username: string;
      password: string;
    };
  },
  {
    token: string;
  }
>({
  url: "/api/user/signup",
  method: "POST"
});

// 登录
export const LoginApi = useDefineApi<
  {
    data: {
      username: string;
      password: string;
    };
  },
  {
    token: string;
  }
>({
  url: "/api/user/login",
  method: "POST"
});

// 获取可用的oauth2平台
export const OAuth2Platforms = useDefineApi<any, { enabled: string[] }>({
  url: "/oauth2/enabled",
  method: "GET"
});

// 使用 Oauth2 账号登录
export const loginWithOAuth2 = useDefineApi<any, { url: string }>({
  method: "POST"
});

// oauth2 callback
export const getUseInfo = useDefineApi<
  {
    data: {
      code: string;
      state: string;
    };
    url: string;
  },
  { token: string }
>({
  method: "POST"
});
