import { insertOrUpdateBlock } from '@blocknote/core';
import { createReactBlockSpec } from '@blocknote/react';
import { schema } from '../../blocks/schema';
import { ReactNode, useEffect, useRef } from 'react';
import { BlockComponentProps } from '../../types/block';
import { ariaAnnounce } from '../../services/aria/aria-announce';
import { useBlockLive, useBlockSelection } from '../../utils/block';
import { useConditionalScopedAction } from '../../services/actions/actions-hook';
import { keyAction, keyExplicitAction } from '../../config/shortcut';
import { useNavigate } from 'react-router';
import { navigateDropState } from '../../utils/navigation';

export const insertRow = (editor: typeof schema.BlockNoteEditor) => ({
	title: 'Reference',
	onItemClick: () => {
		insertOrUpdateBlock(editor, {
			// @ts-ignore
			type: 'reference',
		});
	},
	aliases: ['Reference'],
	group: 'Other',
});

const referenceConfig = {
	type: 'reference',
	propSchema: {
		documentId: {
			default: '',
		},
	},
	content: 'inline',
} as const;

function rowComponent({
	contentRef,
	editor,
	block,
}: BlockComponentProps<typeof referenceConfig, 'reference'>): ReactNode {
	const ref = useRef<HTMLElement>(null);
	const isSelected = useBlockSelection(editor, block);
	const navigate = useNavigate();

	const text = ref.current?.textContent || '\n';
	const url = `/documents/${block.props.documentId}`;

	useEffect(() => {
		contentRef(ref.current);

		editor.focus();
	}, []);

	const goToDocument = () => {
		navigateDropState(navigate, url);
	};

	useConditionalScopedAction(
		'Go to selected reference',
		keyAction('u'),
		isSelected,
		async () => {
			goToDocument();
		},
	);

	useBlockLive(`reference, ${text}, press (command + u) to open`, isSelected);

	return (
		<a
			onClick={() => {
				goToDocument();
			}}
			data-block="Reference"
			href={url}
			className="inline-block cursor-pointer text-yellow-500 !no-underline"
		>
			<span className="flex">
				<span className="flex" ref={ref} />
				<span
					className="ml-1 flex font-sans"
					contentEditable={false}
					aria-hidden
				>
					→
				</span>
			</span>
		</a>
	);
}

export const Reference = createReactBlockSpec(referenceConfig, {
	render: (props) => rowComponent(props),
});
