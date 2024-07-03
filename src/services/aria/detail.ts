import { useMemo } from 'react';

export const ARIA_DETAIL_STORAGE_KEY = 'aria-detail-level';

export enum AriaDetail {
	Low = 0, // Auditive clues only
	Medium = 1, // Clues + short labels
	High = 2, // Clues + detailed labels
}

export const ARIA_DETAIL_MAPPING = [
	{
		value: AriaDetail.Low,
		label: 'Low detail',
	},
	{
		value: AriaDetail.Medium,
		label: 'Medium detail',
	},
	{
		value: AriaDetail.High,
		label: 'High detail',
	},
];

export function getAriaDetail(): AriaDetail {
	const detailNumber = Number(localStorage.getItem(ARIA_DETAIL_STORAGE_KEY));

	return detailNumber ?? AriaDetail.High;
}

export function setAriaDetail(detail: AriaDetail) {
	localStorage.setItem(ARIA_DETAIL_STORAGE_KEY, `${detail}`);
}

export function ariaDetailMapping(
	detail: AriaDetail,
	labelsLowToHigh: [string | undefined, string, string],
): string {
	return labelsLowToHigh[detail - 1] || '';
}

export function useAriaLabel() {
	const memoizedDetail = useMemo(getAriaDetail, []);

	const mapper = (...labelsLowToHigh: [string | undefined, string, string]) =>
		ariaDetailMapping(memoizedDetail, labelsLowToHigh);

	const list = (length: number): string => {
		if (length <= 1) {
			return mapper(undefined, 'Full width', 'Full width of document');
		}

		return mapper(undefined, `${length} items`, `List ${length} items`);
	};

	const itemOfList = (itemNumber: number, length: number): string => {
		return mapper(
			undefined,
			`${itemNumber} of ${length}`,
			`item ${itemNumber} of ${length}`,
		);
	};

	return {
		mapper,
		list,
		itemOfList,
	} as const;
}
