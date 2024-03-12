declare let window: Window &
  typeof globalThis & {
    __TAURI_IPC__: any;
  };

export const isWithoutTauri = window.__TAURI_IPC__ === undefined;
