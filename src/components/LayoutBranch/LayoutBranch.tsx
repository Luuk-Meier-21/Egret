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
  index?: number;
  renderNode: (data: LayoutNodeData, firstInList: boolean) => ReactNode;
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
  index,
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
      className="flex flex-row justify-start"
    >
      {value.children.map((value, index) => (
        <li className="flex">
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
      className="flex ring-1 ring-white"
    >
      {renderNode(value, index === 0)}
    </section>
  );
}

export default LayoutBranch;
