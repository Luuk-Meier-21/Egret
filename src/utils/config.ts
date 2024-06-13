// useScopedAction(`Set focus contrast`, keyExplicitAction("0"), async () => {
// const focusModeString = await selectSingle(
//   "Select contrast",
//   "Focus constrast",
//   FOCUS_MODE_MAPPING,
// );
// const focusMode: number = Number(focusModeString);

import { selectSingle } from "../services/window/window-manager";

// if (!FOCUS_MODE_MAPPING.map(({ value }) => value).includes(focusMode)) {
//   announceError();
//   return;
// }

// setFocusMode(focusMode);
// window.location.reload();
// });

export async function selectConfigFromMapping(
  mapping: { value: number; label: string }[],
  setFunc: (value: number) => void,
): Promise<boolean> {
  const resultString = await selectSingle(
    "Select contrast",
    "Focus constrast",
    mapping,
  );
  const result: number = Number(resultString);

  if (!mapping.map(({ value }) => value).includes(result)) {
    return false;
  }

  setFunc(result);
  window.location.reload();
  return true;
}
