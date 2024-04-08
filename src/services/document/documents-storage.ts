//@ts-nocheck

import { validate } from "uuid";
import { DocumentReference } from "../../types/documents";
import {
  encodeDocumentContent,
  fetchDocumentById,
  formatDocumentName,
} from "../../utils/documents";
import { parseDocumentContentFromLegacy } from "./document-generator";
import { DOCUMENTS } from "../../config/files";
import { writeTextFile } from "@tauri-apps/api/fs";

export interface DocumentContentsService {
  save: () => void;
  delete: () => void;
  getContent: () => Promise<DocumentContent>;
}

export class DocumentService implements DocumentContentsService {
  constructor(public documentReference: DocumentReference) {}

  static async fromContent(
    documentReference: DocumentReference,
    content: DocumentContent,
  ) {
    if (!validate(documentReference.id)) {
      return Promise.reject(false);
    }

    await writeTextFile(
      `${DOCUMENTS.path}/${formatDocumentName(documentReference.name, documentReference.id)}`,
      DocumentService.encode(content),
      {
        dir: DOCUMENTS.source,
      },
    );

    return new DocumentService(documentReference);
  }

  static encode = (content: DocumentContent): string => {
    return JSON.stringify(content);
  };

  save = () => {};
  delete = () => {};
  getContent: () => Promise<DocumentContent> = () => {
    return null as any;
  };
}

export class LegacyDocumentService {
  tempContent: DocumentContent | null = null;
  constructor(public documentReference: DocumentReference) {}

  getContent = async (): Promise<DocumentContent> => {
    if (this.tempContent) {
      this.tempContent;
    }

    const document = await fetchDocumentById(this.documentReference.id);
    if (document === null) {
      throw Error(`Unable to parse document: (${this.documentReference.name})`);
    }

    this.tempContent = parseDocumentContentFromLegacy(document.content);

    return this.tempContent;
  };
}

export async function documentServiceFactory(
  documentReference: DocumentReference & { meta: DocumentMetaContent },
): Promise<DocumentContentsService> {
  if (documentReference.meta.version === undefined) {
    const legacyService = new LegacyDocumentService(documentReference);
    const documentService = DocumentService.fromContent(
      legacyService.documentReference,
      await legacyService.getContent(),
    );

    return documentService;
  }

  return new DocumentService(documentReference);
}
