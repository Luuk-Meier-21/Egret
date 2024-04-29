import { listen } from "@tauri-apps/api/event";
import { WebviewWindow } from "@tauri-apps/api/window";

export function promiseWindow(title: string): Promise<string> {
  let resolve = (_: any) => {};
  let reject = () => {};
  let windowLabel: string;

  const webview = new WebviewWindow("prompt-a", {
    url: "windows/prompt/index.html",
    focus: true,
    alwaysOnTop: true,
    resizable: false,
    minimizable: false,
    width: 300,
    height: 100,
    title,
  });

  webview.once("tauri://created", (event) => {
    windowLabel = event.windowLabel;
  });

  webview.once("tauri://error", (e) => {
    console.error(e);
    reject();
  });

  webview.once("tauri://close-requested", () => {
    reject();
    webview.close();
  });

  listen("submit", (event) => {
    if (event.windowLabel !== windowLabel) {
      return;
    }

    resolve(event.payload);
    webview.close();
  });

  listen("reject", (event) => {
    if (event.windowLabel !== windowLabel) {
      return;
    }

    reject();
    webview.close();
  });

  return new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
}

export function prompt(prompt: string) {
  return promiseWindow(prompt);
}
