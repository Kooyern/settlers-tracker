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
      {/* Header with lead indicator */}
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <h2 className="font-semibold text-text-primary flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-accent" />
          Stilling
        </h2>
        {!isTied && isLeading && (
          <div className="flex items-center gap-2 bg-accent/10 px-3 py-1 rounded-full border border-accent/20">
            <span className="text-xs text-accent font-medium">
              {leader?.name} leder med
            </span>
            <span className="text-sm font-bold text-accent-light number-display">
              +{pointDiff.toFixed(1)}
            </span>
          </div>
        )}
        {isTied && (
          <span className="text-xs text-text-muted bg-bg-elevated px-3 py-1 rounded-full border border-border">
            Likt
          </span>
        )}
      </div>

      {/* Players */}
      <div className="p-4">
        <div className="flex gap-4">
          <PlayerCard
            player={stats.find(s => s.id === 'player1')}
            isLeader={leader?.id === 'player1' && isLeading}
            pointDiff={leader?.id === 'player1' ? pointDiff : -pointDiff}
            isTied={isTied}
          />

          {/* Divider */}
          <div className="flex flex-col items-center justify-center">
            <div className="w-px h-full bg-gradient-to-b from-transparent via-border to-transparent" />
          </div>

          <PlayerCard
            player={stats.find(s => s.id === 'player2')}
            isLeader={leader?.id === 'player2' && isLeading}
            pointDiff={leader?.id === 'player2' ? pointDiff : -pointDiff}
            isTied={isTied}
          />
        </div>
      </div>
    </div>
  )
}

function PlayerCard({ player, isLeader, pointDiff, isTied }) {
  if (!player) return null

  return (
    <div className="flex-1 text-center">
      {/* Avatar with crown */}
      <div className="relative inline-block mb-3">
        {isLeader && (
          <div className="absolute -top-4 left-1/2 -translate-x-1/2">
            <Crown className="w-5 h-5 text-accent drop-shadow-[0_0_8px_rgba(201,162,39,0.5)]" />
          </div>
        )}
        <div
          className={`
            w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl
            shadow-lg transition-all duration-300
            ${isLeader
              ? 'ring-2 ring-accent ring-offset-4 ring-offset-bg-card shadow-accent/20'
              : 'ring-1 ring-border-light ring-offset-2 ring-offset-bg-card opacity-80'
            }
          `}
          style={{ backgroundColor: player.color }}
        >
          {player.name?.charAt(0) || '?'}
        </div>
      </div>

      {/* Name */}
      <h3 className={`font-semibold text-sm mb-1 ${isLeader ? 'text-text-primary' : 'text-text-secondary'}`}>
        {player.name}
      </h3>

      {/* Points */}
      <div className="mb-4">
        <span className={`text-3xl font-bold number-display ${isLeader ? 'text-accent-gradient' : 'text-text-secondary'}`}>
          {player.stats.points.toFixed(1)}
        </span>
        <span className="text-xs text-text-muted ml-1">poeng</span>

        {/* Point difference indicator */}
        {!isTied && (
          <div className={`text-xs mt-1 font-medium ${pointDiff > 0 ? 'text-success' : 'text-text-muted'}`}>
            {pointDiff > 0 ? `+${pointDiff.toFixed(1)}` : ''}
          </div>
        )}
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-1 text-center mb-3">
        <div className="bg-bg-elevated rounded-lg py-2 px-1">
          <p className="text-lg font-bold text-success number-display">{player.stats.wins}</p>
          <p className="text-[9px] text-text-muted uppercase tracking-wide">Seire</p>
        </div>
        <div className="bg-bg-elevated rounded-lg py-2 px-1">
          <p className="text-lg font-bold text-text-muted number-display">{player.stats.draws}</p>
          <p className="text-[9px] text-text-muted uppercase tracking-wide">Uavg.</p>
        </div>
        <div className="bg-bg-elevated rounded-lg py-2 px-1">
          <p className="text-lg font-bold text-danger number-display">{player.stats.losses}</p>
          <p className="text-[9px] text-text-muted uppercase tracking-wide">Tap</p>
        </div>
      </div>

      {/* Win rate bar */}
      <div className="px-2">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="text-text-muted">Seiersrate</span>
          <span className="font-semibold text-text-primary number-display">{player.stats.winRate}%</span>
        </div>
        <div className="h-1.5 bg-bg-primary rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isLeader
                ? 'bg-gradient-to-r from-accent to-accent-light'
                : 'bg-gradient-to-r from-text-muted to-text-secondary'
            }`}
            style={{ width: `${player.stats.winRate}%` }}
          />
        </div>
      </div>
    </div>
  )
}
