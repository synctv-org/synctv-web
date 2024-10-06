const image = `<?xml version="1.0" standalone="no"?>
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
<svg t="1666857514489" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2580" xmlns:xlink="http://www.w3.org/1999/xlink" width="24" height="24"><path d="M870.4 176 153.6 176C104.128 176 64 216.128 64 265.6l0 492.736c0 49.472 40.128 89.6 89.6 89.6L870.4 847.936c49.472 0 89.6-40.128 89.6-89.6L960 265.6C960 216.128 919.872 176 870.4 176zM870.4 668.8 825.6 668.8c0 0-29.696-65.792-89.6-89.6s-134.4 89.6-134.4 89.6S535.04 596.992 467.2 444.8C399.36 292.608 153.6 624 153.6 624l0-358.4L870.4 265.6 870.4 668.8zM668.8 489.6c37.056 0 67.2-30.144 67.2-67.264 0-37.056-30.144-67.2-67.2-67.2C631.68 355.2 601.6 385.344 601.6 422.4 601.6 459.52 631.68 489.6 668.8 489.6z" p-id="2581" fill="#ffffff"></path>
</svg>`;

export default function artplayerPluginQuality() {
  return (art: any) => {
    function update() {
      const hls = art.hls;
      const dash = art.dash;
      const auto = "自动";
      const title = "画质";

      let levels;
      let defaultLevel: any;
      let defaultHtml;
      let currentLevel;
      let getResolution: any;
      let selector: any;
      let onSelect: any;
      if (dash) {
        levels = dash.getBitrateInfoListFor("video");
        currentLevel = dash.getQualityFor("video");
        defaultLevel = levels[currentLevel];
        getResolution = (level: any) => (level.height ? level.height + "P" : "自动");
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
        levels = hls.levels;
        currentLevel = hls.currentLevel;
        defaultLevel = levels[currentLevel];
        getResolution = (level: any) => {
          if (level.name) {
            return level.name;
          }
          return level.height ? level.height + "P" : "自动";
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

      if (!levels || levels.length <= 1) {
        if (art.controls["quality"]) art.controls.remove("quality");
        if (art.setting.find("quality")) art.setting.remove("quality");
        return;
      }

      art.controls.update({
        name: "quality",
        position: "right",
        html: defaultHtml,
        style: { padding: "0 10px" },
        selector,
        onSelect
      });

      art.setting.update({
        name: "quality",
        tooltip: defaultHtml,
        html: title,
        icon: image,
        width: 200,
        selector,
        onSelect
      });
    }

    art.on("ready", update);
    art.on("restart", update);

    return {
      name: "artplayerPluginQuality"
    };
  };
}
