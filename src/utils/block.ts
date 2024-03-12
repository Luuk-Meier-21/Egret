import { BlockIdentifier } from "@blocknote/core";
import { IBlock, IBlockEditor } from "../types/block";

export function createBlock(): IBlock {
  return {};
}

export function toggleBlock(
  editor: IBlockEditor,
  blockToUpdate: IBlock & BlockIdentifier,
  update: IBlock & {
    type: typeof blockToUpdate.type;
  },
) {
  const isSetToTarget = blockToUpdate.type === update.type;
  const updatedBlock: IBlock = isSetToTarget
    ? {
        type: "paragraph",
      }
    : update;
  editor.updateBlock(blockToUpdate, updatedBlock);
}
