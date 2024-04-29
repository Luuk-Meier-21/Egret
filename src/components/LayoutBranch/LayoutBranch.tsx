import { ReactNode } from "react";
import {
  LayoutBranchData,
  LayoutCommon,
  LayoutNodeData,
  LayoutTreeTrunk,
} from "../../types/layout/layout";

interface LayoutBranchProps<T extends LayoutCommon = LayoutTreeTrunk> {
  value: T;
  level?: "row" | "column" | "unknown";
  index?: number;
  renderNode: (data: LayoutNodeData, index: number) => ReactNode;
}

export function LayoutBranchOrNode({
  value,
  level = "row",
  index = -1,
  renderNode = () => null,
}: LayoutBranchProps) {
  if (value.type === "branch") {
    return (
      <LayoutBranch
        index={index}
        level={level}
        renderNode={renderNode}
        value={value}
      />
    );
  } else {
    return (
      <LayoutNode
        index={index}
        level={level}
        renderNode={renderNode}
        value={value}
      />
    );
  }
}

function LayoutBranch({
  value,
  level,
  renderNode,
}: LayoutBranchProps<LayoutBranchData<LayoutTreeTrunk>>) {
  return (
    <ul
      aria-label={`${value.flow}`}
      id={value.id}
      data-layout-level={level}
      data-layout-type="branch"
      data-component-name="LayoutBranch"
      data-flow={value.flow}
      className="group flex w-full flex-row"
    >
      {value.children.map((value, index) => (
        <li key={index} className="flex group-data-[flow='horizontal']:w-full">
          <LayoutBranchOrNode
            renderNode={renderNode}
            index={index}
            level="column"
            key={value.id}
            value={value}
          />
        </li>
      ))}
    </ul>
  );
}

function LayoutNode({
  value,
  level,
  renderNode,
  index,
}: LayoutBranchProps<LayoutNodeData>) {
  return (
    <section
      data-component-name="LayoutNode"
      id={value.id}
      data-layout-level={level}
      data-layout-type="node"
      className="flex w-full ring-1 ring-white/30"
    >
      {renderNode(value, index || -1)}
    </section>
  );
}

export default LayoutBranch;
