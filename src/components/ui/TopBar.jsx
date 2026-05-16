import React from 'react'
import { Shield, Settings, ChevronLeft } from 'lucide-react'

export function TopBar({ title, subtitle, onBack, onSettings, hasActiveMatch }) {
  return (
    <header className="app-topbar">
      <div className="app-topbar-inner">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {onBack ? (
            <button
              type="button"
              onClick={onBack}
              className="btn-icon"
              aria-label="Tilbake"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          ) : (
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-accent-light to-accent-dark shadow-md">
              <Shield className="w-[18px] h-[18px] text-bg-primary" />
            </div>
          )}
          <div className="min-w-0">
            <h1 className="truncate text-base font-semibold leading-tight text-text-primary">
              {title || 'Settlers Tracker'}
            </h1>
            {subtitle && (
              <p className="truncate text-[11px] text-text-muted leading-tight">{subtitle}</p>
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {hasActiveMatch && (
            <span className="badge badge-win">
              <span className="pulse-dot inline-block h-2 w-2 rounded-full bg-success" />
              Live
            </span>
          )}
          {onSettings && (
            <button
              type="button"
              onClick={onSettings}
              className="btn-icon"
              aria-label="Innstillinger"
            >
              <Settings className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
