import { insertOrUpdateBlock } from "@blocknote/core";
import { createReactBlockSpec } from "@blocknote/react";
import { RiAlertFill } from "react-icons/ri";
import { schema } from "./schema";

export const insertLink = (editor: typeof schema.BlockNoteEditor) => ({
  title: "Link",
  onItemClick: () => {
    insertOrUpdateBlock(editor, {
      type: "url",
    });
  },
  aliases: ["link", "anchor", "url"],
  group: "Hypertext",
  icon: <RiAlertFill />,
});

export const Link = createReactBlockSpec(
  {
    type: "url",
    propSchema: {
      url: {
        default: "/",
      },
    },
    content: "inline",
  },
  {
    render: (props) => {
      return (
        <a
          onFocus={() => {
            console.log("hi");
          }}
          href={props.block.props.url}
          className="inline-block w-full text-red-500 underline"
          ref={props.contentRef}
        />
      );
    },
  },
);
