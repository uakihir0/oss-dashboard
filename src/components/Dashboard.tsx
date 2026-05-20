import type { RateLimitInfo, RepoData } from '../types'
import { Header } from './Header'
import { RepoCard } from './RepoCard'

interface Props {
  repos: RepoData[]
  rateLimit: RateLimitInfo
  lastUpdated: Date | null
  hasToken: boolean
  onRefresh: () => void
  onRefreshRepo: (repoName: string) => void
  onOpenSettings: () => void
}

export function Dashboard({ repos, rateLimit, lastUpdated, hasToken, onRefresh, onRefreshRepo, onOpenSettings }: Props) {
  return (
    <div className="dashboard">
      <Header
        rateLimit={rateLimit}
        lastUpdated={lastUpdated}
        hasToken={hasToken}
        onRefresh={onRefresh}
        onOpenSettings={onOpenSettings}
      />
      <div className="repo-grid">
        {repos.map(repo => (
          <RepoCard key={repo.config.name} repo={repo} onRefresh={onRefreshRepo} />
        ))}
      </div>
    </div>
  )
}
