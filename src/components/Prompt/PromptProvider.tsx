import { ReactNode, createContext, useRef, useState } from "react";
import Prompt from "./Prompt";

interface PromptProviderProps {
  children: ReactNode | ReactNode[];
}

export const PromptContext = createContext<(question: string) => string>(
  (_: string) => "default",
);

function PromptProvider({ children }: PromptProviderProps) {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("default");
  const [_, setType] = useState<string | null>("none");

  const resolve = useRef<(...args: any[]) => any>();
  const reject = useRef<(...args: any[]) => any>();

  const prompt = (question: string): Promise<string> => {
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
    setType("none");
  };

  const cancel = (_: HTMLDialogElement | null) => {
    reject.current && reject.current();
    setOpen(false);
    setType("none");
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

      <PromptContext.Provider
        //@ts-ignore
        value={prompt}
      >
        {children}
      </PromptContext.Provider>
    </>
  );
}

export default PromptProvider;
