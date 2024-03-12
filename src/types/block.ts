import { BlockNoteEditor, PartialBlock } from "@blocknote/core";
import { schema } from "../blocks/schema";

export type IBlock = PartialBlock<
  typeof schema.blockSchema,
  typeof schema.inlineContentSchema,
  typeof schema.styleSchema
>;

export type IBlockEditor = BlockNoteEditor<
  typeof schema.blockSchema,
  typeof schema.inlineContentSchema,
  typeof schema.styleSchema
>;
