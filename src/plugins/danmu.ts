type Danmu = string | {
    text: string;
    opacity?: number;
    color?: string;
    border?: boolean;
    style?: {}
}

export function sendDanmu(msg: Danmu, art?: Artplayer) {
  if (!art || !art.plugins.artplayerPluginDanmuku) return;
  if (typeof msg === "string") {
    art.plugins.artplayerPluginDanmuku.emit({
      direct: true,
      text: msg,
    });
  } else {
    art.plugins.artplayerPluginDanmuku.emit({
      direct: true,
      text: msg.text,
      color: msg.color,
      opacity: msg.opacity,
      border: msg.border,
      style: msg.style,
    });
  }
}

// SSE 弹幕
export function artplayerStreamDanmu(streamURL: string) {
  return (art: Artplayer) => {
    let eventSource: EventSource | null = null;
    art.once("video:canplay", () => {
      eventSource = new EventSource(streamURL);
      eventSource.addEventListener("danmu", (event) => {
        sendDanmu(event.data, art);
      });
      eventSource.onerror = (event) => {
        console.error(event);
      };
    });
    art.once("destroy", () => {
      eventSource?.close();
    });
  };
}
