import { generateDocumentMeta } from "../services/document/document-generator";
import { DocumentMeta } from "../types/document/document";

export function generateBlankDocumentMeta(
  name: string,
  _withOnboarding: boolean = true,
): DocumentMeta {
  return generateDocumentMeta({
    name,
  });
}
