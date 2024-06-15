import { systemSound } from "../../bindings";
import { keyAction } from "../../config/shortcut";
import { DocumentDirectory } from "../../types/documents";
import { announceError } from "../../utils/error";
import { useConditionalScopedAction } from "../actions/actions-hook";
import { exportDocumentByDirectory } from "../export/export";
import { useFeature } from "./features";

export default function useExportFeatures(
  env: Record<string, any>,
  directory: DocumentDirectory,
) {
  const hasFeature = useFeature(env, "export");

  useConditionalScopedAction(
    "Export document",
    keyAction("e"),
    hasFeature,
    async () => {
      try {
        await exportDocumentByDirectory(directory);

        systemSound("Glass", 1, 1, 1);
      } catch (error) {
        console.error(error);
        announceError();
      }
    },
  );
}
