declare global {
  interface Window {
    electronAPI?: {
      openExternal: (url: string) => Promise<void>;
    };
  }
}

export const isElectron = (): boolean => {
  return (
    typeof window !== "undefined" &&
    window.process?.versions?.electron !== undefined
  );
};

export const openExternal = (url: string): void => {
  if (isElectron() && window.electronAPI?.openExternal) {
    window.electronAPI.openExternal(url);
  } else {
    window.open(url, "_blank");
  }
};
