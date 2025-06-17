import { ElMessage } from "element-plus";
import Artplayer from "artplayer";
import type { SettingOption } from "artplayer/types/setting";
import { danmuStore } from "@/stores/danmu";
import { storeToRefs } from "pinia";

const { danmuBorder, displayUsername } = storeToRefs(danmuStore());
type Danmu =
  | string
  | {
      text: string;
      opacity?: number;
      color?: string;
      border?: boolean;
      style?: {};
    };

const danmuSettingIcon = `<svg t="1744568781808" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4782" width="24" height="24"><path d="M649.386667 304.64H193.152a33.152 33.152 0 0 1 0-66.176h456.405333c18.218667 0 33.066667 14.848 33.066667 33.109333a33.152 33.152 0 0 1-33.152 33.066667z m181.333333 234.026667H374.4a33.152 33.152 0 0 1 0-66.176h456.405333c18.261333 0 33.109333 14.848 33.109334 33.109333a33.194667 33.194667 0 0 1-33.194667 33.066667z m-181.333333 233.941333H193.152a33.152 33.152 0 0 1 0-66.176h456.405333c18.218667 0 33.066667 14.848 33.066667 33.066667a33.152 33.152 0 0 1-33.152 33.109333z" fill="#ffffff" p-id="4783"></path></svg><path d="M651.377778 691.2H1024v102.4H591.644444c25.6-31.288889 45.511111-65.422222 59.733334-102.4zM568.888889 384h455.111111v102.4H642.844444c-17.066667-36.977778-42.666667-73.955556-73.955555-102.4zM204.8 76.8H1024v102.4H204.8V76.8zM0 605.866667c0 130.844444 102.4 241.777778 244.622222 267.377777l45.511111 65.422223c2.844444 5.688889 11.377778 8.533333 17.066667 8.533333 5.688889 0 14.222222-2.844444 17.066667-8.533333l45.511111-65.422223c142.222222-25.6 244.622222-136.533333 244.622222-267.377777 0-150.755556-136.533333-273.066667-307.2-273.066667C136.533333 332.8 0 455.111111 0 605.866667z m307.2 45.511111c-25.6 0-42.666667-19.911111-42.666667-45.511111 0-25.6 19.911111-45.511111 42.666667-45.511111s42.666667 19.911111 42.666667 45.511111c0 25.6-17.066667 45.511111-42.666667 45.511111z m-153.6 0c-25.6 0-42.666667-19.911111-42.666667-45.511111 0-25.6 19.911111-45.511111 42.666667-45.511111 25.6 0 42.666667 19.911111 42.666667 45.511111 0 25.6-17.066667 45.511111-42.666667 45.511111z m307.2 0c-25.6 0-42.666667-19.911111-42.666667-45.511111 0-25.6 19.911111-45.511111 42.666667-45.511111 25.6 0 42.666667 19.911111 42.666667 45.511111 0 25.6-17.066667 45.511111-42.666667 45.511111z" fill="#ffffff" p-id="4573"></path></svg>`;
const danmuBorderIcon =`<svg t="1744631148935" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4359" width="32" height="32"><path d="M928 928h64v64h-64zM864 992h-64v-64h64v64z m-128 0h-64v-64h64v64z m-128 0h-64v-64h64v64z m-128 0h-64v-64h64v64z m-128 0h-64v-64h64v64z m-128 0h-64v-64h64v64zM32 928h64v64H32zM96 864H32v-64h64v64z m0-128H32v-64h64v64z m0-128H32v-64h64v64z m0-128H32v-64h64v64z m0-128H32v-64h64v64z m0-128H32v-64h64v64zM32 32h64v64H32zM864 96h-64V32h64v64z m-128 0h-64V32h64v64z m-128 0h-64V32h64v64z m-128 0h-64V32h64v64z m-128 0h-64V32h64v64z m-128 0h-64V32h64v64zM928 32h64v64h-64zM992 864h-64v-64h64v64z m0-128h-64v-64h64v64z m0-128h-64v-64h64v64z m0-128h-64v-64h64v64z m0-128h-64v-64h64v64z m0-128h-64v-64h64v64zM928 544h-64v-64h64v64z m-128 0h-64v-64h64v64z m-128 0h-64v-64h64v64z m-128 0h-64v-64h64v64z m-128 0h-64v-64h64v64z m-128 0h-64v-64h64v64z m-128 0H96v-64h64v64z" fill="#ffffff" p-id="4360"></path><path d="M544 928h-64v-64h64v64z m0-128h-64v-64h64v64z m0-128h-64v-64h64v64z m0-128h-64v-64h64v64z m0-128h-64v-64h64v64z m0-128h-64v-64h64v64z m0-128h-64V96h64v64z" fill="#ffffff" p-id="4361"></path></svg>`
const displayUsernameICon = `<svg data-v-c970699f="" width="32" height="32" fill="#ffff" viewBox="0 0 15 15" xmlns="http://www.w3.org/2000/svg"><path d="M7.5 0.875C5.49797 0.875 3.875 2.49797 3.875 4.5C3.875 6.15288 4.98124 7.54738 6.49373 7.98351C5.2997 8.12901 4.27557 8.55134 3.50407 9.31167C2.52216 10.2794 2.02502 11.72 2.02502 13.5999C2.02502 13.8623 2.23769 14.0749 2.50002 14.0749C2.76236 14.0749 2.97502 13.8623 2.97502 13.5999C2.97502 11.8799 3.42786 10.7206 4.17091 9.9883C4.91536 9.25463 6.02674 8.87499 7.49995 8.87499C8.97317 8.87499 10.0846 9.25463 10.8291 9.98831C11.5721 10.7206 12.025 11.8799 12.025 13.5999C12.025 13.8623 12.2376 14.0749 12.5 14.0749C12.7623 14.075 12.975 13.8623 12.975 13.6C12.975 11.72 12.4778 10.2794 11.4959 9.31166C10.7244 8.55135 9.70025 8.12903 8.50625 7.98352C10.0187 7.5474 11.125 6.15289 11.125 4.5C11.125 2.49797 9.50203 0.875 7.5 0.875ZM4.825 4.5C4.825 3.02264 6.02264 1.825 7.5 1.825C8.97736 1.825 10.175 3.02264 10.175 4.5C10.175 5.97736 8.97736 7.175 7.5 7.175C6.02264 7.175 4.825 5.97736 4.825 4.5Z" fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"></path></svg>`

