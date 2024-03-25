import { insertOrUpdateBlock } from "@blocknote/core";
import { createReactBlockSpec } from "@blocknote/react";
import { schema } from "../../blocks/schema";
import { ReactNode } from "react";
import { BlockComponentProps } from "../../types/block";

export const insertRow = (editor: typeof schema.BlockNoteEditor) => ({
  title: "TemplateName",
  onItemClick: () => {
    insertOrUpdateBlock(editor, {
      // @ts-ignore
      type: "template-name",
    });
  },
  aliases: ["TemplateName"],
  group: "Other",
});

const templateNameConfig = {
  type: "template-name",
  propSchema: {},
  content: "inline",
} as const;

function rowComponent({
  contentRef,
}: BlockComponentProps<typeof templateNameConfig, "template-name">): ReactNode {
  return (
    <div data-block="TemplateName">
      <p ref={contentRef} />
    </div>
  );
}

export const TemplateName = createReactBlockSpec(templateNameConfig, {
  render: (props) => rowComponent(props),
});
