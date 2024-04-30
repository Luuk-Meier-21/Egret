import { useEffect, useRef } from "react";
import { IBlockEditor } from "../types/block";
import { Document } from "../types/documents";
import {
  fetchDocumentById,
  formatDocumentName,
  parseDocument,
  saveDocument,
} from "./documents";
import { useHotkeyOverride, useHotkeys } from "./hotkeys";
import { TauriEvent, listen } from "@tauri-apps/api/event";
import { handleError } from "./announce";
import { FILE } from "../config/files";
import { exists } from "@tauri-apps/api/fs";

const UNSAVED_CHANGES_MAX = 5;

export function useEditorAutoSaveHandle(
  editor: IBlockEditor,
  onSave: () => void,
) {
  const unsavedChangesCount = useRef(0);

  const handleSave = (type: string = "unknown") => {
    console.info(
      `🪝 ~ autosave, event: ${type}, after:`,
      unsavedChangesCount.current,
    );
    onSave();
    unsavedChangesCount.current = 0;
  };

  useEffect(() => {
    editor.onEditorContentChange(() => {
      unsavedChangesCount.current++;

      if (unsavedChangesCount.current > UNSAVED_CHANGES_MAX) {
        handleSave("auto");
      }
    });

    editor._tiptapEditor.on("blur", () => {
      handleSave("blur");
    });

    let unlisten = () => {};

    listen(TauriEvent.WINDOW_CLOSE_REQUESTED, async () => {
      handleSave("close");
    }).then((callback) => {
      unlisten = callback;
    });

    return () => {
      handleSave("unmount");
      unlisten();
    };
  }, []);
}

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
    const fileExists = await exists(
      `${FILE.path}/${formatDocumentName(initialDocument.name, initialDocument.id)}`,
      {
        dir: FILE.source,
      },
    );

    if (!fileExists) {
      handleError("File is deleted, unable to save");
    }

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
