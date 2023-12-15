<script setup lang="ts">
import { useVendorApi } from "@/hooks/admin/setting/useVendor";

const {} = useVendorApi();

const props = defineProps<{
  title: string;
}>();
</script>

<template>
  <div class="card">
    <div class="card-title flex flex-wrap justify-between items-center">
      <div>
        {{ props.title }}
      </div>
      <div>
        <el-button class="max-xl:mt-3" type="primary"> 添加解析器 </el-button>
      </div>
    </div>
    <div class="card-body">
      <el-table style="width: 100%">
        <el-table-column prop="username" label="用户名" width="200" />
        <el-table-column prop="id" label="ID" width="120">
          <template #default="scope">
            <div class="flex overflow-hidden text-ellipsis max-w-[100px]">
              <span class="truncate">{{ scope.row.id }}</span>
              <CopyButton size="small" :value="scope.row.id" />
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="role" label="权限组" width="120">
          <template #default="scope"> 23333 </template>
        </el-table-column>

        <el-table-column fixed="right" label="操作">
          <template #default="scope">
            <el-button type="success"> 通过注册 </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class="card-footer flex flex-wrap justify-between overflow-hidden">
      <el-button type="success"> 更新列表 </el-button>
    </div>
  </div>
</template>
