import { useCallback, useEffect, useRef, useState } from 'react'
import { REPOS } from '../config'
import { clearCache, fetchRepoData, getRateLimit, isRateLimited } from '../lib/github-api'
import type { RateLimitInfo, RepoData } from '../types'

const CONCURRENCY = 3

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

    let nextIndex = 0

    const worker = async () => {
      while (nextIndex < REPOS.length) {
        if (abortRef.current || isRateLimited()) break
        const i = nextIndex++
        const config = REPOS[i]

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
        }

        setRateLimit(getRateLimit())
      }
    }

    const workers = Array.from({ length: CONCURRENCY }, () => worker())
    await Promise.all(workers)

    if (isRateLimited()) {
      const msg = `Rate limited (resets ${getRateLimit().resetAt.toLocaleTimeString()})`
      setRepos(prev => prev.map(r => r.loading ? { ...r, loading: false, error: msg } : r))
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
