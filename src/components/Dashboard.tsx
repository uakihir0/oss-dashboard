import { useMemo } from 'react'
import type { RateLimitInfo, RepoData } from '../types'
import { GroupSection } from './GroupSection'
import { Header } from './Header'

interface Props {
  repos: RepoData[]
  rateLimit: RateLimitInfo
  lastUpdated: Date | null
  hasToken: boolean
  onRefresh: () => void
  onRefreshRepo: (repoName: string) => void
  onOpenSettings: () => void
}

export function Dashboard({ repos, rateLimit, lastUpdated, hasToken, onRefresh, onRefreshRepo, onOpenSettings }: Props) {
  const groups = useMemo(() => {
    const map = new Map<string, RepoData[]>()
    for (const repo of repos) {
      const group = repo.config.group
      if (!map.has(group)) map.set(group, [])
      map.get(group)!.push(repo)
    }
    return Array.from(map.entries())
  }, [repos])

  return (
    <div className="dashboard">
      <Header
        rateLimit={rateLimit}
        lastUpdated={lastUpdated}
        hasToken={hasToken}
        onRefresh={onRefresh}
        onOpenSettings={onOpenSettings}
      />
      {groups.map(([name, groupRepos]) => (
        <GroupSection
          key={name}
          name={name}
          repos={groupRepos}
          onRefreshRepo={onRefreshRepo}
        />
      ))}
    </div>
  )
}
