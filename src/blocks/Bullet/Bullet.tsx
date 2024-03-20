import {
  PropSchema,
  createBlockSpecFromStronglyTypedTiptapNode,
  createStronglyTypedTiptapNode,
  defaultProps,
  mergeCSSClasses,
} from "@blocknote/core";
import { createKeyword } from "../../utils/keywords";

export const bulletListItemPropSchema = {
  ...defaultProps,
} satisfies PropSchema;

const BulletListItemBlockContent = createStronglyTypedTiptapNode({
  name: "bullet",
  content: "inline*",
  group: "blockContent",
  // addInputRules() {
  //   return [
  //     // Creates an unordered list when starting with "-", "+", or "*".
  //     new InputRule({
  //       find: new RegExp(`^[-+*]\\s$`),
  //       handler: ({ state, chain, range }) => {
  //         if (getCurrentBlockContentType(this.editor) !== "inline*") {
  //           return;
  //         }

  //         chain()
  //           .BNUpdateBlock(state.selection.from, {
  //             type: "bulletListItem",
  //             props: {},
  //           })
  //           // Removes the "-", "+", or "*" character used to set the list.
  //           .deleteRange({ from: range.from, to: range.to });
  //       },
  //     }),
  //   ];
  // },

  // addKeyboardShortcuts() {
  //   return {
  //     Enter: () => handleEnter(this.editor),
  //     "Mod-Shift-8": () => {
  //       if (getCurrentBlockContentType(this.editor) !== "inline*") {
  //         return true;
  //       }

  //       return this.editor.commands.BNUpdateBlock(
  //         this.editor.state.selection.anchor,
  //         {
  //           type: "bulletListItem",
  //           props: {},
  //         },
  //       );
  //     },
  //   };
  // },

  parseHTML() {
    console.log(this.name);
    return [
      // Case for regular HTML list structure.
      {
        tag: "div[data-content-type=" + this.name + "]", // TODO: remove if we can't come up with test case that needs this
      },
      {
        tag: "li",
        getAttrs: (element) => {
          console.log(element);
          if (typeof element === "string") {
            return false;
          }

          const parent = element.parentElement;

          if (parent === null) {
            return false;
          }

          if (
            parent.tagName === "UL" ||
            (parent.tagName === "DIV" && parent.parentElement!.tagName === "UL")
          ) {
            return {};
          }

          return false;
        },
        node: "bulletListItem",
      },
      // Case for BlockNote list structure.
      {
        tag: "li",
        getAttrs: (element) => {
          if (typeof element === "string") {
            return false;
          }

          const parent = element.parentElement;

          if (parent === null) {
            return false;
          }

          if (parent.getAttribute("data-content-type") === "bulletListItem") {
            return {};
          }

          return false;
        },
        priority: 300,
        node: "bulletListItem",
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return createDefaultBlockDOMOutputSpec(
      this.name,
      // We use a <p> tag, because for <li> tags we'd need a <ul> element to put
      // them in to be semantically correct, which we can't have due to the
      // schema.
      "li",
      {
        ...(this.options.domAttributes?.blockContent || {}),
        ...HTMLAttributes,
      },
      this.options.domAttributes?.inlineContent || {},
    );
  },
});

export const Bullet = createBlockSpecFromStronglyTypedTiptapNode(
  BulletListItemBlockContent,
  bulletListItemPropSchema,
);

export function createDefaultBlockDOMOutputSpec(
  blockName: string,
  htmlTag: string,
  blockContentHTMLAttributes: Record<string, string>,
  inlineContentHTMLAttributes: Record<string, string>,
) {
  const blockContent = document.createElement("ul");
  blockContent.className = mergeCSSClasses(
    "bn-block-content",
    blockContentHTMLAttributes.class,
  );
  blockContent.setAttribute("data-content-type", blockName);
  for (const [attribute, value] of Object.entries(blockContentHTMLAttributes)) {
    if (attribute !== "class") {
      blockContent.setAttribute(attribute, value);
    }
  }

  const inlineContent = document.createElement(htmlTag);
  inlineContent.className = mergeCSSClasses(
    "bn-inline-content",
    inlineContentHTMLAttributes.class,
  );
  for (const [attribute, value] of Object.entries(
    inlineContentHTMLAttributes,
  )) {
    if (attribute !== "class") {
      inlineContent.setAttribute(attribute, value);
    }
  }
  console.log(blockContent);

  blockContent.appendChild(inlineContent);

  return {
    dom: blockContent,
    contentDOM: inlineContent,
  };
}
