import { BlockNoteView, useCreateBlockNote } from "@blocknote/react";
import {
  ContentDocumentRegionData,
  DocumentRegionData,
  TextDocumentRegionData,
} from "../../types/document-service";
import { schema } from "../../blocks/schema";
import { shell } from "@tauri-apps/api";
import {
  useRegisterAction,
  useRegisterEditorAction,
} from "../../services/actions";
import { toggleBlock } from "../../utils/block";
import { useEditorOnSave } from "../../utils/editor";
import { IBlockEditor } from "../../types/block";

interface DocumentRegionProps<
  T extends
    | TextDocumentRegionData
    | ContentDocumentRegionData = DocumentRegionData,
> {
  region: T;
  onSave: (region: TextDocumentRegionData, editor: IBlockEditor) => void;
  onChange: (region: TextDocumentRegionData, editor: IBlockEditor) => void;
}

function RecursiveDocumentRegion({
  region,
  onSave,
  onChange,
}: DocumentRegionProps) {
  if (false) {
    // if (region.contentType === "inline") {
    // return (
    //   <InlineDocumentRegion
    //     region={region}
    //     onChange={onChange}
    //     onSave={onSave}
    //   />
    // );
  } else {
    return (
      <TextDocumentRegion region={region} onChange={onChange} onSave={onSave} />
    );
  }
}

function InlineDocumentRegion({
  region,
  onSave,
  onChange,
}: DocumentRegionProps<ContentDocumentRegionData>) {
  return (
    <article className="p-4 ring-1 ring-white">
      <h3>{region.label}</h3>
      <ul>
        {region.content.map((region) => (
          <li>
            <RecursiveDocumentRegion
              region={region}
              onChange={onChange}
              onSave={onSave}
            />
          </li>
        ))}
      </ul>
    </article>
  );
}

function TextDocumentRegion({
  region,
  onSave,
  onChange,
}: DocumentRegionProps<TextDocumentRegionData>) {
  const editor = useCreateBlockNote({
    schema,
    initialContent: region.blocks,
  });

  const regionWithCurrentBlock = (): TextDocumentRegionData => ({
    ...region,
    blocks: editor.document,
  });

  useEditorOnSave(editor, () => {
    onSave(regionWithCurrentBlock(), editor);
  });

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
      aria-label={`Region: `}
      data-component-name="DocumentDetail"
      className="w-full p-4 text-white focus-within:bg-white focus-within:text-black"
    >
      <h3>{region.label}</h3>
      <BlockNoteView
        aria-label="Document editor"
        className="w-full max-w-[46em] [&_a]:underline"
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

export default RecursiveDocumentRegion;
