import {
  BlockNoteSchema,
  BlockSchemaFromSpecs,
  PartialBlock,
  defaultBlockSpecs,
  defaultInlineContentSpecs,
  defaultStyleSpecs,
} from "@blocknote/core";
import { Alert } from "./Alert/Alert";
import { Title } from "./Title/Title";
import { Link } from "./Link/Link";
import { Row, RowItem } from "./Row/Row";
import { Bullet } from "./Bullet/Bullet";

export type BlockData = PartialBlock<
  BlockSchemaFromSpecs<typeof schema.blockSpecs>
>;
export const schema = BlockNoteSchema.create({
  blockSpecs: {
    // Adds all default blocks.
    // ...defaultBlockSpecs,
    // Adds the Alert block.
    paragraph: defaultBlockSpecs.paragraph,
    // bulletListItem: defaultBlockSpecs.bulletListItem,
    alert: Alert,
    title: Title,
    url: Link,
    // row: Row,
    // bullet: Bullet,
  },
  inlineContentSpecs: {
    ...defaultInlineContentSpecs,
    "row-item": RowItem,
  },
  styleSpecs: {
    italic: defaultStyleSpecs.italic,
    strike: defaultStyleSpecs.strike,
  },
});
