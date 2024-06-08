import {
  isRegistered,
  register,
  unregister,
} from "@tauri-apps/api/globalShortcut";
import hotkeys, { HotkeysEvent, KeyHandler } from "hotkeys-js";
import { useEffect } from "react";
import { capitalize } from "./string";

export function useHotkeys(key: string, handler: KeyHandler) {
  useEffect(() => {
    const method = (event: KeyboardEvent, handle: HotkeysEvent) => {
      event.preventDefault();
      handler(event, handle);
      return false;
    };

    hotkeys(key, method);

    return () => {
      hotkeys.unbind(key, method);
    };
  }, [key, handler]);
}

export function useHotkeyOverride() {
  useEffect(() => {
    hotkeys.filter = function (event) {
      // @ts-expect-error object-possibily-null
      const tagName = (event.target || event.srcElement).tagName;
      return !(
        tagName.isContentEditable ||
        tagName == "INPUT" ||
        tagName == "SELECT" ||
        tagName == "TEXTAREA"
      );
    };
  }, []);
}

export function useTauriShortcut(
  shortcut: string,
  callback: (shortcut: string) => void,
) {
  const segments = shortcut.split("+");
  const parsedShortcut = segments
    .map((key) => (key === "cmd" ? "CommandOrControl" : key))
    .map((key) => capitalize(key))
    .join("+");

  useEffect(() => {
    isRegistered(parsedShortcut)
      .then((isRegistered) => {
        if (isRegistered === false) {
          register(parsedShortcut, callback);
        }
      })
      .catch((err) => console.error(err));

    return () => {
      isRegistered(parsedShortcut)
        .then((isRegistered) => {
          if (isRegistered) {
            unregister(parsedShortcut);
          }
        })
        .catch((err) => console.error(err));
    };
  }, []);
}
