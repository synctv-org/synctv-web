import type Artplayer from "artplayer";
import { destroyOldCustomPlayLib } from "@/utils";

interface artplayPluginSource {
  html: string;
  url: string;
  type: string;
}

const switchSource = (art: Artplayer, source: artplayPluginSource) => {
  const status = art.plugins["syncPlugin"].currentStatus();
  art.once("video:canplay", () => {
    art.plugins["syncPlugin"].setAndNoPublishStatus(status);
    art.emit("restart", source.url);
  });
  if (art.controls["quality"]) art.controls.remove("quality");
  if (art.setting.find("quality")) art.setting.remove("quality");
  destroyOldCustomPlayLib(art);
  art.option.type = source.type;
  art.url = source.url;
};

export function artplayPluginSource(sources: artplayPluginSource[]) {
  return (art: Artplayer) => {
    let currentSourceName = sources.length > 0 ? sources[0].html : "";
    const onSelect = (source: artplayPluginSource) => {
      currentSourceName = source.html;
      switchSource(art, source);
      return "源";
    };
    const setSelector = (newSources: artplayPluginSource[]) => {
      if (newSources.length <= 1) {
        if (art.controls["source"]) art.controls.remove("source");
        if (art.setting.find("source")) art.setting.remove("source");
      } else {
        art.controls.update({
          name: "source",
          position: "right",
          html: "源",
          selector: newSources,
          onSelect
        });
        art.setting.update({
          name: "source",
          position: "right",
          html: "源",
          selector: newSources,
          onSelect
        });
      }
    };
    const updateSources = (newSources: artplayPluginSource[]) => {
      setSelector(newSources);
      const oldSource = newSources.find((v) => v.html === currentSourceName);
      if (oldSource) {
        onSelect(oldSource);
      }
    };
    setSelector(sources);
    return {
      name: "source",
      updateSources
    };
  };
}
