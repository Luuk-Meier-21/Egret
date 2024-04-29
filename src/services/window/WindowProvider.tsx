import { ReactNode, createContext, useRef, useState } from "react";

interface PromptProviderProps {
  children: ReactNode | ReactNode[];
}

export const PromiseWindowContext = createContext<(question: string) => string>(
  (_: string) => "default",
);

function PromiseWindowProvider({ children }: PromptProviderProps) {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("default");
  const [_, setType] = useState<string | null>("none");

  const resolve = useRef<(...args: any[]) => any>();
  const reject = useRef<(...args: any[]) => any>();

  /**
   * @deprecated
   * @param question
   * @returns
   */
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
    setType("none");
  };

  const cancel = (_: HTMLDialogElement | null) => {
    reject.current && reject.current();
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

      <PromiseWindowContext.Provider
        //@ts-ignore
        value={prompt}
      >
        {children}
      </PromiseWindowContext.Provider>
    </>
  );
}

export default PromiseWindowProvider;
