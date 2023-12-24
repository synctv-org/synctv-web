<script setup lang="ts">
import { computed, ref } from "vue";
import { useVendorApi } from "@/hooks/admin/setting/useVendor";
import type { Backend } from "@/types/Vendor";
import type { FormInstance } from "element-plus";
import _ from "lodash";

const { addVendor, editVendor, addAndEditLoading } = useVendorApi();
const open = ref(false);
const emits = defineEmits(["updateVendorList"]);
const isEditMode = ref(false);
const mode = ref<"consul" | "etcd" | "none">("none");
const formRef = ref<FormInstance>();
const data = ref<Backend>({
  backend: {
    endpoint: "",
    comment: "",
    tls: false,
    jwtSecret: "",
    customCA: "",
    timeOut: "",
    consul: {
      serviceName: "",
      token: "",
      pathPrefix: "",
      namespace: "",
      partition: ""
    },
    etcd: { serviceName: "", username: "", password: "" }
  },
  usedBy: {
    bilibili: false,
    bilibiliBackendName: "",
    alist: false,
    alistBackendName: "",
    emby: false,
    embyBackendName: ""
  }
});

const defaultData = {
  backend: {
    endpoint: "",
    comment: "",
    tls: false,
    jwtSecret: "",
    customCA: "",
    timeOut: "",
    consul: {
      serviceName: "",
      token: "",
      pathPrefix: "",
      namespace: "",
      partition: ""
    },
    etcd: { serviceName: "", username: "", password: "" }
  },
  usedBy: {
    bilibili: false,
    bilibiliBackendName: "",
    alist: false,
    alistBackendName: "",
    emby: false,
    embyBackendName: ""
  }
};

const title = computed(() => (isEditMode.value ? "配置解析器" : "新增解析器"));

const openDialog = async (isEdit: boolean, backendData?: Backend) => {
  formRef.value?.resetFields();
  isEditMode.value = isEdit;
  backendData
    ? (data.value = JSON.parse(JSON.stringify(backendData)))
    : (data.value = _.cloneDeep(defaultData));
  open.value = true;
};

const rules = {
  backend: {
    endpoint: [{ required: true, message: "请输入后端地址", trigger: "blur" }]
  }
};

const selectChange = () => {
  data.value.backend.consul = _.cloneDeep(defaultData.backend.consul);
  data.value.backend.etcd = _.cloneDeep(defaultData.backend.etcd);
};

const closeDialog = () => {
  data.value = _.cloneDeep(defaultData);
  open.value = false;
};

const submit = async () => {
  await formRef.value?.validate(async (valid, fields) => {
    if (valid) {
      isEditMode.value ? await editVendor(data.value) : await addVendor(data.value);
      closeDialog();
      emits("updateVendorList");
    }
  });
};

defineExpose({ openDialog });
</script>

<template>
  <el-dialog
    class="el-dialog rounded-lg dark:bg-zinc-800 w-2/6 max-sm:w-full"
    v-model="open"
    :title="title"
  >
    <el-form ref="formRef" :model="data" :rules="rules" label-width="120px">
      <el-form-item label="节点" prop="backend.endpoint">
        <el-input :disabled="isEditMode" v-model="data.backend.endpoint" />
      </el-form-item>
      <el-form-item label="备注">
        <el-input v-model="data.backend.comment" />
      </el-form-item>
      <el-form-item label="TLS">
        <el-switch v-model="data.backend.tls" />
      </el-form-item>
      <el-form-item label="JWT密钥">
        <el-input v-model="data.backend.jwtSecret" />
      </el-form-item>
      <el-form-item label="超时时间">
        <el-input v-model="data.backend.timeOut" />
      </el-form-item>
      <el-form-item label="服务发现" :change="selectChange()">
        <el-select v-model="mode" class="m-2" placeholder="请选择">
          <el-option value="none" label="none" />
          <el-option value="consul" label="consul" />
          <el-option value="etcd" label="etcd" />
        </el-select>
      </el-form-item>
      <div v-if="mode === 'consul'">
        <el-form-item label="服务名">
          <el-input v-model="data.backend.consul!.serviceName" />
        </el-form-item>
        <el-form-item label="token">
          <el-input v-model="data.backend.consul!.token" />
        </el-form-item>
        <el-form-item label="Consul的路径前缀">
          <el-input v-model="data.backend.consul!.pathPrefix" />
        </el-form-item>
        <el-form-item label="命名空间">
          <el-input v-model="data.backend.consul!.namespace" />
        </el-form-item>
        <el-form-item label="分区">
          <el-input v-model="data.backend.consul!.partition" />
        </el-form-item>
      </div>
      <div v-if="mode === 'etcd'">
        <el-form-item label="服务名">
          <el-input v-model="data.backend.etcd!.serviceName" />
        </el-form-item>
        <el-form-item label="用户名">
          <el-input v-model="data.backend.etcd!.username" />
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="data.backend.etcd!.password" />
        </el-form-item>
      </div>
      <el-form-item label="应用到Bilibili">
        <el-switch v-model="data.usedBy!.bilibili" />
      </el-form-item>
      <el-form-item label="Bilibili服务名称">
        <el-input v-model="data.usedBy!.bilibiliBackendName" />
      </el-form-item>

      <el-form-item label="应用到Alist">
        <el-switch v-model="data.usedBy!.alist" />
      </el-form-item>
      <el-form-item label="Alist服务名称">
        <el-input v-model="data.usedBy!.alistBackendName" />
      </el-form-item>

      <el-form-item label="应用到Emby">
        <el-switch v-model="data.usedBy!.emby" />
      </el-form-item>
      <el-form-item label="Emby服务名称">
        <el-input v-model="data.usedBy!.embyBackendName" />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="closeDialog()">取消</el-button>
      <el-button type="primary" :loading="addAndEditLoading" @click="submit()"> 提交 </el-button>
    </template>
  </el-dialog>
</template>
