import type { RateLimitInfo, RepoData } from '../types'
import { Header } from './Header'
import { RepoCard } from './RepoCard'

interface Props {
  repos: RepoData[]
  rateLimit: RateLimitInfo
  lastUpdated: Date | null
  hasToken: boolean
  onRefresh: () => void
  onOpenSettings: () => void
}

export function Dashboard({ repos, rateLimit, lastUpdated, hasToken, onRefresh, onOpenSettings }: Props) {
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
          <RepoCard key={repo.config.name} repo={repo} />
        ))}
      </div>
    </div>
  )
}
