export interface Base {
  backend: {
    endpoint: string;
  };
}

interface Backend extends Base {
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
}

interface Consul {
  serverName?: string;
  token?: string;
  tokenFile?: string;
  pathPrefix?: string;
  namespace?: string;
  partition?: string;
}

interface Etcd {
  serverName?: string;
  username?: string;
  password?: string;
}

export type Vendors = Base | Backend | null;

export interface Response {
  info: {
    backend: Backend;
    usedBy: {
      bilibili: boolean;
      bilibiliBackendName: string;
      alist: boolean;
      alistBackendName: string;
      emby: boolean;
      embyBackendName: string;
    };
  };
  status: number;
}
[];
