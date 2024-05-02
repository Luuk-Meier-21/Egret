import { emit } from "@tauri-apps/api/event";
import { useHotkeys } from "../../utils/hotkeys";
import { useState } from "react";
import { announceError } from "../../utils/error";
import { PromiseWindowData } from "../../services/window/window-manager";
import SearchList from "../../components/SearchList/SearchList";

const getParams = (params: URLSearchParams): PromiseWindowData => {
  const data = {} as PromiseWindowData;

  console.log(params);

  for (let [key, value] of params.entries() as IterableIterator<
    [keyof PromiseWindowData, string]
  >) {
    console.log(key, value);
    //@ts-ignore
    data[key] = value.includes(",") ? value.split(",") : value;
  }

  return data;
};

function App() {
  const [input, setInput] = useState<string | null>(null);
  const params = new URLSearchParams(window.location.search);
  const data = getParams(params);

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
            placeholder="Document name"
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
        (Array.isArray(data.options) ? (
          <SearchList
            list={data.options}
            label={data.label}
            searchKeys={[]}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                reject();
              }
            }}
            searchPosition="top"
            renderItem={(option) => (
              <button
                onClick={() => {
                  submit(option);
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    submit(option);
                  }

                  if (event.key === "Escape") {
                    reject();
                  }
                }}
              >
                {option}
              </button>
            )}
          />
        ) : (
          <button
            onClick={() => {
              submit(data.options);
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                submit(data.options);
              }

              if (event.key === "Escape") {
                reject();
              }
            }}
          >
            {data.options}
          </button>
        ))}
    </div>
  );
}

export default App;
