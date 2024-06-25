import { insertOrUpdateBlock } from '@blocknote/core';
import { createReactBlockSpec } from '@blocknote/react';
import { schema } from '../../blocks/schema';
import { ReactNode, useEffect, useRef } from 'react';
import { BlockComponentProps } from '../../types/block';
import { useBlockSelection } from '../../utils/block';
import { ariaAnnounce } from '../../services/aria/aria-announce';

export const insertRow = (editor: typeof schema.BlockNoteEditor) => ({
	title: 'Button',
	onItemClick: () => {
		insertOrUpdateBlock(editor, {
			// @ts-ignore
			type: 'button',
		});
	},
	aliases: ['Button'],
	group: 'Other',
});

const buttonConfig = {
	type: 'button',
	propSchema: {},
	content: 'inline',
} as const;

function rowComponent({
	contentRef,
	editor,
	block,
}: BlockComponentProps<typeof buttonConfig, 'button'>): ReactNode {
	const ref = useRef<HTMLElement>(null);
	const isSelected = useBlockSelection(editor, block);

	const text = ref.current?.textContent || '\n';
	const label = `button, ${text}`;

	useEffect(() => {
		contentRef(ref.current);
	}, []);

	useEffect(() => {
		if (isSelected) {
			const destructor = ariaAnnounce(label);

			return () => {
				destructor();
			};
		}
	}, [isSelected]);

	return (
		<button
			data-block="Button"
			className="mb-2 rounded-lg bg-yellow-500 px-4 py-2 text-left text-gray-800 shadow-sm ring-1 ring-yellow-300"
		>
			<span ref={ref} />
		</button>
	);
}

export const Button = createReactBlockSpec(buttonConfig, {
	render: (props) => rowComponent(props),
});
