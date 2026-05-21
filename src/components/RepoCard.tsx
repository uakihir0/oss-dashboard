import type { RepoData } from '../types'
import { CIStatus } from './CIStatus'
import { VersionInfo } from './VersionInfo'

interface Props {
  repo: RepoData
  onRefresh: (repoName: string) => void
}

function getOverallStatus(repo: RepoData): 'success' | 'failure' | 'unknown' {
  if (repo.workflows.length === 0) return 'unknown'
  const hasFailure = repo.workflows.some(w => w.conclusion === 'failure')
  if (hasFailure) return 'failure'
  const allSuccess = repo.workflows.every(w => w.conclusion === 'success' || w.conclusion === 'skipped')
  return allSuccess ? 'success' : 'unknown'
}

export function RepoCard({ repo, onRefresh }: Props) {
  const { config, workflows, versions, counts, loading, error } = repo
  const repoUrl = `https://github.com/${config.owner}/${config.name}`
  const overall = getOverallStatus(repo)

  return (
    <div className="repo-card">
      <div className="repo-header">
        <div className="repo-title-row">
          <a href={repoUrl} target="_blank" rel="noopener noreferrer" className="repo-name">
            {!loading && !error && (
              <span className={`overall-status overall-${overall}`}>●</span>
            )}
            {config.displayName}
          </a>
          <button
            className="repo-refresh-btn"
            onClick={() => onRefresh(config.name)}
            disabled={loading}
            title="Refresh this repository"
          >
            ↻
          </button>
        </div>
        <p className="repo-description">{config.description}</p>
        {!loading && !error && (counts.openIssues > 0 || counts.openPRs > 0) && (
          <div className="repo-counts">
            {counts.openIssues > 0 && (
              <a
                href={`${repoUrl}/issues`}
                target="_blank"
                rel="noopener noreferrer"
                className="repo-count-badge count-issues"
              >
                {counts.openIssues} issue{counts.openIssues !== 1 && 's'}
              </a>
            )}
            {counts.openPRs > 0 && (
              <a
                href={`${repoUrl}/pulls`}
                target="_blank"
                rel="noopener noreferrer"
                className="repo-count-badge count-prs"
              >
                {counts.openPRs} PR{counts.openPRs !== 1 && 's'}
              </a>
            )}
          </div>
        )}
      </div>

      {loading && <div className="loading">Loading...</div>}
      {error && <div className="error">Error: {error}</div>}

      {!loading && !error && (
        <>
          <VersionInfo versions={versions} />
          <CIStatus workflows={workflows} />
        </>
      )}
    </div>
  )
}
