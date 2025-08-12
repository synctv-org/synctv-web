import Artplayer from "artplayer";
import { useLocalStorage } from "@vueuse/core";

// 字幕大小预设
const subtitleSizePresets = {
  small: 20,
  medium: 26,
  large: 30,
  extraLarge: 34
};

// 从 localStorage 读取，默认改为 "large"（默认更大）
const subtitleSize = useLocalStorage("subtitle-size", "large");

// 获取当前字幕大小
const getCurrentSubtitleSize = () => {
  return (
    subtitleSizePresets[subtitleSize.value as keyof typeof subtitleSizePresets] ||
    subtitleSizePresets.large
  );
};

// 应用字幕样式
const updateSubtitleSize = (art: Artplayer) => {
  if (!art) return;
  const size = getCurrentSubtitleSize();
  const subtitleElement = art.template.$player.querySelector(".art-subtitle") as HTMLElement;
  if (subtitleElement) {
    subtitleElement.style.fontSize = size + "px";
    subtitleElement.style.fontWeight = "500";
    subtitleElement.style.textShadow = "2px 2px 4px rgba(0, 0, 0, 0.8)";
    subtitleElement.style.lineHeight = "1.4";
  }
};

export function artplayerSubtitleSettings() {
  return (art: Artplayer) => {
    const buildSelector = () => [
      {
        html: `小 (${subtitleSizePresets.small}px)`,
        value: "small",
        default: subtitleSize.value === "small"
      },
      {
        html: `中 (${subtitleSizePresets.medium}px)`,
        value: "medium",
        default: subtitleSize.value === "medium"
      },
      {
        html: `大 (${subtitleSizePresets.large}px)`,
        value: "large",
        default: subtitleSize.value === "large"
      },
      {
        html: `特大 (${subtitleSizePresets.extraLarge}px)`,
        value: "extraLarge",
        default: subtitleSize.value === "extraLarge"
      }
    ];

    const onSelect = (item: { html: string; value: keyof typeof subtitleSizePresets }) => {
      subtitleSize.value = item.value;
      updateSubtitleSize(art);
      return item.html;
    };

    const mountSetting = () => {
      art.setting.add({
        name: "subtitleSize",
        html: "字幕大小",
        selector: buildSelector(),
        onSelect
      });
    };

    // 初始化应用一次
    art.on("ready", () => {
      updateSubtitleSize(art);
      mountSetting();
    });

    // 监听本地存储变化（多标签页同步）
    const handleStorageChange = () => updateSubtitleSize(art);
    window.addEventListener("storage", handleStorageChange);

    return {
      name: "artplayerSubtitleSettings",
      destroy: () => {
        window.removeEventListener("storage", handleStorageChange);
      }
    };
  };
}
