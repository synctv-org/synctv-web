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
