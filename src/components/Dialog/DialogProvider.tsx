import { ReactNode, createContext, useEffect, useRef, useState } from "react";
import DialogPrompt from "../DialogPrompt/DialogPrompt";
import DialogSelect, { SelectOption } from "../DialogSelect/DialogSelect";
import DialogAnnounce from "../DialogAnnounce/DialogAnnounce";

interface DialogProviderProps {
  children: ReactNode | ReactNode[];
}

interface DialogContextProps {
  prompt: (question: string) => Promise<string>;
  select: (
    label: string,
    options: { value: string; label: string }[],
  ) => Promise<string>;
  announce: (message: string) => Promise<void>;
}

export const DialogContext = createContext<DialogContextProps>(
  {} as DialogContextProps,
);

const DIALOG_COMPONENTS = {
  prompt: DialogPrompt,
  select: DialogSelect,
  announce: DialogAnnounce,
};

function DialogProvider({ children }: DialogProviderProps) {
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState("default");
  const [props, setProps] = useState({});
  const [type, setType] = useState<keyof typeof DIALOG_COMPONENTS | null>(null);

  const resolve = useRef<(...args: any[]) => any>();
  const reject = useRef<(...args: any[]) => any>();

  const dialog = <T extends {}>(
    type: keyof typeof DIALOG_COMPONENTS,
    label: string,
  ): Promise<T> => {
    setLabel(label);
    setType(type);
    setOpen(true);

    return new Promise((res, rej) => {
      resolve.current = res;
      reject.current = rej;
    });
  };

  const prompt = (question: string): Promise<string> => {
    return dialog("prompt", question);
  };

  const select = (label: string, options: SelectOption[]): Promise<string> => {
    setProps({ options: options });

    return dialog("select", label);
  };

  const announce = async (message: string): Promise<void> => {
    setProps({ message: message });

    dialog("announce", label);
  };

  const reset = () => {
    setOpen(false);
    setType(null);
    setProps({});
  };

  const submit = (value: string | null) => {
    if (value === null) {
      cancel();
      return;
    }

    resolve.current && resolve.current(value);
    reset();
  };

  const cancel = () => {
    reject.current && reject.current();
    reset();
  };

  useEffect(() => {
    console.log(props);
  }, [props]);

  const renderDialogOfType = () => {
    if (type === null) {
      return null;
    }

    const Element: any = DIALOG_COMPONENTS[type];
    return (
      <Element label={label} onSubmit={submit} onCancel={cancel} {...props} />
    );
  };

  return (
    <>
      {open && renderDialogOfType()}

      <DialogContext.Provider value={{ prompt, select, announce }}>
        {children}
      </DialogContext.Provider>
    </>
  );
}

export default DialogProvider;
