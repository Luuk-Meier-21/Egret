import {
	layoutDeleteNode,
	layoutInsertColumn,
	layoutInsertRow,
	useLayoutBuilder,
} from '../../services/layout/layout-builder'
import { useLayoutNavigator } from '../../services/layout/layout-navigation'
import { useLayoutState } from '../../services/layout/layout-state'
import { useDocumentViewLoader } from '../../services/loader/loader'
import { LayoutNodeData } from '../../types/layout/layout'
import { useStateStore } from '../../services/store/store-hooks'
import {
	defaultFsOptions,
	pathInDirectory,
	pathOfDocumentsDirectory,
} from '../../services/store/store'
import { useNavigate } from 'react-router'
import { DocumentRegionData } from '../../types/document/document'
import {
	useEffectAction,
	useScopedAction,
} from '../../services/actions/actions-hook'
import {
	keyAction,
	keyExplicitAction,
	keyExplicitNavigation,
	keyNavigation,
} from '../../config/shortcut'
import { systemSound } from '../../bindings'
import { removeDir } from '@tauri-apps/api/fs'
import { announceError } from '../../utils/error'
import { Suspense, useContext, useEffect, useMemo } from 'react'
import { EnvContext } from '../EnvProvider/EnvProvider'
import { LayoutBranchOrNode } from '../LayoutBranch/LayoutBranch'
import { generateDocumentRegion } from '../../services/document/document-generator'
import { ariaLines } from '../../services/aria/aria'

import { FOCUS_MODE_MAPPING, setFocusMode } from '../../services/focus/focus'
import { selectConfigFromMapping } from '../../utils/config'
import useExportFeatures from '../../services/features/export'
import useFindLandmarkFeatures from '../../services/features/landmark'
import useTactileFeatures from '../../services/features/tactile'
import { useLayoutAutoSaveHandle } from '../../services/layout/layout-saving'
import DocumentRegion from '../DocumentRegion/DocumentRegion'
import { listen } from '@tauri-apps/api/event'
import { RegionEvent, RegionEventPayload } from '../../services/document/event'
import { useAriaLabel } from '../../services/aria/detail'
import { prompt, selectSingle } from '../../services/window/window-manager'

interface DocumentDetailProps {}

// update is sync with state when document is open
// when navigating out of document to / or other document state updates to (presumably) the state that was active when first opend

