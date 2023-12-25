export interface Backend {
  backend: {
    endpoint: string;
    comment?: string;
    tls?: boolean;
    jwtSecret?: string;
    customCA?: string;
    timeOut?: string;
    consul?: Consul;
    etcd?: Etcd;
  };
  usedBy?: {
    bilibili?: boolean;
    bilibiliBackendName?: string;
    alist?: boolean;
    alistBackendName?: string;
    emby?: boolean;
    embyBackendName?: string;
  };
}

interface Consul {
  serviceName?: string;
  token?: string;
  pathPrefix?: string;
  namespace?: string;
  partition?: string;
}

interface Etcd {
  serviceName?: string;
  username?: string;
  password?: string;
}

export interface FileItem {
  name: string;
  path: string;
  isDir: boolean;
}

export interface FileListPath {
  name: string;
  path: string;
}

export interface FileList {
  paths: FileListPath[];
  items: FileItem[];
  total: number;
}
