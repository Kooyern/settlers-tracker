import React from 'react'
import { Home, Activity, Plus, ScrollText, Map } from 'lucide-react'

const TABS = [
  { id: 'home', label: 'Hjem', icon: Home },
  { id: 'live', label: 'Live', icon: Activity },
  { id: 'new', label: 'Ny', icon: Plus },
  { id: 'matches', label: 'Kamper', icon: ScrollText },
  { id: 'maps', label: 'Kart', icon: Map },
]

export function BottomNav({ current, onChange, hasActiveMatch }) {
  return (
    <nav className="app-bottomnav" aria-label="Hovedmeny">
      <div className="app-bottomnav-inner">
        {TABS.map(tab => {
          const Icon = tab.icon
          const isActive = current === tab.id

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              className="bottomnav-btn"
              data-active={isActive}
              aria-label={tab.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <div className="relative">
                <Icon className="w-[22px] h-[22px]" strokeWidth={isActive ? 2.3 : 1.9} />
                {tab.id === 'live' && hasActiveMatch && (
                  <span className="pulse-dot absolute -right-1.5 -top-1 h-2 w-2 rounded-full bg-success" />
                )}
              </div>
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
