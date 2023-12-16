import { ElNotification } from "element-plus";

import { userStore } from "@/stores/user";

import {
  getVendorsListApi,
  addVendorApi,
  editVendorApi,
  deleteVendorApi
} from "@/services/apis/admin";

import type { Backend } from "@/types/Vendor";

const { token } = userStore();

const errorCatch = (err: any) => {
  ElNotification({
    title: "错误",
    message: err.response ? err.response.data.error : err.message,
    type: "error"
  });
};

export const useVendorApi = () => {
  const addVendor = async (config: Backend) => {
    const { execute, state } = addVendorApi();
    try {
      await execute({
        headers: {
          Authorization: token.value
        },
        data: config
      });
    } catch (err) {
      errorCatch(err);
    }
    return state;
  };

  const editVendor = async (config: Backend) => {
    const { execute, state } = editVendorApi();
    try {
      await execute({
        headers: {
          Authorization: token.value
        },
        data: config
      });
    } catch (err) {
      errorCatch(err);
    }
    return state;
  };

  const deleteVendor = async (endpoints: string[]) => {
    const { execute, state } = deleteVendorApi();
    try {
      await execute({
        headers: {
          Authorization: token.value
        },
        data: {
          endpoints
        }
      });
    } catch (err) {
      errorCatch(err);
    }
    return state;
  };

  const { execute, state: vendorsListState } = getVendorsListApi();
  const getVendorsList = async () => {
    try {
      await execute({
        headers: {
          Authorization: token.value
        }
      });
    } catch (err: any) {
      errorCatch(err);
    }
    return vendorsListState;
  };

  return {
    addVendor,
    editVendor,
    deleteVendor,
    getVendorsList,
    vendorsListState
  };
};
