import { insertOrUpdateBlock } from "@blocknote/core";
import { createReactBlockSpec } from "@blocknote/react";
import { schema } from "../../blocks/schema";
import { ReactNode } from "react";
import { BlockComponentProps } from "../../types/block";
import { useRegisterAction } from "../../services/actions-registry";

export const insertRow = (editor: typeof schema.BlockNoteEditor) => ({
  title: "Row",
  onItemClick: () => {
    insertOrUpdateBlock(editor, {
      // @ts-ignore
      type: "row",
    });
  },
  aliases: ["Row"],
  group: "Other",
});

const rowConfig = {
  type: "row",
  propSchema: {
    parentId: {
      default: "",
    },
  },
  content: "inline",
} as const;

function rowComponent({
  block,
  editor,
  contentRef,
}: BlockComponentProps<typeof rowConfig, "row">): ReactNode {
  useRegisterAction("Test", "cmd+9", () => {
    const selectedBlock = editor.getTextCursorPosition().block;
    const parentId =
      block.props.parentId.length > 0 ? block.props.parentId : null;
    const isChild = parentId !== null;
    const isSelectedBlock = selectedBlock.id === block.id;

    if (isSelectedBlock) {
      if (isChild) {
        editor.insertBlocks(
          [
            {
              type: "row",
              content: `Item`,
              props: {
                parentId: block.props.parentId,
              },
            },
          ],
          block,
          "after",
        );
      } else {
        editor.insertBlocks(
          [
            {
              type: "row",
              content: "First",
              props: {
                parentId:
                  block.props.parentId.length > 0
                    ? block.props.parentId
                    : selectedBlock.id,
              },
            },
          ],
          block,
          "nested",
        );
      }
    }
  });

  return block.props.parentId ? (
    <li role="cell" className="flex ring-1 ring-red-400" data-block="Row">
      <span contentEditable>{block.props.parentId}</span>
      <p ref={contentRef} />
    </li>
  ) : (
    <ul className="flex">
      parent
      <p ref={contentRef} />
    </ul>
  );
}

export const Row = createReactBlockSpec(rowConfig, {
  render: (props) => rowComponent(props),
});
