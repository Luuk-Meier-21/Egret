import { useCallback, useState } from "react";

//value for the initial value, is either T or a function that returns T
type InitialValueType<T> = T | ((prev?: T) => T);

export function useHistoryState<T>(initialValue?: InitialValueType<T>) {
  const [state, _setState] = useState<T>(initialValue as any);
  const [history, setHistory] = useState<InitialValueType<T>[]>(
    initialValue !== undefined && initialValue !== null ? [initialValue] : [],
  );
  const [pointer, setPointer] = useState<number>(
    initialValue !== undefined && initialValue !== null ? 0 : -1,
  );

  const setState: (value: InitialValueType<T>) => void = useCallback(
    (value: InitialValueType<T>) => {
      let valueToAdd = value;
      if (typeof value === "function") {
        valueToAdd = (value as (prev?: T) => T)(state);
      }
      setHistory((prev) => [...prev.slice(0, pointer + 1), valueToAdd]);
      setPointer((prev) => prev + 1);
      _setState(value);
    },
    [setHistory, setPointer, _setState, state, pointer],
  );

  const undo: () => void = useCallback(() => {
    if (pointer <= 0) return;
    _setState(history[pointer - 1]);
    setPointer((prev) => prev - 1);
  }, [history, pointer, setPointer]);

  const redo: () => void = useCallback(() => {
    if (pointer + 1 >= history.length) return;
    _setState(history[pointer + 1]);
    setPointer((prev) => prev + 1);
  }, [pointer, history, setPointer]);

  return { state, setState, undo, redo, history, pointer } as const;
}
