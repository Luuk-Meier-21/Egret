export enum FocusMode {
	High = 0, // default
	Low = 1,
}

export const FOCUS_MODE_MAPPING = [
	{
		value: FocusMode.High,
		label: 'High contrast focus (default)',
	},
	{
		value: FocusMode.Low,
		label: 'Normal contrast focus',
	},
]

export const FOCUS_STORAGE_KEY = 'focus-contrast-level'

export function getFocusMode(): FocusMode {
	const focusNumber = Number(localStorage.getItem(FOCUS_STORAGE_KEY))

	return focusNumber ?? FocusMode.High
}

export function setFocusMode(mode: FocusMode): void {
	localStorage.setItem(FOCUS_STORAGE_KEY, `${mode}`)
}
