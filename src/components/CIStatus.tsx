import type { WorkflowStatus } from '../types'

interface Props {
  workflows: WorkflowStatus[]
}

const STATUS_ICONS: Record<WorkflowStatus['conclusion'], string> = {
  success: '●',
  failure: '●',
  cancelled: '●',
  skipped: '●',
  in_progress: '◐',
  unknown: '○',
}

export function CIStatus({ workflows }: Props) {
  if (workflows.length === 0) {
    return (
      <div className="ci-status">
        <h3>CI Status</h3>
        <p className="no-data">No workflow data</p>
      </div>
    )
  }

  return (
    <div className="ci-status">
      <h3>CI Status</h3>
      <ul className="workflow-list">
        {workflows.map(wf => (
          <li key={wf.name} className={`workflow-item status-${wf.conclusion}`}>
            <a href={wf.url} target="_blank" rel="noopener noreferrer">
              <span className="status-icon">{STATUS_ICONS[wf.conclusion]}</span>
              <span className="workflow-name">{wf.name}</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}
