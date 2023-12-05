import artplayerPluginHlsQuality from "artplayer-plugin-hls-quality";
import type { HlsConfig, FragmentLoaderConstructor } from "hls.js";
import Hls from "hls.js";

class fLoader extends Hls.DefaultConfig.loader {
  constructor(config: HlsConfig) {
    super(config);
    var load = this.load.bind(this);
    this.load = function (context, config, callbacks): void {
      if (context.responseType === "arraybuffer") {
        var onSuccess = callbacks.onSuccess;
        callbacks.onSuccess = function (response, stats, context, networkDetails): void {
          if (response.data instanceof ArrayBuffer) {
            var data = new Uint8Array(response.data);
            var pre = 0;
            while (pre < data.length) {
              var currnet = data.indexOf(0x47, pre + 1);
              if (currnet - pre === 188) {
                response.data = response.data.slice(pre);
                break;
              }
              pre = currnet;
            }
          }
          onSuccess(response, stats, context, networkDetails);
        };
      }
      load(context, config, callbacks);
    };
  }
}

function newHlsConfig(headers: Record<string, string>): Partial<HlsConfig> {
  return {
    xhrSetup: function (xhr: XMLHttpRequest, url: string): void | Promise<void> {
      for (const key in headers) {
        xhr.setRequestHeader(key, headers[key]);
      }
    },
    fLoader: fLoader as FragmentLoaderConstructor
  };
}

export function newHls(headers: Record<string, string>): Hls {
  return new Hls(newHlsConfig(headers));
}

export function isSupported(): boolean {
  return Hls.isSupported();
}

export function newHlsQualityPlugin(): (art: Artplayer) => {
  name: "artplayerPluginHlsQuality";
} {
  return artplayerPluginHlsQuality({
    control: true,
    setting: true,
    getResolution: (level) => (level.height ? level.height + "P" : "自动"),
    title: "画质",
    auto: "自动"
  });
}
