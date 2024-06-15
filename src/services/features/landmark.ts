import { keyExplicitAction } from "../../config/shortcut";
import { Layout } from "../../types/layout/layout";
import { announceError } from "../../utils/error";
import { useConditionalScopedAction } from "../actions/actions-hook";
import { flattenLayoutNodesByReference } from "../layout/layout-content";
import { useLayoutState } from "../layout/layout-state";
import { selectSingle } from "../window/window-manager";
import { useFeature } from "./features";

export default function useFindLandmarkFeatures(
  env: Record<string, any>,
  layout: Layout,
  selection: ReturnType<typeof useLayoutState>,
) {
  const hasFeature = useFeature(env, "landmark");

  useConditionalScopedAction(
    `Find landmark`,
    keyExplicitAction("l"),
    hasFeature,
    async () => {
      const options = flattenLayoutNodesByReference(layout.tree)
        .filter((value) => value.data?.landmark !== undefined)
        .map((value) => ({
          value: value.id,
          label: value.data?.landmark?.label || "",
        }));

      if (options.length <= 0) {
        announceError();
        return;
      }

      const nodeId = await selectSingle("label", "Landmark label", options);
      selection.setNodeId(nodeId);
    },
  );
}
