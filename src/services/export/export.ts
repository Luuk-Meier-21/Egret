import clsx from "clsx";
import { promiseWindow } from "../window/window-manager";
import { exportToSvg } from "./export-svg";

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
      visible: false,
    },
    "export",
  );
}
