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
  length?: number;
  renderNode: (
    data: LayoutNodeData,
    index: number,
    siblingLength: number,
  ) => ReactNode;
}

export function LayoutBranchOrNode({
  value,
  level = "row",
  index = 0,
  length = 1,
  renderNode = () => null,
}: LayoutBranchProps) {
  if (value.type === "branch") {
    return (
      <LayoutBranch
        index={index}
        level={level}
        renderNode={renderNode}
        value={value}
        length={length}
      />
    );
  } else {
    return (
      <LayoutNode
        index={index}
        level={level}
        renderNode={renderNode}
        value={value}
        length={length}
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
      aria-label={`Group ${value.children.length} items`}
      id={value.id}
      data-layout-level={level}
      data-layout-type="branch"
      data-component-name="LayoutBranch"
      data-flow={value.flow}
      className="group flex w-full flex-row"
    >
      {value.children.map((item, index) => (
        <li key={index} className="flex group-data-[flow='horizontal']:w-full">
          <LayoutBranchOrNode
            renderNode={renderNode}
            level="column"
            key={item.id}
            value={item}
            index={index}
            length={value.children.length}
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
  index = 0,
  length = 1,
}: LayoutBranchProps<LayoutNodeData>) {
  return (
    <section
      data-component-name="LayoutNode"
      id={value.id}
      data-layout-level={level}
      data-layout-type="node"
      className="flex w-full ring-1 ring-white/30"
    >
      {renderNode(value, index, length)}
    </section>
  );
}

export default LayoutBranch;
