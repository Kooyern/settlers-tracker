import React from 'react'
import { Shield, ScrollText, Settings, Play, Home, Swords } from 'lucide-react'

export function Header({ currentView, onViewChange, hasActiveMatch }) {
  const navItems = [
    { id: 'dashboard', label: 'Hjem', icon: Home },
    { id: 'history', label: 'Historikk', icon: ScrollText },
    { id: 'live-match', label: 'Spill', icon: Play, isMain: true },
    { id: 'new-match', label: 'Registrer', icon: Swords },
    { id: 'settings', label: 'Innstillinger', icon: Settings },
  ]

  return (
    <>
      {/* Top Header */}
      <header className="bg-settlers-card border-b border-settlers-border sticky top-0 z-50">
        <div className="flex items-center justify-center py-4 px-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-settlers-gold flex items-center justify-center">
              <Shield className="w-5 h-5 text-settlers-dark" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-settlers-gold tracking-wide">
                Settlers Tracker
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-settlers-card border-t border-settlers-border pb-safe">
        <div className="flex justify-around items-center px-2 py-2 max-w-lg mx-auto">
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
                    w-14 h-14 rounded-full
                    ${isActive ? 'bg-settlers-gold' : 'bg-settlers-gold/90'}
                    transition-transform active:scale-95
                  `}
                >
                  <Icon className="w-6 h-6 text-settlers-dark" />
                  {hasActiveMatch && (
                    <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-settlers-card" />
                  )}
                </button>
              )
            }

            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`
                  flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-colors min-w-[60px]
                  ${isActive ? 'text-settlers-gold' : 'text-settlers-muted'}
                `}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-medium">{item.label}</span>
              </button>
            )
          })}
        </div>
      </nav>
    </>
  )
}
