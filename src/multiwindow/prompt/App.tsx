import { emit } from "@tauri-apps/api/event";
import { useHotkeys } from "../../utils/hotkeys";
import { useRef, useState } from "react";
import { announceError } from "../../utils/error";
import { getWindowParams } from "../../services/window/window-manager";
import SearchList from "../../components/SearchList/SearchList";

function App() {
  const [input, setInput] = useState<string | null>(null);
  const params = new URLSearchParams(window.location.search);
  const data = getWindowParams(params);
  const ref = useRef(null);

  const submit = (targetInput: any = input) => {
    if (targetInput === null) {
      announceError();
      return;
    }

    emit("submit", targetInput);
  };

  const reject = () => {
    emit("reject");
  };

  useHotkeys("Escape", () => {
    reject();
  });

  return (
    <div className="p-4">
      {data.type === "input" && (
        <div aria-labelledby="label">
          {data.label && (
            <label id="label" htmlFor="input">
              {data.label}
            </label>
          )}
          <input
            id="input"
            autoFocus
            type="text"
            className="flex h-full w-full bg-black"
            spellCheck="false"
            placeholder={data.label}
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
      )}
      {data.type === "select" &&
        (Array.isArray(data.values) ? (
          <SearchList
            list={data.labels.map((label, index) => ({
              label: label,
              value: data.values[index],
            }))}
            label={data.label}
            searchKeys={["label"]}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                reject();
              }
            }}
            ref={ref}
            searchPosition="top"
            renderItem={(option) => (
              <button
                onClick={() => {
                  submit(option.value);
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    submit(option.value);
                  }

                  if (event.key === "Escape") {
                    reject();
                  }
                }}
              >
                {option.label}
              </button>
            )}
          />
        ) : (
          <button
            onClick={() => {
              submit(data.values);
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                submit(data.values);
              }

              if (event.key === "Escape") {
                reject();
              }
            }}
          >
            {data.labels}
          </button>
        ))}
    </div>
  );
}

export default App;
