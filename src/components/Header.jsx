import React from 'react'
import { Shield, Swords, ScrollText, Settings } from 'lucide-react'

export function Header({ currentView, onViewChange }) {
  const navItems = [
    { id: 'dashboard', label: 'Hjem', icon: Shield },
    { id: 'new-match', label: 'Ny', icon: Swords },
    { id: 'history', label: 'Historikk', icon: ScrollText },
    { id: 'settings', label: 'Innst.', icon: Settings },
  ]

  return (
    <header className="bg-gradient-to-b from-settlers-dark-brown to-settlers-dark border-b-4 border-settlers-gold sticky top-0 z-40">
      {/* Compact title for mobile */}
      <div className="text-center py-3 sm:py-4">
        <h1 className="text-xl sm:text-2xl font-bold gold-text tracking-wider">
          SETTLERS TRACKER
        </h1>
      </div>

      {/* Bottom navigation - mobile optimized */}
      <nav className="flex justify-around pb-2 px-2">
        {navItems.map(item => {
          const Icon = item.icon
          const isActive = currentView === item.id

          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`
                flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all min-w-[60px]
                ${isActive
                  ? 'bg-settlers-gold text-settlers-dark'
                  : 'text-settlers-wheat/70 active:bg-settlers-brown/30'
                }
              `}
            >
              <Icon className={`w-5 h-5 ${isActive ? '' : ''}`} />
              <span className="text-[10px] sm:text-xs font-medium">{item.label}</span>
            </button>
          )
        })}
      </nav>
    </header>
  )
}
