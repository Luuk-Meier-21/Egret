import { generateDocumentRegion } from "../services/document/document-generator";
import { BlockData } from "../types/document/document";
import { v4 as uuidv4 } from "uuid";

export const ONBOARDING_BLOCKS: BlockData = [
  {
    id: uuidv4(),
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
    id: uuidv4(),
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
    id: uuidv4(),
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
  {
    id: uuidv4(),
    type: "image",
    props: {
      src: "https://images.unsplash.com/photo-1573867639040-6dd25fa5f597?q=80&w=2970&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    content:
      "This is a image with alt text (command, o). A close up image of a thick marker sketch of four variants of a user iterface.",
  },
];

export const ONBOARDING_CONTENT = generateDocumentRegion({
  blocks: ONBOARDING_BLOCKS,
});
