import type { RepoConfig } from './types'

export const REPOS: RepoConfig[] = [
  {
    owner: 'uakihir0',
    name: 'planetlink',
    displayName: 'planetlink',
    description: 'Kotlin Multiplatform Multi Social Media library',
    mainBranch: 'main',
  },
  {
    owner: 'uakihir0',
    name: 'kbsky',
    displayName: 'kbsky',
    description: 'Kotlin Multiplatform Bluesky/ATProtocol client',
    mainBranch: 'main',
  },
  {
    owner: 'uakihir0',
    name: 'kmastodon',
    displayName: 'kmastodon',
    description: 'Kotlin Multiplatform Mastodon client',
    mainBranch: 'main',
  },
  {
    owner: 'uakihir0',
    name: 'kmisskey',
    displayName: 'kmisskey',
    description: 'Kotlin Multiplatform Misskey library',
    mainBranch: 'main',
  },
  {
    owner: 'uakihir0',
    name: 'kmatrix',
    displayName: 'kmatrix',
    description: 'Kotlin Multiplatform Matrix library',
    mainBranch: 'main',
  },
  {
    owner: 'uakihir0',
    name: 'knostr',
    displayName: 'knostr',
    description: 'Kotlin Multiplatform Nostr library',
    mainBranch: 'main',
  },
  {
    owner: 'uakihir0',
    name: 'ktumblr',
    displayName: 'ktumblr',
    description: 'Kotlin Multiplatform Tumblr library',
    mainBranch: 'main',
  },
  {
    owner: 'uakihir0',
    name: 'kslack',
    displayName: 'kslack',
    description: 'Kotlin Multiplatform Slack library',
    mainBranch: 'main',
  },
  {
    owner: 'uakihir0',
    name: 'khttpclient',
    displayName: 'khttpclient',
    description: 'Kotlin Multiplatform simple HTTP request library',
    mainBranch: 'main',
  },
  {
    owner: 'uakihir0',
    name: 'kgrpc',
    displayName: 'kgrpc',
    description: 'Kotlin Multiplatform gRPC library',
    mainBranch: 'main',
  },
]

export const CACHE_TTL_MS = 5 * 60 * 1000

export const EXCLUDED_WORKFLOWS = ['dependabot']
