import { ReactNode, useRef, useState } from "react";
import Search from "../Search/Search";

interface SearchListProps<T> {
  list: T[];
  label: string;
  searchKeys: string[];
  renderItem: (item: T) => ReactNode;
  onSearchConfirm?: () => void;
}

function SearchList<T>({
  list,
  label,
  searchKeys,
  renderItem,
}: SearchListProps<T>) {
  const [filteredList, setFiltered] = useState(list);
  const ref = useRef<HTMLUListElement>(null);

  return (
    <div data-component-name="SearchList" className="p-4 ring-1 ring-white">
      <section>
        <ul ref={ref} className="pb-4" role="menu">
          {filteredList.map((item, index) => (
            <li key={index}>{renderItem(item)}</li>
          ))}
        </ul>
      </section>
      <Search
        label={label}
        list={list}
        keys={searchKeys}
        onConfirm={() => {
          ref.current?.querySelector("button")?.focus();
        }}
        onResult={(results) => {
          // Currently all documents go tru search, this might not be the best idea
          setFiltered(results);
        }}
      />
    </div>
  );
}
export default SearchList;
