// Typing registries
// https://stackoverflow.com/questions/47098643/implementing-a-type-safe-service-registry-in-typescript

import { createContext, useEffect } from "react";
import { ObjectRegistry } from "../utils/object";

export type ActionCallback = () => void;

export interface ActionConfiguration {
  label: string;
  shortcut: string;
  callback: ActionCallback;
}

class ActionsRegistry {
  actions = ObjectRegistry.init();

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

export const actionsRegistry = new ActionsRegistry();

const actionContext = createContext(actionsRegistry);

/**
 * a hook for handling actions in caller component scope
 * @param action the action to be added / removed in the scope of the caller component
 */
export function useRegisterAction(...actions: ActionConfiguration[]) {
  useEffect(() => {
    for (let action of actions) {
      actionsRegistry.define(action);
    }

    return () => {
      for (let action of actions) {
        actionsRegistry.delete(action);
      }
    };
  }, []);
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
  };
}
