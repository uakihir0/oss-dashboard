import type { RateLimitInfo } from '../types'

interface Props {
  rateLimit: RateLimitInfo
  lastUpdated: Date | null
  onRefresh: () => void
}

export function Header({ rateLimit, lastUpdated, onRefresh }: Props) {
  return (
    <header className="header">
      <div className="header-left">
        <h1>OSS Dashboard</h1>
        {lastUpdated && (
          <span className="last-updated">
            Updated: {lastUpdated.toLocaleTimeString()}
          </span>
        )}
      </div>
      <div className="header-right">
        <span className="rate-limit">
          API: {rateLimit.remaining}/{rateLimit.limit}
        </span>
        <button className="refresh-btn" onClick={onRefresh}>
          Refresh
        </button>
      </div>
    </header>
  )
}
