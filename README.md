# OSS Dashboard

A dashboard to monitor CI status and versions of public GitHub repositories. Built with React + TypeScript + Vite, designed to be hosted on GitHub Pages.

## Features

- **CI Status**: Displays the latest workflow run status for each repository (Dependabot excluded)
- **Versions**: Shows the latest release tag and snapshot version (parsed from `build.gradle.kts`)
- **Client-side only**: All data is fetched directly from the GitHub API in the browser
- **Rate limit aware**: Throttled requests, localStorage caching with ETag support
- **Token support**: Optional GitHub Personal Access Token for 5,000 req/hr (vs 60 unauthenticated)

## Monitored Repositories

| Repository | Description |
|-----------|-------------|
| [planetlink](https://github.com/uakihir0/planetlink) | Kotlin Multiplatform Multi Social Media library |
| [kbsky](https://github.com/uakihir0/kbsky) | Kotlin Multiplatform Bluesky/ATProtocol client |
| [kmastodon](https://github.com/uakihir0/kmastodon) | Kotlin Multiplatform Mastodon client |
| [kmisskey](https://github.com/uakihir0/kmisskey) | Kotlin Multiplatform Misskey library |
| [kmatrix](https://github.com/uakihir0/kmatrix) | Kotlin Multiplatform Matrix library |
| [knostr](https://github.com/uakihir0/knostr) | Kotlin Multiplatform Nostr library |
| [ktumblr](https://github.com/uakihir0/ktumblr) | Kotlin Multiplatform Tumblr library |
| [kslack](https://github.com/uakihir0/kslack) | Kotlin Multiplatform Slack library |
| [khttpclient](https://github.com/uakihir0/khttpclient) | Kotlin Multiplatform simple HTTP request library |
| [kgrpc](https://github.com/uakihir0/kgrpc) | Kotlin Multiplatform gRPC library |

## Development

```bash
pnpm install
pnpm run dev
```

## Build

```bash
pnpm run build
pnpm run preview
```

## Deployment

The project is configured for GitHub Pages with `base: '/dashboard/'` in `vite.config.ts`. Adjust the base path to match your repository name.

## Token Setup

To avoid GitHub API rate limiting (60 requests/hour for unauthenticated requests):

1. Generate a [Personal Access Token](https://github.com/settings/tokens) — no scopes required for a classic token, or use a fine-grained token with public repository read-only access
2. Click "Set Token" in the dashboard header
3. Paste the token and save

The token is stored in `localStorage` only and never sent anywhere except the GitHub API.
