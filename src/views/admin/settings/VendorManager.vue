<script setup lang="ts">
import { onMounted, ref, reactive } from "vue";
import { useVendorApi } from "@/hooks/admin/setting/useVendor";
import { getAppIcon } from "@/utils/index";

import type { Backend } from "@/types/Vendor";

const props = defineProps<{
  title: string;
}>();

const { vendorsListState, getVendorsList, addVendor, deleteVendor, editVendor } = useVendorApi();

const data = ref(vendorsListState);

const dialog = reactive<{
  visible: boolean;
  dialog: string;
  mode: "consul" | "etcd" | "none";
  data: Backend;
  openDialog: (type: "new" | "edit", data?: Backend) => void;
  closeDialog: () => void;
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
  delete: (e: { info: { backend: { endpoint: string } } }[] | string) => {
    if (Array.isArray(e)) {
      deleteVendor(e.map((item) => item.info.backend.endpoint));
    } else {
      deleteVendor([e]);
    }
    getVendorsList();
  },
  openDialog: (type: "new" | "edit", data?: Backend) => {
    dialog.dialog = type;
    dialog.data = data ? data : JSON.parse(JSON.stringify(dialog.defaultData));
    dialog.visible = true;
  },
  closeDialog: () => {
    dialog.visible = false;
    dialog.data = JSON.parse(JSON.stringify(dialog.defaultData));
    getVendorsList();
  },
  change: () => {
    dialog.data.backend.consul = JSON.parse(JSON.stringify(dialog.defaultData.backend.consul));
    dialog.data.backend.etcd = JSON.parse(JSON.stringify(dialog.defaultData.backend.etcd));
  },
  submit: () => {
    if (dialog.dialog === "new") {
      addVendor(dialog.data);
      dialog.closeDialog();
    }
    if (dialog.dialog === "edit") {
      editVendor(dialog.data);
      dialog.closeDialog();
    }
  },
  rules: {
    endpoint: [{ required: true, message: "请输入后端地址" }]
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

const handleSelectionChange = (e: { info: { backend: { endpoint: string } } }[]) => {
  // console.log(e[0].info.backend.endpoint);
  dialog.selections = e;
};

const statusList = {
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

onMounted(() => {
  getVendorsList();
});
</script>

<template>
  <div class="card">
    <div class="card-title flex flex-wrap justify-between items-center">
      <div>
        {{ props.title }}
      </div>
      <div>
        <el-button class="max-xl:mt-3" type="warning" @click="dialog.delete(dialog.selections)">
          批量删除
        </el-button>

        <el-button class="max-xl:mt-3" type="primary" @click="dialog.openDialog('new')">
          添加解析器
        </el-button>

        <el-button class="max-xl:mt-3" type="success" @click="getVendorsList()">
          刷新列表
        </el-button>
      </div>
    </div>
    <div class="card-body">
      <el-table
        :stripe="true"
        :data="data"
        @selection-change="handleSelectionChange($event)"
        style="width: 100%"
        table-layout="fixed"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="info.backend.endpoint" label="节点">
          <template #default="scope">
            <div style="display: flex; align-items: center">
              <el-image
                v-if="scope.row.info.backend.consul.serverName"
                style="max-width: 15px"
                :src="getAppIcon('consul')"
              />
              <el-image
                v-if="scope.row.info.backend.etcd.serverName"
                style="max-width: 15px"
                :src="getAppIcon('etcd')"
              />
              {{ scope.row.info.backend.endpoint }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="info.backend.comment" label="备注" />
        <el-table-column prop="info.backend.jwtSecret" label="JWT密钥" />
        <el-table-column prop="info.backend.timeOut" label="超时时间" />
        <el-table-column prop="status" label="当前状态">
          <template #default="scope">
            <el-tag v-if="scope" :type="statusList[scope.row.status as 0 | 1 | 2 | 3 | 4].type">{{
              statusList[scope.row.status as 0 | 1 | 2 | 3 | 4].name
            }}</el-tag>
            <el-tag v-else type="info">无效状态</el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="info.backend.endpoint" label="操作">
          <template #default="scope">
            <el-button type="primary" link @click="dialog.openDialog('edit', scope.row.info)"
              >编辑</el-button
            >
            <el-popconfirm
              title="你确定要删除吗？"
              @confirm="dialog.delete(scope.row.info.backend.endpoint)"
            >
              <template #reference>
                <el-button type="danger" link>删除</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class="card-footer flex flex-wrap justify-between overflow-hidden"></div>
  </div>

  <el-dialog
    class="el-dialog rounded-lg dark:bg-zinc-800 w-2/6 max-sm:w-full"
    v-model="dialog.visible"
    title="配置解析器"
  >
    <el-form :model="dialog.data" :rules="dialog.rules" label-width="120px">
      <el-form-item label="节点" prop="endpoint">
        <el-input :disabled="dialog.dialog !== 'new'" v-model="dialog.data.backend.endpoint" />
      </el-form-item>
      <el-form-item label="备注">
        <el-input v-model="dialog.data.backend.comment" />
      </el-form-item>
      <el-form-item label="TLS">
        <el-switch v-model="dialog.data.backend.tls" />
      </el-form-item>
      <el-form-item label="JWT密钥">
        <el-input v-model="dialog.data.backend.jwtSecret" />
      </el-form-item>
      <el-form-item label="超时时间">
        <el-input v-model="dialog.data.backend.timeOut" />
      </el-form-item>
      <el-form-item label="服务发现" :change="dialog.change()">
        <el-select v-model="dialog.mode" class="m-2" placeholder="Select">
          <el-option value="none" label="none" />
          <el-option value="consul" label="consul" />
          <el-option value="etcd" label="etcd" />
        </el-select>
      </el-form-item>
      <div v-if="dialog.mode === 'consul'">
        <el-form-item label="服务名">
          <el-input v-model="dialog.data.backend.consul!.serverName" />
        </el-form-item>
        <el-form-item label="token">
          <el-input v-model="dialog.data.backend.consul!.token" />
        </el-form-item>
        <el-form-item label="Consul的路径前缀">
          <el-input v-model="dialog.data.backend.consul!.pathPrefix" />
        </el-form-item>
        <el-form-item label="命名空间">
          <el-input v-model="dialog.data.backend.consul!.namespace" />
        </el-form-item>
        <el-form-item label="分区">
          <el-input v-model="dialog.data.backend.consul!.partition" />
        </el-form-item>
      </div>
      <div v-if="dialog.mode === 'etcd'">
        <el-form-item label="服务名">
          <el-input v-model="dialog.data.backend.etcd!.serverName" />
        </el-form-item>
        <el-form-item label="用户名">
          <el-input v-model="dialog.data.backend.etcd!.username" />
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="dialog.data.backend.etcd!.password" />
        </el-form-item>
      </div>
      <el-form-item label="应用到Bilibili">
        <el-switch v-model="dialog.data.usedBy!.bilibili" />
      </el-form-item>
      <el-form-item label="Bilibili服务名称">
        <el-input v-model="dialog.data.usedBy!.bilibiliBackendName" />
      </el-form-item>

      <el-form-item label="应用到Alist">
        <el-switch v-model="dialog.data.usedBy!.alist" />
      </el-form-item>
      <el-form-item label="Alist服务名称">
        <el-input v-model="dialog.data.usedBy!.alistBackendName" />
      </el-form-item>

      <el-form-item label="应用到Emby">
        <el-switch v-model="dialog.data.usedBy!.emby" />
      </el-form-item>
      <el-form-item label="Emby服务名称">
        <el-input v-model="dialog.data.usedBy!.embyBackendName" />
      </el-form-item>
    </el-form>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialog.closeDialog()">取消</el-button>
        <el-button type="primary" @click="dialog.submit()"> 提交 </el-button>
      </span>
    </template>
  </el-dialog>
</template>
