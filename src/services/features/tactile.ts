import { closeCompanionSocket, openCompanionSocket } from '../../bindings';
import { keyExplicitNavigation } from '../../config/shortcut';
import { useConditionalScopedAction } from '../actions/actions-hook';
import { clientEndpoint } from '../socket/tactile-socket';
import { useFeature } from './features';
import { emit } from '@tauri-apps/api/event';

export default function useTactileFeatures(env: Record<string, any>) {
	const hasFeature = useFeature(env, 'tactile');

	useConditionalScopedAction(
		'Start tactile mode',
		keyExplicitNavigation('9'),
		hasFeature,
		async () => {
			await openCompanionSocket();

			console.log(clientEndpoint(window.location.hostname));
		},
	);

	useConditionalScopedAction(
		'Stop tactile mode',
		keyExplicitNavigation('8'),
		hasFeature,
		async () => {
			await closeCompanionSocket();
		},
	);

	useConditionalScopedAction(
		'Refresh event',
		keyExplicitNavigation('left'),
		hasFeature,
		async () => {
			emit('refresh-client', 'none');
		},
	);

	// useEffect(() => {
	// 	const focusCallback = (e: any) => {
	// 		navigator.focusColumn(e.payload.row_id, e.payload.column_id)
	// 	}

	// 	const unlistenFocus = listen('focus', focusCallback)
	// 	return () => {
	// 		unlistenFocus.then((f) => f())
	// 	}

	// 	// No dependancy array! Function needs to be redefined on every effect, otherwise it will use stale state when fired.
	// 	// https://stackoverflow.com/questions/57847594/accessing-up-to-date-state-from-within-a-callback
	// })
	// }

	// const layoutIsChanged = (layout: SanitizedLayout): boolean => {
	//   return (
	//     layout.tree.length > 0 &&
	//     JSON.stringify(layout) !== JSON.stringify(layoutCache.current)
	//   );
	// };

	// useStrictEffect(
	// 	() => {
	// 		if (hasFeature) {
	// 			setLayoutState(sanitizeLayout(layout)).then(() => {})
	// 		}
	// 	},
	// 	([layout]) =>
	// 		deepJSONClone(flattenLayoutNodesByReference(layout.tree)).length,
	// 	[layout],
	// )
}
