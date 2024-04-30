import {
  ForwardedRef,
  KeyboardEvent,
  ReactNode,
  forwardRef,
  useRef,
  useState,
} from "react";
import Search from "../Search/Search";

interface SearchListProps<T> {
  list: T[];
  label: string;
  searchKeys: string[];
  renderItem: (item: T) => ReactNode;
  onSearchConfirm?: () => void;
  onKeyDown?: (event: KeyboardEvent<HTMLInputElement>) => void;
  searchPosition?: "top" | "bottom";
}

function SearchListInner<T>(
  {
    list,
    label,
    searchKeys,
    renderItem,
    onKeyDown,
    searchPosition = "bottom",
  }: SearchListProps<T>,
  ref: ForwardedRef<HTMLInputElement>,
) {
  const [filteredList, setFiltered] = useState(list);
  const listRef = useRef<HTMLUListElement>(null);

  return (
    <div data-component-name="SearchList">
      {searchPosition === "top" && (
        <Search
          label={label}
          list={list}
          ref={ref}
          keys={searchKeys}
          onConfirm={() => {
            listRef?.current?.querySelector("button")?.focus();
          }}
          onKeyDown={onKeyDown}
          onResult={(results) => {
            // Currently all documents go tru search, this might not be the best idea
            setFiltered(results);
          }}
        />
      )}
      <div className="p-4 ring-1 ring-white">
        <ul ref={listRef} className="pb-4">
          {filteredList.map((item, index) => (
            <li key={index}>{renderItem(item)}</li>
          ))}
        </ul>
      </div>
      {searchPosition === "bottom" && (
        <Search
          label={label}
          list={list}
          ref={ref}
          keys={searchKeys}
          onConfirm={() => {
            listRef?.current?.querySelector("button")?.focus();
          }}
          onResult={(results) => {
            // Currently all documents go tru search, this might not be the best idea
            setFiltered(results);
          }}
        />
      )}
    </div>
  );
}

const SearchList = forwardRef(SearchListInner) as <T>(
  props: SearchListProps<T> & { ref?: ForwardedRef<HTMLInputElement> },
) => ReturnType<typeof SearchListInner>;

export default SearchList;
