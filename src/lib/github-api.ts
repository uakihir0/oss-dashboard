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
  etag: string | null
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

function getCacheEntry<T>(cacheKey: string): CacheEntry<T> | null {
  const cached = localStorage.getItem(cacheKey)
  if (!cached) return null
  return JSON.parse(cached) as CacheEntry<T>
}

function setCacheEntry<T>(cacheKey: string, data: T, etag: string | null) {
  localStorage.setItem(cacheKey, JSON.stringify({
    data,
    timestamp: Date.now(),
    etag,
  } satisfies CacheEntry<T>))
}

async function fetchWithCache<T>(url: string, cacheKey: string): Promise<T> {
  const cacheEntry = getCacheEntry<T>(cacheKey)

  if (cacheEntry && Date.now() - cacheEntry.timestamp < CACHE_TTL_MS) {
    return cacheEntry.data
  }

  if (rateLimited) {
    if (cacheEntry) return cacheEntry.data
    throw new Error(`Rate limited (resets ${rateLimitInfo.resetAt.toLocaleTimeString()})`)
  }

  const headers: Record<string, string> = {}
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`
  }
  if (cacheEntry?.etag) {
    headers['If-None-Match'] = cacheEntry.etag
  }

  const response = await fetch(url, { headers })
  updateRateLimit(response.headers)

  if (response.status === 304 && cacheEntry) {
    setCacheEntry(cacheKey, cacheEntry.data, cacheEntry.etag)
    return cacheEntry.data
  }

  if (response.status === 403 || response.status === 429) {
    rateLimited = true
    if (cacheEntry) return cacheEntry.data
    throw new Error(`Rate limited (resets ${rateLimitInfo.resetAt.toLocaleTimeString()})`)
  }

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`)
  }

  const data = await response.json()
  const etag = response.headers.get('etag')
  setCacheEntry(cacheKey, data, etag)
  return data
}

export function clearCache() {
  const keys = Object.keys(localStorage)
  for (const key of keys) {
    if (key.startsWith('gh:')) {
      localStorage.removeItem(key)
    }
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

async function fetchWorkflowStatuses(owner: string, repo: string, _branch: string): Promise<WorkflowStatus[]> {
  const url = `${API_BASE}/repos/${owner}/${repo}/actions/runs?per_page=100&exclude_pull_requests=true`
  const cacheKey = `gh:runs:${owner}/${repo}`

  const data = await fetchWithCache<{ workflow_runs: WorkflowRun[] }>(url, cacheKey)
  const runs = data.workflow_runs

  const latestByWorkflow = new Map<number, WorkflowRun>()
  for (const run of runs) {
    if (!latestByWorkflow.has(run.workflow_id)) {
      latestByWorkflow.set(run.workflow_id, run)
    }
  }

  return Array.from(latestByWorkflow.values())
    .filter(run => !EXCLUDED_WORKFLOWS.some(ex => run.name.toLowerCase().includes(ex)))
    .map(run => ({
      name: run.name,
      conclusion: mapConclusion(run),
      url: run.html_url,
      updatedAt: run.created_at,
    }))
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
  const url = `${API_BASE}/repos/${owner}/${repo}/releases/latest`
  const cacheKey = `gh:release:${owner}/${repo}`

  try {
    const data = await fetchWithCache<{ tag_name: string }>(url, cacheKey)
    return data.tag_name
  } catch (e) {
    if (e instanceof Error && e.message === 'HTTP 404') {
      return null
    }
    throw e
  }
}

async function fetchSnapshotVersion(owner: string, repo: string): Promise<string | null> {
  const url = `${API_BASE}/repos/${owner}/${repo}/contents/build.gradle.kts`
  const cacheKey = `gh:snapshot:${owner}/${repo}`

  try {
    const data = await fetchWithCache<{ content: string }>(url, cacheKey)
    const content = atob(data.content.replace(/\n/g, ''))
    const match = content.match(/version\s*=\s*"([^"]+)"/)
    return match ? match[1] : null
  } catch {
    return null
  }
}
