import { ForwardedRef, ReactNode, forwardRef, useRef } from "react";

interface DialogProps {
  children: ReactNode | ReactNode[];
  label: string;
}

export interface DialogImplementationProps<T> {
  onSubmit: (value: T | null) => void;
  onCancel: () => void;
}

const Dialog = forwardRef(function Dialog(
  { children, label }: DialogProps,
  ref: ForwardedRef<HTMLDialogElement>,
) {
  return (
    <dialog ref={ref} open={true}>
      <h2 id="dialog">{label}</h2>
      <form method="dialog">
        {children}
        <button type="submit">confirm</button>
      </form>
    </dialog>
  );
});
export default Dialog;
