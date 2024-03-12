import Fuse, { FuseOptionKey, IFuseOptions } from "fuse.js";
import { useHotkeys } from "../../utils/hotkeys";
import { useEffect, useRef, useState } from "react";

interface SearchProps<T> {
  list: ReadonlyArray<T>;
  keys: FuseOptionKey<T>[];
  onResult?: (results: T[]) => void;
  onConfirm?: () => void;
}

function Search<T>({
  list,
  keys,
  onResult = () => {},
  onConfirm = () => {},
}: SearchProps<T>) {
  const ref = useRef(null);
  const [query, setQuery] = useState<string | null>(null);
  const [key, setKey] = useState<FuseOptionKey<T> | null>(null);

  const focusSearch = () => {
    if (ref.current === null) {
      return;
    }

    const element = ref.current as HTMLDivElement;

    element.focus();
  };

  useHotkeys("cmd+f", (event) => {
    event.preventDefault();
    focusSearch();

    return false;
  });

  useEffect(() => {
    const search = (query: string, key: FuseOptionKey<T> | null) => {
      const options: IFuseOptions<T> = {
        includeScore: true,
        keys: key ? [key] : keys,
        threshold: key ? 0.2 : 0.5,
      };

      const fuse = new Fuse(list, options);
      const result = fuse.search(query);
      console.log(result);

      const documents: T[] = result.map((result) => result.item) || [];
      onResult(query.length > 1 ? documents : (list as T[]));
    };

    search(query || "", key);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, key]);

  return (
    <div
      data-testid="Search"
      data-component-name="Search"
      aria-labelledby="zoeken"
      id="search-box"
      className="py-3 ring-1 ring-red-300 focus:bg-red-300 focus:outline-none"
    >
      <h2 id="zoeken">Zoeken in documenten</h2>
      <button
        className="ring-1 ring-red-200 focus:bg-red-200 focus:outline-none"
        onClick={() => {
          setQuery(null);
          setKey(null);
        }}
      >
        Wis huidige zoekopdracht
      </button>
      <label htmlFor="search-query">Zoek op tekst:</label>
      <input
        id="search-query"
        ref={ref}
        className="ring-1 ring-red-200 focus:bg-red-200 focus:outline-none"
        type="text"
        onKeyDown={(event) => {
          if (event.code !== "Enter") {
            return true;
          }
          onConfirm();
        }}
        value={query || ""}
        onChange={(event) => {
          const query = event.target.value;

          setQuery(query.length > 0 ? query : null);
        }}
      />
    </div>
  );
}

export default Search;
