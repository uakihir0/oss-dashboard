import { Dashboard } from './components/Dashboard'
import { useGitHubData } from './hooks/useGitHubData'

function App() {
  const { repos, rateLimit, lastUpdated, refresh } = useGitHubData()

  return (
    <Dashboard
      repos={repos}
      rateLimit={rateLimit}
      lastUpdated={lastUpdated}
      onRefresh={refresh}
    />
  )
}

export default App
