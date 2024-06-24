import { useNavigate } from 'react-router'
import DocumentsOverview from './DocumentsOverview'
import { useDocumentsOverviewLoader } from '../../services/loader/loader'

function AppDocumentsOverview() {
	const [documentDirectories, keywords] = useDocumentsOverviewLoader()
	const navigate = useNavigate()

	return (
		<DocumentsOverview
			onDocumentClick={(document) => navigate(`/documents/${document.id}`)}
			directories={documentDirectories}
			keywords={keywords}
		/>
	)
}

export default AppDocumentsOverview
