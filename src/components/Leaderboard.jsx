import React from 'react'
import { Crown, Skull } from 'lucide-react'

export function Leaderboard({ players, getPlayerStats }) {
  const stats = players.map(player => ({
    ...player,
    stats: getPlayerStats(player.id)
  })).sort((a, b) => b.stats.points - a.stats.points)

  const leader = stats[0]
  const challenger = stats[1]
  const isLeading = leader?.stats.points > (challenger?.stats.points || 0)
  const isTied = leader?.stats.points === challenger?.stats.points

  return (
    <div className="card overflow-hidden">
      {/* Title */}
      <div className="px-4 py-3 border-b border-settlers-border flex items-center justify-between">
        <h2 className="font-semibold text-settlers-text">Stillingen</h2>
        {isTied && (
          <span className="text-xs text-settlers-gold bg-settlers-gold/10 px-2 py-0.5 rounded-full">
            Likt!
          </span>
        )}
      </div>

      {/* Players */}
      <div className="p-4">
        <div className="flex gap-4">
          <PlayerCard
            player={stats.find(s => s.id === 'player1')}
            isLeader={leader?.id === 'player1' && isLeading}
          />
          <div className="w-px bg-settlers-border" />
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
    <div className="flex-1 text-center">
      {/* Avatar */}
      <div className="relative inline-block mb-3">
        {isLeader && (
          <Crown className="w-4 h-4 text-settlers-gold absolute -top-3 left-1/2 -translate-x-1/2" />
        )}
        <div
          className={`
            w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-xl
            ${isLeader ? 'ring-2 ring-settlers-gold ring-offset-2 ring-offset-settlers-card' : ''}
          `}
          style={{ backgroundColor: player.color }}
        >
          {player.name?.charAt(0) || '?'}
        </div>
      </div>

      <h3 className="font-semibold text-settlers-text text-sm mb-1">{player.name}</h3>

      {/* Points */}
      <div className="mb-3">
        <span className={`text-2xl font-bold ${isLeader ? 'text-settlers-gold' : 'text-settlers-text'}`}>
          {player.stats.points.toFixed(1)}
        </span>
        <span className="text-xs text-settlers-muted ml-1">poeng</span>
      </div>

      {/* Stats */}
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-settlers-muted">Seiere</span>
          <span className="font-medium text-green-400">{player.stats.wins}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-settlers-muted">Tap</span>
          <span className="font-medium text-red-400">{player.stats.losses}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-settlers-muted">Uavgjort</span>
          <span className="font-medium text-settlers-muted">{player.stats.draws}</span>
        </div>
        {player.stats.aiKills > 0 && (
          <div className="flex justify-between">
            <span className="text-settlers-muted flex items-center gap-1">
              <Skull className="w-3 h-3" /> AI
            </span>
            <span className="font-medium text-purple-400">{player.stats.aiKills}</span>
          </div>
        )}
      </div>

      {/* Win rate */}
      <div className="mt-3 pt-3 border-t border-settlers-border">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="text-settlers-muted">Seiersrate</span>
          <span className="font-medium text-settlers-text">{player.stats.winRate}%</span>
        </div>
        <div className="h-1.5 bg-settlers-dark rounded-full overflow-hidden">
          <div
            className="h-full bg-settlers-gold rounded-full"
            style={{ width: `${player.stats.winRate}%` }}
          />
        </div>
      </div>
    </div>
  )
}
