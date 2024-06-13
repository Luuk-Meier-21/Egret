export const ARIA_DETAIL_STORAGE_KEY = "aria-detail-level";

export enum AriaDetail {
  Low = 0, // Auditive clues only
  Medium = 1, // Clues + short labels
  High = 2, // Clues + detailed labels
}

export const ARIA_DETAIL_MAPPING = [
  {
    value: AriaDetail.Low,
    label: "Low detail",
  },
  {
    value: AriaDetail.Medium,
    label: "Medium detail",
  },
  {
    value: AriaDetail.High,
    label: "High detail",
  },
];

export function ariaDetail(): AriaDetail {
  const detailNumber = Number(localStorage.getItem(ARIA_DETAIL_STORAGE_KEY));

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
