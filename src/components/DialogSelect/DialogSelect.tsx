import { useDialogHandlers } from "../../utils/dialog";
import Dialog, { DialogImplementationProps } from "../Dialog/Dialog";

export type SelectOption = { value: string; label: string };

interface DialogSelectProps extends Partial<DialogImplementationProps<string>> {
  label: string;
  options: SelectOption[];
}

function DialogSelect({
  options = [],
  onSubmit = () => {},
  onCancel = () => {},
}: DialogSelectProps) {
  const { ref, onChange } = useDialogHandlers<string>({
    onSubmit,
    onCancel,
  });

  return (
    <Dialog ref={ref} label="Test dialog prompt">
      <select
        onChange={(event) => {
          onChange(event.target.value);
        }}
      >
        {options.map((option) => (
          <option value={option.value}>{option.label}</option>
        ))}
      </select>
    </Dialog>
  );
}
export default DialogSelect;
