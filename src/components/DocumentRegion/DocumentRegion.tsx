import {
	DocumentRegionData,
	DocumentRegionUserLandmark,
} from '../../types/document/document'
import { schema } from '../../blocks/schema'
import { shell } from '@tauri-apps/api'
import { polyfillTiptapBreaking, toggleBlock } from '../../utils/block'
import { useEditorAutoSaveHandle } from '../../utils/editor'
import { IBlockEditor } from '../../types/block'
import { useContext, useEffect, useRef, useState } from 'react'
import { keyAction, keyExplicitAction } from '../../config/shortcut'
import { BlockNoteView, useCreateBlockNote } from '@blocknote/react'
import { useConditionalScopedAction } from '../../services/actions/actions-hook'
import { insertOrUpdateBlock } from '@blocknote/core'
import { voiceSay } from '../../bindings'
import { toDataURL } from '../../utils/url'
import { announceError } from '../../utils/error'
import { openAsset } from '../../utils/filesystem'
import { prompt } from '../../services/window/window-manager'
import { EnvContext } from '../EnvProvider/EnvProvider'
import clsx from 'clsx'
import { FocusMode, getFocusMode } from '../../services/focus/focus'
import { emitEvent, regionInEditEvent } from '../../services/document/event'

interface DocumentRegionProps {
	region: DocumentRegionData
	onSave?: (region: DocumentRegionData, editor: IBlockEditor) => void
	onChange?: (region: DocumentRegionData, editor: IBlockEditor) => void
	onFocus: (region: DocumentRegionData, editor: IBlockEditor) => void
	onAddLandmark: (
		region: DocumentRegionData,
		landmark: DocumentRegionUserLandmark,
	) => void
	onBlur: (region: DocumentRegionData, editor: IBlockEditor) => void
	isFocused: boolean
	isEditing: boolean
	label?: string
}

