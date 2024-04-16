import { readTextFile, writeTextFile } from "@tauri-apps/api/fs";
import { v4 as uuidv4 } from "uuid";
import { KEYWORD_FILE } from "../config/files";
import { slugify } from "./url";
import { requireFile } from "./filesystem";
import { Keyword } from "../types/keywords";
import {
  Document,
  DocumentDirectory,
  DocumentReference,
} from "../types/documents";
import { DocumentData } from "../types/document/document";

export function keywordHasRelation(
  keyword: Keyword,
  document: DocumentData | DocumentDirectory,
): boolean {
  return !!keyword.documentRelations.find(
    (relation) => relation === document.id,
  );
}

export async function referenceKeywordToDocument(
  keyword: Keyword,
  document: DocumentData | DocumentDirectory,
) {
  const hasRelation = keywordHasRelation(keyword, document);

  if (!hasRelation) {
    keyword.documentRelations.push(document.id);
  } else {
    console.info(
      `Document: (${document.name}) already has a relation to keyword: (${keyword.label})`,
    );
  }

  await keyword;
}

export async function dereferenceKeywordFromDocument(
  keyword: Keyword,
  document: Document | DocumentReference,
) {
  const hasRelation = keywordHasRelation(keyword, document);

  if (hasRelation) {
    keyword.documentRelations = keyword.documentRelations.filter(
      (relation) => relation !== document.id,
    );
  } else {
    console.info(
      `Document: (${document.name}) does not have a to keyword: (${keyword.label})`,
    );
  }

  await keyword;
}

export function includeKeywordsInDocument<
  DT extends DocumentReference | Document,
>(document: DT, keywords: Keyword[]): DT & { keywords: Keyword[] } {
  const documentWithKeywords = { ...document, keywords: [] } as DT & {
    keywords: Keyword[];
  };

  keywords.forEach((keyword) => {
    const hasRelation = keywordHasRelation(keyword, document);
    if (hasRelation) {
      documentWithKeywords.keywords.push(keyword);
    }
  });

  return documentWithKeywords;
}

export function includeKeywordsInDocuments<
  DT extends DocumentReference | Document,
>(documents: DT[], keywords: Keyword[]): (DT & { keywords: Keyword[] })[] {
  return documents.map((document) =>
    includeKeywordsInDocument(document, keywords),
  );
}
