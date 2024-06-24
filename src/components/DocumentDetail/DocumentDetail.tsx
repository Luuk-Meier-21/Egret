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
import { useScopedAction } from '../../services/actions/actions-hook'
import {
	keyAction,
	keyExplicitAction,
	keyExplicitNavigation,
	keyNavigation,
} from '../../config/shortcut'
import { systemSound } from '../../bindings'
import { removeDir } from '@tauri-apps/api/fs'
import { announceError } from '../../utils/error'
import { Suspense, useContext } from 'react'
import { EnvContext } from '../EnvProvider/EnvProvider'
import { LayoutBranchOrNode } from '../LayoutBranch/LayoutBranch'
import { generateDocumentRegion } from '../../services/document/document-generator'
import { ariaItemOfList, ariaList } from '../../services/aria/label'
import DocumentRegion from '../DocumentRegion/DocumentRegion'
import { ariaLines } from '../../services/aria/aria'

import { FOCUS_MODE_MAPPING, setFocusMode } from '../../services/focus/focus'
import { selectConfigFromMapping } from '../../utils/config'
import useExportFeatures from '../../services/features/export'
import useFindLandmarkFeatures from '../../services/features/landmark'
import useTactileFeatures from '../../services/features/tactile'
import { useLayoutAutoSaveHandle } from '../../services/layout/layout-saving'
import { flattenLayoutNodesByReference } from '../../services/layout/layout-content'

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

	useScopedAction('Move up', keyNavigation('up'), async () => {
		navigator.focusRowUp()
	})

	useScopedAction('Move down', keyNavigation('down'), async () => {
		navigator.focusRowDown()
	})

	useScopedAction('Move left', keyNavigation('left'), async () => {
		navigator.focusColumnLeft()
	})

	useScopedAction('Move right', keyNavigation('right'), async () => {
		navigator.focusColumnRight()
	})

	useScopedAction(
		'Delete empty column',
		keyNavigation('backspace'),
		async () => {
			deleteNode()
		},
	)

	useScopedAction(
		'Force delete node',
		keyExplicitNavigation('backspace'),
		async () => {
			deleteNode(true)
		},
	)

	useScopedAction('Insert row above', keyExplicitNavigation('up'), async () => {
		insertRow('before')
	})

	useScopedAction(
		'Insert row under',
		keyExplicitNavigation('down'),
		async () => {
			insertRow('after')
		},
	)

	useScopedAction(
		'Insert column left',
		keyExplicitNavigation('left'),
		async () => {
			insertColumn('before')
		},
	)

	useScopedAction(
		'Insert column right',
		keyExplicitNavigation('right'),
		async () => {
			insertColumn('after')
		},
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

	return (
		<div data-component-name="DocumentDetail">
			<main className="bento-dark overflow-hidden font-serif text-base tracking-[0.01em] text-white prose-headings:mb-3 prose-headings:text-2xl prose-headings:font-normal prose-p:mb-3 prose-a:text-yellow-500 prose-a:underline [&_figcaption]:mt-1 [&_figcaption]:italic [&_img]:rounded-sm">
				<div className="divide-y-[1px] divide-white/20">
					{/* {flattenLayoutNodesByReference(builder.layout.tree).map((node) => {
						const isFocused = node.id === selection.nodeId

						return (
							<DocumentRegion
								label={'label'}
								isFocused={isFocused}
								region={node.data ?? generateDocumentRegion({})}
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
									// navigator.focusColumn(branchOrNode.id, node.id)
								}}
								onBlur={() => {
									// navigator.blurColumn();
								}}
							/>
						)
					})} */}

					<Suspense>
						{builder.layout.tree.map((branchOrNode, rowIndex) => (
							<LayoutBranchOrNode
								key={branchOrNode.id}
								value={branchOrNode}
								renderNode={(node, columnIndex, columnLength) => {
									const isFocused = node.id === selection.nodeId
									const data = node.data || generateDocumentRegion({})
									const label = ariaLines({
										[`${data.landmark?.label}`]: data.landmark !== undefined,
										[ariaList(columnLength)]: columnIndex <= 0 && isFocused,
										[ariaItemOfList(columnIndex + 1, columnLength)]:
											columnLength > 1,
									})

									return (
										<div>test</div>
										// <DocumentRegion
										// 	label={label}
										// 	isFocused={isFocused}
										// 	onSave={(region, _editor) => {
										// 		handleRegionSave(region, node)
										// 	}}
										// 	onChange={(region) => {
										// 		handleRegionChange(region, node)
										// 	}}
										// 	onAddLandmark={(_region, landmark) => {
										// 		builder.addLandmark(node, landmark)
										// 	}}
										// 	onExplicitAnnounce={() => {
										// 		return `Item ${columnIndex + 1} of Row ${rowIndex + 1} from the top`
										// 	}}
										// 	onImplicitAnnounce={() => {
										// 		return null
										// 	}}
										// 	onFocus={() => {
										// 		navigator.focusColumn(branchOrNode.id, node.id)
										// 	}}
										// 	onBlur={() => {
										// 		// navigator.blurColumn();
										// 	}}
										// 	region={data}
										// />
									)
								}}
							/>
						))}
					</Suspense>
				</div>
			</main>
		</div>
	)
}
export default DocumentDetail
