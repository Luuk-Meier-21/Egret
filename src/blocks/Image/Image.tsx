import { insertOrUpdateBlock } from '@blocknote/core';
import { createReactBlockSpec } from '@blocknote/react';
import { schema } from '../../blocks/schema';
import { ReactNode, useEffect, useRef } from 'react';
import { BlockComponentProps } from '../../types/block';
import { useBlockLive, useBlockSelection } from '../../utils/block';
import { voiceSay } from '../../bindings';
import { useConditionalScopedAction } from '../../services/actions/actions-hook';
import { ariaAnnounce } from '../../services/aria/aria-announce';

export const insertRow = (editor: typeof schema.BlockNoteEditor) => ({
	title: 'Image',
	onItemClick: () => {
		insertOrUpdateBlock(editor, {
			// @ts-ignore
			type: 'image',
		});
	},
	aliases: ['Image'],
	group: 'Other',
});

const imageConfig = {
	type: 'image',
	propSchema: {
		src: {
			default: '',
		},
		alt: {
			default: '',
		},
	},
	content: 'inline',
} as const;

function rowComponent({
	block,
	contentRef,
	editor,
}: BlockComponentProps<typeof imageConfig, 'image'>): ReactNode {
	const ref = useRef<HTMLElement>(null);
	const isSelected = useBlockSelection(editor, block);

	const alt = ref.current?.textContent || '\n';
	const src = block.props.src;

	useEffect(() => {
		contentRef(ref.current);

		editor.focus();
	}, []);

	useBlockLive(`image, ${alt}`, isSelected);

	return (
		<figure className="inline-content inline-block w-full">
			<img
				className="object-cover"
				contentEditable={false}
				aria-hidden="true"
				src={src}
				alt={alt}
			/>
			<figcaption className="inline-content flex text-sm">
				<span id="caption" aria-placeholder="" ref={ref} />
			</figcaption>
		</figure>
	);
}

export const Image = createReactBlockSpec(imageConfig, {
	render: (props) => rowComponent(props),
	parse: (element) => {
		const imgElement =
			element.tagName === 'img' ? (element as HTMLImageElement) : null;

		if (imgElement && imgElement.src && imgElement.alt) {
			return {
				src: imgElement.src,
				alt: imgElement.alt,
			};
		}

		return;
	},
});
