import React from 'react'
import { Crown, Swords, Trophy, Skull, AlertTriangle, TrendingUp, Percent } from 'lucide-react'

export function Leaderboard({ players, getPlayerStats, formatDuration }) {
  const stats = players.map(player => ({
    ...player,
    stats: getPlayerStats(player.id)
  })).sort((a, b) => b.stats.points - a.stats.points)

  const leader = stats[0]
  const challenger = stats[1]
  const isLeading = leader?.stats.points > (challenger?.stats.points || 0)
  const isTied = leader?.stats.points === challenger?.stats.points

  return (
    <div className="rounded-2xl overflow-hidden bg-gradient-to-b from-[#2a1a10] to-[#1f1209] border border-settlers-gold/20">
      {/* Title bar */}
      <div className="bg-gradient-to-r from-settlers-gold/20 via-settlers-gold/10 to-settlers-gold/20 px-4 py-3 border-b border-settlers-gold/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-settlers-gold" />
            <h2 className="text-base font-bold text-settlers-wheat font-medieval">Stillingen</h2>
          </div>
          {isTied && (
            <span className="text-xs bg-settlers-gold/20 text-settlers-gold px-2 py-0.5 rounded-full">
              Likt!
            </span>
          )}
        </div>
      </div>

      {/* Players comparison */}
      <div className="p-4">
        <div className="flex items-stretch gap-3">
          {/* Player 1 */}
          <PlayerColumn
            player={stats.find(s => s.id === 'player1')}
            isLeader={leader?.id === 'player1' && isLeading}
            opponent={stats.find(s => s.id === 'player2')}
          />

          {/* Divider with VS */}
          <div className="flex flex-col items-center justify-center px-1">
            <div className="flex-1 w-px bg-gradient-to-b from-transparent via-settlers-gold/30 to-transparent" />
            <div className="py-2">
              <div className="w-10 h-10 rounded-full bg-settlers-gold/10 border border-settlers-gold/30 flex items-center justify-center">
                <Swords className="w-5 h-5 text-settlers-gold" />
              </div>
            </div>
            <div className="flex-1 w-px bg-gradient-to-b from-transparent via-settlers-gold/30 to-transparent" />
          </div>

          {/* Player 2 */}
          <PlayerColumn
            player={stats.find(s => s.id === 'player2')}
            isLeader={leader?.id === 'player2' && isLeading}
            opponent={stats.find(s => s.id === 'player1')}
          />
        </div>
      </div>
    </div>
  )
}

function PlayerColumn({ player, isLeader, opponent }) {
  if (!player) return null

  const pointDiff = player.stats.points - (opponent?.stats.points || 0)

  return (
    <div className="flex-1 flex flex-col">
      {/* Player header */}
      <div className={`
        relative rounded-xl p-3 mb-3 transition-all
        ${isLeader
          ? 'bg-gradient-to-br from-settlers-gold/20 to-amber-600/10 border border-settlers-gold/40'
          : 'bg-white/5 border border-white/10'
        }
      `}>
        {/* Crown for leader */}
        {isLeader && (
          <div className="absolute -top-2 left-1/2 -translate-x-1/2">
            <Crown className="w-5 h-5 text-settlers-gold drop-shadow-lg" />
          </div>
        )}

        {/* Avatar */}
        <div className="flex flex-col items-center">
          <div
            className={`
              w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-xl
              shadow-lg transition-all
              ${isLeader ? 'ring-3 ring-settlers-gold ring-offset-2 ring-offset-[#2a1a10]' : ''}
            `}
            style={{ backgroundColor: player.color }}
          >
            {player.name?.charAt(0) || '?'}
          </div>

          <h3 className="font-bold text-settlers-wheat text-sm mt-2 truncate max-w-full">
            {player.name}
          </h3>

          {/* Points */}
          <div className="mt-1">
            <span className={`text-2xl font-bold ${isLeader ? 'text-settlers-gold' : 'text-settlers-wheat/70'}`}>
              {player.stats.points.toFixed(1)}
            </span>
            <span className="text-xs text-settlers-wheat/40 ml-1">poeng</span>
          </div>

          {/* Point difference */}
          {pointDiff !== 0 && (
            <span className={`text-xs mt-0.5 ${pointDiff > 0 ? 'text-green-400' : 'text-red-400'}`}>
              {pointDiff > 0 ? '+' : ''}{pointDiff.toFixed(1)}
            </span>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="space-y-2 flex-1">
        <StatRow
          label="Seiere"
          value={player.stats.wins}
          icon="W"
          color="text-green-400"
          bgColor="bg-green-500/10"
        />
        <StatRow
          label="Tap"
          value={player.stats.losses}
          icon="L"
          color="text-red-400"
          bgColor="bg-red-500/10"
        />
        <StatRow
          label="Uavgjort"
          value={player.stats.draws}
          icon="D"
          color="text-gray-400"
          bgColor="bg-gray-500/10"
        />

        <div className="h-px bg-settlers-gold/10 my-2" />

        <div className="flex items-center justify-between text-xs">
          <span className="text-settlers-wheat/50 flex items-center gap-1">
            <Skull className="w-3 h-3" />
            AI drept
          </span>
          <span className="font-bold text-purple-400">{player.stats.aiKills}</span>
        </div>

        {player.stats.aiDeaths > 0 && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-settlers-wheat/50 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              Slått av AI
            </span>
            <span className="font-bold text-red-400">{player.stats.aiDeaths}</span>
          </div>
        )}

        {/* Win rate bar */}
        <div className="mt-3 pt-2 border-t border-settlers-gold/10">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-settlers-wheat/40 uppercase tracking-wider">Seiersrate</span>
            <span className="text-sm font-bold text-settlers-wheat">{player.stats.winRate}%</span>
          </div>
          <div className="h-1.5 bg-black/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-settlers-gold to-amber-500 rounded-full transition-all duration-500"
              style={{ width: `${player.stats.winRate}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function StatRow({ label, value, icon, color, bgColor }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className={`w-5 h-5 rounded text-[10px] font-bold flex items-center justify-center ${bgColor} ${color}`}>
          {icon}
        </span>
        <span className="text-xs text-settlers-wheat/60">{label}</span>
      </div>
      <span className={`font-bold text-sm ${color}`}>{value}</span>
    </div>
  )
}
