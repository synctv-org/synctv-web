import { useDefineApi } from "@/stores/useDefineApi";
import type { RegForm, EmailRegForm, PublicSettings } from "@/types";
import type { ROLE } from "@/types/User";

// 邮箱注册
export const useEmailRegisterApi = useDefineApi<
  {
    data: EmailRegForm;
  },
  {
    token: string;
    message: string;
    role: ROLE;
  }
>({
  url: "/api/user/signup/email",
  method: "POST"
});

// 登录
export const LoginApi = useDefineApi<
  {
    data: {
      username: string;
      email: string;
      password: string;
    };
  },
  {
    token: string;
    message: string;
    role: ROLE;
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
export const OAuth2Platforms = useDefineApi<any, { enabled: string[] }>({
  url: "/oauth2/enabled",
  method: "GET"
});

// 获取可注册的oauth2平台
export const OAuth2SignupEnabled = useDefineApi<any, { signupEnabled: string[] }>({
  url: "/oauth2/enabled/signup",
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
    message: string;
    role: ROLE;
  }
>({
  method: "POST"
});

// 获取站点配置信息
export const getPublicSettings = useDefineApi<any, PublicSettings>({
  url: "/api/public/settings",
  method: "GET"
});

// 获取 注册 验证码
export const getRegCaptchaApi = useDefineApi<
  any,
  {
    captchaID: string;
    captchaBase64: string;
  }
>({
  url: "/api/user/signup/email/captcha",
  method: "GET"
});

// 发送 注册 验证码
export const sendRegCodeApi = useDefineApi<
  {
    data: {
      email: string;
      captchaID: string;
      answer: string;
    };
  },
  any
>({
  url: "/api/user/signup/email/captcha",
  method: "POST"
});

// 获取 找回密码 验证码
export const getResetCaptchaApi = useDefineApi<
  any,
  {
    captchaID: string;
    captchaBase64: string;
  }
>({
  url: "/api/user/retrieve/email/captcha",
  method: "GET"
});

// 发送 找回密码 验证码
export const sendResetCodeApi = useDefineApi<
  {
    data: {
      email: string;
      captchaID: string;
      answer: string;
    };
  },
  any
>({
  url: "/api/user/retrieve/email/captcha",
  method: "POST"
});

// 重置密码
export const resetPasswordApi = useDefineApi<
  {
    data: {
      email: string;
      captcha: string;
      password: string;
    };
  },
  any
>({
  url: "/api/user/retrieve/email",
  method: "POST"
});

export const usePasswordRegisterApi = useDefineApi<
  {
    data: RegForm;
  },
  {
    token: string;
    message: string;
    role: ROLE;
  }
>({
  url: "/api/user/signup",
  method: "POST"
});

export const oauth2Platforms: { [key: string]: { name: string; class: string } } = {
  github: {
    name: "Github",
    class: "btn-white"
  },
  microsoft: {
    name: "Microsoft",
    class: "btn-default"
  },
  google: {
    name: "Google",
    class: "btn-white"
  },
  "feishu-sso": {
    name: "飞书SSO",
    class: "btn-white"
  },
  authing: {
    name: "Authing",
    class: "btn-white"
  },
  xiaomi: {
    name: "小米",
    class: "btn-white"
  },
  discord: {
    name: "Discord",
    class: "btn-white"
  },
  baidu: {
    name: "百度",
    class: "btn-white"
  },
  "baidu-netdisk": {
    name: "百度网盘",
    class: "btn-white"
  },
  gitee: {
    name: "Gitee",
    class: "btn-error"
  },
  gitlab: {
    name: "GitLab",
    class: "btn-error"
  },
  qq: {
    name: "QQ",
    class: "btn-default"
  }
};
