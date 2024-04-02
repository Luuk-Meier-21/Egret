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
  dereferenceKeywordFromDocument,
  fetchKeywords,
  keywordHasRelation,
  referenceKeywordToDocument,
  saveKeyword,
} from "../../utils/keywords";
import { useRef, useState } from "react";
import { Keyword } from "../../types/keywords";
import { handleError } from "../../utils/announce";
import { useTitle } from "../../utils/title";
import {
  DocumentContent,
  DocumentData,
  DocumentViewData,
} from "../../types/document-service";
import {
  generateDocumentRegion,
  generateDocumentView,
} from "../../services/document/document-parser";
import DocumentRegion from "../DocumentRegion/DocumentRegion";

interface DocumentDetailProps {}

function DocumentDetail({}: DocumentDetailProps) {
  const editRef = useRef<HTMLElement>(null);

  const [initialDocument, initialKeywords] = useLoaderData() as [
    Document,
    Keyword[],
  ];

  const editor = useCreateBlockNote({
    schema,
    initialContent: initialDocument.content.text,
  });
  console.log(editor);

  useTitle(initialDocument.name);

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
    console.log(url);
    if (url === undefined) {
      return;
    }
    shell.open(url);
  });

  // useRegisterAction("Open selected url", "cmd+y", () => {
  //   const props = editor.getTextCursorPosition().block.props as {
  //     documentId?: string;
  //   };
  //   const id = props.documentId;
  //   if (id === undefined) {
  //     return;
  //   }
  //   // Temp fix for: https://github.com/Luuk-Meier-21/contextual-notes/issues/20
  //   navigate(`/`);
  //   setTimeout(() => {
  //     navigate(`/documents/${id}`);
  //   }, 100);
  // });

  const { elementWithShortcut: EditSettings } = useRegisterAction(
    "Edit Keyword",
    "cmd+k",
    () => {
      editRef.current?.querySelector("button")?.focus();

      if (keywords.length <= 0) {
        handleError("No keywords to edit");
      }

      setOpenSettings(!openSettings);
    },
  );

  useRegisterAction("Delete document", "shift+cmd+backspace", async () => {
    await deleteDocumentById(initialDocument.id);
  });

  // useRegisterAction("Delete document", "cmd+4", async () => {
  //   insertOrUpdateBlock(editor, {
  //     type: "row",
  //   });
  // });

  editor.onSelectionChange((editor) => {
    const { block } = editor.getTextCursorPosition();
    if (block.type === "title") {
      return;
    }
  });

  // Sits in betweed editor and blocknotejs, makes 'freezing blocks' possible
  // const beforeEditorChange = (
  //   event: React.KeyboardEvent<HTMLDivElement>,
  // ): boolean => {
  //   const { block } = editor.getTextCursorPosition();

  //   if (block.type === "title" && event.key === "Backspace") {
  //     handleError(block.type, " is frozen");
  //     event.preventDefault();
  //   }

  //   return false;
  // };

  const views: DocumentViewData[] = [
    generateDocumentView({
      label: "test view",
      content: [
        generateDocumentRegion({
          label: "region a",
        }),
        generateDocumentRegion({
          label: "region b",
        }),
        generateDocumentRegion({
          label: "region c",
        }),
        generateDocumentRegion({
          label: "region d",
        }),
      ],
    }),
  ];

  return (
    <main
      aria-labelledby="document-title"
      data-component-name="DocumentDetail"
      lang={initialDocument.content.meta.lang ?? "en"}
    >
      <h1 id="document-title" className="p-4" aria-live="polite">
        Document: {initialDocument.name}{" "}
        <span aria-hidden>{initialDocument.id}</span>
      </h1>

      <section
        aria-label="Edit document settings"
        ref={editRef}
        className="p-4"
      >
        <EditSettings aria-expanded={openSettings} />
        {openSettings && (
          <ul>
            {keywords.map((keyword) => (
              <li key={keyword.id}>
                <input
                  id={keyword.id}
                  type="checkbox"
                  checked={keywordHasRelation(keyword, initialDocument)}
                  onChange={() => setKeywordRelation(keyword)}
                />
                <label htmlFor={keyword.id}>{keyword.label}</label>
              </li>
            ))}
          </ul>
        )}
      </section>

      <ul>
        <li>
          {views.map((view) => (
            <article>
              <h2>{view.label}</h2>
              {view.content.map((region) => (
                <DocumentRegion region={region} />
              ))}
            </article>
          ))}
        </li>
      </ul>
    </main>
  );
}
export default DocumentDetail;

{
  /* <BlockNoteView
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
      </BlockNoteView> */
}
