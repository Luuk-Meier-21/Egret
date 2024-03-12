import { useLoaderData } from "react-router";
import { Link } from "react-router-dom";
import { DocumentReference } from "../../types/documents";
import { useHotkeyOverride, useHotkeys } from "../../utils/hotkeys";
import { useState } from "react";
import {
  fetchKeywords,
  referenceKeywordToDocument,
} from "../../utils/keywords";

interface DocumentsOverviewProps {}

function DocumentsOverview({}: DocumentsOverviewProps) {
  const [selectedDocument, setSelectedDocument] =
    useState<DocumentReference | null>(null);
  const documentReferences = useLoaderData() as DocumentReference[];

  useHotkeyOverride();
  useHotkeys("cmd+l", () => {
    (async () => {
      if (selectedDocument) {
        const keywords = await fetchKeywords();
        console.log(keywords);
        // referenceKeywordToDocument()
      }
    })();
  });

  return (
    <div data-component-name="DocumentsOverview">
      <ul>
        {documentReferences.map((document) => (
          <li key={document.id} className="underline">
            <Link
              onFocus={() => setSelectedDocument(document)}
              onBlur={() => setSelectedDocument(null)}
              to={`/documents/${document.id}`}
            >
              {document.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
export default DocumentsOverview;
