import { useCreateBlockNote } from "@blocknote/react";
import { schema } from "../../blocks/schema";
import {
  Layout,
  LayoutBranchData,
  LayoutBranchOrNodeData,
  LayoutNodeData,
} from "../../types/layout/layout";
import { shell } from "@tauri-apps/api";
import { toDataURL } from "../../utils/url";
import { documentToSVG, inlineResources } from "dom-to-svg";

interface HTMLExportConfig {
  includeIds: boolean;
}

export function useLayoutHTMLExporter(
  _name: string,
  config: Partial<HTMLExportConfig> = {},
) {
  const globalEditor = useCreateBlockNote({
    schema,
  });

  const setSettings = (
    _: Document,
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

  // const layoutToHtml = async (
  //   title: string,
  //   layout: Readonly<Layout>,
  // ): Promise<Document> => {
  //   const htmlDocument = document.implementation.createHTMLDocument(title);
  //   const bodyElement = htmlDocument.body;

  //   for (let trunk of layout.tree) {
  //     await appendBranchOrNode(htmlDocument, bodyElement, trunk);
  //   }

  //   return htmlDocument;
  // };

  // const _htmlToPdfC = async (html: HTMLElement): Promise<string> =>
  //   new Promise(async (res) => {
  //     // const doc = await html2PDF(html, {
  //     //   autoResize: true,
  //     // });
  //     // const dataString = doc.output("datauristring");
  //     // const dataUri = await toDataURL(dataString);
  //     // shell.open(dataUri, "chrome");
  //     const doc = new jsPDF();
  //     doc.html(html, {
  //       autoPaging: false,
  //       html2canvas: {
  //         scale: 0.4,
  //         letterRendering: true,
  //         allowTaint: true,
  //       },
  //       callback: (doc) => {
  //         const dataUri = doc.output("datauristring");

  //         toDataURL(dataUri).then((data) => {
  //           shell.open(data, "chrome");
  //         });

  //         res(doc.output());
  //       },
  //     });
  //   });

  // const _loadStyleSheet = async (
  //   filePath?: string,
  // ): Promise<HTMLStyleElement> => {
  //   pathInDirectory;
  //   const styleString = await readTextFile(
  //     concatPath("stylesheets", filePath || "default.css"),
  //     {
  //       dir: BaseDirectory.AppData,
  //     },
  //   );
  //   const styleElement = document.createElement("style");
  //   styleElement.textContent = styleString;
  //   return styleElement;
  // };

  const exporter = async (_layout: Readonly<Layout>) => {
    const svgDocument = documentToSVG(document);

    await inlineResources(svgDocument.documentElement);

    const svgString = new XMLSerializer().serializeToString(svgDocument);
    console.log(svgString);
    const dataUri = await toDataURL(svgString);
    shell.open(dataUri);

    // const element = htmlDocument.documentElement.cloneNode(true) as HTMLElement;
    // const style = await loadStyleSheet();
    // console.log(style);
    // element.querySelector("head")?.appendChild(style);

    // const pdfString = await htmlToPdfC(element);
    // await writeTextFile(
    //   "/Users/luukmeier/Documents/CMD/Afstuderen/test.pdf",
    //   pdfString,
    // );

    // const path = await save({
    //   title: "Save document as",
    //   defaultPath: `~/Documents/${name}`,
    //   filters: [
    //     {
    //       name: "Image",
    //       extensions: ["html"],
    //     },
    //   ],
    // });

    // if (path === null) {
    //   return;
    // }

    // const title = path.split("/").pop() || "Untitled export";

    // const styleElement = htmlDocument.createElement("style");
    // const styleString = htmlDocument.head.appendChild("p");

    // await writeTextFile(path, htmlDocument.documentElement.outerHTML);

    return "";
  };

  return exporter;
}
