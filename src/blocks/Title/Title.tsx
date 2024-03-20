import { insertOrUpdateBlock } from "@blocknote/core";
import { createReactBlockSpec } from "@blocknote/react";
import { RiAlertFill } from "react-icons/ri";
import { schema } from "../schema";

export const insertTitle = (editor: typeof schema.BlockNoteEditor) => ({
  title: "Title",
  onItemClick: () => {
    insertOrUpdateBlock(editor, {
      type: "title",
    });
  },
  aliases: ["title"],
  group: "Other",
  icon: <RiAlertFill />,
});

// The Alert block.
export const Title = createReactBlockSpec(
  {
    type: "title",
    propSchema: {},
    content: "inline",
  },
  {
    render: (props) => {
      return <h2 className="text-xl font-bold" ref={props.contentRef} />;
    },
    parse: (el) => {
      console.log(el);
      return el;
    },
  },
);
