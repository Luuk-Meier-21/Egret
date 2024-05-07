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
    <div data-component-name="DocumentsOverview" aria-live="polite">
      <section
        id="documents"
        aria-label="Documents"
        className="p-4 ring-1 ring-white"
      >
        {filteredDocuments.length > 0 ? (
          <ul ref={documentsRef} role="menu">
            {filteredDocuments.map((document) => (
              <li
                role="menuitem"
                aria-relevant="additions removals"
                key={document.id}
                className="underline"
              >
                <button
                  onFocus={() => selectDocument(document)}
                  onBlur={() => selectDocument(null)}
                  onClickCapture={() => onDocumentClick(document)}
                  className="underline"
                >
                  {document.name}
                  {/* {document.keywords.length > 0 && (
                    <span>
                      , Keywords:{" "}
                      {document.keywords
                        .map((keywords) => keywords.label)
                        .join(", ")}
                    </span>
                  )} */}
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p aria-relevant="additions text" role="alert">
            No documents found
          </p>
        )}
      </section>
      {children}
      <Search
        label="Search document"
        list={directories}
        keys={["name", "keywords.label"]}
        onConfirm={() => {
          documentsRef.current?.querySelector("button")?.focus();
        }}
        onResult={(searchResults) => {
          // Currently all documents go tru search, this might not be the best idea
          //@ts-ignore
          setFilteredDocuments(searchResults);
        }}
      />
    </div>
  );
}
export default DocumentsOverview;
