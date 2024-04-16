import { useDialogHandlers } from "../../utils/dialog";
import Dialog, { DialogImplementationProps } from "../Dialog/Dialog";

interface DialogPromptProps extends Partial<DialogImplementationProps<string>> {
  label: string;
}

function DialogPrompt({
  onSubmit = () => {},
  onCancel = () => {},
  label,
}: DialogPromptProps) {
  const { ref, onChange, onKeyDown } = useDialogHandlers<string>({
    onSubmit,
    onCancel,
  });

  return (
    <Dialog ref={ref} label={label}>
      <input
        aria-labelledby="dialog"
        autoFocus
        type="text"
        spellCheck="false"
        onKeyDown={onKeyDown}
        onChange={(event) => {
          onChange(event.target.value);
        }}
      />
    </Dialog>
  );
}
export default DialogPrompt;
