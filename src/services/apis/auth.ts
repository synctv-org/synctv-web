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

// 登出
export const logOutApi = useDefineApi<{ headers: { Authorization: string } }, any>({
  url: "/api/user/logout",
  method: "POST"
});

// 获取可用的oauth2平台
export const OAuth2Platforms = useDefineApi<any, { enabled: string[] | null }>({
  url: "/oauth2/enabled",
  method: "GET"
});

// 使用 Oauth2 账号登录
export const loginWithOAuth2 = useDefineApi<
  {
    data: {
      redirect: string;
    };
    url: string;
  },
  {
    url: string;
  }
>({
  method: "POST"
});

// oauth2 callback
export const oAuth2Callback = useDefineApi<
  {
    data: {
      code: string;
      state: string;
    };
    url: string;
  },
  {
    token: string;
    redirect: string;
  }
>({
  method: "POST"
});

// 获取站点配置信息
export const getPublicSettings = useDefineApi<
  any,
  {
    emailEnable: boolean;
    emailWhitelistEnabled: boolean;
    emailWhitelist: string[];
  }
>({
  url: "/api/public/settings",
  method: "GET"
});
