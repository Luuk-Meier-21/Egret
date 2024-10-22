import {
	FileEntry,
	FsOptions,
	readDir,
	writeTextFile,
} from '@tauri-apps/api/fs';
import { Store, decodeJSON, encodeJSON } from './store';
import { DOCUMENTS } from '../../config/files';
import { requireDir } from '../../utils/filesystem';

export function useStateStore<T>(
	state: T,
	path: string,
	options: FsOptions = {
		dir: DOCUMENTS.source,
	},
): () => Promise<void> {
	//@ts-ignore
	const store: Store<T> = new Store(
		state,
		path,
		encodeJSON,
		decodeJSON,
	).setOptions(options);

	const forceSave = async () => {
		await requireDir(DOCUMENTS.path, {
			dir: DOCUMENTS.source,
		});

		await writeTextFile(path, encodeJSON(state), options);
		// return store
		//   .set(state)
		//   .save()
		//   .then(() => {
		//     // console.info("💾 ~ store saved to: ", path);
		//   });
	};

	return forceSave;
}

export function createAbstractStore() {
	const createStore = <T>(
		value: T,
		path: string,
		options: FsOptions = {
			dir: DOCUMENTS.source,
		},
	): Store<T> => {
		return new Store(value, path, encodeJSON, decodeJSON).setOptions(options);
	};

	const loadStore = <T>(
		path: string,
		fallbackContent: T,
		options: FsOptions = {
			dir: DOCUMENTS.source,
		},
	): Promise<Store<T>> => {
		return Store.load<T>(
			path,
			options,
			encodeJSON,
			decodeJSON,
			fallbackContent as Record<string, any>,
		);
	};

	const searchDirectory = async <T>(
		path: string,
		transform: (file: FileEntry) => T | null,
		options: FsOptions = {
			dir: DOCUMENTS.source,
		},
	): Promise<T[]> => {
		await requireDir(path, options);

		const entries = await readDir(path, options);

		return entries.map(transform).filter((value) => value !== null) as T[];
	};

	const createDirectory = async <T>(
		path: string,
		transform: (file: FileEntry) => T | null,
		options: FsOptions = {
			dir: DOCUMENTS.source,
		},
	) => {
		await requireDir(path, options);

		const segments = path.split('/');
		const filename = segments.pop();

		const entries = await readDir(segments.join('/'), options);
		const directory = entries.find((file) => file.name === filename);

		if (directory === undefined) {
			return Promise.reject();
		}

		const data = transform(directory);

		if (data === null) {
			return Promise.reject();
		}

		return data;
	};

	return {
		createStore,
		loadStore,
		searchDirectory,
		createDirectory,
	} as const;
}

export const useAbstractStore = createAbstractStore;

export type AbstractStore = ReturnType<typeof useAbstractStore>;
