import {
  BlockNoteEditor,
  BlockSchemaFromSpecs,
  BlockSchemaWithBlock,
  insertOrUpdateBlock,
} from "@blocknote/core";
import { createReactBlockSpec } from "@blocknote/react";
import { schema } from "../../blocks/schema";
import { availableMonitors } from "@tauri-apps/api/window";
import { Link } from "react-router-dom";
import { validate } from "uuid";
import { fetchDocumentById } from "../../utils/documents";
import { useRef, useState } from "react";
import { IBlockEditor } from "../../types/block";

const setReferenceName = async (
  documentId: string,
  editor: any,
  block: any,
) => {
  if (!validate(documentId)) {
    return;
  }

  const document = await fetchDocumentById(documentId);

  if (document === null) {
    return;
  }

  const currBlock = editor.getTextCursorPosition().block;
  editor.updateBlock(currBlock, {
    type: "reference",
    content: document.name,
    props: {
      fetchName: false,
      documentId: block.props.documentId,
    },
  });
};

export const insertReference = (editor: typeof schema.BlockNoteEditor) => ({
  title: "Reference",
  onItemClick: () => {
    insertOrUpdateBlock(editor, {
      // @ts-ignore
      type: "reference",
    });
  },
  aliases: ["Reference"],
  group: "Other",
});

export const Reference = createReactBlockSpec(
  {
    type: "reference",
    propSchema: {
      documentId: {
        default: "",
      },
      fetchName: {
        default: true,
      },
    },
    content: "inline",
  },
  {
    render: (props) => {
      if (props.block.props.fetchName) {
        setReferenceName(
          props.block.props.documentId,
          props.editor,
          props.block,
        );
      }

      return (
        <div
          className="underline"
          data-block="Reference"
          role="link"
          data-reference={props.block.props.documentId}
        >
          <p className="flex before:[content:'']" ref={props.contentRef} />
        </div>
      );
    },
    parse: (element) => {
      const isValidId = validate(element.textContent ?? "");
      if (!isValidId) {
        return undefined;
      }

      return {
        documentId: element.textContent || "",
      };
    },
  },
);
