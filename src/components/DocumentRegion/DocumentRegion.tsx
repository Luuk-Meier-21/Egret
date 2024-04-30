import { DocumentRegionData } from "../../types/document/document";
import { schema } from "../../blocks/schema";
import { shell } from "@tauri-apps/api";
import { toggleBlock } from "../../utils/block";
import { useEditorAutoSaveHandle } from "../../utils/editor";
import { IBlockEditor } from "../../types/block";
import { useEffect, useRef } from "react";
import { keyAction, keyExplicitAction } from "../../config/shortcut";
import { BlockNoteView, useCreateBlockNote } from "@blocknote/react";
import { useConditionalAction } from "../../services/actions/actions-hook";
import { insertOrUpdateBlock } from "@blocknote/core";
import { DialogFilter, open } from "@tauri-apps/api/dialog";
import { voiceSay } from "../../bindings";
import { convertFileSrc } from "@tauri-apps/api/tauri";
import { toDataURL } from "../../utils/url";
import { announceError } from "../../utils/error";
import { copyFile } from "@tauri-apps/api/fs";
import { ASSETS, DOCUMENTS } from "../../config/files";
import { openAsset } from "../../utils/filesystem";

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

  useConditionalAction(
    "Insert image by url",
    keyAction("o"),
    isFocused,
    async () => {
      if (!editor.isFocused()) {
        return;
      }

      try {
        const url = await openAsset("Select a Image", [
          {
            name: "Image",
            extensions: ["png", "jpg", "jpeg", "pdf", "svg"],
          },
        ]);

        insertOrUpdateBlock(editor, {
          type: "image",
          props: {
            src: url,
          },
        });

        editor.focus();
      } catch (error) {
        announceError();
        console.error(error);
      }
    },
  );

  useConditionalAction(
    "Insert image as embed",
    keyExplicitAction("o"),
    isFocused,
    async () => {
      if (!editor.isFocused()) {
        return;
      }

      try {
        const url = await openAsset("Select a Image", [
          {
            name: "Image",
            extensions: ["png", "jpg", "jpeg", "pdf", "svg"],
          },
        ]);
        const dataUrl = await toDataURL(url);

        insertOrUpdateBlock(editor, {
          type: "image",
          props: {
            src: dataUrl,
          },
        });

        editor.focus();
      } catch (error) {
        announceError();
        console.error(error);
      }
    },
  );

  useConditionalAction(
    "Insert audio fragment",
    keyAction("l"),
    isFocused,
    async () => {
      if (!editor.isFocused()) {
        return;
      }

      try {
        const url = await openAsset("Select a Image", [
          {
            name: "Audio",
            extensions: ["png", "jpg", "jpeg", "pdf", "svg"],
          },
        ]);

        insertOrUpdateBlock(editor, {
          type: "image",
          props: {
            src: url,
          },
        });

        editor.focus();
      } catch (error) {
        announceError();
        console.error(error);
      }
    },
  );

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
      className="input-hint relative  w-full p-4 text-inherit outline-none data-[focused]:bg-white data-[focused]:text-black"
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
        className="mx-auto flex h-full w-full max-w-[46em] outline-none focus:outline-none [&_*]:outline-none"
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
