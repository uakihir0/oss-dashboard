import { useState } from 'react'

interface Props {
  token: string | null
  onSave: (token: string | null) => void
  onClose: () => void
}

export function TokenSettings({ token, onSave, onClose }: Props) {
  const [value, setValue] = useState(token ?? '')

  const handleSave = () => {
    const trimmed = value.trim()
    onSave(trimmed || null)
    onClose()
  }

  const handleClear = () => {
    setValue('')
    onSave(null)
    onClose()
  }

  return (
    <div className="token-overlay" onClick={onClose}>
      <div className="token-dialog" onClick={e => e.stopPropagation()}>
        <h2>GitHub Token</h2>
        <p className="token-description">
          Set a Personal Access Token to increase the API rate limit from 60 to 5,000 requests/hour.
          No scopes are required — a scopeless classic token or a read-only fine-grained token is sufficient.
          The token is stored in your browser only.
        </p>
        <input
          type="password"
          className="token-input"
          placeholder="ghp_xxxxxxxxxxxx"
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSave()}
        />
        <div className="token-actions">
          {token && (
            <button className="token-btn token-btn-danger" onClick={handleClear}>
              Clear
            </button>
          )}
          <button className="token-btn token-btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="token-btn token-btn-primary" onClick={handleSave}>
            Save
          </button>
        </div>
      </div>
    </div>
  )
}
