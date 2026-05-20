import { useCallback, useEffect, useRef, useState } from 'react'
import { REPOS } from '../config'
import { clearCache, fetchLatestRelease, fetchSnapshotVersion, fetchWorkflowStatuses, getRateLimit } from '../lib/github-api'
import type { RateLimitInfo, RepoData } from '../types'

export function useGitHubData() {
  const [repos, setRepos] = useState<RepoData[]>(
    REPOS.map(config => ({
      config,
      workflows: [],
      versions: { release: null, snapshot: null },
      loading: true,
      error: null,
    }))
  )
  const [rateLimit, setRateLimit] = useState<RateLimitInfo>(getRateLimit())
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const abortRef = useRef(false)

  const fetchAll = useCallback(async () => {
    abortRef.current = false
    setRepos(REPOS.map(config => ({
      config,
      workflows: [],
      versions: { release: null, snapshot: null },
      loading: true,
      error: null,
    })))

    for (let i = 0; i < REPOS.length; i++) {
      if (abortRef.current) break
      const config = REPOS[i]

      try {
        const [workflows, release, snapshot] = await Promise.all([
          fetchWorkflowStatuses(config.owner, config.name, config.mainBranch),
          fetchLatestRelease(config.owner, config.name),
          fetchSnapshotVersion(config.owner, config.name),
        ])

        setRepos(prev => prev.map((r, idx) =>
          idx === i
            ? { config, workflows, versions: { release, snapshot }, loading: false, error: null }
            : r
        ))
      } catch (e) {
        setRepos(prev => prev.map((r, idx) =>
          idx === i
            ? { config, workflows: [], versions: { release: null, snapshot: null }, loading: false, error: e instanceof Error ? e.message : 'Unknown error' }
            : r
        ))
      }

      setRateLimit(getRateLimit())
    }

    setLastUpdated(new Date())
  }, [])

  const refresh = useCallback(() => {
    abortRef.current = true
    clearCache()
    fetchAll()
  }, [fetchAll])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  return { repos, rateLimit, lastUpdated, refresh }
}
