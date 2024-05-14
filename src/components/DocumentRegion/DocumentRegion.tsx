import {
  DocumentRegionData,
  DocumentRegionUserLandmark,
} from "../../types/document/document";
import { schema } from "../../blocks/schema";
import { shell } from "@tauri-apps/api";
import { polyfillTiptapBreaking, toggleBlock } from "../../utils/block";
import { useEditorAutoSaveHandle } from "../../utils/editor";
import { IBlockEditor } from "../../types/block";
import { useEffect, useRef, useState } from "react";
import {
  keyAction,
  keyExplicitAction,
  keyLandmark,
} from "../../config/shortcut";
import { BlockNoteView, useCreateBlockNote } from "@blocknote/react";
import { useConditionalAction } from "../../services/actions/actions-hook";
import { insertOrUpdateBlock } from "@blocknote/core";
import { voiceSay } from "../../bindings";
import { toDataURL } from "../../utils/url";
import { announceError } from "../../utils/error";
import { openAsset } from "../../utils/filesystem";
import { prompt, selectSingle } from "../../services/window/window-manager";

interface DocumentRegionProps {
  region: DocumentRegionData;
  onSave?: (region: DocumentRegionData, editor: IBlockEditor) => void;
  onChange?: (region: DocumentRegionData, editor: IBlockEditor) => void;
  onFocus: (region: DocumentRegionData, editor: IBlockEditor) => void;
  onAddLandmark: (
    region: DocumentRegionData,
    landmark: DocumentRegionUserLandmark,
  ) => void;
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
  onAddLandmark = () => {},
  onImplicitAnnounce = () => null,
  onExplicitAnnounce = () => null,
  isFocused = false,
  onFocus,
  onBlur,
  label,
}: DocumentRegionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const editButton = useRef<HTMLButtonElement>(null);

  const [isEditing, setEditing] = useState(false);

  const editor = useCreateBlockNote({
    schema,
    initialContent: region.blocks,
  });

  const regionWithCurrentBlock = (): DocumentRegionData => ({
    ...region,
    blocks: editor.document,
  });

  const autoSave = () => {
    onSave(regionWithCurrentBlock(), editor);
  };

  useEditorAutoSaveHandle(editor, autoSave);

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
    setEditing(true);
  };

  const stopEdit = () => {
    setEditing(false);
  };

  useEffect(() => {
    if (isFocused) {
      focus();
    }
  }, [isFocused, isEditing]);

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
    keyAction("i"),
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
    keyExplicitAction("/"),
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

  useConditionalAction(
    `Add landmark`,
    keyExplicitAction("l"),
    isFocused,
    async () => {
      const label = await prompt("label", "Landmark label");

      if (label === null) {
        announceError();
        return;
      }

      onAddLandmark(region, {
        label,
      });
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

  /**
   * Component renders a visual and a voice assisted (VA) version.
   * - VA:      a button containing x words from the editors content, finetuned for VA users.
   * - Visual:  the complete editor content is shown to visual users or collaborators.
   *
   * In both cases a user needs to confirm edit to change the content.
   * */

  return (
    <section
      data-component-name="DocumentDetail"
      aria-current="page"
      lang="en"
      data-focused={isFocused || undefined}
      ref={ref}
      aria-label={label}
      className="input-hint relative w-full p-4 text-inherit data-[focused]:bg-white data-[focused]:text-black"
    >
      {region.landmark && (
        <span
          aria-hidden="true"
          className="absolute left-2 right-2 top-0 block text-sm opacity-50"
        >
          Landmark: {region.landmark?.label}
        </span>
      )}
      <div aria-hidden={!isEditing ? "true" : undefined}>
        <BlockNoteView
          id={region.id}
          data-editor
          className="mx-auto flex h-full w-full max-w-[46em] outline-none [&_*]:outline-none"
          editor={editor}
          slashMenu={false}
          sideMenu={false}
          formattingToolbar={false}
          hyperlinkToolbar={false}
          editable={isEditing}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              onSave(region, editor);
              stopEdit();
            }
          }}
          onFocus={() => {
            onFocus(region, editor);
            focus();
          }}
          onBlur={() => {
            onBlur(region, editor);
            stopEdit();
          }}
        />
      </div>
      {!isEditing && (
        <button
          ref={editButton}
          className="absolute inset-0 text-left outline-2 outline-white focus:outline-dashed"
          onClick={() => {
            onFocus(region, editor);
            focus();
            startEdit();
          }}
          onFocus={() => {
            onFocus(region, editor);
            focus();
          }}
          onBlur={() => {
            onBlur(region, editor);
            stopEdit();
          }}
          aria-label={getPreviewText() || "Blank"}
        ></button>
      )}
    </section>
  );
}

export default DocumentRegion;
