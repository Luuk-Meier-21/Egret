import { insertOrUpdateBlock } from "@blocknote/core";
import { createReactBlockSpec } from "@blocknote/react";
import { schema } from "../../blocks/schema";

export const insertTemplateName = (editor: typeof schema.BlockNoteEditor) => ({
  title: "TemplateName",
  onItemClick: () => {
    insertOrUpdateBlock(editor, {
      // @ts-ignore
      type: "template-name",
    });
  },
  aliases: ["templatename"],
  group: "Other",
});

export const TemplateName = createReactBlockSpec(
  {
    type: "template-name",
    propSchema: {},
    content: "inline",
  },
  {
    render: (props) => {
      return (
        <div data-block="TemplateName">
          <p ref={props.contentRef} />
        </div>
      );
    },
  },
);
