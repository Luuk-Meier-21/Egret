import { insertOrUpdateBlock } from '@blocknote/core';
import { createReactBlockSpec } from '@blocknote/react';
import { RiAlertFill } from 'react-icons/ri';
import { schema } from './schema';

export const insertTitle = (editor: typeof schema.BlockNoteEditor) => ({
	title: 'Title',
	onItemClick: () => {
		insertOrUpdateBlock(editor, {
			type: 'title',
		});
	},
	aliases: ['title'],
	group: 'Other',
	icon: <RiAlertFill />,
});

// The Alert block.
export const Title = createReactBlockSpec(
	{
		type: 'title',
		propSchema: {},
		content: 'inline',
	},
	{
		render: (props) => {
			// const ref = useRef<HTMLHeadingElement>(null);

			// useEffect(() => {
			//   props.contentRef(ref.current);
			// }, []);

			return (
				<p
					role="heading"
					aria-level={1}
					className="flex text-xl font-bold"
					ref={props.contentRef}
				/>
			);
		},
	},
);
