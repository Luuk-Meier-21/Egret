import { useLoaderData } from "react-router";
import { Link } from "react-router-dom";
import { DocumentReference } from "../../types/documents";
import Search from "../Search/Search";
import { useRef, useState } from "react";
import { useHotkeys } from "../../utils/hotkeys";
import { action, useRegisterAction } from "../../services/actions";

interface DocumentsOverviewProps {}

function DocumentsOverview({}: DocumentsOverviewProps) {
  const documentsRef = useRef<HTMLUListElement>(null);
  const documentReferences = useLoaderData() as DocumentReference[];
  const [filteredDocuments, setFilteredDocuments] =
    useState(documentReferences);

  useRegisterAction(
    action("Test", "cmd+3", () => {
      console.log("Action called from registry");
    }),
  );

  return (
    <div data-component-name="DocumentsOverview">
      <Search
        list={documentReferences}
        keys={["name"]}
        onConfirm={() => {
          documentsRef.current?.querySelector("a")?.focus();
        }}
        onResult={(searchResults) => {
          // Currently all documents go tru search, this might not be the best idea
          setFilteredDocuments(searchResults);
        }}
      />
      <section aria-live="polite" className="ring-1 ring-black">
        {filteredDocuments.length > 0 ? (
          <ul ref={documentsRef}>
            {filteredDocuments.map((document) => (
              <li
                aria-relevant="additions removals"
                key={document.id}
                className="underline"
              >
                <Link
                  // onFocus={() => setSelectedDocument(document)}
                  // onBlur={() => setSelectedDocument(null)}
                  to={`/documents/${document.id}`}
                >
                  {document.name}
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p aria-relevant="additions text" role="alert">
            No documents found
          </p>
        )}
      </section>
    </div>
  );
}
export default DocumentsOverview;
