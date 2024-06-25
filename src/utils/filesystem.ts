import { DialogFilter, open } from '@tauri-apps/api/dialog';
import {
	FsDirOptions,
	createDir,
	exists,
	writeTextFile,
} from '@tauri-apps/api/fs';
import { convertFileSrc } from '@tauri-apps/api/tauri';

export async function requireDir(path: string, options: FsDirOptions = {}) {
	const hasDir = await exists(path, options);
	if (!hasDir) {
		if (options.recursive == undefined) {
			options.recursive = true;
		}
		await createDir(path, options);
	}
}

export async function requireFile(
	path: string,
	defaultContext: Record<string, any> | Record<string, any>[],
	options: FsDirOptions = {},
) {
	const hasFile = await exists(path, options);
	if (!hasFile) {
		await writeTextFile(path, JSON.stringify(defaultContext), options);
	}
}

export async function openAsset(
	windowLabel: string,
	filters: DialogFilter[],
): Promise<string | null> {
	const targetImage = await open({
		title: windowLabel,
		directory: false,
		multiple: false,
		filters: filters,
	});

	if (targetImage === null) {
		return null;
	}

	const src = `${Array.isArray(targetImage) ? targetImage[0] : targetImage}`;

	return convertFileSrc(src);
}
