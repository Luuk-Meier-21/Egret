import { insertOrUpdateBlock } from "@blocknote/core";
import { createReactBlockSpec } from "@blocknote/react";
import { RiAlertFill } from "react-icons/ri";
import { schema } from "./schema";
import { useEffect, useRef } from "react";

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
      //@ts-ignore
      const labelText = props.block.content?.[0]?.text || null;
      const label = labelText ? `Title, ${labelText}` : undefined;

      const ref = useRef<HTMLHeadingElement>(null);

      useEffect(() => {
        props.contentRef(ref.current);

        const content = ref.current?.querySelector("* > div");
        content?.setAttribute("aria-label", "heading");
      }, []);

      return (
        <h2
          role="heading"
          // aria-roledescription="Test"
          // aria-level={1}
          className="flex text-xl font-bold"
          ref={ref}
        />
      );
    },
  },
);
