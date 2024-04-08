import { ReactNode } from "react";
import {
  LayoutBranchData,
  LayoutCommon,
  LayoutNodeData,
  LayoutTreeTrunk,
} from "../../types/layout-service";

interface LayoutBranchProps<T extends LayoutCommon = LayoutTreeTrunk> {
  value: T;
  level?: "row" | "column" | "unknown";
  renderNode: (data: LayoutNodeData) => ReactNode;
}

export function LayoutBranchOrNode({
  value,
  level = "row",
  renderNode = () => null,
}: LayoutBranchProps) {
  if (value.type === "branch") {
    return <LayoutBranch level={level} renderNode={renderNode} value={value} />;
  } else {
    return <LayoutNode level={level} renderNode={renderNode} value={value} />;
  }
}

function LayoutBranch({
  value,
  level,
  renderNode,
}: LayoutBranchProps<LayoutBranchData<LayoutTreeTrunk>>) {
  return (
    <div
      aria-label={`${value.flow}`}
      id={value.id}
      data-layout-level={level}
      data-layout-type="branch"
      data-component-name="LayoutBranch"
      data-flow={value.flow}
      className="flex flex-col"
    >
      list horizontal {value.children.length} items
      <ul className="flex w-full flex-row">
        {value.children.map((value) => (
          <li className="flex w-full">
            <LayoutBranchOrNode
              renderNode={renderNode}
              level="column"
              key={value.id}
              value={value}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

function LayoutNode({
  value,
  level,
  renderNode,
}: LayoutBranchProps<LayoutNodeData>) {
  return (
    <section
      data-component-name="LayoutNode"
      id={value.id}
      data-layout-level={level}
      data-layout-type="node"
      className="flex w-full ring-1 ring-white"
    >
      {renderNode(value)}
    </section>
  );
}

export default LayoutBranch;