function DocumentRegion({
	region,
	onSave = () => {},
	onChange = () => {},
	onAddLandmark = () => {},
	isFocused = false,
	isEditing = false,
	onFocus,
	onBlur,
	label,
}: DocumentRegionProps) {
	const env = useContext(EnvContext)

	const ref = useRef<HTMLDivElement>(null)
	const editButton = useRef<HTMLButtonElement>(null)

	const hasFeature = (key: string) =>
		env?.features?.value ? env?.features?.value?.includes(key) ?? false : false

	const editor = useCreateBlockNote({
		schema,
		initialContent: region.blocks,
	})

	const regionWithCurrentBlock = (): DocumentRegionData => ({
		...region,
		blocks: editor.document,
	})

	const autoSave = () => {
		onSave(regionWithCurrentBlock(), editor)
	}

	useEditorAutoSaveHandle(editor, autoSave)

	const focus = () => {
		try {
			editButton.current?.focus()
			editor.focus()
		} catch (error) {
			console.info(`Unable to focus: (${region.label || region.id})`)
		}
	}

	useEffect(() => {
		if (isFocused) {
			focus()
		}
	}, [isFocused, isEditing])

	useEffect(() => {
		editor._tiptapEditor.on('create', () => {
			if (isFocused) {
				focus()
			}
		})
	})

	editor.onEditorContentChange(() => {
		onChange(regionWithCurrentBlock(), editor)
	})

	useConditionalScopedAction(
		'Selection to title',
		keyAction('b'),
		isFocused,
		() => {
			if (!editor.isFocused()) {
				return
			}
			const selectedBlock = editor.getTextCursorPosition().block
			toggleBlock(editor, selectedBlock, {
				type: 'title',
			})
		},
	)

	useConditionalScopedAction(
		'Open selected url',
		keyAction('u'),
		isFocused,
		() => {
			const url = editor.getSelectedLinkUrl()
			if (url === undefined) {
				return
			}
			shell.open(url)
		},
	)

	useConditionalScopedAction(
		'Open selected url',
		keyExplicitAction('u'),
		isFocused,
		() => {
			const url = editor.getSelectedLinkUrl()
			if (url === undefined) {
				return
			}
			shell.open(url)
		},
	)

	useConditionalScopedAction(
		'Insert image by url',
		keyAction('o'),
		isFocused,
		async () => {
			if (!editor.isFocused()) {
				return
			}

			try {
				const url = await openAsset('Select a Image', [
					{
						name: 'Image',
						extensions: ['png', 'jpg', 'jpeg', 'pdf', 'svg'],
					},
				])

				insertOrUpdateBlock(editor, {
					type: 'image',
					props: {
						src: url,
					},
				})

				editor.focus()
			} catch (error) {
				announceError()
				console.error(error)
			}
		},
	)

	useConditionalScopedAction(
		'Insert image as embed',
		keyExplicitAction('o'),
		isFocused,
		async () => {
			if (!editor.isFocused()) {
				return
			}

			try {
				const url = await openAsset('Select a Image', [
					{
						name: 'Image',
						extensions: ['png', 'jpg', 'jpeg', 'pdf', 'svg'],
					},
				])
				const dataUrl = await toDataURL(url)

				insertOrUpdateBlock(editor, {
					type: 'image',
					props: {
						src: dataUrl,
					},
				})

				editor.focus()
			} catch (error) {
				announceError()
				console.error(error)
			}
		},
	)

	useConditionalScopedAction(
		'Insert audio fragment',
		keyAction('i'),
		isFocused,
		async () => {
			if (!editor.isFocused()) {
				return
			}

			try {
				const url = await openAsset('Select a Image', [
					{
						name: 'Audio',
						extensions: ['png', 'jpg', 'jpeg', 'pdf', 'svg'],
					},
				])

				insertOrUpdateBlock(editor, {
					type: 'image',
					props: {
						src: url,
					},
				})

				editor.focus()
			} catch (error) {
				announceError()
				console.error(error)
			}
		},
	)

	useConditionalScopedAction(
		'Insert dummy text',
		keyExplicitAction("'"),
		isFocused,
		async () => {
			if (!editor.isFocused()) {
				return
			}

			// Proxy of: https://loripsum.net/
			const response = await fetch('/api/dummy-text/1/plaintext')
			const text = await response.text()

			const selectedBlock = editor.getTextCursorPosition().block
			editor.insertBlocks(
				[
					{
						type: 'paragraph',
						content: text.trim() || '',
					},
				],
				selectedBlock,
			)
		},
	)

	useConditionalScopedAction(
		`Add landmark`,
		keyExplicitAction('l'),
		isFocused && hasFeature('landmark'),
		async () => {
			const label = await prompt('label', 'Landmark label')

			if (label === null) {
				announceError()
				return
			}

			onAddLandmark(region, {
				label,
			})
		},
	)

	const getPreviewText = (): string | undefined => {
		const maxWords = 5

		if (polyfillTiptapBreaking(editor)) {
			return
		}

		const innerText = editor.domElement.innerText
		const words = innerText.match(/([^\s]+)/g) || []

		if (words.join(' ').length <= 0) {
			return
		}

		if (words.length > maxWords) {
			return `${words.slice(0, maxWords).join(' ')}…`
		}

		return words.join(' ')
	}

	const focusMode = getFocusMode()
	const classes = clsx({
		'input-hint group relative w-full p-5 data-[focused]:text-black data-[focused]:bg-white':
			focusMode === FocusMode.High,
		'input-hint group relative w-full p-5 data-[focused]:bg-gray-400':
			focusMode === FocusMode.Low,
	})

	/**
	 * Component renders a visual and a voice assisted (VA) version.
	 * - VA:      a button containing x words from the editors content, finetuned for VA users.
	 * - Visual:  the complete editor content is shown to visual users or collaborators.
	 *
	 * In both cases a user needs to confirm edit to change the content.
	 * */

	return (
		<section
			data-component-name="DocumentDetail"
			aria-current="page"
			lang="en"
			data-focused={isFocused || undefined}
			data-editing={isEditing || undefined}
			ref={ref}
			aria-label={label}
			className={classes}
		>
			{region.landmark && (
				<span
					aria-hidden="true"
					className="absolute left-4 right-4 top-0 block text-sm opacity-50"
				>
					Landmark: {region.landmark?.label}
				</span>
			)}
			<div aria-hidden={!isEditing ? 'true' : undefined}>
				<BlockNoteView
					id={region.id}
					data-editor
					className="mx-auto flex h-full w-full max-w-[46em] rounded-sm outline-none ring-1 ring-transparent ring-transparent group-data-[editing]:ring-white/50 [&_*]:outline-none"
					editor={editor}
					slashMenu={false}
					sideMenu={false}
					formattingToolbar={false}
					hyperlinkToolbar={false}
					editable={isEditing}
					aria-hidden={!isEditing ? 'true' : undefined}
					onKeyDown={(event) => {
						if (event.key === 'Escape') {
							onSave(region, editor)
						}
					}}
					onBlur={() => {
						if (!isFocused) {
							onBlur(region, editor)
						}
					}}
				/>
			</div>
			{!isEditing && (
				<button
					ref={editButton}
					className="absolute inset-0 text-left outline-none"
					onClick={() => {
						onFocus(region, editor)
						focus()
						emitEvent(regionInEditEvent(region))
					}}
					onFocus={() => {
						onFocus(region, editor)
						focus()
					}}
					onBlur={() => {
						onBlur(region, editor)
						// stopEdit()
					}}
					aria-label={getPreviewText() || 'Blank'}
				></button>
			)}
		</section>
	)
}

export default DocumentRegion
