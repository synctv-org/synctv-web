import { ref } from "vue";

export interface settingType {
  value: any;
  append?: string;
  placeholder?: string;
  comment?: string;
  name?: string;
  disabled?: boolean;
  isTextarea?: boolean;
}

export type settingGroupName =
  | "all"
  | "database"
  | "room"
  | "proxy"
  | "rtmp"
  | "user"
  | "oauth2"
  | "email"
  | "server";

export interface settingGroup {
  name?: string;
  value: Map<string, settingType>;
}

export const useSettings = () => {
  const generateOAuth2SettingsMap = (name: string) => {
    return new Map([
      [name + "_enabled", { value: false, name: "是否启用" }],
      [name + "_client_id", { value: "", name: "Client ID" }],
      [name + "_client_secret", { value: "", name: "Client Secret" }],
      [name + "_redirect_url", { value: "", name: "Redirect Url" }],
      [name + "_disable_user_signup", { value: false, name: "禁止用户注册" }],
      [name + "_signup_need_review", { value: false, name: "注册需要审核", disabled: true }]
    ]);
  };

  const defaultDatabaseSettings: Map<string, settingType> = new Map([
    ["database_version", { value: "", name: "数据库版本", disabled: true }]
  ]);

  const defaultRoomSettings: Map<string, settingType> = new Map([
    ["create_room_need_review", { value: false, name: "创建房间需要审核" }],
    ["disable_create_room", { value: false, name: "禁止创建房间" }],
    ["room_must_need_pwd", { value: false, name: "创建房间必须填写密码" }],
    [
      "room_ttl",
      {
        value: 48,
        append: "小时",
        comment: "回收房间仅仅只是释放内存，而不是删除房间",
        name: "非活跃房间回收时间"
      }
    ]
  ]);

  const defaultProxySettings: Map<string, settingType> = new Map([
    ["allow_proxy_to_local", { value: false, name: "允许代理到本机地址" }],
    ["live_proxy", { value: false, name: "代理直播流" }],
    ["movie_proxy", { value: false, name: "代理普通视频" }]
  ]);

  const defaultRtmpSettings: Map<string, settingType> = new Map([
    [
      "custom_publish_host",
      { value: "", placeholder: "example.com:1935", name: "自定义推流 Host" }
    ],
    [
      "rtmp_player",
      {
        value: false,
        comment: "可以通过 RTMP 协议观看直播流（无需身份验证，不安全）",
        name: "允许使用 RTMP 播放器"
      }
    ],
    ["ts_disguised_as_png", { value: false, name: "ts伪装成png图片" }]
  ]);

  const defaultUserSettings: Map<string, settingType> = new Map([
    ["enable_guest", { value: false, name: "允许访客用户" }],
    ["disable_user_signup", { value: false, name: "禁止用户注册" }],
    ["signup_need_review", { value: false, name: "注册需要审核" }],
    ["user_max_room_count", { value: 0, append: "个", name: "用户最大创建房间数" }]
  ]);

  const defaultEmailSettings: Map<string, settingType> = new Map([
    ["enable_email", { value: false, name: "是否启用" }],
    ["email_disable_user_signup", { value: false, name: "禁止用户使用邮箱注册" }],
    ["email_signup_need_review", { value: 0, append: "个", name: "邮箱注册需要审核" }],
    ["email_retrieve_password_url_path", { value: "", name: "重置密码URL" }],
    ["email_signup_white_list_enable", { value: false, name: "邮箱域名白名单" }],
    ["email_signup_white_list", { value: "", name: "允许的邮箱域名", isTextarea: true }],
    ["smtp_host", { value: "", name: "SMTP 服务器地址" }],
    ["smtp_port", { value: "", name: "SMTP 端口" }],
    ["smtp_protocol", { value: "", name: "SMTP 加密方式" }],
    ["smtp_username", { value: "", name: "SMTP 账号" }],
    ["smtp_password", { value: "", name: "SMTP 密码" }],
    ["smtp_from", { value: "", name: "SMTP 发件地址" }],
    ["smtp_pool_size", { value: "", name: "SMTP 连接池大小" }]
  ]);

  const defaultCinemaSettings: Map<string, settingType> = new Map([
    ["hidden", { value: false, name: "隐藏此房间" }],
    ["disable_join_new_user", { value: false, name: "禁止新用户加入" }],
    ["disable_guest", { value: false, name: "禁止访客加入" }],
    ["join_need_review", { value: false, name: "加入需要审核" }],
    // ["user_default_permissions", { value: 0, name: "用户默认权限" }],
    ["can_get_movie_list", { value: false, name: "允许用户获取影片列表" }],
    ["can_add_movie", { value: false, name: "允许用户添加影片" }],
    ["can_edit_movie", { value: false, name: "允许用户编辑影片" }],
    ["can_delete_movie", { value: false, name: "允许用户删除影片" }],
    ["can_set_current_movie", { value: false, name: "允许用户切换影片" }],
    ["can_set_current_status", { value: false, name: "是否可以上报进度" }],
    ["can_send_chat_message", { value: false, name: "是否允许聊天 / 发送弹幕" }]
  ]);

  const defaultServerSettings: Map<string, settingType> = new Map([
    ["host", { value: false, name: "host" }],
    ["version", { value: false, name: "版本", disabled: true }]
  ]);

  const serverSettingsGroup: Map<settingGroupName, settingGroup> = new Map([
    [
      "server",
      {
        name: "系统设置",
        value: defaultServerSettings
      }
    ]
  ]);

  const databaseSettingsGroup: Map<settingGroupName, settingGroup> = new Map([
    [
      "database",
      {
        name: "数据库设置",
        value: defaultDatabaseSettings
      }
    ]
  ]);

  const roomSettingsGroup: Map<settingGroupName, settingGroup> = new Map([
    [
      "room",
      {
        name: "房间设置",
        value: defaultRoomSettings
      }
    ]
  ]);

  const proxySettingsGroup: Map<settingGroupName, settingGroup> = new Map([
    [
      "proxy",
      {
        name: "代理设置",
        value: defaultProxySettings
      }
    ]
  ]);

  const rtmpSettingsGroup: Map<settingGroupName, settingGroup> = new Map([
    [
      "rtmp",
      {
        name: "RTMP设置",
        value: defaultRtmpSettings
      }
    ]
  ]);

  const userSettingsGroup: Map<settingGroupName, settingGroup> = new Map([
    [
      "user",
      {
        name: "用户相关",
        value: defaultUserSettings
      }
    ]
  ]);

  const OAuth2SettingGroup: Map<string, settingGroup> = new Map([
    [
      "oauth2_baidu",
      {
        name: "百度",
        value: generateOAuth2SettingsMap("oauth2_baidu")
      }
    ],
    [
      "oauth2_baidu-netdisk",
      {
        name: "百度网盘",
        value: generateOAuth2SettingsMap("oauth2_baidu-netdisk")
      }
    ],
    [
      "oauth2_gitee",
      {
        name: "Gitee",
        value: generateOAuth2SettingsMap("oauth2_gitee")
      }
    ],
    [
      "oauth2_github",
      {
        name: "GitHub",
        value: generateOAuth2SettingsMap("oauth2_github")
      }
    ],
    [
      "oauth2_gitlab",
      {
        name: "GitLab",
        value: generateOAuth2SettingsMap("oauth2_gitlab")
      }
    ],
    [
      "oauth2_google",
      {
        name: "Google",
        value: generateOAuth2SettingsMap("oauth2_google")
      }
    ],
    [
      "oauth2_microsoft",
      {
        name: "Microsoft",
        value: generateOAuth2SettingsMap("oauth2_microsoft")
      }
    ],
    [
      "oauth2_qq",
      {
        name: "QQ",
        value: generateOAuth2SettingsMap("oauth2_qq")
      }
    ],
    [
      "oauth2_xiaomi",
      {
        name: "小米",
        value: generateOAuth2SettingsMap("oauth2_xiaomi")
      }
    ],
    [
      "oauth2_authing",
      {
        name: "Authing",
        value: generateOAuth2SettingsMap("oauth2_authing")
      }
    ],
    [
      "oauth2_feishu-sso",
      {
        name: "飞书SSO",
        value: generateOAuth2SettingsMap("oauth2_feishu-sso")
      }
    ]
  ]);

  const emailSettingGroup: Map<settingGroupName, settingGroup> = new Map([
    [
      "email",
      {
        name: "邮箱设置",
        value: defaultEmailSettings
      }
    ]
  ]);

  return {
    generateOAuth2SettingsMap,
    databaseSettingsGroup,
    roomSettingsGroup,
    proxySettingsGroup,
    rtmpSettingsGroup,
    userSettingsGroup,
    OAuth2SettingGroup,
    emailSettingGroup,
    serverSettingsGroup,
    defaultCinemaSettings,
    defaultDatabaseSettings,
    defaultRoomSettings,
    defaultProxySettings,
    defaultRtmpSettings,
    defaultUserSettings,
    defaultServerSettings
  };
};
