import React from 'react'
import { Crown, Swords, Target, Skull, Clock, TrendingUp } from 'lucide-react'

export function Leaderboard({ players, getPlayerStats, formatDuration }) {
  const stats = players.map(player => ({
    ...player,
    stats: getPlayerStats(player.id)
  })).sort((a, b) => b.stats.points - a.stats.points)

  const leader = stats[0]
  const challenger = stats[1]

  return (
    <div className="parchment rounded-xl p-6 wood-frame">
      <div className="flex items-center gap-3 mb-6">
        <Crown className="w-8 h-8 text-settlers-gold" />
        <h2 className="text-2xl font-bold text-settlers-dark-brown font-medieval">
          Leaderboard
        </h2>
      </div>

      {/* Head to Head Display */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Player 1 */}
        <div className={`
          rounded-lg p-4 text-center relative overflow-hidden
          ${stats[0]?.id === 'player1' ? 'bg-gradient-to-br from-yellow-100 to-yellow-200 ring-2 ring-settlers-gold' : 'bg-white/50'}
        `}>
          {stats[0]?.id === 'player1' && (
            <Crown className="absolute top-2 right-2 w-5 h-5 text-settlers-gold" />
          )}
          <div
            className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center text-2xl font-bold text-white shadow-lg"
            style={{ backgroundColor: players[0]?.color }}
          >
            {players[0]?.name?.charAt(0) || 'S'}
          </div>
          <h3 className="font-bold text-settlers-dark-brown text-lg">
            {players[0]?.name || 'Spiller 1'}
          </h3>
          <p className="text-3xl font-bold text-settlers-gold mt-2">
            {stats.find(s => s.id === 'player1')?.stats.points || 0}
          </p>
          <p className="text-sm text-settlers-brown">poeng</p>
        </div>

        {/* VS Badge */}
        <div className="flex items-center justify-center">
          <div className="bg-settlers-dark-brown rounded-full p-4 shadow-lg">
            <Swords className="w-10 h-10 text-settlers-gold" />
          </div>
        </div>

        {/* Player 2 */}
        <div className={`
          rounded-lg p-4 text-center relative overflow-hidden
          ${stats[0]?.id === 'player2' ? 'bg-gradient-to-br from-yellow-100 to-yellow-200 ring-2 ring-settlers-gold' : 'bg-white/50'}
        `}>
          {stats[0]?.id === 'player2' && (
            <Crown className="absolute top-2 right-2 w-5 h-5 text-settlers-gold" />
          )}
          <div
            className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center text-2xl font-bold text-white shadow-lg"
            style={{ backgroundColor: players[1]?.color }}
          >
            {players[1]?.name?.charAt(0) || 'S'}
          </div>
          <h3 className="font-bold text-settlers-dark-brown text-lg">
            {players[1]?.name || 'Spiller 2'}
          </h3>
          <p className="text-3xl font-bold text-settlers-gold mt-2">
            {stats.find(s => s.id === 'player2')?.stats.points || 0}
          </p>
          <p className="text-sm text-settlers-brown">poeng</p>
        </div>
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-2 gap-4">
        {stats.map((player) => (
          <div key={player.id} className="bg-white/30 rounded-lg p-4">
            <h4 className="font-bold text-settlers-dark-brown mb-3 flex items-center gap-2">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: player.color }}
              />
              {player.name}
            </h4>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-2 text-settlers-brown">
                  <Target className="w-4 h-4" /> Kamper
                </span>
                <span className="font-bold text-settlers-dark-brown">
                  {player.stats.matches}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="flex items-center gap-2 text-green-700">
                  <TrendingUp className="w-4 h-4" /> Seiere
                </span>
                <span className="font-bold text-green-700">
                  {player.stats.wins}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="flex items-center gap-2 text-red-700">
                  <TrendingUp className="w-4 h-4 rotate-180" /> Tap
                </span>
                <span className="font-bold text-red-700">
                  {player.stats.losses}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="flex items-center gap-2 text-gray-600">
                  <Swords className="w-4 h-4" /> Uavgjort
                </span>
                <span className="font-bold text-gray-600">
                  {player.stats.draws}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="flex items-center gap-2 text-purple-700">
                  <Skull className="w-4 h-4" /> AI Drept
                </span>
                <span className="font-bold text-purple-700">
                  {player.stats.aiKills} (+{(player.stats.aiKills * 0.5).toFixed(1)}p)
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="flex items-center gap-2 text-settlers-brown">
                  <Clock className="w-4 h-4" /> Spilletid
                </span>
                <span className="font-bold text-settlers-dark-brown">
                  {formatDuration(player.stats.totalPlayTime)}
                </span>
              </div>

              <div className="pt-2 border-t border-settlers-brown/20">
                <div className="flex justify-between items-center">
                  <span className="text-settlers-brown">Seiersrate</span>
                  <span className="font-bold text-settlers-dark-brown">
                    {player.stats.winRate}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
