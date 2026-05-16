import React from 'react'
import { Crown, TrendingUp } from 'lucide-react'

export function Leaderboard({ players, getPlayerStats }) {
  const stats = players.map(player => ({
    ...player,
    stats: getPlayerStats(player.id)
  })).sort((a, b) => b.stats.points - a.stats.points)

  const leader = stats[0]
  const challenger = stats[1]
  const isLeading = leader?.stats.points > (challenger?.stats.points || 0)
  const isTied = leader?.stats.points === challenger?.stats.points
  const pointDiff = Math.abs((leader?.stats.points || 0) - (challenger?.stats.points || 0))

  return (
    <div className="card overflow-hidden">
      {/* Header */}
      <div className="border-b border-border px-3 py-4 sm:px-5">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-text-primary flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-accent" />
            Stilling
          </h2>
          {isTied && (
            <span className="text-xs text-text-muted bg-bg-elevated px-3 py-1.5 rounded-full border border-border">
              Likt
            </span>
          )}
        </div>

        {/* Lead indicator - on its own line for clarity */}
        {!isTied && isLeading && (
          <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5 rounded-xl border border-accent/20 bg-accent/10 px-3 py-2 text-center">
            <span className="text-sm text-accent">
              <span className="font-semibold">{leader?.name}</span> leder med
            </span>
            <span className="text-lg font-bold text-accent number-display">
              +{pointDiff.toFixed(1)}
            </span>
            <span className="text-sm text-accent">poeng</span>
          </div>
        )}
      </div>

      {/* Players comparison */}
      <div className="p-3 sm:p-5">
        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] sm:gap-4">
          <PlayerCard
            player={stats.find(s => s.id === 'player1')}
            isLeader={leader?.id === 'player1' && isLeading}
          />

          <div className="hidden items-center sm:flex">
            <div className="h-3/4 w-px bg-gradient-to-b from-transparent via-border to-transparent" />
          </div>

          <PlayerCard
            player={stats.find(s => s.id === 'player2')}
            isLeader={leader?.id === 'player2' && isLeading}
          />
        </div>
      </div>
    </div>
  )
}

function PlayerCard({ player, isLeader }) {
  if (!player) return null

  return (
    <div className="min-w-0 rounded-xl border border-border bg-bg-elevated/50 p-3 text-center sm:border-0 sm:bg-transparent sm:p-0">
      {/* Avatar with crown */}
      <div className="relative inline-block mb-4">
        {isLeader && (
          <div className="absolute -top-5 left-1/2 -translate-x-1/2">
            <Crown className="w-6 h-6 text-accent drop-shadow-[0_0_8px_rgba(201,162,39,0.5)]" />
          </div>
        )}
        <div
          className={`
            w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl
            shadow-lg transition-all
            ${isLeader
              ? 'ring-2 ring-accent ring-offset-4 ring-offset-bg-card'
              : 'opacity-70'
            }
          `}
          style={{ backgroundColor: player.color }}
        >
          {player.name?.charAt(0) || '?'}
        </div>
      </div>

      {/* Name */}
      <h3 className={`mb-2 truncate font-semibold ${isLeader ? 'text-text-primary' : 'text-text-secondary'}`}>
        {player.name}
      </h3>

      {/* Points - larger and more prominent */}
      <div className="mb-5">
        <span className={`number-display text-3xl font-bold sm:text-4xl ${isLeader ? 'text-accent' : 'text-text-secondary'}`}>
          {player.stats.points.toFixed(1)}
        </span>
        <span className="ml-1 text-sm text-text-muted">poeng</span>
      </div>

      {/* Stats - more spacious */}
      <div className="mb-4 grid grid-cols-3 gap-1.5 sm:gap-2">
        <div className="rounded-xl bg-bg-primary px-1 py-2 sm:bg-bg-elevated sm:px-2 sm:py-3">
          <p className="number-display text-lg font-bold text-success sm:text-xl">{player.stats.wins}</p>
          <p className="text-[10px] text-text-muted uppercase tracking-wider mt-1">Seire</p>
        </div>
        <div className="rounded-xl bg-bg-primary px-1 py-2 sm:bg-bg-elevated sm:px-2 sm:py-3">
          <p className="number-display text-lg font-bold text-text-muted sm:text-xl">{player.stats.draws}</p>
          <p className="text-[10px] text-text-muted uppercase tracking-wider mt-1">Uavgjort</p>
        </div>
        <div className="rounded-xl bg-bg-primary px-1 py-2 sm:bg-bg-elevated sm:px-2 sm:py-3">
          <p className="number-display text-lg font-bold text-danger sm:text-xl">{player.stats.losses}</p>
          <p className="text-[10px] text-text-muted uppercase tracking-wider mt-1">Tap</p>
        </div>
      </div>

      {/* Win rate bar */}
      <div>
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-text-muted">Seiersrate</span>
          <span className="font-semibold text-text-primary number-display">{player.stats.winRate}%</span>
        </div>
        <div className="h-2 bg-bg-primary rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isLeader
                ? 'bg-gradient-to-r from-accent to-accent-light'
                : 'bg-text-muted'
            }`}
            style={{ width: `${player.stats.winRate}%` }}
          />
        </div>
      </div>
    </div>
  )
}
