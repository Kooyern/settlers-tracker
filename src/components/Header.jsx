import React from 'react'
import { Shield, Swords, Trophy, ScrollText, Settings } from 'lucide-react'

export function Header({ currentView, onViewChange }) {
  const navItems = [
    { id: 'dashboard', label: 'Slagmark', icon: Shield },
    { id: 'new-match', label: 'Ny Kamp', icon: Swords },
    { id: 'history', label: 'Krønike', icon: ScrollText },
    { id: 'settings', label: 'Innstillinger', icon: Settings },
  ]

  return (
    <header className="bg-gradient-to-b from-settlers-dark-brown to-settlers-dark border-b-4 border-settlers-gold">
      {/* Main title banner */}
      <div className="text-center py-6 relative overflow-hidden">
        {/* Decorative background */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-32 h-32 bg-settlers-gold rounded-full blur-3xl" />
          <div className="absolute top-0 right-0 w-32 h-32 bg-settlers-gold rounded-full blur-3xl" />
        </div>

        <div className="relative">
          <div className="flex items-center justify-center gap-4 mb-2">
            <Trophy className="w-8 h-8 text-settlers-gold" />
            <h1 className="text-3xl md:text-4xl font-bold gold-text tracking-wider">
              SETTLERS
            </h1>
            <Trophy className="w-8 h-8 text-settlers-gold" />
          </div>
          <p className="text-settlers-wheat text-lg tracking-widest">
            10th Anniversary Battle Tracker
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex justify-center gap-2 pb-4 px-4 flex-wrap">
        {navItems.map(item => {
          const Icon = item.icon
          const isActive = currentView === item.id

          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300
                font-medieval text-sm uppercase tracking-wider
                ${isActive
                  ? 'bg-settlers-gold text-settlers-dark shadow-lg scale-105'
                  : 'bg-settlers-dark-brown/50 text-settlers-wheat hover:bg-settlers-brown/50 hover:text-settlers-gold'
                }
              `}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{item.label}</span>
            </button>
          )
        })}
      </nav>
    </header>
  )
}
