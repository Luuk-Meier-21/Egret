import { listen } from "@tauri-apps/api/event";
import { WebviewWindow, WindowOptions } from "@tauri-apps/api/window";
import { slugify } from "../../utils/url";

export type PromiseWindowData = {
  type: string;
} & (
  | {
      type: "input";
      label: string;
    }
  | {
      type: "select";
      label: string;
      options: string[];
    }
);

// Currently Tauri has no good way of sharing data between windows: https://github.com/tauri-apps/tauri/issues/5979
export function promiseWindow(
  title: string,
  data: PromiseWindowData,
  options: WindowOptions = {},
): Promise<string> {
  let resolve = (_: any) => {};
  let reject = () => {};
  let windowLabel: string;

  const params = new URLSearchParams(data as Record<string, any>);

  const webview = new WebviewWindow(slugify(title), {
    url: `windows/prompt/index.html?${params.toString()}`,
    focus: true,
    alwaysOnTop: true,
    resizable: false,
    minimizable: false,
    title,
    width: options.width || 300,
    height: options.height || 300,
    ...options,
  });

  webview.once("tauri://created", (event) => {
    windowLabel = event.windowLabel;
  });

  webview.once("tauri://error", (e) => {
    console.error(e);
    reject();
    webview.close();
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

export function prompt(prompt: string, promptDescription: string) {
  return promiseWindow(prompt, {
    type: "input",
    label: promptDescription,
  });
}

export function selectSingle(
  prompt: string,
  promptDescription: string,
  options: string[],
) {
  return promiseWindow(
    prompt,
    {
      type: "select",
      label: promptDescription,
      options: options,
    },
    {
      width: 600,
      minHeight: 500,
    },
  );
}
