import axios, { type AxiosRequestConfig } from "axios";
import { useAsyncState } from "@vueuse/core";
import { decodeJWT } from "@/utils/utils";
import router from "@/router";
import { roomStore } from "@/stores/room";

const room = roomStore();

axios.interceptors.response.use(
  function (response) {
    return response;
  },
  function (error) {
    if (error.response.status === 401) {
      if (
        error.config.url.startsWith("/api/movie") ||
        error.config.url.startsWith("/api/room/delete") ||
        error.config.url.startsWith("/api/room/pwd")
      ) {
        const { r: roomId } = decodeJWT(error.config.headers.Authorization);
        router.push(`/joinRoom/${roomId}`);
      } else {
        room.userToken = "";
        localStorage.clear();
        setTimeout(() => (window.location.href = "/"), 1000);
      }
    }
    return Promise.reject(error);
  }
);

const _req = async <T>(config: AxiosRequestConfig): Promise<T | undefined> => {
  const result = await axios(config);
  let realData = result.data;
  if (realData.data) realData = realData.data;
  return realData;
};

export const request = <T>(config: AxiosRequestConfig) => {
  return useAsyncState<T | undefined, AxiosRequestConfig[]>(
    async (config2) => {
      config = Object.assign({}, config, config2);
      const result = await _req<T>(config);
      return result;
    },
    undefined,
    {
      immediate: false,
      shallow: false as any,
      throwError: true,
      resetOnExecute: false
    }
  );
};
