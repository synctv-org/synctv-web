import { ElNotification } from "element-plus";

import { userStore } from "@/stores/user";

import {
  getVendorsListApi,
  addVendorApi,
  editVendorApi,
  deleteVendorApi
} from "@/services/apis/admin";

import type { Vendors } from "@/types/Vendor";

const { token } = userStore();

const fetch = async (apiMethod: typeof addVendorApi, data: Vendors) => {
  const { execute, state } = apiMethod();
  try {
    await execute({
      headers: {
        Authorization: token.value
      },
      data
    });
    return state;
  } catch (err: any) {
    ElNotification({
      title: "错误",
      message: err.response ? err.response.data.error : err.message,
      type: "error"
    });
  }
};

export const useVendorApi = () => {
  const addVendor = async (config: Vendors) => {
    const res = await fetch(addVendorApi, config);
    return res;
  };

  const editVendor = async (config: Vendors) => {
    const res = await fetch(editVendorApi, config);
    return res;
  };

  const deleteVendor = async (config: Vendors) => {
    const res = await fetch(deleteVendorApi, config);
    return res;
  };

  const getVendorsList = async () => {
    const { execute, state } = getVendorsListApi();
    try {
      await execute({
        headers: {
          Authorization: token.value
        }
      });
    } catch (err: any) {
      ElNotification({
        title: "错误",
        message: err.response ? err.response.data.error : err.message,
        type: "error"
      });
    }
    return state;
  };

  return {
    addVendor,
    editVendor,
    deleteVendor,
    getVendorsList
  };
};
