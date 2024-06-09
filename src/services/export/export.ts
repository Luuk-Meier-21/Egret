import clsx from "clsx";
import { promiseWindow, selectSingle } from "../window/window-manager";
import { exportToSvg } from "./export-svg";
import { concatPath } from "../store/store";
import { save } from "@tauri-apps/api/dialog";
import { DocumentDirectory } from "../../types/documents";
import { writeTextFile } from "@tauri-apps/api/fs";

export type ExportFormat = keyof typeof exportFormatMapping;
export type ExportSize = keyof typeof exportSizeMapping;
export type ExportStyle = keyof typeof exportStylesMapping;
export type ExportSizeOption = { width: number; height: number };
export type ExportWindowProps = {
  type: "export";
  path: string;
  format: ExportFormat;
  style: ExportStyle;
};

const exportFormatMapping = {
  svg: exportToSvg,
};

const exportSizeMapping = {
  a5: { width: 595, height: 842 },
  desktop: { width: 1440, height: 1080 },
};

const exportStylesMapping = {
  default: clsx(
    "font-serif text-[16px] text-black bg-white data-[layout-type='node']:bg-red-200",
  ),
  wireframe: clsx(
    "font-serif text-[16px] text-black bg-white [&_*[data-layout-type='node']]:ring-black ring-1 ring-transparent data-[layout-type='node']:bg-red-200",
  ),
  apple: clsx(
    "font-sans text-lg tracking-tight text-gray-950",
    "[&_div]:w-full",
    "prose-p:mb-5 prose-p:w-full prose-p:whitespace-pre-wrap prose-p:max-w-[32em]",
    "[&_figcaption]:text-base [&>figcaption]:text-gray-500",
    "[&_*[data-layout-type='node']]:p-5",
    "prose-headings:text-5xl prose-headings:tracking-tight prose-headings:border-b-[2px] prose-headings:border-gray-200 prose-headings:pb-2 prose-headings:font-medium prose-headings:mb-7",
    "prose-a:p-4 prose-a:flex prose-a:text-lg prose-a:mb-3 prose-a:rounded-full prose-a:ring-[3px] prose-a:font-bold prose-a:ring-gray-950 prose-a:justify-center prose-a:min-w-[200px]",
  ),
};

export const getExporter = (format: ExportFormat) =>
  exportFormatMapping[format];
export const getExportSize = (size: ExportSize) => exportSizeMapping[size];
export const getExportStyle = (style: ExportStyle) =>
  exportStylesMapping[style];

export const getAllExportSizeKeys = () => Object.keys(exportSizeMapping);
export const getAllExporterKeys = () => Object.keys(exportFormatMapping);
export const getAllExportStyleKeys = () => Object.keys(exportStylesMapping);

export function exportDocument(
  path: string,
  format: ExportFormat,
  size: ExportSize,
  style: ExportStyle,
): Promise<string> {
  const screen = getExportSize(size);

  return promiseWindow(
    "Export layout",
    {
      type: "export",
      path: path,
      format,
      style,
    },
    {
      minWidth: screen.width || 200,
      minHeight: screen.height || 200,
      // visible: false,
    },
    "export",
  );
}

export async function exportDocumentByDirectory(directory: DocumentDirectory) {
  const format = (await selectSingle(
    "Select format",
    "Export format",
    getAllExporterKeys().map((key) => ({ label: key, value: key })),
  )) as ExportFormat;
  const size = (await selectSingle(
    "Select size",
    "Export size",
    getAllExportSizeKeys().map((key) => ({ label: key, value: key })),
  )) as ExportSize;
  const style = (await selectSingle(
    "Select style preset",
    "Export style",
    getAllExportStyleKeys().map((key) => ({ label: key, value: key })),
  )) as ExportStyle;

  const layoutFilePath = concatPath(directory.filePath, "layout.json");

  const svg = await exportDocument(layoutFilePath, format, size, style);

  const path = await save({
    title: `Save as ${format}`,
    defaultPath: `~/Documents/${directory.name}`,
    filters: [
      {
        name: "Export",
        extensions: [format],
      },
    ],
  });

  if (path === null) {
    return Promise.reject("Path invalid");
  }

  await writeTextFile(path, svg);
}
