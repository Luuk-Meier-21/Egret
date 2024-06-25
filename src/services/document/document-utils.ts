import { validate } from 'uuid';
import { documentsPath } from '../store/store';
import { createAbstractStore } from '../store/store-hooks';
import { parseFileToDocumentDirectory } from './document-generator';

export const getDocumentDirectories = async () => {
	const store = createAbstractStore();
	return await store.searchDirectory(
		documentsPath(),
		parseFileToDocumentDirectory,
	);
};

export const getDocumentDirectoryOfId = async (id: string) => {
	const store = createAbstractStore();

	if (!validate(id)) {
		return null;
	}

	const dirs = await store.searchDirectory(
		documentsPath(),
		parseFileToDocumentDirectory,
	);

	return dirs.find((dir) => dir.id === id) || null;
};