function DocumentDetail({}: DocumentDetailProps) {
	const [directory, _staticDocumentData, staticLayout, _keywords] =
		useDocumentViewLoader()

	const env = useContext(EnvContext)
	const builder = useLayoutBuilder(staticLayout)
	const selection = useLayoutState(builder.layout)
	const navigator = useLayoutNavigator(selection, builder.layout)
	const aria = useAriaLabel()

	const navigate = useNavigate()
	const save = useStateStore(
		builder.layout,
		pathInDirectory(directory, 'layout.json'),
	)

	useLayoutAutoSaveHandle(builder.layout, save)

	const deleteNode = (force: boolean = false) =>
		layoutDeleteNode(navigator, builder, selection, force)
	const insertRow = (position: 'before' | 'after') =>
		layoutInsertRow(navigator, builder, selection, position)
	const insertColumn = (position: 'before' | 'after') =>
		layoutInsertColumn(navigator, builder, selection, position)

	const handleRegionSave = (
		region: DocumentRegionData,
		node: LayoutNodeData,
	) => {
		builder.insertContent(region, node)
	}

	const handleRegionChange = (
		region: DocumentRegionData,
		node: LayoutNodeData,
	) => {
		builder.insertContent(region, node)
	}

	useScopedAction('Save document', keyAction('s'), async () => {
		await save()
		systemSound('Glass', 1, 1, 1)
	})

	useScopedAction(
		'Delete document',
		keyExplicitAction('backspace'),
		async () => {
			console.log('hi')
			const confirmText = 'document'
			const text = await prompt(
				'Confirm deletion',
				`Type the word '${confirmText}' to confirm deletion`,
			)
			if (confirmText !== text) {
				announceError()
				return
			}

			await removeDir(pathOfDocumentsDirectory(directory.fileName), {
				...defaultFsOptions,
				recursive: true,
			})

			navigate('/')
		},
	)

	const layoutDependancies = [selection.rowId, selection.nodeId]

	useEffectAction(
		'Move up',
		keyNavigation('up'),
		async () => {
			navigator.focusRowUp()
		},
		layoutDependancies,
	)

	useEffectAction(
		'Move down',
		keyNavigation('down'),
		async () => {
			navigator.focusRowDown()
		},
		layoutDependancies,
	)

	useEffectAction(
		'Move left',
		keyNavigation('left'),
		async () => {
			navigator.focusColumnLeft()
		},
		layoutDependancies,
	)

	useEffectAction(
		'Move right',
		keyNavigation('right'),
		async () => {
			navigator.focusColumnRight()
		},
		layoutDependancies,
	)

	useEffectAction(
		'Delete empty column',
		keyNavigation('backspace'),
		async () => {
			deleteNode()
		},
		layoutDependancies,
	)

	useEffectAction(
		'Force delete node',
		keyExplicitNavigation('backspace'),
		async () => {
			deleteNode(true)
		},
		layoutDependancies,
	)

	useEffectAction(
		'Insert row above',
		keyExplicitNavigation('up'),
		async () => {
			insertRow('before')
		},
		layoutDependancies,
	)

	useEffectAction(
		'Insert row under',
		keyExplicitNavigation('down'),
		async () => {
			insertRow('after')
		},
		layoutDependancies,
	)

	useEffectAction(
		'Insert column left',
		keyExplicitNavigation('left'),
		async () => {
			insertColumn('before')
		},
		layoutDependancies,
	)

	useEffectAction(
		'Insert column right',
		keyExplicitNavigation('right'),
		async () => {
			insertColumn('after')
		},
		layoutDependancies,
	)

	useScopedAction(`Set focus contrast`, keyExplicitAction('0'), async () => {
		const succes = await selectConfigFromMapping(
			FOCUS_MODE_MAPPING,
			setFocusMode,
		)
		if (!succes) {
			announceError()
		}
	})

	// Experimental features:
	useExportFeatures(env, directory)
	useFindLandmarkFeatures(env, builder.layout, selection)
	useTactileFeatures(env, builder.layout, navigator)

	useEffect(() => {
		const inEditListener = listen<RegionEventPayload>(
			RegionEvent.IN_EDIT,
			(event) => {
				if (event.payload.region) {
					selection.setEditing(true)
				} else {
					selection.setEditing(false)
				}
			},
		)

		return () => {
			inEditListener.then((func) => func())
		}
	}, [])

	return (
		<div data-component-name="DocumentDetail">
			<main className="bento-dark overflow-hidden font-serif text-base tracking-[0.01em] text-white prose-headings:mb-3 prose-headings:text-2xl prose-headings:font-normal prose-p:mb-3 prose-a:text-yellow-500 prose-a:underline [&_figcaption]:mt-1 [&_figcaption]:italic [&_img]:rounded-sm">
				<div className="divide-y-[1px] divide-white/20">
					{builder.layout.tree.map((branchOrNode, rowIndex) => (
						<LayoutBranchOrNode
							key={branchOrNode.id}
							value={branchOrNode}
							renderNode={(node, columnIndex, columnLength) => {
								const isFocused = node.id === selection.nodeId
								const isEditing = isFocused && selection.isEditing
								const data = node.data || generateDocumentRegion({})
								const label = ariaLines({
									[`${data.landmark?.label}`]: data.landmark !== undefined,
									[aria.list(columnLength)]: columnIndex <= 0 && isFocused,
									[aria.itemOfList(columnIndex + 1, columnLength)]:
										columnLength > 1,
								})

								return (
									<DocumentRegion
										label={label}
										isFocused={isFocused}
										isEditing={isEditing}
										onSave={(region, _editor) => {
											handleRegionSave(region, node)
										}}
										onChange={(region) => {
											handleRegionChange(region, node)
										}}
										onAddLandmark={(_region, landmark) => {
											builder.addLandmark(node, landmark)
										}}
										onFocus={() => {
											navigator.focusColumn(branchOrNode.id, node.id)
										}}
										onBlur={() => {
											navigator.blurColumn()
										}}
										region={data}
									/>
								)
							}}
						/>
					))}
				</div>
			</main>
		</div>
	)
}
export default DocumentDetail
