import {
	ComponentPropsWithoutRef,
	DependencyList,
	useContext,
	useEffect,
} from 'react'
import {
	ActionCallback,
	ActionConfiguration,
	renderAction,
	renderActionWithShortcut,
} from './actions-registry'
import { ActionsContext } from '../../components/Actions/Actions'
import { ActionReducerAction } from './actions-reducer'
import { useHotkeys } from '../../utils/hotkeys'

// function actionCallbackWithAnnounce(callback: ActionCallback) {
//   const announce = (value: boolean) => {
//     if (!value) {
//       announceError();
//     }
//   };

//   const value = callback();
//   if ((value as Promise<boolean | void>)["then"] !== undefined) {
//     const asyncValue = value as Promise<boolean | void>;
//     asyncValue.then((value) => {
//       if (typeof value === "boolean") {
//         announce(value);
//       }
//     });
//   } else {
//     const sycnValue = value as boolean | void;
//     if (typeof sycnValue === "boolean") {
//       announce(sycnValue);
//     }
//   }
// }

export function useInjectedScopedAction(
	dispatch: React.Dispatch<ActionReducerAction>,
	label: string,
	shortcut: string,
	callback: ActionCallback,
	condition = true,
	dependancies: DependencyList = [],
) {
	const wrappedCallback = () => {
		if (condition) {
			callback(action)
		}
	}

	const action: ActionConfiguration = {
		label,
		shortcut,
		callback: wrappedCallback,
		hidden: false,
	}

	useHotkeys(shortcut, wrappedCallback)
	useEffect(() => {
		if (condition) {
			dispatch({ type: 'register', action })
		}

		return () => {
			dispatch({ type: 'unscope', action })
		}
	}, [condition, ...dependancies])

	const element = (props: ComponentPropsWithoutRef<'button'>) =>
		renderAction({ ...action, ...props })

	const elementWithShortcut = (props: ComponentPropsWithoutRef<'button'>) =>
		renderActionWithShortcut({ ...action, ...props })

	return { callback, element, elementWithShortcut } as const
}

export function useConditionalScopedAction(
	label: string,
	shortcut: string,
	condition: boolean,
	callback: ActionCallback,
) {
	const [_, dispatch] = useContext(ActionsContext)
	const { element, elementWithShortcut } = useInjectedScopedAction(
		dispatch,
		label,
		shortcut,
		callback,
		condition,
	)

	return { callback, element, elementWithShortcut } as const
}

export function useScopedAction(
	label: string,
	shortcut: string,
	callback: ActionCallback,
) {
	const { element, elementWithShortcut } = useConditionalScopedAction(
		label,
		shortcut,
		true,
		callback,
	)

	return { callback, element, elementWithShortcut } as const
}

export function useEffectAction(
	label: string,
	shortcut: string,
	callback: ActionCallback,
	dependancies: DependencyList,
) {
	const [_, dispatch] = useContext(ActionsContext)
	const { element, elementWithShortcut } = useInjectedScopedAction(
		dispatch,
		label,
		shortcut,
		callback,
		true,
		dependancies,
	)

	return { callback, element, elementWithShortcut } as const
}
