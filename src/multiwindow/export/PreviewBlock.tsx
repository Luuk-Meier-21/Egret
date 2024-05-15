import { BlockNoteView, useCreateBlockNote } from "@blocknote/react";
import { BlockData } from "../../types/document/document";
import { schema } from "../../blocks/schema";
import { ComponentProps } from "react";

interface PreviewBlockProps {
  blocks: BlockData;
  className?: string;
  props?: ComponentProps<"div">;
}

const PreviewBlock = ({ blocks, className, ...props }: PreviewBlockProps) => {
  const editor = useCreateBlockNote({
    schema,
    initialContent: blocks,
  });

  return (
    <div {...props} className={className}>
      <BlockNoteView
        editor={editor}
        slashMenu={false}
        sideMenu={false}
        formattingToolbar={false}
        hyperlinkToolbar={false}
        editable={false}
      />
    </div>
  );
};

export default PreviewBlock;
