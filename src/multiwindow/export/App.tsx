import { useEffect, useState } from "react";
import { readTextFile } from "@tauri-apps/api/fs";
import { Layout } from "../../types/layout/layout";
import { LayoutBranchOrNode } from "../../components/LayoutBranch/LayoutBranch";
import { getExportStyle, getExporter } from "../../services/export/export";
import PreviewBlock from "./PreviewBlock";
import "../../styles.css";
import { useMultiWindow } from "../../services/window/window-manager";

function App() {
  const { data, resolve, reject } = useMultiWindow();
  const [layout, setLayout] = useState<Layout | null>(null);

  if (data.type !== "export") {
    return null;
  }

  const tryExport = () => {
    if (layout) {
      const exporter = getExporter(data.format);
      // const nodes = flattenLayoutNodesByReference(layout.tree);

      setTimeout(() => {
        exporter().then((value: string | undefined) => {
          if (value) {
            resolve(value);
          } else {
            reject();
          }
        });
      }, 2000);
    }
  };

  useEffect(() => {
    readTextFile(data.path).then((data) => {
      try {
        const json = JSON.parse(data);
        setLayout(json as Layout);
      } catch (error) {
        reject();
      }
    });
  }, []);

  useEffect(() => {
    tryExport();
  }, [layout]);

  return layout !== null ? (
    <div>
      <main className={getExportStyle(data.style) || getExportStyle("default")}>
        {layout.tree.map((branchOrNode, _rowIndex) => (
          <LayoutBranchOrNode
            key={branchOrNode.id}
            value={branchOrNode}
            renderNode={(node, _columnIndex, _columnLength) => {
              if (node.data?.blocks === undefined) {
                return null;
              }

              return (
                // Block editor will not parse to svg
                <PreviewBlock
                  blocks={node.data?.blocks}
                  className="mx-auto flex h-full w-full max-w-[46em] outline-none [font-family:unset;] [&_*]:outline-none"
                />
              );
            }}
          />
        ))}
      </main>
    </div>
  ) : (
    <div>laoding</div>
  );
}

export default App;
