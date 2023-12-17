import { ref } from "vue";
import { ElNotification, ElMessage } from "element-plus";
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

  const deleteVendor = async (endpoints: string[], showMsg = false) => {
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
      showMsg && ElMessage.success("删除成功");
    } catch (err) {
      errorCatch(err);
    }
    return state;
  };

  const currentPage = ref(1);
  const pageSize = ref(10);
  const {
    execute,
    state: vendorsListState,
    isLoading: getVendorsListLoading
  } = getVendorsListApi();
  const getVendorsList = async (showMsg = false) => {
    try {
      await execute({
        headers: {
          Authorization: token.value
        },
        page: currentPage.value,
        max: pageSize.value
      });
      if (vendorsListState.value) {
        showMsg && ElMessage.success("更新成功");
      }
    } catch (err: any) {
      errorCatch(err);
    }
  };

  return {
    addVendor,
    editVendor,
    deleteVendor,
    getVendorsList,
    vendorsListState,
    getVendorsListLoading,
    currentPage,
    pageSize
  };
};
