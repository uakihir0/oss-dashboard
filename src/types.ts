export interface RepoConfig {
  owner: string
  name: string
  displayName: string
  description: string
  hasReleases: boolean
  mainBranch: string
}

export interface WorkflowRun {
  id: number
  name: string
  status: string
  conclusion: string | null
  html_url: string
  created_at: string
  head_branch: string
  workflow_id: number
}

export interface WorkflowStatus {
  name: string
  conclusion: 'success' | 'failure' | 'cancelled' | 'skipped' | 'in_progress' | 'unknown'
  url: string
  updatedAt: string
}

export interface VersionInfo {
  release: string | null
  snapshot: string | null
}

export interface RepoData {
  config: RepoConfig
  workflows: WorkflowStatus[]
  versions: VersionInfo
  loading: boolean
  error: string | null
}

export interface RateLimitInfo {
  remaining: number
  limit: number
  resetAt: Date
}
