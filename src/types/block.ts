import {
  BlockConfig,
  BlockFromConfig,
  BlockNoteEditor,
  BlockSchemaWithBlock,
  CustomBlockConfig,
  InlineContentConfig,
  InlineContentSchema,
  PartialBlock,
  StyleConfig,
  StyleSchema,
} from "@blocknote/core";
import { schema } from "../blocks/schema";

export type IBlock<
  ST extends Record<string, BlockConfig> = typeof schema.blockSchema,
  IT extends Record<
    string,
    InlineContentConfig
  > = typeof schema.inlineContentSchema,
  SST extends Record<string, StyleConfig> = typeof schema.styleSchema,
> = PartialBlock<ST, IT, SST>;

export type IBlockEditor<
  ST extends Record<string, BlockConfig> = typeof schema.blockSchema,
  IT extends Record<
    string,
    InlineContentConfig
  > = typeof schema.inlineContentSchema,
  SST extends Record<string, StyleConfig> = typeof schema.styleSchema,
> = BlockNoteEditor<ST, IT, SST>;

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
