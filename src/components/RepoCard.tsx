import type { RepoData } from '../types'
import { CIStatus } from './CIStatus'
import { VersionInfo } from './VersionInfo'

interface Props {
  repo: RepoData
}

function getOverallStatus(repo: RepoData): 'success' | 'failure' | 'unknown' {
  if (repo.workflows.length === 0) return 'unknown'
  const hasFailure = repo.workflows.some(w => w.conclusion === 'failure')
  if (hasFailure) return 'failure'
  const allSuccess = repo.workflows.every(w => w.conclusion === 'success' || w.conclusion === 'skipped')
  return allSuccess ? 'success' : 'unknown'
}

export function RepoCard({ repo }: Props) {
  const { config, workflows, versions, loading, error } = repo
  const repoUrl = `https://github.com/${config.owner}/${config.name}`
  const overall = getOverallStatus(repo)

  return (
    <div className="repo-card">
      <div className="repo-header">
        <a href={repoUrl} target="_blank" rel="noopener noreferrer" className="repo-name">
          {!loading && !error && (
            <span className={`overall-status overall-${overall}`}>●</span>
          )}
          {config.displayName}
        </a>
        <p className="repo-description">{config.description}</p>
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
