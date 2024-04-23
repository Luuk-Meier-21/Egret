import { useCreateBlockNote } from "@blocknote/react";
import { schema } from "../../blocks/schema";
import {
  Layout,
  LayoutBranchData,
  LayoutBranchOrNodeData,
  LayoutNodeData,
} from "../../types/layout/layout";
import { save } from "@tauri-apps/api/dialog";
import { writeTextFile } from "@tauri-apps/api/fs";

interface HTMLExportConfig {
  includeIds: boolean;
}

export function useLayoutHTMLExporter(config: Partial<HTMLExportConfig> = {}) {
  const globalEditor = useCreateBlockNote({
    schema,
  });

  const setSettings = (
    htmlDocument: Document,
    element: HTMLElement,
    nodeOrBranch: LayoutBranchOrNodeData,
  ) => {
    if (config.includeIds) element.setAttribute("id", nodeOrBranch.id);
  };

  const appendNode = async (
    htmlDocument: Document,
    element: HTMLElement,
    node: LayoutNodeData,
  ) => {
    let nodeElement = htmlDocument.createElement("div");
    setSettings(htmlDocument, nodeElement, node);

    if (node.data?.blocks) {
      const blockString = await globalEditor.blocksToHTMLLossy(
        node.data?.blocks as any,
      );
      nodeElement.innerHTML = blockString;
    }

    element.appendChild(nodeElement);
  };

  const appendBranch = async (
    htmlDocument: Document,
    element: HTMLElement,
    branch: LayoutBranchData,
  ) => {
    let branchElement = htmlDocument.createElement("ul");
    setSettings(htmlDocument, branchElement, branch);

    branchElement.setAttribute("data-branch-flow", branch.flow);

    for (let child of branch.children) {
      await appendBranchOrNode(htmlDocument, branchElement, child);
    }

    element.appendChild(branchElement);
  };

  const appendBranchOrNode = async (
    htmlDocument: Document,
    element: HTMLElement,
    branch: LayoutBranchOrNodeData,
  ) => {
    if (branch.type === "branch") {
      appendBranch(htmlDocument, element, branch);
    } else {
      appendNode(htmlDocument, element, branch);
    }
  };

  const exporter = async (layout: Readonly<Layout>) => {
    const path = await save({
      title: "Save document as",
      defaultPath: "~/Documents/Untitled export",
      filters: [
        {
          name: "Image",
          extensions: ["html"],
        },
      ],
    });

    if (path === null) {
      return;
    }

    const title = path.split("/").pop() || "Untitled export";
    const htmlDocument = document.implementation.createHTMLDocument(title);
    const bodyElement = htmlDocument.body;

    for (let trunk of layout.tree) {
      await appendBranchOrNode(htmlDocument, bodyElement, trunk);
    }

    // const styleElement = htmlDocument.createElement("style");
    // const styleString = htmlDocument.head.appendChild("p");

    await writeTextFile(path, htmlDocument.documentElement.outerHTML);

    return path;
  };

  return exporter;
}
