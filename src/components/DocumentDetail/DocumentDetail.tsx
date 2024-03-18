import { useLoaderData } from "react-router";
import {
  BlockNoteView,
  SuggestionMenuController,
  getDefaultReactSlashMenuItems,
  useCreateBlockNote,
} from "@blocknote/react";
import { filterSuggestionItems } from "@blocknote/core";
import { insertTitle } from "../../blocks/Title";
import { insertAlert } from "../../blocks/Alert";
import { schema } from "../../blocks/schema";
import { Document } from "../../types/documents";
import { useEditorAutosave } from "../../utils/editor";
import { deleteDocumentById } from "../../utils/documents";
import { useRegisterAction } from "../../services/actions";
import { toggleBlock } from "../../utils/block";
import { shell } from "@tauri-apps/api";
import {
  createKeyword,
  dereferenceKeywordFromDocument,
  fetchKeywords,
  keywordHasRelation,
  referenceKeywordToDocument,
  saveKeyword,
} from "../../utils/keywords";
import { useEffect, useState } from "react";
import { Keyword } from "../../types/keywords";

interface DocumentDetailProps {}

function DocumentDetail({}: DocumentDetailProps) {
  // const navigate = useNavigate();

  const [initialDocument, initialKeywords] = useLoaderData() as [
    Document,
    Keyword[],
  ];
  const editor = useCreateBlockNote({
    schema,
    initialContent: initialDocument.content,
  });

  const [keywords, setKeywords] = useState<Keyword[]>(initialKeywords);
  const [openSettings, setOpenSettings] = useState(false);

  const setKeywordRelation = async (keyword: Keyword) => {
    const hasRelation = keywordHasRelation(keyword, initialDocument);

    hasRelation
      ? await dereferenceKeywordFromDocument(keyword, initialDocument)
      : await referenceKeywordToDocument(keyword, initialDocument);

    await saveKeyword(keyword);

    const keywords = await fetchKeywords();

    setKeywords(keywords);
  };

  useEditorAutosave(editor, initialDocument);

  useRegisterAction("Selection to title", "cmd+b", () => {
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

  const { elementWithShortcut: EditSettings } = useRegisterAction(
    "Edit Keyword",
    "cmd+k",
    () => {
      if (keywords.length <= 0) {
        console.error("No keywords to edit");
      }

      setOpenSettings(!openSettings);
    },
  );

  useRegisterAction("Relate keyword", "cmd+r", async () => {
    console.log("jhi");
  });

  useRegisterAction("Delete document", "shift+cmd+backspace", async () => {
    await deleteDocumentById(initialDocument.id);
  });

  return (
    <div data-component-name="DocumentDetail" role="application">
      <h1 aria-live="polite" role="alert">
        {initialDocument.name}
      </h1>

      <section>
        <EditSettings aria-expanded={openSettings} />
        {openSettings && (
          <ul>
            {keywords.map((keyword) => (
              <li key={keyword.id}>
                <input
                  id={keyword.id}
                  type="checkbox"
                  checked={keywordHasRelation(keyword, initialDocument)}
                  onChange={(event) => setKeywordRelation(keyword)}
                />
                <label htmlFor={keyword.id}>{keyword.label}</label>
              </li>
            ))}
          </ul>
        )}
      </section>

      <BlockNoteView
        className="max-w-[46em] text-black ring-1 ring-black [&_a]:underline"
        editor={editor}
        autoFocus
        slashMenu={false}
        autoCorrect="false"
        spellCheck="false"
        sideMenu={false}
        formattingToolbar={false}
        hyperlinkToolbar={false}
      >
        <SuggestionMenuController
          triggerCharacter="/"
          getItems={async (query) =>
            filterSuggestionItems(
              [
                ...getDefaultReactSlashMenuItems(editor),
                insertTitle(editor),
                insertAlert(editor),
              ],
              query,
            )
          }
        />
      </BlockNoteView>
    </div>
  );
}
export default DocumentDetail;
