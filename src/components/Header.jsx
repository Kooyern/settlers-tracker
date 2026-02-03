import React from 'react'
import { Shield, Swords, ScrollText, Settings, Play, Home } from 'lucide-react'

export function Header({ currentView, onViewChange, hasActiveMatch }) {
  const navItems = [
    { id: 'dashboard', label: 'Hjem', icon: Home },
    { id: 'history', label: 'Historikk', icon: ScrollText },
    { id: 'live-match', label: 'Spill', icon: Play, highlight: true },
    { id: 'new-match', label: 'Registrer', icon: Swords },
    { id: 'settings', label: 'Innstillinger', icon: Settings },
  ]

  return (
    <>
      {/* Top Header - Clean and minimal */}
      <header className="bg-gradient-to-r from-settlers-dark-brown via-[#3d2415] to-settlers-dark-brown border-b-2 border-settlers-gold/50 sticky top-0 z-50">
        <div className="flex items-center justify-center py-3 px-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-settlers-gold to-amber-600 flex items-center justify-center shadow-lg">
              <Shield className="w-5 h-5 text-settlers-dark" />
            </div>
            <div>
              <h1 className="text-lg font-bold gold-text tracking-wide font-medieval">
                SETTLERS TRACKER
              </h1>
              <p className="text-[10px] text-settlers-wheat/60 -mt-0.5 tracking-wider">
                10TH ANNIVERSARY EDITION
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Bottom Navigation - Fixed at bottom */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-t from-settlers-dark via-settlers-dark-brown to-settlers-dark-brown/95 border-t-2 border-settlers-gold/30 backdrop-blur-lg pb-safe">
        <div className="flex justify-around items-end px-1 pt-1 pb-2 max-w-lg mx-auto">
          {navItems.map(item => {
            const Icon = item.icon
            const isActive = currentView === item.id
            const isPlayButton = item.id === 'live-match'

            if (isPlayButton) {
              return (
                <button
                  key={item.id}
                  onClick={() => onViewChange(item.id)}
                  className={`
                    relative flex flex-col items-center justify-center -mt-5
                    w-16 h-16 rounded-full
                    ${isActive
                      ? 'bg-gradient-to-br from-settlers-gold via-amber-500 to-amber-600'
                      : 'bg-gradient-to-br from-settlers-gold/90 to-amber-600/90'
                    }
                    shadow-lg shadow-amber-900/50
                    ${hasActiveMatch ? 'pulse-gold' : ''}
                    transition-transform active:scale-95
                  `}
                >
                  <Icon className={`w-7 h-7 ${isActive ? 'text-settlers-dark' : 'text-settlers-dark/90'}`} />
                  {hasActiveMatch && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-settlers-dark animate-pulse" />
                  )}
                </button>
              )
            }

            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`
                  flex flex-col items-center gap-0.5 px-2 py-2 rounded-xl transition-all min-w-[56px]
                  ${isActive
                    ? 'text-settlers-gold'
                    : 'text-settlers-wheat/50 active:text-settlers-wheat/70'
                  }
                `}
              >
                <div className={`
                  p-1.5 rounded-lg transition-all
                  ${isActive ? 'bg-settlers-gold/20' : ''}
                `}>
                  <Icon className={`w-5 h-5 ${isActive ? 'drop-shadow-glow' : ''}`} />
                </div>
                <span className={`text-[9px] font-medium ${isActive ? 'text-settlers-gold' : ''}`}>
                  {item.label}
                </span>
                {isActive && (
                  <div className="w-1 h-1 rounded-full bg-settlers-gold mt-0.5" />
                )}
              </button>
            )
          })}
        </div>
      </nav>
    </>
  )
}
