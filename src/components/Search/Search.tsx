import Fuse, { FuseOptionKey, IFuseOptions } from "fuse.js";
import {
  ForwardedRef,
  KeyboardEvent,
  MutableRefObject,
  forwardRef,
  useEffect,
  useRef,
  useState,
} from "react";
import { useRegisterAction } from "../../services/actions/actions-registry";
import { keyAction } from "../../config/shortcut";
import { useScopedAction } from "../../services/actions/actions-hook";

interface SearchProps<T> {
  list: ReadonlyArray<T>;
  keys: FuseOptionKey<T>;
  label: string;
  onResult?: (results: T[], query: string) => void;
  onKeyDown?: (event: KeyboardEvent<HTMLInputElement>) => void;
  onConfirm?: () => void;
}

function SearchInner<T>(
  {
    list,
    keys,
    label,
    onResult = () => {},
    onKeyDown = () => {},
    onConfirm = () => {},
  }: SearchProps<T>,
  externalRef: ForwardedRef<HTMLInputElement>,
) {
  const ref = (externalRef ||
    useRef(null)) as MutableRefObject<HTMLInputElement | null>;
  const [query, setQuery] = useState<string | null>(null);
  const [key, _setKey] = useState<FuseOptionKey<T> | null>(null);

  const focusSearch = () => {
    const element = ref?.current;

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

  useScopedAction(`Remove search query ${label}`, "Backspace", () => {
    setQuery(null);
  });

  useScopedAction(`Focus search ${label}`, keyAction("f"), () => {
    focusSearch();
  });

  return (
    <div
      data-testid="Search"
      data-component-name="Search"
      id="search-box"
      aria-labelledby="search"
      className="rounded-rem box-light flex px-5 py-4 text-white"
    >
      <label id="search" htmlFor="search-query" className="hidden">
        {label}
      </label>
      <input
        id="search-query"
        ref={ref}
        type="search"
        placeholder={`${label}...`}
        autoFocus
        spellCheck="false"
        autoCorrect="false"
        className="w-full bg-transparent selection:outline-none placeholder:text-white/50 focus:outline-none [&::-webkit-search-cancel-button]:hidden"
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
      <span role="tooltip" className="whitespace-nowrap text-white/50">
        command + f
      </span>
    </div>
  );
}

export const Search = forwardRef(SearchInner) as <T>(
  props: SearchProps<T> & { ref?: ForwardedRef<HTMLInputElement> },
) => ReturnType<typeof SearchInner>;

export default Search;
