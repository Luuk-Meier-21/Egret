import { DocumentRegionData } from '../../types/document/document';
import { emit } from '@tauri-apps/api/event';

export type GlobalEvent = [string, Record<string, any>];

export const emitEvent = (event: [string, Record<string, any>]) =>
	emit(...event);

export const eventFactory = <ET extends string, PT>(
	event: ET,
	props: PT,
): [ET, PT] => [event, props];
// Document

export enum DocumentEvent {
	CLOSE = 'document-close',
	OPEN = 'document-open',
}

export type DocumentEventPayload = {
	documentId: string;
};

export function emitDocumentEvent(
	event: DocumentEvent,
	documentId: DocumentEventPayload['documentId'],
): GlobalEvent {
	return [event, { documentId }] as const;
}

// Region
export enum RegionEvent {
	IN_EDIT = 'region-in-edit',
}

export type RegionEventPayload = {
	region: DocumentRegionData;
};

export const regionInEditEvent = (region: DocumentRegionData) =>
	eventFactory<RegionEvent, RegionEventPayload>(RegionEvent.IN_EDIT, {
		region,
	});
