import { useDefineApi } from "@/stores/useDefineApi";

// 获取 哔哩哔哩 登录二维码
export const getBiliBiliQRCode = useDefineApi<
  { headers: { Authorization: string } },
  { url: string; key: string }
>({
  method: "GET",
  url: "/api/vendor/bilibili/qr"
});

// 登录 哔哩哔哩
export const loginBiliBili = useDefineApi<
  {
    data: {
      key: string;
    };
    headers: { Authorization: string };
  },
  any
>({
  method: "POST",
  url: "/api/vendor/bilibili/login"
});
