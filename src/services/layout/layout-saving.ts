import { listen, TauriEvent } from "@tauri-apps/api/event";
import { useEffect } from "react";
import { useStrictEffect } from "./layout-change";
import { deepJSONClone } from "../../utils/object";
import { flattenLayoutNodesByReference } from "./layout-content";
import { Layout } from "../../types/layout/layout";

export function useLayoutAutoSaveHandle(layout: Layout, onSave: () => void) {
  const saveLayout = () => {
    console.log("save: ", layout);
    onSave();
  };

  // useEffect(() => {
  //   let unlisten = () => {};

  //   listen(TauriEvent.WINDOW_CLOSE_REQUESTED, async () => {
  //     await onSave();
  //   }).then((callback) => {
  //     unlisten = callback;
  //   });

  //   return () => {
  //     unlisten();
  //   };
  // }, [onSave, layout]);

  // useStrictEffect(
  //   () => {
  //     saveLayout();
  //   },
  //   ([layout]) =>
  //     deepJSONClone(flattenLayoutNodesByReference(layout.tree)).length,
  //   [layout],
  // );
}
