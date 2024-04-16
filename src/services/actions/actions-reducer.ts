import { slugify } from "../../utils/url";
import { ActionConfiguration } from "./actions-registry";

type ReducerRequired = {
  type: string;
};

export type ActionReducerAction = ReducerRequired &
  (
    | {
        type: "register";
        action: ActionConfiguration;
      }
    | {
        type: "unscope";
        action: ActionConfiguration;
      }
  );

export function actionsReducer(
  actions: ActionConfiguration[],
  reducerAction: ActionReducerAction,
): ActionConfiguration[] {
  switch (reducerAction.type) {
    case "register": {
      return [...actions, reducerAction.action];
    }
    case "unscope": {
      const newActions = actions.filter(
        (a) => slugify(a.label) !== slugify(reducerAction.action.label),
      );

      return [...newActions];
    }
  }
}
