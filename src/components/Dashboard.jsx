import React from 'react'
import { Swords, Clock, Skull, Target, TrendingUp, Trophy, Flame, Calendar } from 'lucide-react'
import { Leaderboard } from './Leaderboard'
import { MatchCard } from './MatchCard'
import { format } from 'date-fns'
import { nb } from 'date-fns/locale'

export function Dashboard({ players, matches, getPlayerStats, formatDuration, onDeleteMatch, onViewReport, onNewMatch, onStartLive }) {
  const recentMatches = matches.slice(0, 3)

  // Calculate stats
  const totalPlayTime = matches.reduce((acc, m) => acc + (m.duration || 0), 0)
  const totalAiKills = matches.reduce((acc, m) =>
    acc + (m.players?.[0]?.aiEliminations || 0) + (m.players?.[1]?.aiEliminations || 0), 0
  )

  // Calculate streaks
  const getStreak = (playerId) => {
    let streak = 0
    for (const match of matches) {
      if (match.winnerId === playerId) {
        streak++
      } else {
        break
      }
    }
    return streak
  }

  const player1Stats = getPlayerStats('player1')
  const player2Stats = getPlayerStats('player2')
  const leader = player1Stats.points > player2Stats.points ? players[0] :
                 player2Stats.points > player1Stats.points ? players[1] : null
  const pointDiff = Math.abs(player1Stats.points - player2Stats.points)

  // Get current streak holder
  const player1Streak = getStreak('player1')
  const player2Streak = getStreak('player2')
  const currentStreakHolder = player1Streak > 0 ? { player: players[0], streak: player1Streak } :
                              player2Streak > 0 ? { player: players[1], streak: player2Streak } : null

  return (
    <div className="space-y-4">
      {/* Hero Stats Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-settlers-dark-brown via-[#4a2c1a] to-settlers-dark p-4 border border-settlers-gold/30">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-settlers-gold/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-amber-600/5 rounded-full blur-2xl" />

        <div className="relative">
          {/* Quick summary */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-settlers-wheat/60 text-xs uppercase tracking-wider">Totalt spilt</p>
              <p className="text-3xl font-bold text-settlers-gold">{matches.length}</p>
              <p className="text-settlers-wheat/40 text-xs">kamper</p>
            </div>

            {leader && (
              <div className="text-right">
                <p className="text-settlers-wheat/60 text-xs uppercase tracking-wider">Leder</p>
                <div className="flex items-center gap-2 justify-end">
                  <span className="text-lg font-bold text-settlers-wheat">{leader.name}</span>
                  <div
                    className="w-6 h-6 rounded-full border-2 border-settlers-gold"
                    style={{ backgroundColor: leader.color }}
                  />
                </div>
                <p className="text-settlers-gold text-xs">+{pointDiff.toFixed(1)} poeng</p>
              </div>
            )}
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-3 gap-2">
            <StatBox
              icon={<Clock className="w-4 h-4" />}
              value={formatDuration(totalPlayTime)}
              label="Spilletid"
            />
            <StatBox
              icon={<Skull className="w-4 h-4" />}
              value={totalAiKills}
              label="AI drept"
            />
            <StatBox
              icon={<Swords className="w-4 h-4" />}
              value={matches.filter(m => m.result === 'draw').length}
              label="Uavgjort"
            />
          </div>

          {/* Current streak indicator */}
          {currentStreakHolder && currentStreakHolder.streak >= 2 && (
            <div className="mt-3 flex items-center gap-2 bg-orange-500/20 rounded-lg px-3 py-2">
              <Flame className="w-5 h-5 text-orange-400" />
              <span className="text-orange-300 text-sm font-medium">
                {currentStreakHolder.player.name} har {currentStreakHolder.streak} seire på rad!
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Leaderboard */}
      <Leaderboard
        players={players}
        getPlayerStats={getPlayerStats}
        formatDuration={formatDuration}
      />

      {/* Recent Matches */}
      {recentMatches.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-base font-bold text-settlers-wheat/90 font-medieval flex items-center gap-2">
              <Calendar className="w-4 h-4 text-settlers-gold" />
              Siste kamper
            </h2>
            <span className="text-xs text-settlers-wheat/40">{matches.length} totalt</span>
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
        <div className="rounded-2xl bg-gradient-to-br from-settlers-parchment/10 to-settlers-parchment/5 border border-settlers-gold/20 p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-settlers-gold/10 flex items-center justify-center">
            <Swords className="w-8 h-8 text-settlers-gold/50" />
          </div>
          <p className="text-settlers-wheat/70 mb-2 font-medium">Ingen kamper ennå!</p>
          <p className="text-settlers-wheat/40 text-sm">
            Trykk på spill-knappen for å starte deres første kamp.
          </p>
        </div>
      )}
    </div>
  )
}

function StatBox({ icon, value, label }) {
  return (
    <div className="bg-black/20 rounded-xl p-3 text-center border border-settlers-gold/10">
      <div className="text-settlers-gold/70 mb-1 flex justify-center">
        {icon}
      </div>
      <p className="font-bold text-settlers-wheat text-lg leading-none">
        {value}
      </p>
      <p className="text-[10px] text-settlers-wheat/50 mt-1">{label}</p>
    </div>
  )
}
