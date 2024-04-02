import { BlockNoteView, useCreateBlockNote } from "@blocknote/react";
import { DocumentRegionData } from "../../types/document-service";
import { Keyword } from "../../types/keywords";
import { schema } from "../../blocks/schema";
import { shell } from "@tauri-apps/api";
import { useRegisterAction } from "../../services/actions";
import { toggleBlock } from "../../utils/block";

interface DocumentRegionProps {
  region: DocumentRegionData;
}

function DocumentRegion({ region }: DocumentRegionProps) {
  const editor = useCreateBlockNote({
    schema,
    initialContent: region.blocks,
  });

  // useEditorAutosave(editor, initialDocument);

  useRegisterAction("Selection to title", "cmd+b", () => {
    const selectedBlock = editor.getTextCursorPosition().block;
    toggleBlock(editor, selectedBlock, {
      type: "title",
    });
  });

  useRegisterAction("Open selected url", "cmd+u", () => {
    const url = editor.getSelectedLinkUrl();
    console.log(url);
    if (url === undefined) {
      return;
    }
    shell.open(url);
  });

  return (
    <section
      aria-labelledby="document-title"
      data-component-name="DocumentDetail"
    >
      <h3>{region.label}</h3>
      <BlockNoteView
        aria-label="Document editor"
        className="max-w-[46em] p-4 text-white ring-1 ring-white [&_a]:underline"
        editor={editor}
        autoFocus
        slashMenu={false}
        autoCorrect="false"
        spellCheck="false"
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
