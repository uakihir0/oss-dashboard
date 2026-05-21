import type { RepoData } from '../types'
import { RepoCard } from './RepoCard'

interface Props {
  name: string
  repos: RepoData[]
  onRefreshRepo: (repoName: string) => void
}

function getGroupStatus(repos: RepoData[]): 'success' | 'failure' | 'loading' | 'unknown' {
  const loaded = repos.filter(r => !r.loading && !r.error)
  if (repos.some(r => r.loading)) return 'loading'
  if (loaded.length === 0) return 'unknown'

  const hasFailure = loaded.some(r =>
    r.workflows.some(w => w.conclusion === 'failure')
  )
  if (hasFailure) return 'failure'

  const allSuccess = loaded.every(r =>
    r.workflows.length > 0 &&
    r.workflows.every(w => w.conclusion === 'success' || w.conclusion === 'skipped')
  )
  return allSuccess ? 'success' : 'unknown'
}

export function GroupSection({ name, repos, onRefreshRepo }: Props) {
  const status = getGroupStatus(repos)

  const statusLabel: Record<string, string> = {
    success: 'All green',
    failure: `${repos.filter(r => r.workflows.some(w => w.conclusion === 'failure')).length} failing`,
    loading: 'Loading...',
    unknown: 'Pending',
  }

  return (
    <section className="group-section">
      <div className="group-header">
        <span className={`group-status group-status-${status}`}>●</span>
        <h2 className="group-name">{name}</h2>
        <span className={`group-label group-label-${status}`}>{statusLabel[status]}</span>
      </div>
      <div className="repo-grid">
        {repos.map(repo => (
          <RepoCard key={repo.config.name} repo={repo} onRefresh={onRefreshRepo} />
        ))}
      </div>
    </section>
  )
}
