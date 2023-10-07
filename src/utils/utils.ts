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
