import { useCallback, useEffect, useRef, useState } from 'react'
import { REPOS } from '../config'
import { clearCache, fetchRepoData, getRateLimit, isRateLimited } from '../lib/github-api'
import type { RateLimitInfo, RepoData } from '../types'

const REQUEST_INTERVAL_MS = 300

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

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

      if (isRateLimited()) {
        setRepos(prev => prev.map((r, idx) =>
          idx >= i
            ? { ...r, loading: false, error: `Rate limited (resets ${getRateLimit().resetAt.toLocaleTimeString()})` }
            : r
        ))
        break
      }

      try {
        const { workflows, release, snapshot } = await fetchRepoData(
          config.owner,
          config.name,
          config.mainBranch,
        )

        setRepos(prev => prev.map((r, idx) =>
          idx === i
            ? { config, workflows, versions: { release, snapshot }, loading: false, error: null }
            : r
        ))
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Unknown error'
        setRepos(prev => prev.map((r, idx) =>
          idx === i
            ? { config, workflows: [], versions: { release: null, snapshot: null }, loading: false, error: msg }
            : r
        ))

        if (isRateLimited()) {
          setRepos(prev => prev.map((r, idx) =>
            idx > i && r.loading
              ? { ...r, loading: false, error: msg }
              : r
          ))
          break
        }
      }

      setRateLimit(getRateLimit())

      if (i < REPOS.length - 1 && !isRateLimited()) {
        await delay(REQUEST_INTERVAL_MS)
      }
    }

    setRateLimit(getRateLimit())
    setLastUpdated(new Date())
  }, [])

  const refresh = useCallback(() => {
    abortRef.current = true
    clearCache()
    setTimeout(() => fetchAll(), 100)
  }, [fetchAll])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  return { repos, rateLimit, lastUpdated, refresh }
}
