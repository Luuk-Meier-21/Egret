import { useEffect, useRef } from "react";
import { IBlockEditor } from "../types/block";
import { Document } from "../types/documents";
import { fetchDocumentById, parseDocument, saveDocument } from "./documents";
import { useHotkeyOverride, useHotkeys } from "./hotkeys";
import { TauriEvent, listen } from "@tauri-apps/api/event";

const UNSAVED_CHANGES_MAX = 15;

export function useEditorAutosave(
  editor: IBlockEditor,
  initialDocument: Document,
): {
  saveAndSync: () => void;
  save: () => void;
  sync: () => void;
} {
  const unsavedChangesCount = useRef(0);

  const getCurrentDocument = (): Document =>
    parseDocument(
      initialDocument.name,
      initialDocument.id,
      initialDocument.content.meta,
      editor.document,
    );

  const saveChanges = async () => {
    if (unsavedChangesCount.current > 0) {
      await save();
    }
  };

  const save = async () => {
    await saveDocument(getCurrentDocument());
    console.log("🚀 ~ save ~ after:", unsavedChangesCount.current);
    unsavedChangesCount.current = 0;
  };

  const sync = async () => {
    const document = await fetchDocumentById(initialDocument.id);
    if (document === null) {
      // Rly weird, revert to old state? this would mean a corrupted document
      return;
    }
    editor.replaceBlocks(editor.document, document.content.text);
  };

  const saveAndSync = async () => {
    await save();
    await sync();
  };

  // Save of x editor changes
  editor.onEditorContentChange(() => {
    unsavedChangesCount.current++;

    if (unsavedChangesCount.current > UNSAVED_CHANGES_MAX) {
      save();
    }
  });

  // Save on component unmount
  useEffect(() => {
    //@ts-ignore
    let unlisten = () => {};

    // Save on window close
    listen(TauriEvent.WINDOW_CLOSE_REQUESTED, async () => {
      saveChanges();
    }).then((callback) => {
      unlisten = callback;
    });

    return () => {
      saveChanges();
    };
  }, []);

  // Save on save hotkey
  useHotkeyOverride();
  useHotkeys("cmd+s", () => {
    saveChanges();
  });

  return {
    saveAndSync,
    save,
    sync,
  };
}
