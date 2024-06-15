export enum DocumentEvent {
  CLOSE = "document-close",
  OPEN = "document-open",
}

export type DocumentEventPayload = {
  documentId: string;
};

export function emitDocumentEvent(
  event: DocumentEvent,
  documentId: DocumentEventPayload["documentId"],
) {
  return [event, { documentId }] as const;
}
