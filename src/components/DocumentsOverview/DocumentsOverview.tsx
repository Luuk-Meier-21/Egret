import { useLoaderData } from "react-router";
import { Link } from "react-router-dom";
import { DocumentReference } from "../../types/documents";

interface DocumentsOverviewProps {}

function DocumentsOverview({}: DocumentsOverviewProps) {
  const documentReferences = useLoaderData() as DocumentReference[];

  return (
    <div data-component-name="DocumentsOverview">
      <ul>
        {documentReferences.map((document) => (
          <li key={document.id} className="underline">
            <Link to={`/documents/${document.id}`}>{document.name}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
export default DocumentsOverview;
