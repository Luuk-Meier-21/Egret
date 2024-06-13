import { useEffect, useRef, useState } from "react";
import { LayoutBranchOrNode } from "../../components/LayoutBranch/LayoutBranch";
import { Layout, SanitizedLayout } from "../../types/layout/layout";
import { socketEndpoint } from "../../services/socket/tactile-socket";

const connectWebsocket = (): WebSocket | undefined => {
  try {
    return new WebSocket(socketEndpoint(window.location.hostname));
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
        layout.tree.map((branchOrNode, _rowIndex) => (
          <LayoutBranchOrNode
            key={branchOrNode.id}
            value={branchOrNode}
            renderNode={(node, _columnIndex) => {
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
