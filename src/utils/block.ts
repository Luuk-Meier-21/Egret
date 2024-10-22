import {
	BlockConfig,
	BlockFromConfig,
	BlockIdentifier,
	BlockSchemaWithBlock,
	InlineContentConfig,
	StyleConfig,
} from '@blocknote/core';
import { IBlock, IBlockEditor } from '../types/block';
import { useEffect, useState } from 'react';
import {
	ariaAnnounce,
	AriaAnnouncementDestructor,
} from '../services/aria/aria-announce';

export function createBlock(): IBlock {
	return {};
}

export function toggleBlock(
	editor: IBlockEditor,
	blockToUpdate: IBlock & BlockIdentifier,
	update: IBlock & {
		type: typeof blockToUpdate.type;
	},
) {
	const isSetToTarget = blockToUpdate.type === update.type;
	const updatedBlock: IBlock = isSetToTarget
		? {
				type: 'paragraph',
			}
		: update;
	editor.updateBlock(blockToUpdate, updatedBlock);
}

export function isBlockInSelection<
	ST extends Record<string, BlockConfig>,
	IT extends Record<string, InlineContentConfig>,
	SST extends Record<string, StyleConfig>,
>(editor: IBlockEditor<ST, IT, SST>, block: IBlock<ST, IT, SST>): boolean {
	return editor.getTextCursorPosition().block.id === block.id;
}

export function blocksHaveContent<
	ST extends Record<string, BlockConfig>,
	IT extends Record<string, InlineContentConfig>,
	SST extends Record<string, StyleConfig>,
>(blocks: IBlock<ST, IT, SST>[]): boolean {
	return blocks.some((block) => {
		//@ts-expect-error
		if (block.content[0]?.text === '-') {
			return false;
		}

		//@ts-expect-error
		return block?.content?.length > 0 || block?.children?.length > 0;
	});
}

// export function getInlineContentText<
//   ST extends BlockConfig,
//   IT extends InlineContentConfig,
//   SST extends Record<string, StyleConfig>,
// >(
//   editor: IBlockEditor<
//     BlockSchemaWithBlock<string, ST>,
//     Record<string, IT>,
//     SST
//   >,
//   block: BlockFromConfig<ST, Record<string, IT>, SST>,
// ) {
//   const recursiveSearch = (
//     content: InlineContentFromConfig<IT, SST>[]
//   ) => {
//     content.text

//     if (content.length <= 0) {
//       return null;
//     }

//   };

//   if (block.content === undefined) {
//     return null;
//   }

//   recursiveSearch(block.content as InlineContentFromConfig<IT, SST>[]);
// }

export function useBlockSelection<
	ST extends BlockConfig,
	IT extends Record<string, InlineContentConfig>,
	SST extends Record<string, StyleConfig>,
>(
	editor: IBlockEditor<BlockSchemaWithBlock<string, ST>, IT, SST>,
	block: BlockFromConfig<ST, IT, SST>,
) {
	const [isSelected, setSelected] = useState(isBlockInSelection(editor, block));

	useEffect(() => {
		editor.onSelectionChange(() => {
			setSelected(isBlockInSelection(editor, block));
		});

		editor.onEditorSelectionChange(() => {
			setSelected(isBlockInSelection(editor, block));
		});

		editor._tiptapEditor.on('blur', () => {
			setSelected(false);
		});
	}, []);

	return isSelected;
}

/**
 * @deprecated
 */
export function useBlockLive(
	label: string,
	isSelected: boolean,
	priority: 'polite' | 'assertive' = 'polite',
) {
	useEffect(() => {
		if (isSelected) {
			const destructor = ariaAnnounce(label, priority);

			return () => {
				destructor();
			};
		}
	}, [isSelected]);
}

export function useBlockAnnounce(
	priority: 'polite' | 'assertive',
	message: string,
	condition: boolean,
	delay: number = 0,
) {
	useEffect(() => {
		if (condition) {
			const destructor = new Promise<AriaAnnouncementDestructor>((res) =>
				setTimeout(() => res(ariaAnnounce(message, priority)), delay),
			);

			return () => {
				destructor.then((func) => func());
			};
		}
	}, [condition]);
}

export function polyfillTiptapBreaking(editor: IBlockEditor): boolean {
	const isBreaking =
		editor._tiptapEditor?.view === undefined ||
		editor._tiptapEditor?.view?.dom === undefined;

	return isBreaking;
}
