import Artplayer from "artplayer";

const image = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" height="18">
    <path fill="#fff" d="M0 96C0 60.7 28.7 32 64 32l384 0c35.3 0 64 28.7 64 64l0 320c0 35.3-28.7 64-64 64L64 480c-35.3 0-64-28.7-64-64L0 96zM323.8 202.5c-4.5-6.6-11.9-10.5-19.8-10.5s-15.4 3.9-19.8 10.5l-87 127.6L170.7 297c-4.6-5.7-11.5-9-18.7-9s-14.2 3.3-18.7 9l-64 80c-5.8 7.2-6.9 17.1-2.9 25.4s12.4 13.6 21.6 13.6l96 0 32 0 208 0c8.9 0 17.1-4.9 21.2-12.8s3.6-17.4-1.4-24.7l-120-176zM112 192a48 48 0 1 0 0-96 48 48 0 1 0 0 96z"/>
</svg>`;

export default function artplayerPluginQuality() {
  return (art: Artplayer) => {
    function update() {
      const hls = art.hls;
      const dash = (art as any).dash;
      const auto = "自动";
      const title = "画质";

      let defaultLevel: any;
      let defaultHtml: any;
      let currentLevel;
      let selector: any;
      let onSelect: any;
      if (dash) {
        const levels = dash.getBitrateInfoListFor("video");
        currentLevel = dash.getQualityFor("video");
        defaultLevel = levels[currentLevel];
        const getResolution = (level: any) => (level.height ? level.height + "P" : auto);
        const settings = dash.getSettings();
        defaultHtml = settings?.streaming?.abr?.autoSwitchBitrate?.video
          ? auto
          : getResolution(defaultLevel);
        const cfg = {
          streaming: {
            abr: {
              autoSwitchBitrate: {
                video: false
              }
            }
          }
        };
        selector = levels.map((item: any, index: any) => {
          return {
            html: getResolution(item),
            level: index,
            default: defaultLevel === item
          };
        });
        onSelect = (item: any) => {
          dash.updateSettings(cfg);
          dash.setQualityFor("video", item.level, true);
          return item.html;
        };
      } else if (hls) {
        const levels = hls.levels;
        currentLevel = hls.currentLevel;
        defaultLevel = levels[currentLevel];
        const getResolution = (level: any) => {
          if (level.name) {
            return level.name;
          }
          return level.height ? level.height + "P" : auto;
        };
        defaultHtml = defaultLevel ? getResolution(defaultLevel) : auto;
        selector = levels.map((item: any, index: any) => {
          return {
            html: getResolution(item),
            level: item.level || index,
            default: defaultLevel === item
          };
        });
        onSelect = (item: any) => {
          hls.currentLevel = item.level;
          art.loading.show = true;
          return item.html;
        };
      }

      if (!selector || selector.length <= 1) {
        if (art.controls["quality"]) art.controls.remove("quality");
        if (art.setting.find("quality")) art.setting.remove("quality");
        return;
      }

      const isMobile = Artplayer.utils.isMobile;

      const updateControls = () => {
        if (!isMobile || art.fullscreen) {
          art.controls.update({
            name: "quality",
            position: "right",
            html: defaultHtml,
            style: { padding: "0 10px" },
            selector,
            onSelect
          });
        } else if (art.controls["quality"]) {
          art.controls.remove("quality");
        }
      };

      updateControls();

      art.setting.update({
        name: "quality",
        tooltip: defaultHtml,
        html: title,
        icon: image,
        width: 200,
        selector,
        onSelect
      });

      if (isMobile) {
        art.on("fullscreen", updateControls);
      }
    }

    art.on("ready", update);
    art.on("restart", update);

    return {
      name: "artplayerPluginQuality"
    };
  };
}
