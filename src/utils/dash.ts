import dashjs from "dashjs";
import artplayerPluginDashQuality from "artplayer-plugin-dash-quality";

export function newDash(): dashjs.MediaPlayerClass {
  return dashjs.MediaPlayer().create();
}

export function isSupported(): boolean {
  return dashjs.supportsMediaSource();
}

export function newDashQualityPlugin(): (art: Artplayer) => {
  name: "artplayerPluginDashQuality";
} {
  return artplayerPluginDashQuality({
    control: true,
    setting: true,
    getResolution: (level) => (level.height ? level.height + "P" : "自动"),
    title: "画质",
    auto: "自动"
  });
}
