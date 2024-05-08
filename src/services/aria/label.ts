type AriaLine = Record<string, boolean> | string;

const LINE_JOIN_CHARACTER = ", ";

export function ariaLines(...lines: AriaLine[]): string {
  const resolvedLines = lines.map((line) => {
    if (typeof line === "string") {
      return line;
    }

    let lines = Object.entries(line)
      .map(([lineString, condition]) => {
        if (condition) {
          return lineString;
        }
      })
      .filter((item) => typeof item === "string");

    return lines.join(LINE_JOIN_CHARACTER);
  });

  return resolvedLines.filter((item) => !!item).join(LINE_JOIN_CHARACTER);
}

export function ariaList(length: number): string {
  if (length <= 1) {
    return `Full width`;
  }

  return `List ${length} items`;
}

export function ariaItemOfList(itemNumber: number, length: number): string {
  return `${itemNumber} of ${length}`;
}
