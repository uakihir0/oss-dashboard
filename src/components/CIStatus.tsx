import { useState } from 'react'
import type { WorkflowStatus } from '../types'

interface Props {
  workflows: WorkflowStatus[]
}

const VISIBLE_COUNT = 4

const STATUS_ICONS: Record<WorkflowStatus['conclusion'], string> = {
  success: '●',
  failure: '●',
  cancelled: '●',
  skipped: '●',
  in_progress: '◐',
  unknown: '○',
}

export function CIStatus({ workflows }: Props) {
  const [expanded, setExpanded] = useState(false)

  if (workflows.length === 0) {
    return (
      <div className="ci-status">
        <h3>CI Status</h3>
        <p className="no-data">No workflow data</p>
      </div>
    )
  }

  const hasMore = workflows.length > VISIBLE_COUNT
  const visible = expanded ? workflows : workflows.slice(0, VISIBLE_COUNT)
  const hiddenCount = workflows.length - VISIBLE_COUNT

  return (
    <div className="ci-status">
      <h3>CI Status</h3>
      <ul className="workflow-list">
        {visible.map(wf => (
          <li key={wf.name} className={`workflow-item status-${wf.conclusion}`}>
            <a href={wf.url} target="_blank" rel="noopener noreferrer">
              <span className="status-icon">{STATUS_ICONS[wf.conclusion]}</span>
              <span className="workflow-name">{wf.name}</span>
            </a>
          </li>
        ))}
      </ul>
      {hasMore && (
        <button className="expand-btn" onClick={() => setExpanded(!expanded)}>
          {expanded ? 'Show less' : `+${hiddenCount} more`}
        </button>
      )}
    </div>
  )
}
