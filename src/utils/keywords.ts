import { exists, readTextFile, writeTextFile } from "@tauri-apps/api/fs";
import { Keyword } from "../classes/keyword";
import { v4 as uuidv4 } from "uuid";
import { KEYWORD_FILE } from "../config/files";
import { slugify } from "./url";
import { Document, DocumentReference } from "../types/documents";

export function createKeyword(label: string): Keyword {
  return {
    label,
    id: uuidv4(),
    slug: slugify(label),
    documents: [],
  };
}

export async function fetchKeywords(): Promise<Keyword[]> {
  const hasFile = await exists(KEYWORD_FILE.filename, {
    dir: KEYWORD_FILE.source,
  });

  if (!hasFile) {
    await writeTextFile(KEYWORD_FILE.filename, JSON.stringify([]), {
      dir: KEYWORD_FILE.source,
    });
  }

  const text = await readTextFile(KEYWORD_FILE.filename, {
    dir: KEYWORD_FILE.source,
  });

  return JSON.parse(text) as Keyword[];
}

export async function saveKeyword(newKeyword: Keyword): Promise<void> {
  const keywords = await fetchKeywords();
  const prevSavedKeyword = keywords.find(
    (keyword) =>
      keyword.id === newKeyword.id || keyword.slug === newKeyword.slug,
  );

  if (prevSavedKeyword) {
    // Copy over documents to previously saved keyword.
    prevSavedKeyword.documents = newKeyword.documents;
  } else {
    keywords.push(newKeyword);
  }

  console.log(keywords);

  await writeTextFile(KEYWORD_FILE.filename, JSON.stringify(keywords), {
    dir: KEYWORD_FILE.source,
  });
}

export async function referenceKeywordToDocument(
  keyword: Keyword,
  document: Document | DocumentReference,
) {
  if (!keyword.documents.includes(keyword.id)) {
    keyword.documents.push(keyword.id);
  }
  //@ts-ignore
  if (!document.keywords.includes(document.id)) {
    //@ts-ignore
    document.keywords.push(keyword.id);
  }

  console.log(keyword, document);
}

export async function dereferenceKeywordFromDocument(
  keyword: Keyword,
  document: Document | DocumentReference,
) {
  if (!keyword.documents.includes(keyword.id)) {
    keyword.documents.push(keyword.id);
  }
  //@ts-ignore
  if (!document.keywords.includes(document.id)) {
    //@ts-ignore
    document.keywords.push(keyword.id);
  }
}
