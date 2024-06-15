import { useEffect } from "react";
import { Layout } from "../../types/layout/layout";
import { DocumentEvent, DocumentEventPayload } from "../document/event";
import { Event, listen, TauriEvent } from "@tauri-apps/api/event";
import { useStrictEffect } from "./layout-change";
import { deepJSONClone } from "../../utils/object";
import { flattenLayoutNodesByReference } from "./layout-content";

export function useLayoutAutoSaveHandle(layout: Layout, save: () => void) {
  useEffect(() => {
    const unlistenCloseDocument = listen<DocumentEventPayload>(
      DocumentEvent.CLOSE,
      (_event: Event<DocumentEventPayload>) => {
        save();
      },
    );

    const unlistenClose = listen(
      TauriEvent.WINDOW_CLOSE_REQUESTED,
      async () => {
        await save();
      },
    );

    return () => {
      unlistenCloseDocument.then((func) => func());
      unlistenClose.then((func) => func());
    };
  }, [listen, save]);

  useStrictEffect(
    () => {
      save();
    },
    ([layout]) =>
      deepJSONClone(flattenLayoutNodesByReference(layout.tree)).length,
    [layout],
  );
}
