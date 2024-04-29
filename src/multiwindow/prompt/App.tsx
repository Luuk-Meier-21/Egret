import { emit } from "@tauri-apps/api/event";
import { useHotkeys } from "../../utils/hotkeys";
import { useEffect, useState } from "react";
import { announceError } from "../../utils/error";
import { appWindow } from "@tauri-apps/api/window";
import { voiceSay } from "../../bindings";

function App() {
  const [input, setInput] = useState<string | null>(null);

  const submit = () => {
    if (input === null) {
      announceError();
      return;
    }

    emit("submit", input);
  };

  const reject = () => {
    emit("reject");
  };

  useHotkeys("Escape", () => {
    reject();
  });

  useHotkeys("Enter", () => {
    submit();
  });

  return (
    <div>
      <input
        autoFocus
        type="text"
        className="flex h-full w-full bg-black"
        spellCheck="false"
        placeholder=""
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            submit();
          }

          if (event.key === "Escape") {
            reject();
          }
        }}
        onChange={(event) => {
          if (event.target.value === "") {
            setInput(null);
          }

          setInput(event.target.value);
        }}
      />
    </div>
  );
}

export default App;
