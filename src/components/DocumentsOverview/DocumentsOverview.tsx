import { useLoaderData } from "react-router";
import { Link } from "react-router-dom";
import {
  DocumentReference,
  DocumentReferenceWithKeywords,
} from "../../types/documents";
import Search from "../Search/Search";
import { useEffect, useRef, useState } from "react";
import { Keyword } from "../../types/keywords";
import {
  includeKeywordsInDocument,
  includeKeywordsInDocuments,
} from "../../utils/keywords";

interface DocumentsOverviewProps {}

function DocumentsOverview({}: DocumentsOverviewProps) {
  const documentsRef = useRef<HTMLUListElement>(null);
  const [documentReferences, keywords] = useLoaderData() as [
    DocumentReference[],
    Keyword[],
  ];

  const [filteredDocuments, setFilteredDocuments] = useState<
    DocumentReferenceWithKeywords[]
  >(includeKeywordsInDocuments(documentReferences, keywords));

  return (
    <div data-component-name="DocumentsOverview">
      <Search
        list={includeKeywordsInDocuments(documentReferences, keywords)}
        keys={["name", "keywords.label"]}
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
                  {document.keywords.length > 0 && (
                    <span>
                      , Keywords:{" "}
                      {document.keywords
                        .map((keywords) => keywords.label)
                        .join(", ")}
                    </span>
                  )}
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
