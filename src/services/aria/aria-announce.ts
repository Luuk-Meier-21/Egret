type AriaAnnouncementDestructor = () => void;

export function ariaAnnounce(message: string): AriaAnnouncementDestructor {
	const liveRegion = document.getElementById('live-region');

	if (liveRegion === null) {
		return () => {};
	}

	liveRegion.textContent = '';
	liveRegion.textContent = message;

	return () => {
		liveRegion.innerHTML = '';
	};
}
