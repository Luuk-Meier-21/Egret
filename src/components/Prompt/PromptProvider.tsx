import { ReactNode, createContext, useRef, useState } from "react";
import Prompt from "./Prompt";

interface PromptProviderProps {
  children: ReactNode | ReactNode[];
}

interface PromptContextValues {
  prompt: (question: string) => Promise<string>;
}

const defaultPromptContext = {} as PromptContextValues;

export const PromptContext =
  createContext<PromptContextValues>(defaultPromptContext);

function PromptProvider({ children }: PromptProviderProps) {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("default");

  const ref = useRef<HTMLInputElement>(null);
  const resolve = useRef<(value: string) => void>();
  const reject = useRef<() => void>();

  const promptUser = (question: string): Promise<string> => {
    setQuestion(question);
    setOpen(true);

    return new Promise((res, rej) => {
      resolve.current = res;
      reject.current = rej;
    });
  };

  const submit = (value: string | null, dialog: HTMLDialogElement | null) => {
    if (value === null) {
      cancel(dialog);
      return;
    }

    resolve.current && resolve.current(value);
    setOpen(false);
  };

  const cancel = (dialog: HTMLDialogElement | null) => {
    reject.current && reject.current();
    setOpen(false);
  };

  return (
    <>
      {open && (
        <Prompt
          open={open}
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
