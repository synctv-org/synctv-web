import Artplayer from "artplayer";
import type { Events } from "artplayer/types/events";

const newSubtitleHtml = (name: string): HTMLElement => {
  const SubtitleHtml = document.createElement("span");
  SubtitleHtml.style.backgroundColor = "#fff";
  SubtitleHtml.style.color = "#000";
  SubtitleHtml.style.padding = "2px 6px";
  SubtitleHtml.style.borderRadius = "5px";
  SubtitleHtml.style.fontSize = "14px";
  SubtitleHtml.innerText = name;
  return SubtitleHtml;
};

const disableSubtitleStr = "关闭";

export function artplayerSubtitle(subtitles: Record<string, { url: string; type: string }>) {
  return (art: Artplayer) => {
    const subtitleHTML = newSubtitleHtml("字幕");

    const subtitleKeys = Object.keys(subtitles);
    const hasOnlyOneSubtitle = subtitleKeys.length === 1;

    const selector = Object.keys(subtitles).map((key) => ({
      html: key,
      url: subtitles[key].url,
      type: subtitles[key].type,
      default: hasOnlyOneSubtitle && key !== disableSubtitleStr
    }));

    selector.push({
      html: disableSubtitleStr,
      url: "",
      type: "",
      default: false
    });

    const onSelect = (item: any) => {
      if (item.html === disableSubtitleStr) {
        art.subtitle.show = false;
        art.emit("artplayer-plugin-ass:visible" as keyof Events, false);
      } else if (item.type.toLowerCase() === "ass") {
        art.subtitle.show = false;
        art.emit("artplayer-plugin-ass:switch" as keyof Events, item.url);
      } else {
        art.emit("artplayer-plugin-ass:visible" as keyof Events, false);
        art.subtitle.switch(item.url, { type: item.type });
        art.subtitle.show = true;
      }
      return subtitleHTML.outerHTML;
    };

    const isMobile = Artplayer.utils.isMobile;

    const updateControls = () => {
      if (!isMobile || art.fullscreen) {
        art.controls.update({
          name: "subtitle",
          position: "right",
          html: subtitleHTML.outerHTML,
          selector: selector,
          onSelect
        });
      } else if (art.controls["subtitle"]) {
        art.controls.remove("subtitle");
      }
    };

    updateControls();

    art.setting.update({
      name: "subtitle",
      html: subtitleHTML.outerHTML,
      selector: selector,
      onSelect
    });

    if (hasOnlyOneSubtitle) {
      const firstSubtitle = subtitles[subtitleKeys[0]];
      if (firstSubtitle) {
        onSelect(firstSubtitle);
      }
    }

    if (isMobile) {
      art.on("fullscreen", updateControls);
    }

    return {
      name: "artplayerSubtitle"
    };
  };
}
