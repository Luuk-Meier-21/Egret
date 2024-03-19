import { useLoaderData, useNavigate } from "react-router";
import { DocumentReference } from "../../types/documents";
import { Keyword } from "../../types/keywords";
import DocumentsOverview from "./DocumentsOverview";

function AppDocumentsOverview() {
  const [documentReferences, keywords] = useLoaderData() as [
    DocumentReference[],
    Keyword[],
  ];
  const navigate = useNavigate();

  return (
    <DocumentsOverview
      onDocumentClick={(document) => navigate(`/documents/${document.id}`)}
      documentReferences={documentReferences}
      keywords={keywords}
    />
  );
}

export default AppDocumentsOverview;
