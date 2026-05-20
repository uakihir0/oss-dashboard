import type { RateLimitInfo } from '../types'

interface Props {
  rateLimit: RateLimitInfo
  lastUpdated: Date | null
  hasToken: boolean
  onRefresh: () => void
  onOpenSettings: () => void
}

export function Header({ rateLimit, lastUpdated, hasToken, onRefresh, onOpenSettings }: Props) {
  const isLimited = rateLimit.remaining <= 0

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
        <span className={`rate-limit ${isLimited ? 'rate-limit-exhausted' : ''}`}>
          API: {rateLimit.remaining}/{rateLimit.limit}
          {isLimited && ` (resets ${rateLimit.resetAt.toLocaleTimeString()})`}
        </span>
        <button className="settings-btn" onClick={onOpenSettings} title="Token settings">
          {hasToken ? 'Token ✓' : 'Set Token'}
        </button>
        <button className="refresh-btn" onClick={onRefresh} disabled={isLimited}>
          Refresh
        </button>
      </div>
    </header>
  )
}
