import type { RateLimitInfo, RepoData } from '../types'
import { Header } from './Header'
import { RepoCard } from './RepoCard'

interface Props {
  repos: RepoData[]
  rateLimit: RateLimitInfo
  lastUpdated: Date | null
  onRefresh: () => void
}

export function Dashboard({ repos, rateLimit, lastUpdated, onRefresh }: Props) {
  return (
    <div className="dashboard">
      <Header rateLimit={rateLimit} lastUpdated={lastUpdated} onRefresh={onRefresh} />
      <div className="repo-grid">
        {repos.map(repo => (
          <RepoCard key={repo.config.name} repo={repo} />
        ))}
      </div>
    </div>
  )
}
