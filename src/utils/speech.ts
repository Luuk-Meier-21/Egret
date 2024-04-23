import { useEffect } from "react";
import { voiceSay } from "../bindings";

/**
 * Parse shortcuts abreviations such as `cmd` to their complete word. `cmd` to `command`
 * @param keys a array of shortcut keys
 * @returns a array of human / VA readable shortcuts
 */
export function formatShortcutsForSpeech(keys: string[]): string[] {
  return keys.map((key) => {
    switch (key) {
      case "cmd":
        return "command";
      case "ctrl":
        return "control";
      case ",":
        return "comma";
      case ".":
        return "period";
      case "/":
        return "slash";
      case "up":
        return "arrow up";
      case "down":
        return "arrow down";
      case "left":
        return "arrow left";
      case "right":
        return "arrow right";
      default:
        return key;
    }
  });
}

export function useOverrideScreenreader(
  message: string,
  condition: boolean,
): () => void {
  const func = () => {
    console.info("Voiceover say: ", message);
    voiceSay(message);
  };

  useEffect(() => {
    if (condition) {
      func();
    }
  }, [condition]);

  return func;
}