const pluginsArray: any[] = [];

export const newDamuControl = () => {
  return (art: Artplayer): void => {
    art.setting.update({
      icon: danmuSettingIcon,
      name: "danmukuPlugin",
      html: "弹幕设置",
      selector: [
        {
          icon: danmuBorderIcon,
          switch: danmuBorder.value,
          html: `弹幕边框 「 ${danmuBorder.value ? "开" : "关"} 」`,
          onSwitch(item: SettingOption, element: HTMLDivElement, event: Event) {
            console.log(item);
            danmuBorder.value = !danmuBorder.value;
            item.html = `弹幕边框 「 ${danmuBorder.value ? "开" : "关"} 」`;
            // TODO 如果使用load重载 是用户有感的 考虑要不要这样立刻重载
            art.plugins.artplayerPluginDanmuku.load();
            return danmuBorder.value;
          }
        },
        {
          icon: displayUsernameICon,
          switch: displayUsername.value,
          html: `显示用户名 「 ${displayUsername.value ? "开" : "关"} 」`,
          onSwitch(item: SettingOption, element: HTMLDivElement, event: Event) {
            console.log(item);
            displayUsername.value = !displayUsername.value;
            item.html = `显示用户名 「 ${displayUsername.value ? "开" : "关"} 」`;
            art.plugins.artplayerPluginDanmuku.load();
            return displayUsername.value;
          }
        }
      ]
    });

    pluginsArray.forEach((plugin, index) => {
      art.setting.update({
        icon: plugin.icon,
        name: `danmukuPlugin-${index}`,
        html: plugin.html,
        default: plugin.default,
        switch: plugin.switch
      });
    });
  };
};

export function sendDanmu(msg: Danmu, art?: Artplayer) {
  if (!art || !art.plugins.artplayerPluginDanmuku) return;
  if (typeof msg === "string") {
    art.plugins.artplayerPluginDanmuku.emit({
      direct: true,
      text: msg
    });
  } else {
    art.plugins.artplayerPluginDanmuku.emit({
      direct: true,
      text: msg.text,
      color: msg.color,
      opacity: msg.opacity,
      border: msg.border,
      style: msg.style
    });
  }
}

// SSE 弹幕
export function artplayerStreamDanmu(streamURL: string) {
  return (art: Artplayer) => {
    let eventSource: EventSource | null = null;
    let reconnectTimeout: number | null = null;

    const connect = () => {
      eventSource = new EventSource(streamURL);
      eventSource.addEventListener("danmu", (event) => {
        sendDanmu(event.data, art);
      });
      eventSource.addEventListener("error", (event) => {
        console.error(`获取实时弹幕错误！${event}`);
        if (eventSource?.readyState !== EventSource.CLOSED) {
          return;
        }

        // 3秒后尝试重连
        if (!reconnectTimeout) {
          reconnectTimeout = window.setTimeout(() => {
            ElMessage.warning("正在尝试重新连接弹幕服务器...");
            connect();
            reconnectTimeout = null;
          }, 3000);
        }
      });
    };

    art.once("video:canplay", () => {
      connect();
    });

    art.once("destroy", () => {
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
      eventSource?.close();
    });
  };
}
