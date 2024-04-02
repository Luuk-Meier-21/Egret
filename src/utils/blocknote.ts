import { StyleSchema, StyledText } from "@blocknote/core";
import { schema } from "../blocks/schema";

type PartialLink = {
  type: "link";
  content: string | StyledText<typeof schema.styleSchema>[];
  href: string;
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
