import { useDialogHandlers } from "../../utils/dialog";
import Dialog, { DialogImplementationProps } from "../Dialog/Dialog";

interface DialogAnnounceProps
  extends Partial<DialogImplementationProps<string>> {
  label: string;
  message: string;
}

function DialogAnnounce({
  onSubmit = () => {},
  onCancel = () => {},
  label,
  message,
}: DialogAnnounceProps) {
  const { ref, onChange, onKeyDown } = useDialogHandlers<string>({
    onSubmit,
    onCancel,
  });

  return (
    <Dialog ref={ref} label={label}>
      <span>{message}</span>
    </Dialog>
  );
}
export default DialogAnnounce;
