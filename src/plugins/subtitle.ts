import type Artplayer from "artplayer";
import type { ComponentOption } from "artplayer/types/component";

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

const newSubtitleControl = (
  subtitles: Record<
    string,
    {
      url: string;
      type: string;
    }
  >
): ComponentOption => {
  subtitles["关闭"] = {
    url: "",
    type: ""
  };
  return {
    name: "subtitle",
    html: newSubtitleHtml("字幕"),
    position: "right",
    selector: Object.keys(subtitles).map((key) => {
      return {
        html: key,
        url: subtitles[key].url,
        type: subtitles[key].type
      };
    }),
    onSelect(this: Artplayer, selector: any) {
      console.log("切换字幕：", selector);
      if (selector.html === "关闭") {
        this.subtitle.show = false;
      } else {
        this.subtitle.switch(selector.url, { type: selector.type });
        this.subtitle.show = true;
      }
      return newSubtitleHtml("字幕").outerHTML;
    }
  };
};

export const newSubtitle = (
  subtitles: Record<
    string,
    {
      url: string;
      type: string;
    }
  >
): ((art: Artplayer) => unknown) => {
  return (art: Artplayer) => {
    if (!subtitles) return;
    art.once("ready", () => {
      if (art.controls["subtitle"]) {
        art.controls.remove("subtitle");
      }
      art.controls.add(newSubtitleControl(subtitles));
      return {
        name: "subtitles"
      };
    });
  };
};
