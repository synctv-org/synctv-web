import { ref, reactive } from "vue";
import { ElNotification, ElMessage } from "element-plus";
import { userStore } from "@/stores/user";
import {
  getVendorsListApi,
  addVendorApi,
  editVendorApi,
  deleteVendorApi
} from "@/services/apis/admin";

import type { FormInstance } from "element-plus";
import type { Backend } from "@/types/Vendor";

const { token } = userStore();

const errorCatch = (err: any) => {
  ElNotification({
    title: "错误",
    message: err.response ? err.response.data.error : err.message,
    type: "error"
  });
};

export const formRef = ref<FormInstance>();

export const dialog = reactive<{
  visible: boolean;
  dialog: string;
  mode: "consul" | "etcd" | "none";
  data: Backend;
  openDialog: (type: "new" | "edit", data?: Backend) => void;
  closeDialog: () => void;
  handleSelectionChange: (e: { info: { backend: { endpoint: string } } }[]) => void;
  change: () => void;
  submit: () => void;
  delete: (e: { info: { backend: { endpoint: string } } }[] | string) => void;
  rules: any;
  defaultData: Backend;
  selections: { info: { backend: { endpoint: string } } }[];
}>({
  visible: false,
  mode: "none",
  dialog: "",
  data: {
    backend: {
      endpoint: "",
      comment: "",
      tls: false,
      jwtSecret: "",
      customCA: "",
      timeOut: "",
      consul: {
        serverName: "",
        token: "",
        pathPrefix: "",
        namespace: "",
        partition: ""
      },
      etcd: { serverName: "", username: "", password: "" }
    },
    usedBy: {
      bilibili: false,
      bilibiliBackendName: "",
      alist: false,
      alistBackendName: "",
      emby: false,
      embyBackendName: ""
    }
  },
  selections: [],
  delete: async (e: { info: { backend: { endpoint: string } } }[] | string) => {
    if (Array.isArray(e)) {
      await useVendorApi().deleteVendor(
        e.map((item) => item.info.backend.endpoint),
        true
      );
    } else {
      await useVendorApi().deleteVendor([e], true);
    }
    await useVendorApi().getVendorsList();
  },
  handleSelectionChange: (e: { info: { backend: { endpoint: string } } }[]) => {
    dialog.selections = e;
  },
  openDialog: (type: "new" | "edit", data?: Backend) => {
    dialog.dialog = type;
    dialog.data = data ? data : JSON.parse(JSON.stringify(dialog.defaultData));
    formRef.value?.resetFields();
    dialog.visible = true;
  },
  closeDialog: () => {
    dialog.visible = false;
    dialog.data = JSON.parse(JSON.stringify(dialog.defaultData));
  },
  change: () => {
    dialog.data.backend.consul = JSON.parse(JSON.stringify(dialog.defaultData.backend.consul));
    dialog.data.backend.etcd = JSON.parse(JSON.stringify(dialog.defaultData.backend.etcd));
  },
  submit: async () => {
    dialog.dialog === "new"
      ? await useVendorApi().addVendor(dialog.data)
      : await useVendorApi().editVendor(dialog.data);
    dialog.closeDialog();
    await useVendorApi().getVendorsList();
  },
  rules: {
    backend: {
      endpoint: [{ required: true, message: "请输入后端地址", trigger: "blur" }]
    }
  },
  defaultData: {
    backend: {
      endpoint: "",
      comment: "",
      tls: false,
      jwtSecret: "",
      customCA: "",
      timeOut: "",
      consul: {
        serverName: "",
        token: "",
        pathPrefix: "",
        namespace: "",
        partition: ""
      },
      etcd: { serverName: "", username: "", password: "" }
    },
    usedBy: {
      bilibili: false,
      bilibiliBackendName: "",
      alist: false,
      alistBackendName: "",
      emby: false,
      embyBackendName: ""
    }
  }
});

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
  const getVendorsList = async () => {
    try {
      await execute({
        headers: {
          Authorization: token.value
        },
        page: currentPage.value,
        max: pageSize.value
      });
      if (dialog.dialog === "edit") {
        ElMessage.success("更新成功");
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
