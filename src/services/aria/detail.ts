export const ARIA_DETAIL_STORAGE_KEY = "aria-detail-level";

export enum AriaDetail {
  Low = 1, // Auditive clues only
  Medium = 2, // Clues + short labels
  High = 3, // Clues + detailed labels
}

export function ariaDetail(): AriaDetail {
  const detailNumber = Number(localStorage.getItem("aria-detail-level"));

  return Object.values(AriaDetail).includes(detailNumber)
    ? detailNumber
    : AriaDetail.High;
}

export function setAriaDetail(detail: AriaDetail) {
  localStorage.setItem(ARIA_DETAIL_STORAGE_KEY, `${detail}`);
}

export function ariaDetailMapping(
  ...labelsLowToHigh: [string | undefined, string, string]
): string {
  const detail = ariaDetail();

  return labelsLowToHigh[detail - 1] || "";
}
