import { FsOptions } from "@tauri-apps/api/fs";
import { STORE } from "./files";

export const keywordsRecordPath = `${STORE.path}/keywords.json`;
export const keywordsRecordOptions: FsOptions = {
  dir: STORE.source,
};
