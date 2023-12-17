<script setup lang="ts">
import { dialog, formRef } from "@/hooks/admin/setting/useVendor";
</script>

<template>
  <el-dialog
    class="el-dialog rounded-lg dark:bg-zinc-800 w-2/6 max-sm:w-full"
    v-model="dialog.visible"
    title="配置解析器"
  >
    <el-form ref="formRef" :model="dialog.data" :rules="dialog.rules" label-width="120px">
      <el-form-item label="节点" prop="backend.endpoint">
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
      <el-button @click="dialog.closeDialog()">取消</el-button>
      <el-button type="primary" @click="dialog.submit()"> 提交 </el-button>
    </template>
  </el-dialog>
</template>
