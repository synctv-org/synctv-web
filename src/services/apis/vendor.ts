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
