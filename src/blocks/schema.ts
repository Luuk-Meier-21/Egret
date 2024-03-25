import {
  BlockNoteSchema,
  BlockSchemaFromSpecs,
  PartialBlock,
  defaultBlockSpecs,
  defaultInlineContentSpecs,
  defaultStyleSpecs,
} from "@blocknote/core";
import { Alert } from "./Alert";
import { Title } from "./Title";
import { Link } from "./Link";
import { Reference } from "./Reference/Reference";
import { Row } from "./Row/Row";

export type BlockData = PartialBlock<
  BlockSchemaFromSpecs<typeof schema.blockSpecs>
>;

export const schema = BlockNoteSchema.create({
  blockSpecs: {
    // Adds all default blocks.
    // ...defaultBlockSpecs,
    // Adds the Alert block.
    paragraph: defaultBlockSpecs.paragraph,
    bulletListItem: defaultBlockSpecs.bulletListItem,
    alert: Alert,
    title: Title,
    url: Link,
    reference: Reference,
  },
  inlineContentSpecs: {
    ...defaultInlineContentSpecs,
  },
  styleSpecs: {
    italic: defaultStyleSpecs.italic,
    strike: defaultStyleSpecs.strike,
  },
});
