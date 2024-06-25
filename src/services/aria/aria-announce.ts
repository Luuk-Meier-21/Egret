export type AriaAnnouncementDestructor = () => void;

export function ariaAnnounce(
	message: string,
	priority: 'polite' | 'assertive' = 'polite',
): AriaAnnouncementDestructor {
	const liveRegion = document.getElementById(`live-region-${priority}`);

	if (liveRegion === null) {
		return () => {};
	}

	liveRegion.textContent = '';
	liveRegion.textContent = message;

	return () => {
		liveRegion.innerHTML = '';
	};
}
