import type Artplayer from "artplayer";
import type { ComponentOption } from "artplayer/types/component";
import type { Events } from "artplayer/types/events";
import { ElMessage } from "element-plus";

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

export const newSubtitleControl = (
  subtitles: Record<
    string,
    {
      url: string;
      type: string;
    }
  >,
  controlName: string = "subtitle"
): ComponentOption => {
  subtitles["关闭"] = {
    url: "",
    type: ""
  };
  const subtitleHTML = newSubtitleHtml("字幕");
  return {
    name: controlName,
    html: subtitleHTML,
    position: "right",
    selector: Object.keys(subtitles).map((key) => {
      return {
        html: key,
        url: subtitles[key].url,
        type: subtitles[key].type
      };
    }),
    onSelect(this: Artplayer, selector: any) {
      if (selector.html === "关闭") {
        this.subtitle.show = false;
        this.emit("artplayer-plugin-ass:visible" as keyof Events, false);
      } else if (selector.type.toLowerCase() === "ass") {
        this.subtitle.show = false;
        this.emit("artplayer-plugin-ass:switch" as keyof Events, selector.url);
      } else {
        this.emit("artplayer-plugin-ass:visible" as keyof Events, false);
        this.subtitle.switch(selector.url, { type: selector.type });
        this.subtitle.show = true;
      }
      return subtitleHTML.outerHTML;
    }
  };
};
