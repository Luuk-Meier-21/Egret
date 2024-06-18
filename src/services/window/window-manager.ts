import { emit, listen, TauriEvent } from "@tauri-apps/api/event";
import { WebviewWindow, WindowOptions } from "@tauri-apps/api/window";
import { slugify } from "../../utils/url";
import { ExportWindowProps } from "../export/export";

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
      values: (string | number)[];
      labels: string[];
    }
  | ExportWindowProps
);

// Currently Tauri has no good way of sharing data between windows: https://github.com/tauri-apps/tauri/issues/5979
export function promiseWindow(
  title: string,
  data: PromiseWindowData,
  options: WindowOptions = {},
  windowEndpoint: string = "prompt",
): Promise<string> {
  let resolve = (_: any) => {};
  let reject = () => {};

  const windowLabel: string = slugify(title);
  const params = new URLSearchParams(data as Record<string, any>);

  const webview =
    WebviewWindow.getByLabel(windowLabel) ??
    new WebviewWindow(windowLabel, {
      url: `window/${windowEndpoint}/index.html?${params.toString()}`,
      focus: true,
      alwaysOnTop: true,
      resizable: false,
      minimizable: false,
      title,
      width: options.width || 300,
      height: options.height || 300,
      ...options,
    });

  // webview.once("tauri://created", (event) => {});

  webview.once(TauriEvent.WINDOW_DESTROYED, () => {
    reject();
    webview.close();
  });

  webview.once("tauri://error", (e) => {
    console.error(e);
    reject();
    webview?.close();
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
  options: { label: string; value: string | number }[],
) {
  let labels: string[] = [];
  let values = options.map(({ label, value }) => {
    labels.push(label);
    return value;
  });

  // Data has to be send over url query params, tauri currently supports no alternaltive
  return promiseWindow(
    prompt,
    {
      type: "select",
      label: promptDescription,
      values: values,
      labels: labels,
    },
    {
      width: 600,
      minHeight: 500,
    },
  );
}

const resolveMultiWindowParams = (params: URLSearchParams) => {
  const data = {} as PromiseWindowData;

  for (let [key, value] of params.entries() as IterableIterator<
    [keyof PromiseWindowData, string]
  >) {
    //@ts-ignore
    data[key] = value.includes(",") ? value.split(",") : value;
  }

  return data;
};

export const useMultiWindow = (overwriteParams?: URLSearchParams) => {
  const params = overwriteParams || new URLSearchParams(window.location.search);
  const data = resolveMultiWindowParams(params);
  const resolve = (value: string) => emit("submit", value);
  const reject = () => emit("reject");

  return {
    data,
    resolve,
    reject,
  } as const;
};
