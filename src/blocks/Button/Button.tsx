import { insertOrUpdateBlock } from '@blocknote/core';
import { createReactBlockSpec } from '@blocknote/react';
import { schema } from '../../blocks/schema';
import { ReactNode, useEffect, useRef } from 'react';
import { BlockComponentProps } from '../../types/block';

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
}: BlockComponentProps<typeof buttonConfig, 'button'>): ReactNode {
	const ref = useRef<HTMLElement>(null);

	useEffect(() => {
		contentRef(ref.current);
	}, []);

	return (
		<button
			role="button"
			type="button"
			onClick={() => {}}
			data-block="Button"
			className="mb-2 mr-auto flex rounded-lg bg-yellow-500 px-4 py-2 text-left text-gray-800 shadow-sm ring-1 ring-yellow-300"
		>
			<span ref={ref} />
		</button>
	);
}

export const Button = createReactBlockSpec(buttonConfig, {
	render: (props) => rowComponent(props),
});
