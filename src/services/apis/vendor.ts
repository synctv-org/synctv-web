import { useDefineApi } from "@/stores/useDefineApi";

// 获取 哔哩哔哩 登录二维码
export const getBiliBiliQRCode = useDefineApi<
  {
    headers: { Authorization: string };
  },
  { url: string; key: string }
>({
  url: "/api/vendor/bilibili/login/qr",
  method: "GET"
});

// 验证 哔哩哔哩 登录二维码
export const veriBiliBiliQRCode = useDefineApi<
  {
    headers: { Authorization: string };
  },
  { status: string }
>({
  url: "/api/vendor/bilibili/login/qr",
  method: "POST"
});

// 获取 哔哩哔哩 人机验证
export const getBiliBiliCaptcha = useDefineApi<
  {
    headers: { Authorization: string };
  },
  {
    token: string;
    gt: string;
    challenge: string;
  }
>({
  url: "/api/vendor/bilibili/login/captcha",
  method: "GET"
});

// 获取 哔哩哔哩 手机验证码
export const getBiliBiliPhoneCode = useDefineApi<
  {
    data: {
      token: string;
      challenge: string;
      validate: string;
      telephone: string;
    };
  },
  {
    captchaKey: string;
  }
>({
  url: "/api/vendor/bilibili/login/sms/send",
  method: "POST"
});
