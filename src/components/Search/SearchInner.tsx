import Fuse, { FuseOptionKey, IFuseOptions } from "fuse.js";
import { ForwardedRef, useEffect, useState } from "react";
import { useRegisterAction } from "../../services/actions/actions-registry";
import { useHotkeyOverride } from "../../utils/hotkeys";
import { useScopedAction } from "../../services/actions/actions-hook";
import { SearchProps } from "./Search";

export function SearchInner<T>(
  {
    list,
    keys,
    label,
    onResult = () => {},
    onKeyDown = () => {},
    onConfirm = () => {},
  }: SearchProps<T>,
  ref: ForwardedRef<HTMLInputElement>,
) {
  const [query, setQuery] = useState<string | null>(null);
  const [key, setKey] = useState<FuseOptionKey<T> | null>(null);

  const focusSearch = () => {
    // @ts-expect-error
    const element = ref.current as HTMLInputElement;

    if (element === null) {
      return;
    }

    element.focus();
  };

  useRegisterAction("Search for document, by title or keyword", "cmd+f", () => {
    focusSearch();
  });

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

  useHotkeyOverride();
  useScopedAction("Backspace", () => {
    setQuery(null);
  });

  useScopedAction();

  return (
    <div
      data-testid="Search"
      data-component-name="Search"
      id="search-box"
      aria-labelledby="search"
      className="gap-2 p-4 ring-1 ring-white"
    >
      <label id="search" htmlFor="search-query">
        {label}
      </label>
      <input
        id="search-query"
        ref={ref}
        type="search"
        autoFocus
        spellCheck="false"
        autoCorrect="false"
        className="bg-transparent"
        onKeyDown={(event) => {
          onKeyDown(event);

          if (event.code !== "Enter") {
            return true;
          }
          onConfirm();
          event.preventDefault();
          return false;
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
