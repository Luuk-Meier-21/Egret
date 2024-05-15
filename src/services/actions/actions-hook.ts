import { ComponentPropsWithoutRef, useContext, useEffect } from "react";
import {
  ActionCallback,
  ActionConfiguration,
  renderAction,
  renderActionWithShortcut,
} from "./actions-registry";
import { ActionsContext } from "../../components/Actions/Actions";
import { ActionReducerAction } from "./actions-reducer";
import { useHotkeys } from "../../utils/hotkeys";
import { announceError } from "../../utils/error";

function actionCallbackWithAnnounce(callback: ActionCallback) {
  const announce = (value: boolean) => {
    if (!value) {
      announceError();
    }
  };

  const value = callback();
  if ((value as Promise<boolean | void>)["then"] !== undefined) {
    const asyncValue = value as Promise<boolean | void>;
    asyncValue.then((value) => {
      if (typeof value === "boolean") {
        announce(value);
      }
    });
  } else {
    const sycnValue = value as boolean | void;
    if (typeof sycnValue === "boolean") {
      announce(sycnValue);
    }
  }
}

export function useScopedAction(
  label: string,
  shortcut: string,
  callback: ActionCallback,
) {
  const [_, dispatch] = useContext(ActionsContext);
  const action: ActionConfiguration = {
    label,
    shortcut,
    callback,
    hidden: false,
  };

  useHotkeys(shortcut, () => actionCallbackWithAnnounce(callback));

  useEffect(() => {
    dispatch({ type: "register", action });

    return () => {
      dispatch({ type: "unscope", action });
    };
  }, []);

  const element = (props: ComponentPropsWithoutRef<"button">) =>
    renderAction({ ...action, ...props });

  const elementWithShortcut = (props: ComponentPropsWithoutRef<"button">) =>
    renderActionWithShortcut({ ...action, ...props });

  return { callback, element, elementWithShortcut } as const;
}

export function useConditionalAction(
  label: string,
  shortcut: string,
  condition: boolean,
  callback: ActionCallback,
) {
  const [_, dispatch] = useContext(ActionsContext);
  const wrappedCallback = () => {
    if (condition) {
      actionCallbackWithAnnounce(callback);
    }
  };

  const action: ActionConfiguration = {
    label,
    shortcut,
    callback: wrappedCallback,
    hidden: false,
  };

  useHotkeys(shortcut, wrappedCallback);

  useEffect(() => {
    if (condition) {
      dispatch({ type: "register", action });
    }

    return () => {
      dispatch({ type: "unscope", action });
    };
  }, [condition]);

  const element = (props: ComponentPropsWithoutRef<"button">) =>
    renderAction({ ...action, ...props });

  const elementWithShortcut = (props: ComponentPropsWithoutRef<"button">) =>
    renderActionWithShortcut({ ...action, ...props });

  return { callback, element, elementWithShortcut } as const;
}

export function useInjectedAction(
  dispatch: React.Dispatch<ActionReducerAction>,
  label: string,
  shortcut: string,
  callback: ActionCallback,
) {
  const action: ActionConfiguration = {
    label,
    shortcut,
    callback,
    hidden: false,
  };

  useHotkeys(shortcut, () => actionCallbackWithAnnounce(callback));

  useEffect(() => {
    dispatch({ type: "register", action });

    return () => {
      dispatch({ type: "unscope", action });
    };
  }, []);

  const element = (props: ComponentPropsWithoutRef<"button">) =>
    renderAction({ ...action, ...props });

  const elementWithShortcut = (props: ComponentPropsWithoutRef<"button">) =>
    renderActionWithShortcut({ ...action, ...props });

  return { callback, element, elementWithShortcut } as const;
}
