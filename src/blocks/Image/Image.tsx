import { insertOrUpdateBlock } from "@blocknote/core";
import { createReactBlockSpec } from "@blocknote/react";
import { schema } from "../../blocks/schema";
import { ReactNode, useEffect, useRef } from "react";
import { BlockComponentProps } from "../../types/block";
import { useBlockSelection } from "../../utils/block";
import { voiceSay } from "../../bindings";
import { useConditionalScopedAction } from "../../services/actions/actions-hook";

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
  const label = "  Image";
  const src = block.props.src;
  // @ts-expect-error
  const alt = block.content.length > 0 ? block.content[0].text : "/n";

  const ref = useRef<HTMLElement>(null);
  const isSelected = useBlockSelection(editor, block);

  useEffect(() => {
    contentRef(ref.current);
  }, []);

  // useOverrideScreenreader(`${label}, ${alt}`, isSelected); // Seems to cause voiceover losing focus
  useConditionalScopedAction(
    "Read out label",
    "cmd+shift+/",
    isSelected,
    () => {
      voiceSay(label);
    },
  );

  return (
    <figure className="inline-content inline-block w-full max-w-[600px]">
      <img
        className="object-cover"
        contentEditable={false}
        aria-hidden="true"
        src={src}
        alt={alt}
      />
      <figcaption className="inline-content flex text-sm">
        <span id="caption" role="textbox" ref={ref} />
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
