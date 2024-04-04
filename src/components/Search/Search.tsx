import Fuse, { FuseOptionKey, IFuseOptions } from "fuse.js";
import { useEffect, useRef, useState } from "react";
import { useRegisterAction } from "../../services/actions-registry";

interface SearchProps<T> {
  list: ReadonlyArray<T>;
  keys: FuseOptionKey<T>;
  onResult?: (results: T[], query: string) => void;
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

  useRegisterAction("Search for document, by title or keyword", "cmd+f", () => {
    focusSearch();
  });

  const { element: DeleteButton } = useRegisterAction(
    "Delete search query",
    "shift+cmd+f",
    () => {
      setQuery(null);
      setKey(null);
      focusSearch();
    },
  );

  useEffect(() => {
    const search = (query: string, key: FuseOptionKey<T> | null) => {
      const options: IFuseOptions<T> = {
        includeScore: true,
        // @ts-ignore
        keys: key ? [key] : keys,
        threshold: key ? 0.2 : 0.5,
      };

      const fuse = new Fuse(list, options);
      const result = fuse.search(query);

      const documents: T[] = result.map((result) => result.item) || [];
      const searchResults = query.length > 1 ? documents : (list as T[]);
      onResult(searchResults, query);
    };

    search(query || "", key);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, key]);

  return (
    <div
      data-testid="Search"
      data-component-name="Search"
      aria-labelledby="search"
      id="search-box"
      className="gap-2 p-4 ring-1 ring-white"
    >
      <DeleteButton />
      <label id="search" htmlFor="search-query">
        Search documents
      </label>
      <input
        id="search-query"
        ref={ref}
        type="text"
        spellCheck="false"
        autoCorrect="false"
        className="bg-transparent"
        onKeyDown={(event) => {
          if (event.code !== "Enter") {
            return true;
          }
          onConfirm();
          event.preventDefault();
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
