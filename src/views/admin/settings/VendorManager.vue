<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useVendorApi } from "@/hooks/admin/setting/useVendor";
import { getAppIcon } from "@/utils/index";

const props = defineProps<{
  title: string;
}>();

const { vendorsListState, getVendorsList } = useVendorApi();

const data = ref(vendorsListState);

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
        <el-button class="max-xl:mt-3" type="primary">添加解析器</el-button>
        <el-button class="max-xl:mt-3" type="success">刷新列表</el-button>
      </div>
    </div>
    <div class="card-body">
      <el-table :stripe="true" :data="data" style="width: 100%" table-layout="fixed">
        <el-table-column prop="info.backend.endpoint" label="端点">
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
      </el-table>
    </div>
    <div class="card-footer flex flex-wrap justify-between overflow-hidden"></div>
  </div>
</template>
