import type { VersionInfo as VersionInfoType } from '../types'

interface Props {
  versions: VersionInfoType
}

export function VersionInfo({ versions }: Props) {
  return (
    <div className="version-info">
      <h3>Versions</h3>
      <div className="version-list">
        <div className="version-item">
          <span className="version-label">Release</span>
          <span className="version-value release">
            {versions.release ?? '—'}
          </span>
        </div>
        <div className="version-item">
          <span className="version-label">Snapshot</span>
          <span className="version-value snapshot">
            {versions.snapshot ?? '—'}
          </span>
        </div>
      </div>
    </div>
  )
}
