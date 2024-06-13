//@ts-nocheck

import { useReducer } from "react";
import { layoutReducer } from "./layout-builder-reducer";
import { Layout, LayoutNodeData } from "../../types/layout/layout";
import { DocumentRegionData } from "../../types/document/document";
import { systemSound } from "../../bindings";

export function oldBuilder(staticLayout: Layout) {
  const [layout, dispatch] = useReducer(layoutReducer, staticLayout);

  const insertContent = (
    data: DocumentRegionData,
    node: LayoutNodeData,
  ): LayoutNodeData => {
    // Dispatch insert-content dispatcher action
    dispatch({ type: "insert-content", node, data });

    // annouce success state, this is preemptive since state is only available on rerender.
    announceCreation();

    // return presumably inserted node
    return node;
  };

  insertContent(region, node);
}

export function newBuilder() {
  // let the reducer handle event dispatching as well as reducing.
  const [layout, dispatch] = useReducer(layoutReducer, staticLayout);

  // make `insertContent` return the correct reducer action object.
  dispatch(insertContent(data, node));
}

// somewhere else in the codebase:
{
  // Listen for layout insertion, without coupling to the implementation of it.
  listen("layout-insert", (node: LayoutNodeData) => {
    announceCreation();
    // No something with the inserted node...
  });
}
