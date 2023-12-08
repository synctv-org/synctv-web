import { ElMessage } from "element-plus";

export const debounces = (delay: number): Function => {
  let timerId: ReturnType<typeof setTimeout> | null = null;

  const add = (func: Function): Function => {
    return (...args: any[]) => {
      if (timerId) {
        clearTimeout(timerId);
      }
      timerId = setTimeout(() => {
        func(...args);
        timerId = null;
      }, delay);
    };
  };

  return add;
};

export const deepEqualObject = (obj1: any, obj2: any) => {
  if (obj1 === obj2) {
    return true;
  } else if (
    typeof obj1 === "object" &&
    typeof obj2 === "object" &&
    Object.keys(obj1).length === Object.keys(obj2).length
  ) {
    for (const key in obj1) {
      if (!deepEqualObject(obj1[key], obj2[key])) {
        return false;
      }
    }
    return true;
  } else {
    return false;
  }
};

export const strLengthLimit = (str: any, num: number) => {
  if (typeof str !== "string") return;
  if (str.length > num)
    throw ElMessage({
      type: "error",
      message: `输入框内容过长，单个输入框最大不可超过${num}个字符！`
    });
};

export const blobToUin8Array = (blob: Blob): Promise<Uint8Array> => {
  return new Promise((resolve, reject) => {
    blob
      .arrayBuffer()
      .then((res) => {
        resolve(new Uint8Array(res));
      })
      .catch((err) => {
        reject(err);
      });
  });
};

export const decodeJWT = (jwt: string) => {
  const parts = jwt.split(".");
  if (parts.length !== 3) {
    throw new Error("非 JWT 格式！");
  }
  try {
    const decodedPayload = atob(parts[1]);
    const parsedPayload = JSON.parse(decodedPayload);
    return parsedPayload;
  } catch (error) {
    throw new Error("JWT 解析失败");
  }
};

export const getAppIcon = (appName: string): string => {
  const href = new URL(`/src/assets/appIcons/${appName}.svg`, import.meta.url).href;
  return href.endsWith("undefined") ? getAppIcon("default") : href;
};
