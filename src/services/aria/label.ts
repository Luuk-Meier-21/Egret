import { ariaDetailMapping } from "./detail";

export function ariaList(length: number): string {
  if (length <= 1) {
    return ariaDetailMapping(undefined, "Full width", "Full width of document");
  }

  return ariaDetailMapping(
    undefined,
    `${length} items`,
    `List ${length} items`,
  );
}

export function ariaItemOfList(itemNumber: number, length: number): string {
  return ariaDetailMapping(
    undefined,
    `${itemNumber} of ${length}`,
    `item ${itemNumber} of ${length}`,
  );
}
