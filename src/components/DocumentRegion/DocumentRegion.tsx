import { DocumentRegionData } from "../../types/document/document";
import { schema } from "../../blocks/schema";
import { shell } from "@tauri-apps/api";
import { toggleBlock } from "../../utils/block";
import { useEditorOnSave } from "../../utils/editor";
import { IBlockEditor } from "../../types/block";
import {
  useRegisterAction,
  useRegisterEditorAction,
} from "../../services/actions/actions-registry";
import { useContext, useEffect, useRef, useState } from "react";
import { keyExplicitAction } from "../../config/shortcut";
import { BlockNoteView, useCreateBlockNote } from "@blocknote/react";
import { useScopedAction } from "../../services/actions/actions-hook";
import { insertOrUpdateBlock } from "@blocknote/core";
import { DialogContext } from "../Dialog/DialogProvider";
import { clearMocks } from "@tauri-apps/api/mocks";

interface DocumentRegionProps {
  region: DocumentRegionData;
  onSave: (region: DocumentRegionData, editor: IBlockEditor) => void;
  onChange: (region: DocumentRegionData, editor: IBlockEditor) => void;
  onExport: (region: DocumentRegionData, editor: IBlockEditor) => void;
  onFocus: (region: DocumentRegionData, editor: IBlockEditor) => void;
  onBlur: (region: DocumentRegionData, editor: IBlockEditor) => void;
  isFocused: boolean;
}

function DocumentRegion({
  region,
  onSave,
  onChange,
  isFocused = false,
  onFocus,
  onBlur,
  onExport,
}: DocumentRegionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [editing, setEditing] = useState(false);

  const { announce } = useContext(DialogContext);

  const focusRef = useRef<HTMLInputElement>(null);

  const editor = useCreateBlockNote({
    schema,
    initialContent: region.blocks,
  });

  const regionWithCurrentBlock = (): DocumentRegionData => ({
    ...region,
    blocks: editor.document,
  });

  useEditorOnSave(editor, () => {
    onSave(regionWithCurrentBlock(), editor);
  });

  const focus = () => {
    try {
      editor.focus();
    } catch (error) {
      console.info(`Unable to focus: (${region.label || region.id})`);
    }
  };

  useEffect(() => {}, [editing]);

  useEffect(() => {
    editor._tiptapEditor.on("create", () => {
      if (isFocused) {
        focus();
      }
    });

    const setNavigation = (event: globalThis.KeyboardEvent) => {
      if (event.altKey) {
        setEditing(false);
      } else {
        setEditing(true);
      }
    };

    window.addEventListener("keydown", setNavigation);
    window.addEventListener("keyup", setNavigation);

    return () => {
      window.removeEventListener("keydown", setNavigation);
      window.addEventListener("keyup", setNavigation);
    };
  }, []);

  useEffect(() => {
    if (isFocused) {
      focus();
    }
  }, [isFocused]);

  editor.onEditorContentChange(() => {
    onChange(regionWithCurrentBlock(), editor);
  });

  useRegisterEditorAction(editor, "Selection to title", "cmd+b", () => {
    if (!editor.isFocused()) {
      return;
    }
    const selectedBlock = editor.getTextCursorPosition().block;
    toggleBlock(editor, selectedBlock, {
      type: "title",
    });
  });

  useScopedAction("Open selected url", "cmd+u", () => {
    const url = editor.getSelectedLinkUrl();
    if (url === undefined) {
      return;
    }
    shell.open(url);
  });

  useScopedAction("Insert image", "cmd+o", () => {
    if (!editor.isFocused()) {
      return;
    }

    insertOrUpdateBlock(editor, {
      type: "image",
      props: {
        src: "https://letsenhance.io/static/8f5e523ee6b2479e26ecc91b9c25261e/1015f/MainAfter.jpg",
      },
    });
  });

  useScopedAction("Insert dummy text", keyExplicitAction("'"), async () => {
    if (!editor.isFocused()) {
      return;
    }

    // Proxy of: https://loripsum.net/
    const response = await fetch("/api/dummy-text/1/plaintext");
    const text = await response.text();

    const selectedBlock = editor.getTextCursorPosition().block;
    editor.insertBlocks(
      [
        {
          type: "paragraph",
          content: text.trim() || "",
        },
      ],
      selectedBlock,
    );
  });

  const refa = useRef<HTMLButtonElement>(null);

  useScopedAction("Export to HTML", "p", async () => {
    if (isFocused) {
      refa.current?.focus();

      setTimeout(() => {
        editor.focus();
      }, 1000);
    }
    // const element = refa.current?.querySelector("* > div");
    // element?.setAttribute("role", "alert");
    // console.log(element);
  });

  return (
    <section
      data-component-name="DocumentDetail"
      aria-current="page"
      data-focused={isFocused || undefined}
      ref={ref}
      className="input-hint relative w-full p-4 text-white data-[focused]:bg-white data-[focused]:text-black"
    >
      <button ref={refa}>Some announcement</button>
      <BlockNoteView
        id={region.id}
        data-editor
        aria-hidden="true"
        onFocus={() => {
          onFocus(region, editor);
        }}
        onBlur={() => {
          onBlur(region, editor);
        }}
        className="mx-auto w-full max-w-[46em] [&_a]:underline"
        editor={editor}
        slashMenu={false}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            editor;
          }
        }}
        sideMenu={false}
        formattingToolbar={false}
        hyperlinkToolbar={false}
      ></BlockNoteView>
    </section>
  );
}

export default DocumentRegion;
