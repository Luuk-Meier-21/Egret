import { useLoaderData } from "react-router";
import { DocumentDirectory } from "../../types/documents";
import { DocumentMeta } from "../../types/document/document";
import { Layout } from "../../types/layout/layout";
import { Keyword } from "../../types/keywords";

export function useDocumentViewLoader() {
  return useLoaderData() as [
    DocumentDirectory,
    DocumentMeta,
    Layout,
    Keyword[],
  ];
}

export function useDocumentsOverviewLoader() {
  return useLoaderData() as [DocumentDirectory[], Keyword[]];
}
