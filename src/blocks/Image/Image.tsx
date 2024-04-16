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
  const src = block.props.src;
  // @ts-ignore
  const alt = block.content.length > 0 ? block.content[0].text : "/n";

  return (
    <figure
      data-block="Image"
      className="inline-content inline-block w-full max-w-[600px]"
    >
      <img
        contentEditable={false}
        className="object-cover"
        src={src}
        alt={alt}
      />
      <p aria-label="alt" className="inline-content text-sm" ref={contentRef} />
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
