import { useEffect, useRef, useState } from "react";
import { LayoutBranchOrNode } from "../../components/LayoutBranch/LayoutBranch";
import { Layout, SanitizedLayout } from "../../types/layout/layout";

const connectWebsocket = (): WebSocket | undefined => {
  try {
    return new WebSocket("ws://192.168.1.232:2000/socket");
  } catch (error) {
    console.info(error);
    return;
  }
};

const jsonToLayout = (
  data: string | undefined,
): SanitizedLayout | undefined => {
  if (data === undefined) {
    return;
  }

  const layout = JSON.parse(data) as SanitizedLayout;

  return layout;
};

function App() {
  const webSocket = useRef(connectWebsocket());
  const [layout, setLayout] = useState<Layout>();

  const refreshLayout = (data: string) => {
    if (data === "refresh") {
      webSocket.current?.send("load");
      return;
    }

    if (data.length > 0 && JSON.stringify(layout) !== data) {
      setLayout(jsonToLayout(data));
    }
  };

  const onOpen = (event: Event) => {
    console.log(event);
  };
  const onMessage = (event: MessageEvent) => {
    console.log(event);
    refreshLayout(event.data);
  };
  const onError = (event: Event) => {
    console.log(event);
  };
  const onClose = (event: CloseEvent) => {
    console.log(event);
  };

  useEffect(() => {
    webSocket.current?.addEventListener("open", onOpen);
    webSocket.current?.addEventListener("message", onMessage);
    webSocket.current?.addEventListener("error", onError);
    webSocket.current?.addEventListener("close", onClose);

    return () => {
      webSocket.current?.removeEventListener("open", onOpen);
      webSocket.current?.removeEventListener("message", onMessage);
      webSocket.current?.removeEventListener("error", onError);
      webSocket.current?.removeEventListener("close", onClose);
    };
  });

  const focusColumn = (columnId: string, rowId: string) => {
    webSocket.current?.send(`focus:${columnId}.${rowId}`);
  };

  // const socket = new WebSocket("ws://192.168.1.232:2000/companion");

  return (
    <div>
      <button
        onClick={async () => {
          console.log("Send");
          webSocket.current?.send("load:hi");
        }}
      >
        test
      </button>
      {layout ? (
        layout.tree.map((branchOrNode, rowIndex) => (
          <LayoutBranchOrNode
            key={branchOrNode.id}
            value={branchOrNode}
            renderNode={(node, columnIndex) => {
              return (
                <button
                  onClick={() => focusColumn(node.id, branchOrNode.id)}
                  className="h-28 w-full"
                ></button>
              );
            }}
          />
        ))
      ) : (
        <div>Awaiting data...</div>
      )}
    </div>
  );
}

export default App;
