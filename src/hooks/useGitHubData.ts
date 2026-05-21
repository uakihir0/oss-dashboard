import { useCallback, useEffect, useRef, useState } from 'react'
import { REPOS } from '../config'
import { clearCache, clearRepoCache, fetchRepoData, getRateLimit, isRateLimited } from '../lib/github-api'
import type { RateLimitInfo, RepoData } from '../types'

const CONCURRENCY = 3

export function useGitHubData() {
  const [repos, setRepos] = useState<RepoData[]>(
    REPOS.map(config => ({
      config,
      workflows: [],
      versions: { release: null, snapshot: null },
      counts: { openIssues: 0, openPRs: 0 },
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
      counts: { openIssues: 0, openPRs: 0 },
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
          const { workflows, release, snapshot, counts } = await fetchRepoData(
            config.owner,
            config.name,
            config.mainBranch,
          )

          setRepos(prev => prev.map((r, idx) =>
            idx === i
              ? { config, workflows, versions: { release, snapshot }, counts, loading: false, error: null }
              : r
          ))
        } catch (e) {
          const msg = e instanceof Error ? e.message : 'Unknown error'
          setRepos(prev => prev.map((r, idx) =>
            idx === i
              ? { config, workflows: [], versions: { release: null, snapshot: null }, counts: { openIssues: 0, openPRs: 0 }, loading: false, error: msg }
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

  const refreshAll = useCallback(() => {
    abortRef.current = true
    clearCache()
    setTimeout(() => fetchAll(), 100)
  }, [fetchAll])

  const refreshRepo = useCallback(async (repoName: string) => {
    const i = REPOS.findIndex(r => r.name === repoName)
    if (i === -1) return
    const config = REPOS[i]

    clearRepoCache(config.owner, config.name)
    setRepos(prev => prev.map((r, idx) =>
      idx === i ? { ...r, loading: true, error: null } : r
    ))

    try {
      const { workflows, release, snapshot, counts } = await fetchRepoData(
        config.owner,
        config.name,
        config.mainBranch,
      )
      setRepos(prev => prev.map((r, idx) =>
        idx === i
          ? { config, workflows, versions: { release, snapshot }, counts, loading: false, error: null }
          : r
      ))
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Unknown error'
      setRepos(prev => prev.map((r, idx) =>
        idx === i
          ? { config, workflows: [], versions: { release: null, snapshot: null }, counts: { openIssues: 0, openPRs: 0 }, loading: false, error: msg }
          : r
      ))
    }

    setRateLimit(getRateLimit())
  }, [])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  return { repos, rateLimit, lastUpdated, refresh: refreshAll, refreshRepo }
}
