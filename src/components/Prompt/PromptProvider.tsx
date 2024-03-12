import { ReactNode, createContext, useRef, useState } from "react";
import Prompt from "./Prompt";

interface PromptProviderProps {
  children: ReactNode | ReactNode[];
}

export const PromptContext = createContext<
  (question: string) => Promise<string | null>
>(async () => "default");

function PromptProvider({ children }: PromptProviderProps) {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("default");

  const ref = useRef<HTMLInputElement>(null);
  const resolve = useRef<(value: string | null) => void>();

  const promptUser = (question: string): Promise<string | null> => {
    setQuestion(question);
    setOpen(true);

    return new Promise((res) => {
      resolve.current = res;
    });
  };

  const submit = (value: string | null, dialog: HTMLDialogElement | null) => {
    if (value === null) {
      cancel(dialog);
      return;
    }

    resolve.current && resolve.current(value);
    setOpen(false);
    dialog!.close();
  };

  const cancel = (dialog: HTMLDialogElement | null) => {
    resolve.current && resolve.current(null);
    dialog!.close();
  };

  return (
    <>
      {open && (
        <Prompt
          open={open}
          ref={ref}
          promptLabel={question}
          onSubmit={submit}
          onCancel={cancel}
        />
      )}
      <PromptContext.Provider value={promptUser}>
        {children}
      </PromptContext.Provider>
    </>
  );
}

export default PromptProvider;
