export const getFileExtension = (url: string) => {
  const match = url.match(/\.([a-z0-9]+)(?:[\?#]|$)/i);
  if (match) {
    return match[1];
  } else {
    return "";
  }
};

export const isDev = () => {
  return localStorage.getItem("dev") === "true";
};

export const devLog = (...args: any[]) => {
  if (isDev()) {
    console.log(...args);
  }
};

export const debounces = (delay: number): Function => {
  let timerId: ReturnType<typeof setTimeout> | null = null;

  const add = (func: Function): Function => {
    return (...args: any[]) => {
      if (timerId) {
        clearTimeout(timerId);
      }
      timerId = setTimeout(() => {
        func(...args);
        timerId = null;
      }, delay);
    };
  };

  return add;
};

export const deepEqualObject = (obj1: any, obj2: any) => {
  if (obj1 === obj2) {
    return true;
  } else if (
    typeof obj1 === "object" &&
    typeof obj2 === "object" &&
    Object.keys(obj1).length === Object.keys(obj2).length
  ) {
    for (const key in obj1) {
      if (!deepEqualObject(obj1[key], obj2[key])) {
        return false;
      }
    }
    return true;
  } else {
    return false;
  }
};
