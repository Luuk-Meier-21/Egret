import { useState } from 'react'
import { Layout } from '../../types/layout/layout'
import { flattenLayoutNodesByReference } from './layout-content'
import { useStrictEffect } from './layout-change'

export function useLayoutState(layout: Layout) {
	const rows = layout.tree
	const columns = flattenLayoutNodesByReference(layout.tree)

	const [rowId, setRowId] = useState<string | null>(rows[0].id)
	const [nodeId, setNodeId] = useState<string | null>(columns[0].id)
	const [isEditing, setEditing] = useState(false)

	useStrictEffect(
		() => {
			setEditing(false)
		},
		([nodeId]) => nodeId || '',
		[nodeId],
	)

	return { rowId, setRowId, nodeId, setNodeId, isEditing, setEditing } as const
}

export type LayoutState = ReturnType<typeof useLayoutState>
