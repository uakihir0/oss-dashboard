import type { RepoConfig } from './types'

export const REPOS: RepoConfig[] = [
  {
    owner: 'uakihir0',
    name: 'kbsky',
    displayName: 'kbsky',
    description: 'Kotlin Multiplatform Bluesky/ATProtocol client',
    hasReleases: true,
    mainBranch: 'main',
  },
  {
    owner: 'uakihir0',
    name: 'kmastodon',
    displayName: 'kmastodon',
    description: 'Kotlin Multiplatform Mastodon client',
    hasReleases: false,
    mainBranch: 'main',
  },
]

export const CACHE_TTL_MS = 5 * 60 * 1000

export const EXCLUDED_WORKFLOWS = ['dependabot']
