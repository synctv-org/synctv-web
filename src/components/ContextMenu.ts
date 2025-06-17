import { h, render } from "vue";

// 存储当前菜单实例
let currentMenuInstance: {
  container: HTMLElement;
  handleClickOutside: (e: MouseEvent) => void;
  handleEscapeKey: (e: KeyboardEvent) => void;
} | null = null;

/**
 * 右键菜单vnode
 */
export const ContextMenu = (
    event: MouseEvent,
    menuItems: ContextMenuItem[]
) => {
  // 阻止默认右键菜单
  event.preventDefault();

  const closeMenu = () => {
    if (currentMenuInstance) {
      render(null, currentMenuInstance.container); // 卸载 VNode
      document.body.removeChild(currentMenuInstance.container); // 移除容器
      document.removeEventListener("click", currentMenuInstance.handleClickOutside);
      document.removeEventListener("keydown", currentMenuInstance.handleEscapeKey);
      currentMenuInstance = null;
    }
  };

  // 如果已经有打开的菜单，则先关闭它
  if (currentMenuInstance) {
    closeMenu();
  }

  const container = document.createElement("div");
  container.style.position = "absolute";
  container.style.zIndex = "9999";

  const menuWidth = 200; // 菜单宽度
  const menuHeight = menuItems.length * 36 + 8;

  // 鼠标位置
  const mouseX = event.clientX;
  const mouseY = event.clientY;

  // 计算菜单位置
  let x = mouseX;
  let y = mouseY - menuHeight + 8;

  // 如果菜单超出右边界，向左调整
  if (x + menuWidth > window.innerWidth) {
    x = window.innerWidth - menuWidth;
  }

  // 如果菜单超出底部边界，向上调整
  if (y + menuHeight > window.innerHeight) {
    y = window.innerHeight - menuHeight;
  }

  // 如果菜单超出左边界，向右调整
  if (x < 0) {
    x = 0;
  }

  // 如果菜单超出顶边界，向下调整
  if (y < 0) {
    y = 0;
  }

  // 设置菜单的位置
  container.style.top = `${y}px`;
  container.style.left = `${x}px`;

  // 创建菜单内容
  const vnode = h(
      "div",
      {
        class: "shadow-lg border rounded whitespace-nowrap overflow-hidden select-none bg-white dark:bg-black",
        style: {
          position: "absolute",
          top: "0",
          left: "0",
          minWidth: "150px",
          maxWidth: "300px",
        },
      },
      menuItems.map((item) =>
          h(
              "div",
              {
                class: "py-1.5 px-4 cursor-pointer hover:bg-gray-200 dark:hover:bg-neutral-700 text-sm",
                onContextmenu: (event) => {
                  event.preventDefault();
                },
                onClick: () => {
                  item.onClick?.(); // 执行菜单项的回调函数
                  closeMenu(); // 关闭菜单
                },
              },
              item.label
          )
      )
  );

  // 挂载菜单
  render(vnode, container);
  document.body.appendChild(container);

  // 监听点击外部区域以关闭菜单
  const handleClickOutside = (e: MouseEvent) => {
    if (!container.contains(e.target as Node)) {
      closeMenu();
    }
  };

  // 按下 Esc 键关闭菜单
  const handleEscapeKey = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      closeMenu();
    }
  };

  document.addEventListener("click", handleClickOutside);
  document.addEventListener("keydown", handleEscapeKey);

  // 保存当前实例
  currentMenuInstance = {
    container,
    handleClickOutside,
    handleEscapeKey,
  };
};

/**
 * 函数调用右键菜单
 */
export const handleContextMenu = (
    event: MouseEvent,
    callback: (event: MouseEvent) => ContextMenuItem[]
) => {
  event.preventDefault()
  // 显示右键菜单 这个回调用于传入event
  const menuItems = callback(event);
  ContextMenu(event, menuItems);
};

export type ContextMenuItem = {
  label: string;
  icon?: string | Element;
  onClick?: () => void | Promise<void>; // 支持同步和异步操作
};