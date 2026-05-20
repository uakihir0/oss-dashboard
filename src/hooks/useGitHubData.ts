import { useCallback, useEffect, useState } from 'react'
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

  const fetchAll = useCallback(async () => {
    setRepos(prev => prev.map(r => ({ ...r, loading: true, error: null })))

    const results = await Promise.all(
      REPOS.map(async (config) => {
        try {
          const [workflows, release, snapshot] = await Promise.all([
            fetchWorkflowStatuses(config.owner, config.name, config.mainBranch),
            config.hasReleases
              ? fetchLatestRelease(config.owner, config.name)
              : Promise.resolve(null),
            fetchSnapshotVersion(config.owner, config.name),
          ])

          return {
            config,
            workflows,
            versions: { release, snapshot },
            loading: false,
            error: null,
          } satisfies RepoData
        } catch (e) {
          return {
            config,
            workflows: [],
            versions: { release: null, snapshot: null },
            loading: false,
            error: e instanceof Error ? e.message : 'Unknown error',
          } satisfies RepoData
        }
      })
    )

    setRepos(results)
    setRateLimit(getRateLimit())
    setLastUpdated(new Date())
  }, [])

  const refresh = useCallback(() => {
    clearCache()
    fetchAll()
  }, [fetchAll])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  return { repos, rateLimit, lastUpdated, refresh }
}
