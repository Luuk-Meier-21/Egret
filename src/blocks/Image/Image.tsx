import { insertOrUpdateBlock } from "@blocknote/core";
import { createReactBlockSpec } from "@blocknote/react";
import { schema } from "../../blocks/schema";
import { ReactNode, useContext } from "react";
import { BlockComponentProps, IBlockEditor } from "../../types/block";
import { DialogContext } from "../../components/Dialog/DialogProvider";

// const updateAltAsync = async (
//   src: string,
//   editor: IBlockEditor,
//   block: any,
// ) => {
//   try {
//     const { prompt } = useContext(DialogContext);

//     const alt = await prompt("Image alt text");

//     if (alt === null) {
//       // editor.remove(editor.getTextCursorPosition().block, {});
//       return;
//     }

//     // editor.updateBlock(editor.getTextCursorPosition().block, {
//     //   type: "image",
//     //   props: {
//     //     src,
//     //     alt,
//     //   },
//     // });
//   } catch (error) {
//     console.log("unable to parse image");
//     return;
//   }
// };

export const insertRow = (editor: typeof schema.BlockNoteEditor) => ({
  title: "Image",
  onItemClick: () => {
    insertOrUpdateBlock(editor, {
      // @ts-ignore
      type: "image",
    });
  },
  aliases: ["Image"],
  group: "Other",
});

const imageConfig = {
  type: "image",
  propSchema: {
    src: {
      default: "",
    },
    alt: {
      default: "",
    },
  },
  content: "inline",
} as const;

function rowComponent({
  block,
  contentRef,
  editor,
}: BlockComponentProps<typeof imageConfig, "image">): ReactNode {
  const alt = block.props.alt;
  const src = block.props.src;

  return (
    <figure data-block="Image" className="w-full max-w-[600px]">
      <img
        className="object-cover"
        src={block.props.src}
        alt={block.props.alt}
      />
      <figcaption className=" font- text-sm" ref={contentRef} />
    </figure>
  );
}

export const Image = createReactBlockSpec(imageConfig, {
  render: (props) => rowComponent(props),
  parse: (element) => {
    const imgElement =
      element.tagName === "img" ? (element as HTMLImageElement) : null;

    if (imgElement && imgElement.src && imgElement.alt) {
      return {
        src: imgElement.src,
        alt: imgElement.alt,
      };
    }

    return;
  },
});
