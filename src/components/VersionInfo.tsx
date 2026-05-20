import type { VersionInfo as VersionInfoType } from '../types'

interface Props {
  versions: VersionInfoType
  hasReleases: boolean
}

export function VersionInfo({ versions, hasReleases }: Props) {
  return (
    <div className="version-info">
      <h3>Versions</h3>
      <div className="version-list">
        {hasReleases && (
          <div className="version-item">
            <span className="version-label">Release</span>
            <span className="version-value release">
              {versions.release ?? 'No releases'}
            </span>
          </div>
        )}
        <div className="version-item">
          <span className="version-label">Snapshot</span>
          <span className="version-value snapshot">
            {versions.snapshot ?? 'Unknown'}
          </span>
        </div>
      </div>
    </div>
  )
}
