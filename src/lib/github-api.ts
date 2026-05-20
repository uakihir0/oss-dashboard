import { CACHE_TTL_MS, EXCLUDED_WORKFLOWS } from '../config'
import type { RateLimitInfo, WorkflowRun, WorkflowStatus } from '../types'

const API_BASE = 'https://api.github.com'
const TOKEN_KEY = 'gh:token'

let authToken: string | null = localStorage.getItem(TOKEN_KEY)

export function getToken(): string | null {
  return authToken
}

export function setToken(token: string | null) {
  authToken = token
  if (token) {
    localStorage.setItem(TOKEN_KEY, token)
  } else {
    localStorage.removeItem(TOKEN_KEY)
  }
  rateLimited = false
}

interface CacheEntry<T> {
  data: T
  timestamp: number
}

let rateLimitInfo: RateLimitInfo = {
  remaining: 60,
  limit: 60,
  resetAt: new Date(),
}

let rateLimited = false

export function getRateLimit(): RateLimitInfo {
  return { ...rateLimitInfo }
}

export function isRateLimited(): boolean {
  return rateLimited
}

function updateRateLimit(headers: Headers) {
  const remaining = headers.get('x-ratelimit-remaining')
  const limit = headers.get('x-ratelimit-limit')
  const reset = headers.get('x-ratelimit-reset')

  if (remaining !== null) rateLimitInfo.remaining = parseInt(remaining, 10)
  if (limit !== null) rateLimitInfo.limit = parseInt(limit, 10)
  if (reset !== null) rateLimitInfo.resetAt = new Date(parseInt(reset, 10) * 1000)

  if (rateLimitInfo.remaining <= 0) {
    rateLimited = true
  } else {
    rateLimited = false
  }
}

function getCache<T>(cacheKey: string): CacheEntry<T> | null {
  const cached = localStorage.getItem(cacheKey)
  if (!cached) return null
  return JSON.parse(cached) as CacheEntry<T>
}

function setCache<T>(cacheKey: string, data: T) {
  try {
    localStorage.setItem(cacheKey, JSON.stringify({
      data,
      timestamp: Date.now(),
    } satisfies CacheEntry<T>))
  } catch {
    // quota exceeded — silently skip caching
  }
}

function buildHeaders(): Record<string, string> {
  const headers: Record<string, string> = {}
  if (authToken) {
    headers['Authorization'] = `token ${authToken}`
  }
  return headers
}

async function fetchJSON<T>(url: string): Promise<T> {
  if (rateLimited) {
    throw new Error(`Rate limited (resets ${rateLimitInfo.resetAt.toLocaleTimeString()})`)
  }

  const response = await fetch(url, { headers: buildHeaders() })
  updateRateLimit(response.headers)

  if (response.status === 401) {
    throw new Error('Invalid token (HTTP 401)')
  }

  if (response.status === 403 || response.status === 429) {
    rateLimited = true
    throw new Error(`Rate limited (resets ${rateLimitInfo.resetAt.toLocaleTimeString()})`)
  }

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`)
  }

  return response.json()
}

export function clearCache() {
  const keys = Object.keys(localStorage)
  for (const key of keys) {
    if (key.startsWith('gh:') && key !== TOKEN_KEY) {
      localStorage.removeItem(key)
    }
  }
}

export function clearRepoCache(owner: string, repo: string) {
  const prefix = `gh:`
  const patterns = [
    `${prefix}runs:${owner}/${repo}`,
    `${prefix}release:${owner}/${repo}`,
    `${prefix}snapshot:${owner}/${repo}`,
  ]
  for (const key of patterns) {
    localStorage.removeItem(key)
  }
}

export async function fetchRepoData(
  owner: string,
  repo: string,
  branch: string,
): Promise<{ workflows: WorkflowStatus[]; release: string | null; snapshot: string | null }> {
  const [workflows, release, snapshot] = await Promise.all([
    fetchWorkflowStatuses(owner, repo, branch),
    fetchLatestRelease(owner, repo),
    fetchSnapshotVersion(owner, repo),
  ])
  return { workflows, release, snapshot }
}

async function fetchWorkflowStatuses(owner: string, repo: string, branch: string): Promise<WorkflowStatus[]> {
  const cacheKey = `gh:runs:${owner}/${repo}`
  const cached = getCache<WorkflowStatus[]>(cacheKey)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data
  }

  const url = `${API_BASE}/repos/${owner}/${repo}/actions/runs?per_page=100&branch=${branch}&exclude_pull_requests=true`
  const data = await fetchJSON<{ workflow_runs: WorkflowRun[] }>(url)
  const runs = data.workflow_runs

  const latestByWorkflow = new Map<number, WorkflowRun>()
  for (const run of runs) {
    if (!latestByWorkflow.has(run.workflow_id)) {
      latestByWorkflow.set(run.workflow_id, run)
    }
  }

  const statuses = Array.from(latestByWorkflow.values())
    .filter(run => !EXCLUDED_WORKFLOWS.some(ex => run.name.toLowerCase().includes(ex)))
    .map(run => ({
      name: run.name,
      conclusion: mapConclusion(run),
      url: run.html_url,
      updatedAt: run.created_at,
    }))

  setCache(cacheKey, statuses)
  return statuses
}

function mapConclusion(run: WorkflowRun): WorkflowStatus['conclusion'] {
  if (run.status === 'in_progress' || run.status === 'queued') return 'in_progress'
  if (run.conclusion === 'success') return 'success'
  if (run.conclusion === 'failure') return 'failure'
  if (run.conclusion === 'cancelled') return 'cancelled'
  if (run.conclusion === 'skipped') return 'skipped'
  return 'unknown'
}

async function fetchLatestRelease(owner: string, repo: string): Promise<string | null> {
  const cacheKey = `gh:release:${owner}/${repo}`
  const cached = getCache<string | null>(cacheKey)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data
  }

  try {
    const data = await fetchJSON<{ tag_name: string }>(
      `${API_BASE}/repos/${owner}/${repo}/releases/latest`
    )
    setCache(cacheKey, data.tag_name)
    return data.tag_name
  } catch (e) {
    if (e instanceof Error && e.message === 'HTTP 404') {
      setCache(cacheKey, null)
      return null
    }
    throw e
  }
}

async function fetchSnapshotVersion(owner: string, repo: string): Promise<string | null> {
  const cacheKey = `gh:snapshot:${owner}/${repo}`
  const cached = getCache<string | null>(cacheKey)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data
  }

  try {
    const data = await fetchJSON<{ content: string }>(
      `${API_BASE}/repos/${owner}/${repo}/contents/build.gradle.kts`
    )
    const content = atob(data.content.replace(/\n/g, ''))
    const match = content.match(/version\s*=\s*"([^"]+)"/)
    const version = match ? match[1] : null
    setCache(cacheKey, version)
    return version
  } catch {
    return null
  }
}
