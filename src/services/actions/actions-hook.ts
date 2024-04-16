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

export function useScopedAction(
  label: string,
  shortcut: string,
  callback: ActionCallback,
  hidden: boolean = false,
) {
  const [actions, dispatch] = useContext(ActionsContext);
  const action: ActionConfiguration = {
    label,
    shortcut,
    callback,
    hidden,
  };

  useHotkeys(shortcut, callback);

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
  condition: boolean,
  label: string,
  shortcut: string,
  callback: ActionCallback,
  hidden: boolean = false,
) {
  const [actions, dispatch] = useContext(ActionsContext);
  const action: ActionConfiguration = {
    label,
    shortcut,
    callback,
    hidden,
  };

  useHotkeys(shortcut, callback);

  useEffect(() => {
    if (condition) {
      dispatch({ type: "register", action });
    } else {
      dispatch({ type: "unscope", action });
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
  hidden: boolean = false,
) {
  const action: ActionConfiguration = {
    label,
    shortcut,
    callback,
    hidden,
  };

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
