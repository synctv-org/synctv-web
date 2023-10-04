import axios, { type AxiosRequestConfig } from "axios";
import { useAsyncState } from "@vueuse/core";

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
