import { DocumentMetaContent, DocumentReference } from "../types/documents";
import {
  fetchDocumentById,
  fetchDocumentsReferences,
} from "../utils/documents";

export interface RegionContent {}

export type RegionDocumentContent = {
  meta: Partial<DocumentMetaContent>;
  regions: RegionContent[];
};

export type RegionDocument = {
  name: string;
  id: string;
  keywords?: string[];
  content: RegionDocumentContent;
};

export interface DocumentContentsService {
  save: () => void;
  delete: () => void;
  getMeta: () => DocumentMetaContent;
  getContents: () => RegionDocumentContent;
}

export class DocumentService implements DocumentContentsService {
  constructor(public documentReference: DocumentReference) {}

  save = () => {};
  delete = () => {};
  getMeta = () => {
    return null as any;
  };
  getContents = () => {
    return null as any;
  };
}

export class LegacyDocumentService implements DocumentContentsService {
  constructor(public documentReference: DocumentReference) {}

  save = () => {};
  delete = () => {};
  getMeta = () => {
    return null as any;
  };
  getContents = (): RegionDocumentContent => {
    const document = fetchDocumentById(this.documentReference.id);

    return;
  };
}

export function documentServiceFactory(
  documentReference: DocumentReference & { meta: DocumentMetaContent },
): DocumentContentsService {
  if (documentReference.meta.version === undefined) {
    return new LegacyDocumentService(documentReference);
  }

  return new DocumentService(documentReference);
}
