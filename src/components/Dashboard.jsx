import React from 'react'
import { Swords, Clock, Skull, Flame, Trophy } from 'lucide-react'
import { Leaderboard } from './Leaderboard'
import { MatchCard } from './MatchCard'

export function Dashboard({ players, matches, getPlayerStats, formatDuration, onDeleteMatch, onViewReport }) {
  const recentMatches = matches.slice(0, 3)

  // Calculate stats
  const totalPlayTime = matches.reduce((acc, m) => acc + (m.duration || 0), 0)
  const totalAiKills = matches.reduce((acc, m) =>
    acc + (m.players?.[0]?.aiEliminations || 0) + (m.players?.[1]?.aiEliminations || 0), 0
  )

  // Calculate current streak
  const getStreak = (playerId) => {
    let streak = 0
    for (const match of matches) {
      if (match.winnerId === playerId) streak++
      else break
    }
    return streak
  }

  const player1Streak = getStreak('player1')
  const player2Streak = getStreak('player2')
  const currentStreakHolder = player1Streak > 0 ? { player: players[0], streak: player1Streak } :
                              player2Streak > 0 ? { player: players[1], streak: player2Streak } : null

  return (
    <div className="space-y-4">
      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard
          value={matches.length}
          label="Kamper"
          icon={<Trophy className="w-4 h-4" />}
        />
        <StatCard
          value={formatDuration(totalPlayTime)}
          label="Spilletid"
          icon={<Clock className="w-4 h-4" />}
        />
        <StatCard
          value={totalAiKills}
          label="AI drept"
          icon={<Skull className="w-4 h-4" />}
        />
      </div>

      {/* Current streak */}
      {currentStreakHolder && currentStreakHolder.streak >= 2 && (
        <div className="card p-4 flex items-center gap-4 glow-accent">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500/20 to-red-500/20 flex items-center justify-center border border-orange-500/30">
            <Flame className="w-6 h-6 text-orange-400" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-text-primary">
              {currentStreakHolder.player.name} er på fyr!
            </p>
            <p className="text-xs text-text-secondary">
              {currentStreakHolder.streak} seire på rad
            </p>
          </div>
          <div className="text-2xl font-bold text-orange-400 number-display">
            🔥 {currentStreakHolder.streak}
          </div>
        </div>
      )}

      {/* Leaderboard */}
      <Leaderboard
        players={players}
        getPlayerStats={getPlayerStats}
      />

      {/* Recent Matches */}
      {recentMatches.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-semibold text-text-secondary tracking-wide uppercase">
              Siste kamper
            </h2>
            <span className="text-xs text-text-muted number-display">{matches.length} totalt</span>
          </div>

          <div className="space-y-2">
            {recentMatches.map(match => (
              <MatchCard
                key={match.id}
                match={match}
                players={players}
                formatDuration={formatDuration}
                onDelete={onDeleteMatch}
                onViewReport={onViewReport}
                compact
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {matches.length === 0 && (
        <div className="card p-10 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-bg-elevated flex items-center justify-center border border-border">
            <Swords className="w-8 h-8 text-text-muted" />
          </div>
          <p className="text-text-primary font-medium mb-1">Ingen kamper ennå</p>
          <p className="text-sm text-text-muted">
            Trykk på spill-knappen for å starte.
          </p>
        </div>
      )}
    </div>
  )
}

function StatCard({ value, label, icon }) {
  return (
    <div className="card p-4 text-center">
      <div className="flex justify-center mb-2">
        <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
          {icon}
        </div>
      </div>
      <p className="text-2xl font-bold text-text-primary number-display">{value}</p>
      <p className="text-[10px] text-text-muted uppercase tracking-wider mt-1">{label}</p>
    </div>
  )
}
