import { BlockNoteView, useCreateBlockNote } from "@blocknote/react";
import { DocumentRegionData } from "../../types/document/document";
import { schema } from "../../blocks/schema";
import { shell } from "@tauri-apps/api";
import { toggleBlock } from "../../utils/block";
import { useEditorOnSave } from "../../utils/editor";
import { IBlockEditor } from "../../types/block";
import {
  useRegisterAction,
  useRegisterEditorAction,
} from "../../services/actions-registry";
import { useEffect, useRef } from "react";
import { deepJSONClone } from "../../utils/object";
import { keyExplicitAction } from "../../config/shortcut";

interface DocumentRegionProps {
  region: DocumentRegionData;
  onSave: (region: DocumentRegionData, editor: IBlockEditor) => void;
  onChange: (region: DocumentRegionData, editor: IBlockEditor) => void;
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
}: DocumentRegionProps) {
  const ref = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    editor._tiptapEditor.on("create", () => {
      if (isFocused) {
        focus();
      }
    });
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

  useRegisterAction("Open selected url", "cmd+u", () => {
    const url = editor.getSelectedLinkUrl();
    if (url === undefined) {
      return;
    }
    shell.open(url);
  });

  useRegisterAction("Insert image", "cmd+o", () => {
    if (!editor.isFocused()) {
      return;
    }

    const selectedBlock = editor.getTextCursorPosition().block;
    editor.insertBlocks(
      [
        {
          type: "image",
          props: {
            src: "https://letsenhance.io/static/8f5e523ee6b2479e26ecc91b9c25261e/1015f/MainAfter.jpg",
          },
        },
      ],
      selectedBlock,
    );
  });

  useRegisterAction("Insert image", keyExplicitAction("'"), async () => {
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

  return (
    <section
      aria-label={`Region: ${region.label || ""}`}
      data-component-name="DocumentDetail"
      data-focused={isFocused || undefined}
      ref={ref}
      className="input-hint w-full p-4 text-white data-[focused]:bg-white data-[focused]:text-black"
    >
      <BlockNoteView
        id={region.id}
        data-editor
        onFocus={() => {
          onFocus(region, editor);
        }}
        onBlur={() => {
          onBlur(region, editor);
        }}
        role="document"
        aria-label={`field, ${region.label}`}
        className="mx-auto w-full max-w-[46em] [&_a]:underline"
        editor={editor}
        aria-placeholder="test"
        // editable={false}
        slashMenu={false}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            editor;
          }
        }}
        sideMenu={false}
        formattingToolbar={false}
        hyperlinkToolbar={false}
      />
    </section>
  );
}

export default DocumentRegion;
