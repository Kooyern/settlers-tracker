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
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-settlers-text">{matches.length}</p>
          <p className="text-xs text-settlers-muted mt-1">Kamper</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-settlers-text">{formatDuration(totalPlayTime)}</p>
          <p className="text-xs text-settlers-muted mt-1">Spilletid</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-settlers-text">{totalAiKills}</p>
          <p className="text-xs text-settlers-muted mt-1">AI drept</p>
        </div>
      </div>

      {/* Current streak */}
      {currentStreakHolder && currentStreakHolder.streak >= 2 && (
        <div className="card p-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center">
            <Flame className="w-5 h-5 text-orange-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-settlers-text">
              {currentStreakHolder.player.name} har {currentStreakHolder.streak} seire på rad!
            </p>
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
            <h2 className="text-sm font-semibold text-settlers-muted">Siste kamper</h2>
            <span className="text-xs text-settlers-muted">{matches.length} totalt</span>
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
        <div className="card p-8 text-center">
          <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-settlers-border flex items-center justify-center">
            <Swords className="w-7 h-7 text-settlers-muted" />
          </div>
          <p className="text-settlers-text font-medium mb-1">Ingen kamper ennå</p>
          <p className="text-sm text-settlers-muted">
            Trykk på spill-knappen for å starte.
          </p>
        </div>
      )}
    </div>
  )
}
