import { ForwardedRef, ReactNode, forwardRef, useRef, useState } from "react";
import Search from "../Search/Search";

interface SearchListProps<T> {
  list: T[];
  label: string;
  searchKeys: string[];
  renderItem: (item: T) => ReactNode;
  onSearchConfirm?: () => void;
}

function SearchListInner<T>(
  { list, label, searchKeys, renderItem }: SearchListProps<T>,
  ref: ForwardedRef<HTMLInputElement>,
) {
  const [filteredList, setFiltered] = useState(list);
  const listRef = useRef<HTMLUListElement>(null);

  return (
    <div data-component-name="SearchList" className="p-4 ring-1 ring-white">
      <section>
        <ul ref={listRef} className="pb-4" role="menu">
          {filteredList.map((item, index) => (
            <li key={index}>{renderItem(item)}</li>
          ))}
        </ul>
      </section>
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
    </div>
  );
}

const SearchList = forwardRef(SearchListInner) as <T>(
  props: SearchListProps<T> & { ref?: ForwardedRef<HTMLInputElement> },
) => ReturnType<typeof SearchListInner>;

export default SearchList;
