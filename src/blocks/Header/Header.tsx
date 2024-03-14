import { insertOrUpdateBlock } from "@blocknote/core";
import { createReactBlockSpec } from "@blocknote/react";
import { schema } from "../schema";

export const insertHeader = (editor: typeof schema.BlockNoteEditor) => ({
  title: "Header",
  onItemClick: () => {
    insertOrUpdateBlock(editor, {
      type: "header",
    });
  },
  aliases: ["Header"],
  group: "Other",
});

export const Header = createReactBlockSpec(
  {
    type: "header",
    propSchema: {},
    content: "inline",
  },
  {
    render: (props) => {
      return (
        <div data-block="Header" className="flex w-full flex-row">
          <p ref={props.contentRef} />
          <p ref={props.contentRef} />
          <p ref={props.contentRef} />
        </div>
      );
    },
  },
);
