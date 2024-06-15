import {
  closeCompanionSocket,
  openCompanionSocket,
  setLayoutState,
} from "../../bindings";
import { keyExplicitNavigation } from "../../config/shortcut";
import { Layout } from "../../types/layout/layout";
import { useConditionalScopedAction } from "../actions/actions-hook";
import { flattenLayoutNodesByReference } from "../layout/layout-content";
import { clientEndpoint } from "../socket/tactile-socket";
import { useFeature } from "./features";
import { useEffect } from "react";
import { useStrictEffect } from "../layout/layout-change";
import { sanitizeLayout } from "../layout/layout-builder";
import { deepJSONClone } from "../../utils/object";
import { emit, listen } from "@tauri-apps/api/event";
import { useLayoutNavigator } from "../layout/layout-navigation";

export default function useTactileFeatures(
  env: Record<string, any>,
  layout: Layout,
  navigator: ReturnType<typeof useLayoutNavigator>,
) {
  const hasFeature = useFeature(env, "tactile");

  useConditionalScopedAction(
    "Start tactile mode",
    keyExplicitNavigation("9"),
    hasFeature,
    async () => {
      await openCompanionSocket();

      console.log(clientEndpoint(window.location.hostname));
    },
  );

  useConditionalScopedAction(
    "Stop tactile mode",
    keyExplicitNavigation("8"),
    hasFeature,
    async () => {
      await closeCompanionSocket();
    },
  );

  useConditionalScopedAction(
    "Refresh event",
    keyExplicitNavigation("left"),
    hasFeature,
    async () => {
      emit("refresh-client", "none");
    },
  );

  useEffect(() => {
    const focusCallback = (e: any) => {
      navigator.focusColumn(e.payload.row_id, e.payload.column_id);
    };

    const unlistenFocus = listen("focus", focusCallback);
    return () => {
      unlistenFocus.then((f) => f());
    };

    // No dependancy array! Function needs to be redefined on every effect, otherwise it will use stale state when fired.
    // https://stackoverflow.com/questions/57847594/accessing-up-to-date-state-from-within-a-callback
  });
  // }

  // const layoutIsChanged = (layout: SanitizedLayout): boolean => {
  //   return (
  //     layout.tree.length > 0 &&
  //     JSON.stringify(layout) !== JSON.stringify(layoutCache.current)
  //   );
  // };

  useStrictEffect(
    () => {
      setLayoutState(sanitizeLayout(layout)).then(() => {});
    },
    ([layout]) =>
      deepJSONClone(flattenLayoutNodesByReference(layout.tree)).length,
    [layout],
  );
}
