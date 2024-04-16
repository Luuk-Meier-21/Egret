import { insertOrUpdateBlock } from "@blocknote/core";
import { createReactBlockSpec } from "@blocknote/react";
import { schema } from "../../blocks/schema";
import { ReactNode } from "react";
import { BlockComponentProps } from "../../types/block";

export const insertRow = (editor: typeof schema.BlockNoteEditor) => ({
  title: "DummyText",
  onItemClick: () => {
    insertOrUpdateBlock(editor, {
      // @ts-ignore
      type: "dummy-text",
    });
  },
  aliases: ["DummyText"],
  group: "Other",
});

const dummyTextConfig = {
  type: "dummy-text",
  propSchema: {},
  content: "inline",
} as const;

function rowComponent({
  contentRef,
}: BlockComponentProps<typeof dummyTextConfig, "dummy-text">): ReactNode {
  return (
    <div data-block="DummyText">
      <p ref={contentRef} />
    </div>
  );
}

export const DummyText = createReactBlockSpec(dummyTextConfig, {
  render: (props) => rowComponent(props),
});
