import { DocumentRegionData } from "../../types/document/document";
import { schema } from "../../blocks/schema";
import { shell } from "@tauri-apps/api";
import { toggleBlock } from "../../utils/block";
import { useEditorAutoSaveHandle } from "../../utils/editor";
import { IBlockEditor } from "../../types/block";
import { useEffect, useRef } from "react";
import { keyExplicitAction } from "../../config/shortcut";
import { BlockNoteView, useCreateBlockNote } from "@blocknote/react";
import { useConditionalAction } from "../../services/actions/actions-hook";
import { insertOrUpdateBlock } from "@blocknote/core";
import { open } from "@tauri-apps/api/dialog";
import { voiceSay } from "../../bindings";

interface DocumentRegionProps {
  region: DocumentRegionData;
  onSave?: (region: DocumentRegionData, editor: IBlockEditor) => void;
  onChange?: (region: DocumentRegionData, editor: IBlockEditor) => void;
  onFocus: (region: DocumentRegionData, editor: IBlockEditor) => void;
  onImplicitAnnounce?: (
    region: DocumentRegionData,
    editor: IBlockEditor,
  ) => string | null;
  onExplicitAnnounce?: (
    region: DocumentRegionData,
    editor: IBlockEditor,
  ) => string | null;
  onBlur: (region: DocumentRegionData, editor: IBlockEditor) => void;
  isFocused: boolean;
}

function DocumentRegion({
  region,
  onSave = () => {},
  onChange = () => {},
  onImplicitAnnounce = () => null,
  onExplicitAnnounce = () => null,
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

  useEditorAutoSaveHandle(editor, () => {
    onSave(regionWithCurrentBlock(), editor);
  });

  const focus = () => {
    try {
      editor.focus();
      onImplicitAnnounce(region, editor);
    } catch (error) {
      console.info(`Unable to focus: (${region.label || region.id})`);
    }
  };

  useEffect(() => {
    if (isFocused) {
      focus();
    }
  }, [isFocused]);

  useEffect(() => {
    editor._tiptapEditor.on("create", () => {
      if (isFocused) {
        focus();
      }
    });
  });

  editor.onEditorContentChange(() => {
    onChange(regionWithCurrentBlock(), editor);
  });

  useConditionalAction("Selection to title", "cmd+b", isFocused, () => {
    if (!editor.isFocused()) {
      return;
    }
    const selectedBlock = editor.getTextCursorPosition().block;
    toggleBlock(editor, selectedBlock, {
      type: "title",
    });
  });

  useConditionalAction("Open selected url", "cmd+u", isFocused, () => {
    const url = editor.getSelectedLinkUrl();
    if (url === undefined) {
      return;
    }
    shell.open(url);
  });

  useConditionalAction("Insert image", "cmd+o", isFocused, async () => {
    if (!editor.isFocused()) {
      return;
    }

    const targetImage = await open({
      title: "Image to insert",
      directory: false,
      multiple: false,
      filters: [
        {
          name: "Image",
          extensions: ["png", "jpg", "jpeg", "pdf"],
        },
      ],
    });

    if (targetImage === null) {
      return;
    }

    const src = `file:/${Array.isArray(targetImage) ? targetImage[0] : targetImage}`;

    console.log(src);

    insertOrUpdateBlock(editor, {
      type: "image",
      props: {
        src,
      },
    });
  });

  useConditionalAction(
    "Insert dummy text",
    keyExplicitAction("'"),
    isFocused,
    async () => {
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
    },
  );

  useConditionalAction(
    "Speak current position",
    keyExplicitAction("i"),
    isFocused,
    async () => {
      if (!editor.isFocused()) {
        return;
      }

      const voiceLine = onExplicitAnnounce(region, editor);

      if (voiceLine === null) {
        return;
      }

      voiceSay(voiceLine);
    },
  );

  return (
    <section
      data-component-name="DocumentDetail"
      aria-current="page"
      data-focused={isFocused || undefined}
      ref={ref}
      className="input-hint relative w-full p-4 text-white data-[focused]:bg-white data-[focused]:text-black"
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
        className="mx-auto flex h-full w-full max-w-[46em] "
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
      />
    </section>
  );
}

export default DocumentRegion;
