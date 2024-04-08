import { ReactNode, useContext } from "react";
import { DocumentRegionData } from "../../types/document-service";
import {
  LayoutBranchData,
  LayoutCommon,
  LayoutNodeData,
  LayoutTreeTrunk,
} from "../../types/layout-service";
import { PromptContext } from "../Prompt/PromptProvider";

interface LayoutBranchProps<T extends LayoutCommon = LayoutTreeTrunk> {
  value: T;
  renderRegion: (region: DocumentRegionData) => ReactNode;
}

export function LayoutBranchOrNode({
  value,
  renderRegion = () => null,
}: LayoutBranchProps) {
  if (value.type === "branch") {
    return <LayoutBranch renderRegion={renderRegion} value={value} />;
  } else {
    return <LayoutNode renderRegion={renderRegion} value={value} />;
  }
}

function LayoutBranch({
  value,
  renderRegion,
}: LayoutBranchProps<LayoutBranchData<LayoutTreeTrunk>>) {
  return (
    <ul
      aria-label={`${value.flow}`}
      data-component-name="LayoutBranch"
      data-flow={value.flow}
      className="flex w-full flex-col data-[flow='horizontal']:flex-row"
    >
      {value.children.map((value) => (
        <LayoutBranchOrNode
          renderRegion={renderRegion}
          key={value.id}
          value={value}
        />
      ))}
    </ul>
  );
}

function LayoutNode({
  value,
  renderRegion,
}: LayoutBranchProps<LayoutNodeData>) {
  const {} = useContext(PromptContext);

  return (
    <article
      data-component-name="LayoutNode"
      className="flex w-full ring-1 ring-white"
    >
      {value.data ? (
        renderRegion(value.data)
      ) : (
        <button
          className="p-4"
          onClick={async () => {
            console.error(
              "Adding new data not implemented yet, node:",
              value.id,
            );
          }}
        >
          Blank
        </button>
      )}
    </article>
  );
}

export default LayoutBranch;
