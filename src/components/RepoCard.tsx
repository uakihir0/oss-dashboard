import type { RepoData } from '../types'
import { CIStatus } from './CIStatus'
import { VersionInfo } from './VersionInfo'

interface Props {
  repo: RepoData
}

export function RepoCard({ repo }: Props) {
  const { config, workflows, versions, loading, error } = repo
  const repoUrl = `https://github.com/${config.owner}/${config.name}`

  return (
    <div className="repo-card">
      <div className="repo-header">
        <a href={repoUrl} target="_blank" rel="noopener noreferrer" className="repo-name">
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
