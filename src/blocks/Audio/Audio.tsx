import { insertOrUpdateBlock } from '@blocknote/core';
import { createReactBlockSpec } from '@blocknote/react';
import { schema } from '../../blocks/schema';
import { ReactNode, useEffect, useRef } from 'react';
import { BlockComponentProps } from '../../types/block';
import {
	useBlockAnnounce,
	useBlockLive,
	useBlockSelection,
} from '../../utils/block';
import { keyAction } from '../../config/shortcut';
import { formatShortcutsForSpeech } from '../../utils/speech';
import { useConditionalScopedAction } from '../../services/actions/actions-hook';

export const insertRow = (editor: typeof schema.BlockNoteEditor) => ({
	title: 'Audio',
	onItemClick: () => {
		insertOrUpdateBlock(editor, {
			// @ts-ignore
			type: 'audio',
		});
	},
	aliases: ['Audio'],
	group: 'Other',
});

const audioConfig = {
	type: 'audio',
	propSchema: {
		src: {
			default: '',
		},
	},
	content: 'inline',
} as const;

function rowComponent({
	contentRef,
	editor,
	block,
}: BlockComponentProps<typeof audioConfig, 'audio'>): ReactNode {
	const ref = useRef<HTMLParagraphElement>(null);
	const audioRef = useRef<HTMLAudioElement>(null);
	const isSelected = useBlockSelection(editor, block);

	const src = block.props.src;
	const text = ref.current?.textContent;

	const playShortcut = keyAction('Space');

	useEffect(() => {
		contentRef(ref.current);

		editor.focus();
	}, []);

	useConditionalScopedAction(
		'Toggle audio fragment',
		playShortcut,
		isSelected,
		() => {
			audioRef.current?.paused
				? audioRef.current?.play()
				: audioRef.current?.pause();
		},
	);

	useBlockLive(`audio, ${text}`, isSelected, 'assertive');

	useBlockAnnounce(
		'polite',
		`You are currently on a audio fragment, press (${formatShortcutsForSpeech(playShortcut.split('+')).join(' + ')}) to toggle play/pause`,
		isSelected,
		2000,
	);

	return (
		<div
			data-block="Audio"
			className="relative my-2 w-full rounded-lg text-inherit"
		>
			<audio
				className="mb-2 block w-[200px]"
				controlsList="play noplaybackrate noremoteplayback nofullscreen"
				controls
				ref={audioRef}
				src={src}
			></audio>
			<span className="mt-2 text-sm italic" ref={ref} />
		</div>
	);
}

export const Audio = createReactBlockSpec(audioConfig, {
	render: (props) => rowComponent(props),
});
