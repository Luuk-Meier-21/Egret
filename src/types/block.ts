import {
  BlockFromConfig,
  BlockNoteEditor,
  BlockSchemaWithBlock,
  CustomBlockConfig,
  InlineContentSchema,
  PartialBlock,
  StyleSchema,
} from "@blocknote/core";
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

export interface BlockComponentProps<
  T extends CustomBlockConfig,
  BT extends keyof typeof schema.blockSpecs,
> {
  block: BlockFromConfig<T, InlineContentSchema, StyleSchema>;
  editor: BlockNoteEditor<
    BlockSchemaWithBlock<BT, T>,
    InlineContentSchema,
    StyleSchema
  >;
  contentRef: (node: HTMLElement | null) => void;
}
