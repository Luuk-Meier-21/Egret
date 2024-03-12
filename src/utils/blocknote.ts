import {
  InlineContent,
  PartialInlineContent,
  StyleSchema,
  StyledText,
} from "@blocknote/core";
import { schema } from "../App";

type PartialLink = {
  type: "link";
  content: string | StyledText<typeof schema.styleSchema>[];
  href: string;
};

type PartialContent = {
  type: "text";
  text: string;
  styles: StyleSchema;
};

export const createLinkContent = (
  content: string | StyledText<StyleSchema>,
  href: string,
): PartialLink => {
  const contentObject: StyledText<StyleSchema> =
    typeof content === "object"
      ? content
      : {
          type: "text",
          text: content,
          styles: {},
        };

  return {
    type: "link",
    href: href,
    content: [contentObject],
  };
};
