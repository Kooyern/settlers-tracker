import React from 'react'
import { Crown, Swords, Trophy, Skull, AlertTriangle } from 'lucide-react'

export function Leaderboard({ players, getPlayerStats, formatDuration }) {
  const stats = players.map(player => ({
    ...player,
    stats: getPlayerStats(player.id)
  })).sort((a, b) => b.stats.points - a.stats.points)

  const leader = stats[0]
  const isLeading = leader?.stats.points > (stats[1]?.stats.points || 0)

  return (
    <div className="parchment rounded-xl p-4 wood-frame">
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="w-6 h-6 text-settlers-gold" />
        <h2 className="text-lg font-bold text-settlers-dark-brown font-medieval">
          Stillingen
        </h2>
      </div>

      {/* Head to Head - Mobile optimized */}
      <div className="flex items-center justify-around gap-2 mb-4">
        {/* Player 1 */}
        <PlayerCard
          player={stats.find(s => s.id === 'player1')}
          isLeader={leader?.id === 'player1' && isLeading}
        />

        {/* VS */}
        <div className="flex flex-col items-center">
          <Swords className="w-8 h-8 text-settlers-gold" />
          <span className="text-xs text-settlers-brown font-bold mt-1">VS</span>
        </div>

        {/* Player 2 */}
        <PlayerCard
          player={stats.find(s => s.id === 'player2')}
          isLeader={leader?.id === 'player2' && isLeading}
        />
      </div>

      {/* Detailed Stats - Compact for mobile */}
      <div className="grid grid-cols-2 gap-2">
        {players.map((p) => {
          const player = stats.find(s => s.id === p.id)
          return (
          <div key={player.id} className="bg-white/40 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: player.color }}
              />
              <span className="font-bold text-settlers-dark-brown text-sm truncate">
                {player.name}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
              <StatRow label="Seiere" value={player.stats.wins} color="text-green-700" />
              <StatRow label="Tap" value={player.stats.losses} color="text-red-700" />
              <StatRow label="Uavgjort" value={player.stats.draws} color="text-gray-600" />
              <StatRow
                label="AI drept"
                value={player.stats.aiKills}
                color="text-purple-700"
                icon={<Skull className="w-3 h-3" />}
              />
              {player.stats.aiDeaths > 0 && (
                <StatRow
                  label="Slått av AI"
                  value={player.stats.aiDeaths}
                  color="text-red-600"
                  icon={<AlertTriangle className="w-3 h-3" />}
                />
              )}
            </div>

            <div className="mt-2 pt-2 border-t border-settlers-brown/20 flex justify-between items-center">
              <span className="text-xs text-settlers-brown">Seiersrate</span>
              <span className="font-bold text-settlers-dark-brown text-sm">
                {player.stats.winRate}%
              </span>
            </div>
          </div>
          )
        })}
      </div>
    </div>
  )
}

function PlayerCard({ player, isLeader }) {
  if (!player) return null

  return (
    <div className={`
      flex flex-col items-center p-3 rounded-xl flex-1 max-w-[140px]
      ${isLeader ? 'bg-yellow-50 ring-2 ring-settlers-gold' : 'bg-white/30'}
    `}>
      {isLeader && (
        <Crown className="w-5 h-5 text-settlers-gold mb-1" />
      )}
      <div
        className={`
          w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-md
          ${isLeader ? 'ring-4 ring-settlers-gold ring-offset-2' : ''}
        `}
        style={{ backgroundColor: player.color }}
      >
        {player.name?.charAt(0) || '?'}
      </div>
      <h3 className="font-bold text-settlers-dark-brown text-sm mt-2 truncate max-w-full">
        {player.name}
      </h3>
      <p className="text-2xl font-bold text-settlers-gold">
        {player.stats.points.toFixed(1)}
      </p>
      <p className="text-[10px] text-settlers-brown -mt-1">poeng</p>
    </div>
  )
}

function StatRow({ label, value, color, icon }) {
  return (
    <div className="flex justify-between items-center">
      <span className={`${color} flex items-center gap-1`}>
        {icon}
        {label}
      </span>
      <span className={`font-bold ${color}`}>{value}</span>
    </div>
  )
}
