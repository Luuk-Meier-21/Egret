import {
  ForwardedRef,
  KeyboardEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { useHotkeys } from "./hotkeys";
import { DialogImplementationProps } from "../components/Dialog/Dialog";

type UseDialogHandlersProps<RT> = DialogImplementationProps<RT>;

export function useDialogHandlers<RT extends string | string[]>({
  onSubmit,
  onCancel,
}: UseDialogHandlersProps<RT>): {
  onKeyDown: (event: KeyboardEvent<any>) => void;
  onChange: (value: RT) => void;
  ref: ForwardedRef<HTMLDialogElement>;
} {
  const ref = useRef<HTMLDialogElement>(null);
  const [value, setValue] = useState<RT | null>(null);

  const dispatchCancel = () =>
    ref?.current?.dispatchEvent(new Event("cancel", { bubbles: true }));
  const dispatchSubmit = () =>
    ref?.current?.dispatchEvent(new Event("submit", { bubbles: true }));

  useHotkeys("escape", () => {
    dispatchCancel();
  });

  useHotkeys("enter", () => {
    dispatchSubmit();
  });

  useEffect(() => {
    const submit = () => onSubmit(value);
    const cancel = () => onCancel();

    ref?.current?.addEventListener("cancel", cancel);
    ref?.current?.addEventListener("submit", submit);

    return () => {
      ref?.current?.removeEventListener("cancel", cancel);
      ref?.current?.removeEventListener("submit", submit);
    };
  }, [value]);

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      dispatchCancel();
    } else if (event.key === "Enter") {
      dispatchSubmit();
    }
  };

  const handleChange = (value: RT) => {
    setValue(value);
  };

  return { onChange: handleChange, onKeyDown: handleKeyDown, ref };
}
