import { readTextFile, writeTextFile } from "@tauri-apps/api/fs";
import { v4 as uuidv4 } from "uuid";
import { KEYWORD_FILE } from "../config/files";
import { slugify } from "./url";
import { requireDir, requireFile } from "./filesystem";
import { Keyword } from "../types/keywords";
import { Document, DocumentReference } from "../types/documents";

export function parseKeyword(
  label: string,
  slug: string,
  id: string,
  documentRelations?: string[],
): Keyword {
  return {
    label,
    slug,
    id,
    documentRelations: documentRelations ?? [],
  };
}

export function createKeyword(label: string): Keyword {
  return parseKeyword(label, slugify(label), uuidv4());
}

export async function fetchKeywords(): Promise<Keyword[]> {
  await requireFile(KEYWORD_FILE.filename, [], {
    dir: KEYWORD_FILE.source,
  });

  const text = await readTextFile(KEYWORD_FILE.filename, {
    dir: KEYWORD_FILE.source,
  });

  return JSON.parse(text) as Keyword[];
}

export async function saveKeyword(keywordToSave: Keyword): Promise<void> {
  const keywords = await fetchKeywords();
  const keywordIndex = keywords.findIndex(
    (keyword) =>
      keyword.id === keywordToSave.id || keyword.slug === keywordToSave.slug,
  );

  if (keywordIndex < 0) {
    // Not saved
    keywords.push(keywordToSave);
  } else {
    // Saved, copy over relations
    const prevSavedKeyword = keywords[keywordIndex];

    prevSavedKeyword.documentRelations = keywordToSave.documentRelations;
    keywords[keywordIndex] = prevSavedKeyword;
  }

  await writeTextFile(KEYWORD_FILE.filename, JSON.stringify(keywords), {
    dir: KEYWORD_FILE.source,
  });
}

export async function referenceKeywordToDocument(
  keyword: Keyword,
  document: Document | DocumentReference,
) {
  const hasRelation = keyword.documentRelations.find(
    (relation) => relation === document.id,
  );

  if (!hasRelation) {
    keyword.documentRelations.push(document.id);
  } else {
    console.info(
      `Document: (${document.name}) already has a relation to keyword: (${keyword.label})`,
    );
  }

  saveKeyword(keyword);
}

export async function dereferenceKeywordFromDocument(
  keyword: Keyword,
  document: Document | DocumentReference,
) {
  const hasRelation = keyword.documentRelations.find(
    (relation) => relation === document.id,
  );

  if (hasRelation) {
    keyword.documentRelations = keyword.documentRelations.filter(
      (relation) => relation !== document.id,
    );
  } else {
    console.info(
      `Document: (${document.name}) does not have a to keyword: (${keyword.label})`,
    );
  }

  saveKeyword(keyword);
}
