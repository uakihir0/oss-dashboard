import { useState } from 'react'
import { Dashboard } from './components/Dashboard'
import { TokenSettings } from './components/TokenSettings'
import { useGitHubData } from './hooks/useGitHubData'
import { getToken, setToken } from './lib/github-api'

function App() {
  const { repos, rateLimit, lastUpdated, refresh, refreshRepo } = useGitHubData()
  const [showSettings, setShowSettings] = useState(false)
  const [hasToken, setHasToken] = useState(!!getToken())

  const handleSaveToken = (token: string | null) => {
    setToken(token)
    setHasToken(!!token)
    refresh()
  }

  return (
    <>
      <Dashboard
        repos={repos}
        rateLimit={rateLimit}
        lastUpdated={lastUpdated}
        hasToken={hasToken}
        onRefresh={refresh}
        onRefreshRepo={refreshRepo}
        onOpenSettings={() => setShowSettings(true)}
      />
      {showSettings && (
        <TokenSettings
          token={getToken()}
          onSave={handleSaveToken}
          onClose={() => setShowSettings(false)}
        />
      )}
    </>
  )
}

export default App
