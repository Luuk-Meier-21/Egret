import { insertOrUpdateBlock } from "@blocknote/core";
import {
  createReactBlockSpec,
  createReactInlineContentSpec,
} from "@blocknote/react";
import { schema } from "../../blocks/schema";
import { createDefaultBlockDOMOutputSpec } from "../Bullet/Bullet";

export const insertRow = (editor: typeof schema.BlockNoteEditor) => ({
  title: "Row",
  onItemClick: () => {
    insertOrUpdateBlock(editor, {
      // @ts-ignore
      type: "row",
    });
  },
  aliases: ["Row"],
  group: "Other",
});

const Rowa = {
  config: {
    type: "row",
    propSchema: {},
    content: "inline",
  },
  implementation: {
    // render: (props) => {
    //   return (
    //     <div
    //       data-row="0"
    //       className="p-1 ring-1 ring-white"
    //       ref={props.contentRef}
    //     />
    //   );
    // },
    toInternalHTML: (block: any, editor: any) => {
      const element = createDefaultBlockDOMOutputSpec("row", "ul", {}, {});
      const child = createDefaultBlockDOMOutputSpec("row", "li", {}, {});

      element.dom.appendChild(child.dom);
      element.dom.appendChild(child.dom);
      element.dom.appendChild(child.dom);
      return element;
    },
    // parse: (el) => {
    //   console.log(el);
    //   return el;
    // },
    // toExternalHTML: (props) => {
    //   return (
    //     <ul className="p-1 ring-1 ring-white">
    //       {props.block.children.map((child, i) => {
    //         console.log(child);
    //         return <li></li>;
    //       })}
    //     </ul>
    //   );
    // },
  },
};

export const Row = Rowa;

export const ExtendedRow = Row;

export const RowItem = createReactInlineContentSpec(
  {
    type: "row-item",
    propSchema: {},
    content: "styled",
  } as const,
  {
    render: (props) => <span ref={props.contentRef} />,
  },
);
