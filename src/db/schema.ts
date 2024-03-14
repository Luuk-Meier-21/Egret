import { relations } from "drizzle-orm";
import {
  blob,
  integer,
  primaryKey,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";

export const keywords = sqliteTable("keywords", {
  id: integer("id").primaryKey().unique(),
  name: text("name"),
  slug: text("slug").unique(),
});

export const keywordsRelations = relations(keywords, ({ many }) => ({
  documents: many(documents),
}));

export const documents = sqliteTable("documents", {
  id: integer("id").primaryKey().unique(),
  name: text("name"),
  // content: blob("content", { mode: "json" }),
});

export const documentsRelations = relations(keywords, ({ many }) => ({
  keywords: many(keywords),
}));

export const keywordsToDocuments = sqliteTable(
  "keywords_to_documents",
  {
    keywordId: integer("keyword_id")
      .notNull()
      .references(() => keywords.id),
    documentId: integer("document_id")
      .notNull()
      .references(() => documents.id),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.keywordId, t.documentId] }),
  }),
);

export const keywordsToDocumentsRelations = relations(
  keywordsToDocuments,
  ({ one }) => ({
    keywords: one(keywords, {
      fields: [keywordsToDocuments.keywordId],
      references: [keywords.id],
    }),
    documents: one(documents, {
      fields: [keywordsToDocuments.documentId],
      references: [documents.id],
    }),
  }),
);
