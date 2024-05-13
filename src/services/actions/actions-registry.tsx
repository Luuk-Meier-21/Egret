// Typing registries
// https://stackoverflow.com/questions/47098643/implementing-a-type-safe-service-registry-in-typescript

import { ComponentPropsWithoutRef, useEffect } from "react";
import { ObjectRegistry } from "../../utils/object";
import { useHotkeys } from "../../utils/hotkeys";
import { formatShortcutsForSpeech } from "../../utils/speech";
import { IBlockEditor } from "../../types/block";

export type ActionCallback = () =>
  | boolean
  | void
  | Promise<boolean>
  | Promise<void>;

export interface ActionConfiguration {
  label: string;
  shortcut: string;
  callback: ActionCallback;
  hidden: boolean;
}

class ActionsRegistry {
  actions = ObjectRegistry.init();

  constructor() {}

  define(action: ActionConfiguration) {
    this.actions.register(action.shortcut, action);
  }

  delete(action: ActionConfiguration) {
    // @ts-expect-error
    this.actions.remove(action.shortcut);
  }

  map<T>(callback: (action: ActionConfiguration) => T) {
    return this.actions.keys().map((key) => {
      const action = this.actions.get(key);
      return callback(action);
    });
  }
}

const actionsRegistry = new ActionsRegistry();

/**
 * a hook for handling actions in caller component scope
 * @param action the action to be added / removed in the scope of the caller component
 */
export function useRegisterAction(
  label: string,
  shortcut: string,
  callback: ActionCallback,
): {
  callback: ActionCallback;
  element: React.FC<ComponentPropsWithoutRef<"button">>;
  elementWithShortcut: React.FC<ComponentPropsWithoutRef<"button">>;
} {
  const newAction = action(label, shortcut, callback);

  const element = (props: ComponentPropsWithoutRef<"button">) =>
    renderAction({ ...newAction, ...props });
  const elementWithShortcut = (props: ComponentPropsWithoutRef<"button">) =>
    renderActionWithShortcut({ ...newAction, ...props });

  useHotkeys(shortcut, (event) => {
    event.preventDefault();
    callback();
  });

  // useTauriShortcut(shortcut, callback);

  useEffect(() => {
    actionsRegistry.define(newAction);

    return () => {
      actionsRegistry.delete(newAction);
    };
  }, []);

  return { callback, element, elementWithShortcut };
}

export function useRegisterEditorAction(
  editor: IBlockEditor,
  label: string,
  shortcut: string,
  callback: ActionCallback,
) {
  useRegisterAction(label, shortcut, () => {
    if (editor.isFocused() && editor.isEditable) {
      callback();
    }
  });
}

export function renderAction({
  label,
  callback,
  ...props
}: ActionConfiguration & ComponentPropsWithoutRef<"button">) {
  return (
    <button
      className=" w-full text-left underline"
      onClick={callback}
      {...props}
    >
      {label}
    </button>
  );
}

export function renderActionWithShortcut({
  label,
  shortcut,
  callback,
  ...props
}: ActionConfiguration & ComponentPropsWithoutRef<"button">) {
  return (
    <button
      className=" w-full text-left underline"
      onClick={callback}
      {...props}
    >
      {label}{" "}
      <em>({formatShortcutsForSpeech(shortcut.split("+")).join(", ")})</em>
    </button>
  );
}

export function action(
  label: string,
  shortcut: string,
  callback: ActionCallback,
): ActionConfiguration {
  return {
    label,
    shortcut,
    callback,
    hidden: false,
  };
}
