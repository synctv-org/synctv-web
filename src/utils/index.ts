import { RoomAdminPermission, RoomMemberPermission } from "@/types/Room";
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

export const strLengthLimit = (str: string, num: number) => {
  if (str.length > num)
    throw ElMessage({
      type: "error",
      message: `输入框内容过长，单个输入框最大不可超过${num}个字符！`
    });
};

export const blobToUint8Array = (blob: Blob): Promise<Uint8Array> => {
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

export const getAppIcon = (appName: string): string => {
  const href = new URL(`/src/assets/appIcons/${appName}.svg`, import.meta.url).href;
  return href.endsWith("undefined") ? getAppIcon("default") : href;
};

export const getObjValue = <T extends object, K extends keyof T>(obj: T, key: K) => {
  return obj[key];
};

export const parsePermissions = (permissions: number, type: "member" | "admin") => {
  let result: number[] = [];
  const P = type === "member" ? RoomMemberPermission : RoomAdminPermission;
  for (let permission in P) {
    if (!isNaN(Number(permission))) {
      if ((permissions & Number(permission)) !== 0) {
        result.push(Number(permission));
      }
    }
  }
  return result;
};

export const formatTime = (date: Date) => {
  const hours = `0${date.getHours()}`.slice(-2);
  const minutes = `0${date.getMinutes()}`.slice(-2);
  const seconds = `0${date.getSeconds()}`.slice(-2);
  return `${hours}:${minutes}:${seconds}`;
};

export const destroyOldCustomPlayLib = (art: any) => {
  for (const key of ["dash", "m3u8", "hls", "ts", "mpd", "torrent"]) {
    if (art[key]) {
      art[key].destroy();
      art[key] = undefined;
    }
  }
};
