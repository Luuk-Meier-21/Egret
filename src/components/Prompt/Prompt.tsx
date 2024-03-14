import { ForwardedRef, forwardRef, useEffect, useRef, useState } from "react";
import { useHotkeys } from "../../utils/hotkeys";
import { event } from "@tauri-apps/api";

interface PromptProps {
  open: boolean;
  promptLabel: string;
  submitLabel?: string;
  defaultValue?: string | null;
  onChange?: (value: string | null, dialog: HTMLDialogElement | null) => void;
  onSubmit?: (value: string | null, dialog: HTMLDialogElement | null) => void;
  onCancel?: (dialog: HTMLDialogElement | null) => void;
}

const Prompt = forwardRef(function Prompt(
  {
    open,
    defaultValue = null,
    promptLabel,
    submitLabel,
    onSubmit = () => {},
    onCancel = () => {},
  }: PromptProps,
  ref: ForwardedRef<HTMLInputElement>,
) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [value, setValue] = useState<string | null>(null);

  const dispatchCancel = () =>
    dialogRef?.current?.dispatchEvent(new Event("cancel", { bubbles: true }));
  const dispatchSubmit = () =>
    dialogRef?.current?.dispatchEvent(new Event("submit", { bubbles: true }));

  useHotkeys("escape", () => {
    dispatchCancel();
  });

  useHotkeys("enter", () => {
    dispatchSubmit();
  });

  useEffect(() => {
    const submit = () => onSubmit(value, dialogRef?.current);
    const cancel = () => onCancel(dialogRef?.current);

    dialogRef?.current?.addEventListener("cancel", cancel);
    dialogRef?.current?.addEventListener("submit", submit);

    return () => {
      dialogRef?.current?.removeEventListener("cancel", cancel);
      dialogRef?.current?.removeEventListener("submit", submit);
    };
  }, [value]);

  return (
    <dialog ref={dialogRef} open={open}>
      <p>{promptLabel}</p>
      <form method="dialog">
        <input
          ref={ref}
          autoFocus
          type="text"
          spellCheck="false"
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              dispatchCancel();
            } else if (event.key === "Enter") {
              dispatchSubmit();
            }
          }}
          onChange={(event) => setValue(event?.target.value || null)}
        />
        <button type="submit">{submitLabel ? submitLabel : "Confirm"}</button>
      </form>
    </dialog>
  );
});

export default Prompt;
