import React from 'react'
import { Swords, Clock, Skull, Target, Play } from 'lucide-react'
import { Leaderboard } from './Leaderboard'
import { MatchCard } from './MatchCard'

export function Dashboard({ players, matches, getPlayerStats, formatDuration, onDeleteMatch, onViewReport, onNewMatch, onStartLive }) {
  const recentMatches = matches.slice(0, 3)

  // Calculate stats
  const totalPlayTime = matches.reduce((acc, m) => acc + (m.duration || 0), 0)
  const totalAiKills = matches.reduce((acc, m) =>
    acc + (m.players?.[0]?.aiEliminations || 0) + (m.players?.[1]?.aiEliminations || 0), 0
  )

  return (
    <div className="space-y-4">
      {/* Quick action buttons */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={onStartLive}
          className="btn-settlers py-4 text-base flex items-center justify-center gap-2 pulse-gold"
        >
          <Play className="w-5 h-5" />
          Live Kamp
        </button>
        <button
          onClick={onNewMatch}
          className="py-4 text-base flex items-center justify-center gap-2 bg-settlers-brown/20 text-settlers-dark-brown rounded-lg font-bold hover:bg-settlers-brown/30 transition-colors"
        >
          <Swords className="w-5 h-5" />
          Manuell
        </button>
      </div>

      {/* Quick Stats - 2x2 grid on mobile */}
      <div className="grid grid-cols-4 gap-2">
        <QuickStat
          icon={<Target className="w-5 h-5" />}
          value={matches.length}
          label="Kamper"
        />
        <QuickStat
          icon={<Clock className="w-5 h-5" />}
          value={formatDuration(totalPlayTime)}
          label="Spilletid"
        />
        <QuickStat
          icon={<Skull className="w-5 h-5" />}
          value={totalAiKills}
          label="AI drept"
        />
        <QuickStat
          icon={<Swords className="w-5 h-5" />}
          value={matches.filter(m => m.result === 'draw').length}
          label="Uavgjort"
        />
      </div>

      {/* Leaderboard */}
      <Leaderboard
        players={players}
        getPlayerStats={getPlayerStats}
        formatDuration={formatDuration}
      />

      {/* Recent Matches */}
      {recentMatches.length > 0 && (
        <div className="parchment rounded-xl p-4 wood-frame">
          <h2 className="text-lg font-bold text-settlers-dark-brown font-medieval mb-3 flex items-center gap-2">
            <Swords className="w-5 h-5 text-settlers-gold" />
            Siste Kamper
          </h2>

          <div className="space-y-3">
            {recentMatches.map(match => (
              <MatchCard
                key={match.id}
                match={match}
                players={players}
                formatDuration={formatDuration}
                onDelete={onDeleteMatch}
                onViewReport={onViewReport}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {matches.length === 0 && (
        <div className="parchment rounded-xl p-6 text-center">
          <p className="text-settlers-brown mb-2">Ingen kamper ennå!</p>
          <p className="text-settlers-brown/70 text-sm">
            Trykk på knappen over for å registrere deres første kamp.
          </p>
        </div>
      )}
    </div>
  )
}

function QuickStat({ icon, value, label }) {
  return (
    <div className="parchment rounded-lg p-2 text-center">
      <div className="text-settlers-gold mb-1 flex justify-center">
        {icon}
      </div>
      <p className="font-bold text-settlers-dark-brown text-lg leading-none">
        {value}
      </p>
      <p className="text-[10px] text-settlers-brown mt-0.5">{label}</p>
    </div>
  )
}
