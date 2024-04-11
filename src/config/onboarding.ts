import { BlockData } from "../types/document/document";

export const ONBOARDING_BLOCKS: BlockData = [
  {
    id: "1ae35140-5259-4de0-b004-c1bfaf2043e5",
    type: "title",
    props: {},
    content: [
      {
        type: "text",
        text: "This is a title, toggle it by pressing (command, b)",
        styles: {},
      },
    ],
    children: [],
  },
  {
    id: "f69ed762-0120-479b-87cd-551c6b92c470",
    type: "paragraph",
    props: {
      textColor: "default",
      backgroundColor: "default",
      textAlignment: "left",
    },
    content: [
      {
        type: "text",
        text: "This is a paragraph, the default text of a document.",
        styles: {},
      },
    ],
    children: [],
  },
  {
    id: "d3409325-d144-4b23-8bd0-b05b8af6d81b",
    type: "paragraph",
    props: {
      textColor: "default",
      backgroundColor: "default",
      textAlignment: "left",
    },
    content: [
      {
        type: "link",
        href: "https://www.google.com/",
        content: [
          {
            type: "text",
            text: "This is a link to google.com, press (command, u) to open it.",
            styles: {},
          },
        ],
      },
    ],
    children: [],
  },
];

export const ONBOARDING_CONTENT: any = {
  meta: {},
  text: ONBOARDING_BLOCKS,
};
