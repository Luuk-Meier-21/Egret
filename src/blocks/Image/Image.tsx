import { insertOrUpdateBlock } from "@blocknote/core";
import { createReactBlockSpec } from "@blocknote/react";
import { schema } from "../../blocks/schema";
import { ReactNode, useContext, useEffect, useRef, useState } from "react";
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
  const label = "Image alt text";

  const hasSelectedBlock = () =>
    editor.getTextCursorPosition().block.id === block.id;

  const [isEditing, setEditing] = useState(hasSelectedBlock());

  const ref = useRef<HTMLElement>(null);
  const shadowRef = useRef<HTMLElement>(null);

  // @ts-ignore
  const alt = block.content.length > 0 ? block.content[0].text : "/n";

  useEffect(() => {
    // contentRef(ref.current);

    const element = ref.current?.querySelector("* > div");

    // element?.setAttribute("aria-lalde", "Alt test");

    editor.onSelectionChange(() => {
      setEditing(hasSelectedBlock());
    });
  }, []);

  useEffect(() => {}, [isEditing]);

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
      <figcaption className="inline-content flex text-sm">
        <legend
          // aria-label="label"
          // aria-description="description"
          // aria-placeholder="placeholder"
          id="caption"
          className="isolate"
          role="textbox"
          ref={contentRef}
        />
      </figcaption>
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
