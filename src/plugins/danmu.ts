import { ElMessage } from "element-plus";

type Danmu =
  | string
  | {
      text: string;
      opacity?: number;
      color?: string;
      border?: boolean;
      style?: {};
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
