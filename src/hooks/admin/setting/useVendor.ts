import { ref, reactive } from "vue";
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

export const statusList = {
  0: {
    type: "",
    name: "空闲"
  },
  1: {
    type: "warning",
    name: "连接中"
  },
  2: {
    type: "success",
    name: "就绪"
  },
  3: {
    type: "danger",
    name: "瞬时故障"
  },
  4: {
    type: "info",
    name: "关闭"
  }
};

export const useVendorApi = () => {
  const selections = ref<{ info: { backend: { endpoint: string } } }[]>([]);
  const addAndEditLoading = ref(false);
  const addVendor = async (config: Backend) => {
    addAndEditLoading.value = true;
    const { execute, state } = addVendorApi();
    try {
      await execute({
        headers: {
          Authorization: token.value
        },
        data: config
      });
      addAndEditLoading.value = false;
    } catch (err) {
      errorCatch(err);
      addAndEditLoading.value = false;
    }
    return state;
  };

  const editVendor = async (config: Backend) => {
    addAndEditLoading.value = true;
    const { execute, state } = editVendorApi();
    try {
      await execute({
        headers: {
          Authorization: token.value
        },
        data: config
      });
      addAndEditLoading.value = false;
    } catch (err) {
      errorCatch(err);
      addAndEditLoading.value = false;
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

  const batchDelete = async (e: { info: { backend: { endpoint: string } } }[] | string) => {
    if (Array.isArray(e)) {
      await deleteVendor(
        e.map((item) => item.info.backend.endpoint),
        true
      );
    } else {
      await deleteVendor([e], true);
    }
    await getVendorsList();
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
    addAndEditLoading,
    addVendor,
    editVendor,
    deleteVendor,
    getVendorsList,
    vendorsListState,
    getVendorsListLoading,
    currentPage,
    pageSize,
    selections,
    batchDelete
  };
};
