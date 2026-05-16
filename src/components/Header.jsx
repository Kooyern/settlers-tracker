import React from 'react'
import { Shield, ScrollText, Settings, Play, Home, Swords } from 'lucide-react'

export function Header({ currentView, onViewChange, hasActiveMatch }) {
  const navItems = [
    { id: 'dashboard', label: 'Hjem', icon: Home },
    { id: 'history', label: 'Historikk', icon: ScrollText },
    { id: 'live-match', label: 'Spill', icon: Play, isMain: true },
    { id: 'new-match', label: 'Ny', icon: Swords },
    { id: 'settings', label: 'Oppsett', icon: Settings },
  ]

  return (
    <>
      <header className="bg-gradient-to-b from-bg-secondary to-bg-primary border-b border-border sticky top-0 z-50">
        <div className="flex items-center justify-center px-3 py-3 sm:py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-light to-accent-dark flex items-center justify-center shadow-lg">
              <Shield className="w-5 h-5 text-bg-primary" />
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight text-accent-gradient">
                Settlers Tracker
              </h1>
              <p className="text-[10px] text-text-muted tracking-wide uppercase">
                10th Anniversary
              </p>
            </div>
          </div>
        </div>
      </header>

      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-t from-bg-secondary via-bg-secondary to-bg-secondary/95 border-t border-border backdrop-blur-xl pb-safe">
        <div className="mx-auto flex max-w-lg items-center justify-around gap-1 px-1.5 py-2">
          {navItems.map(item => {
            const Icon = item.icon
            const isActive = currentView === item.id

            if (item.isMain) {
              return (
                <button
                  key={item.id}
                  onClick={() => onViewChange(item.id)}
                  className={`
                    relative flex items-center justify-center -mt-6
                    h-14 w-14 shrink-0 rounded-full
                    bg-gradient-to-br from-accent-light via-accent to-accent-dark
                    shadow-lg shadow-accent/20
                    transition-all duration-200 active:scale-95
                    ${isActive ? 'ring-2 ring-accent/50 ring-offset-2 ring-offset-bg-secondary' : ''}
                  `}
                  title={item.label}
                >
                  <Icon className="w-6 h-6 text-bg-primary" />
                  {hasActiveMatch && (
                    <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-success rounded-full border-2 border-bg-secondary animate-pulse" />
                  )}
                </button>
              )
            }

            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`
                  min-w-0 flex-1 flex-col items-center gap-1 rounded-xl px-1.5 py-2 transition-all duration-200
                  ${isActive
                    ? 'text-accent'
                    : 'text-text-muted hover:text-text-secondary'
                  }
                `}
                title={item.label}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'drop-shadow-[0_0_8px_rgba(201,162,39,0.5)]' : ''}`} />
                <span className="max-w-full truncate text-[10px] font-medium leading-none">{item.label}</span>
              </button>
            )
          })}
        </div>
      </nav>
    </>
  )
}
