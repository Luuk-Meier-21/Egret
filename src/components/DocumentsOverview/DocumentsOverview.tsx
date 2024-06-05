import { DocumentDirectory } from "../../types/documents";
import Search from "../Search/Search";
import { ReactNode, useRef, useState } from "react";
import { Keyword } from "../../types/keywords";
// import { includeKeywordsInDocuments } from "../../utils/keywords";
import { useRegisterAction } from "../../services/actions/actions-registry";
import { writeText } from "@tauri-apps/api/clipboard";

interface DocumentsOverviewProps {
  // Documents overview could be uses as a document selector, wrapped in a dialog component. Callbacks resolve promise like prompt handles this
  onDocumentClick: (document: DocumentDirectory) => void;
  onDocumentSelection?: (document: DocumentDirectory | null) => void;
  directories: DocumentDirectory[];
  keywords: Keyword[];
  children?: ReactNode | ReactNode[];
}

function DocumentsOverview({
  onDocumentClick,
  onDocumentSelection = () => {},
  directories,
  children,
}: DocumentsOverviewProps) {
  const searchRef = useRef<HTMLInputElement>(null);
  const documentsRef = useRef<HTMLUListElement>(null);

  const [selectedDocument, setSelectedDocument] =
    useState<DocumentDirectory | null>(null);

  const selectDocument = (document: DocumentDirectory | null) => {
    setSelectedDocument(document);
    onDocumentSelection(document);
  };

  useRegisterAction("Copy selected document id", "cmd+c", async () => {
    if (selectedDocument === null) {
      return;
    }

    await writeText(selectedDocument.id);
  });

  const [filteredDocuments, setFilteredDocuments] =
    //@ts-ignore
    useState<DocumentDirectory[]>(directories);

  return (
    <div
      data-component-name="DocumentsOverview"
      aria-live="polite"
      className="relative flex w-full flex-1 flex-col"
    >
      <section id="documents" aria-label="Documents" className="py-5">
        {filteredDocuments.length > 0 ? (
          <ul
            ref={documentsRef}
            role="menu"
            className="flex flex-col divide-y-[1px] divide-white/20"
          >
            {filteredDocuments.map((document) => (
              <li
                role="menuitem"
                aria-relevant="additions removals"
                key={document.id}
              >
                <button
                  onFocus={() => selectDocument(document)}
                  onBlur={() => selectDocument(null)}
                  onClickCapture={() => onDocumentClick(document)}
                  className="bento-focus-light relative my-1 rounded-[1rem] px-3 py-1.5 outline-white"
                >
                  {document.name}
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p
            aria-relevant="additions text"
            role="alert"
            className="my-1 px-3 py-1.5 text-white/50"
          >
            No documents found for search query...
          </p>
        )}
      </section>
      {children}
      <div className="mt-auto">
        <Search
          ref={searchRef}
          label="Search document"
          list={directories}
          keys={["name", "keywords.label"]}
          onConfirm={() => {
            documentsRef.current?.querySelector("button")?.focus();
          }}
          onResult={(searchResults) => {
            setFilteredDocuments(searchResults);
          }}
        />
      </div>
    </div>
  );
}
export default DocumentsOverview;
