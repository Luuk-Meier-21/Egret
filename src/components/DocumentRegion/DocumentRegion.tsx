import { BlockNoteView, useCreateBlockNote } from "@blocknote/react";
import { DocumentRegionData } from "../../types/document-service";
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

  useEffect(() => {
    if (isFocused) {
      try {
        editor.focus();
      } catch (error) {}
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

  return (
    <section
      aria-label={`Region: ${region.label || ""}`}
      data-component-name="DocumentDetail"
      ref={ref}
      className="w-full p-4 text-white focus-within:bg-white focus-within:text-black"
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
        className="w-full max-w-[46em] [&_a]:underline"
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
