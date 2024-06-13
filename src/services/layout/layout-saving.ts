import { Layout } from "../../types/layout/layout";

export function useLayoutAutoSaveHandle(layout: Layout, onSave: () => void) {
  //@ts-ignore
  const saveLayout = () => {
    console.log("save: ", layout);
    onSave();
  };

  // useEffect(() => {
  //   let unlisten = () => {};

  //   listen(TauriEvent.WINDOW_CLOSE_REQUESTED, async () => {
  //     await onSave();
  //   }).then((callback) => {
  //     unlisten = callback;
  //   });

  //   return () => {
  //     unlisten();
  //   };
  // }, [onSave, layout]);

  // useStrictEffect(
  //   () => {
  //     saveLayout();
  //   },
  //   ([layout]) =>
  //     deepJSONClone(flattenLayoutNodesByReference(layout.tree)).length,
  //   [layout],
  // );
}
