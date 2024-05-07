import { DocumentRegionData } from "../../types/document/document";
import { schema } from "../../blocks/schema";
import { shell } from "@tauri-apps/api";
import {
  polyfillTiptapBreaking,
  tiptapIsBreaking,
  toggleBlock,
} from "../../utils/block";
import { useEditorAutoSaveHandle } from "../../utils/editor";
import { IBlockEditor } from "../../types/block";
import { useEffect, useRef, useState } from "react";
import { keyAction, keyExplicitAction } from "../../config/shortcut";
import { BlockNoteView, useCreateBlockNote } from "@blocknote/react";
import {
  useConditionalAction,
  useScopedAction,
} from "../../services/actions/actions-hook";
import { insertOrUpdateBlock } from "@blocknote/core";
import { DialogFilter, open } from "@tauri-apps/api/dialog";
import { voiceSay } from "../../bindings";
import { toDataURL } from "../../utils/url";
import { announceError } from "../../utils/error";
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
  label?: string;
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
  label,
}: DocumentRegionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const editButton = useRef<HTMLButtonElement>(null);

  const [inEdit, setEdit] = useState(false);

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
      editButton.current?.focus();
      editor.focus();
      onImplicitAnnounce(region, editor);
    } catch (error) {
      console.info(`Unable to focus: (${region.label || region.id})`);
    }
  };

  const startEdit = () => {
    setEdit(true);
  };

  const stopEdit = () => {
    setEdit(false);
  };

  useEffect(() => {
    if (isFocused) {
      focus();
    }
  }, [isFocused, inEdit]);

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

  const getPreviewText = (): string | undefined => {
    const maxWords = 5;

    if (polyfillTiptapBreaking(editor)) {
      return;
    }

    const innerText = editor.domElement.innerText;
    const words = innerText.match(/([^\s]+)/g) || [];

    if (words.join(" ").length <= 0) {
      return;
    }

    if (words.length > maxWords) {
      return `${words.slice(0, maxWords).join(" ")}…`;
    }

    return words.join(" ");
  };

  return (
    <section
      data-component-name="DocumentDetail"
      aria-current="page"
      lang="en"
      data-focused={isFocused || undefined}
      ref={ref}
      aria-label={label}
      tabIndex={0}
      onFocus={() => {
        onFocus(region, editor);
        focus();
      }}
      onBlur={() => {
        onBlur(region, editor);
        console.warn("Blur");
        stopEdit();
      }}
      className="input-hint relative w-full  p-4 text-inherit outline-none outline-8 focus:outline data-[focused]:bg-white data-[focused]:text-black"
    >
      <BlockNoteView
        id={region.id}
        data-editor
        className="mx-auto flex h-full w-full max-w-[46em] outline-none focus:outline-none [&_*]:outline-none"
        editor={editor}
        slashMenu={false}
        sideMenu={false}
        formattingToolbar={false}
        hyperlinkToolbar={false}
        editable={inEdit}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            stopEdit();
          }
        }}
        onFocus={() => {
          onFocus(region, editor);
          focus();
        }}
        onBlur={() => {
          onBlur(region, editor);
          console.warn("Blur");
          stopEdit();
        }}
      />
      {!inEdit && (
        <button
          ref={editButton}
          className="absolute inset-0 text-left"
          onClick={startEdit}
          aria-label={getPreviewText() || "Blank"}
        ></button>
      )}
    </section>
  );
}

export default DocumentRegion;
