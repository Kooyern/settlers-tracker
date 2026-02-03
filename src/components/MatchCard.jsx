import React, { useState } from 'react'
import { Calendar, Clock, Map, Trophy, Skull, ChevronDown, ChevronUp, Trash2, Eye, AlertTriangle, FileText } from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'
import { nb } from 'date-fns/locale'

export function MatchCard({ match, players, formatDuration, onDelete, onViewReport, compact = false }) {
  const [expanded, setExpanded] = useState(false)

  const winner = players.find(p => p.id === match.winnerId)
  const loser = players.find(p => p.id !== match.winnerId)
  const matchDate = new Date(match.date)
  const mapName = match.mapName || 'Ukjent kart'
  const isDraw = match.result === 'draw'

  // Get player stats from match
  const getPlayerMatchStats = (playerId) => {
    const idx = playerId === 'player1' ? 0 : 1
    return match.players?.[idx] || { aiEliminations: 0, aiDeaths: 0 }
  }

  if (compact) {
    return (
      <div className="rounded-xl bg-gradient-to-r from-[#2a1a10] to-[#1f1209] border border-settlers-gold/10 overflow-hidden">
        <div className="p-3">
          <div className="flex items-center gap-3">
            {/* Players */}
            <div className="flex items-center gap-1.5 flex-1 min-w-0">
              {/* Player 1 */}
              <div className="flex items-center gap-1.5">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md ${match.winnerId === 'player1' ? 'ring-2 ring-settlers-gold' : ''}`}
                  style={{ backgroundColor: players[0]?.color }}
                >
                  {match.winnerId === 'player1' && !isDraw ? (
                    <Trophy className="w-4 h-4" />
                  ) : (
                    players[0]?.name?.charAt(0) || 'S'
                  )}
                </div>
              </div>

              {/* Result indicator */}
              <div className="px-2">
                {isDraw ? (
                  <span className="text-xs font-bold text-gray-400">—</span>
                ) : (
                  <span className="text-xs font-bold text-settlers-gold">vs</span>
                )}
              </div>

              {/* Player 2 */}
              <div className="flex items-center gap-1.5">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md ${match.winnerId === 'player2' ? 'ring-2 ring-settlers-gold' : ''}`}
                  style={{ backgroundColor: players[1]?.color }}
                >
                  {match.winnerId === 'player2' && !isDraw ? (
                    <Trophy className="w-4 h-4" />
                  ) : (
                    players[1]?.name?.charAt(0) || 'E'
                  )}
                </div>
              </div>
            </div>

            {/* Match info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                {isDraw ? (
                  <span className="text-xs font-medium text-gray-400 bg-gray-500/10 px-2 py-0.5 rounded">
                    Uavgjort
                  </span>
                ) : (
                  <span className="text-sm font-bold text-settlers-wheat truncate">
                    {winner?.name} vant
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-0.5 text-[11px] text-settlers-wheat/40">
                <span className="truncate">{mapName}</span>
                <span>·</span>
                <span>{formatDuration(match.duration)}</span>
              </div>
            </div>

            {/* Time ago */}
            <div className="text-right">
              <p className="text-[10px] text-settlers-wheat/40">
                {formatDistanceToNow(matchDate, { locale: nb, addSuffix: true })}
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Full card view
  return (
    <div className="rounded-2xl overflow-hidden bg-gradient-to-b from-[#2a1a10] to-[#1f1209] border border-settlers-gold/20 shadow-lg">
      {/* Match Header */}
      <div className="p-4">
        {/* Date and result badge */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-settlers-wheat/50 text-xs">
            <Calendar className="w-3.5 h-3.5" />
            <span>{format(matchDate, 'dd. MMM yyyy, HH:mm', { locale: nb })}</span>
          </div>
          {isDraw && (
            <span className="text-xs font-bold text-gray-400 bg-gray-500/20 px-3 py-1 rounded-full">
              UAVGJORT
            </span>
          )}
        </div>

        {/* Players & Result */}
        <div className="flex items-center justify-between gap-2">
          {/* Player 1 */}
          <PlayerDisplay
            player={players[0]}
            isWinner={match.winnerId === 'player1'}
            isDraw={isDraw}
            stats={getPlayerMatchStats('player1')}
          />

          {/* VS divider */}
          <div className="flex flex-col items-center px-2">
            <div className="text-2xl font-bold text-settlers-gold/50">VS</div>
          </div>

          {/* Player 2 */}
          <PlayerDisplay
            player={players[1]}
            isWinner={match.winnerId === 'player2'}
            isDraw={isDraw}
            stats={getPlayerMatchStats('player2')}
          />
        </div>

        {/* Quick Info Bar */}
        <div className="flex items-center justify-center gap-4 mt-4 pt-3 border-t border-settlers-gold/10">
          <div className="flex items-center gap-1.5 text-xs text-settlers-wheat/50">
            <Map className="w-3.5 h-3.5" />
            <span>{mapName}</span>
          </div>
          <div className="w-1 h-1 rounded-full bg-settlers-gold/30" />
          <div className="flex items-center gap-1.5 text-xs text-settlers-wheat/50">
            <Clock className="w-3.5 h-3.5" />
            <span>{formatDuration(match.duration)}</span>
          </div>
          {(getPlayerMatchStats('player1').aiEliminations > 0 || getPlayerMatchStats('player2').aiEliminations > 0) && (
            <>
              <div className="w-1 h-1 rounded-full bg-settlers-gold/30" />
              <div className="flex items-center gap-1.5 text-xs text-purple-400">
                <Skull className="w-3.5 h-3.5" />
                <span>
                  {getPlayerMatchStats('player1').aiEliminations + getPlayerMatchStats('player2').aiEliminations} AI
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Expand/Collapse */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full py-2.5 bg-black/20 hover:bg-black/30 transition-colors flex items-center justify-center gap-2 text-settlers-wheat/50 text-xs border-t border-settlers-gold/10"
      >
        {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        {expanded ? 'Skjul detaljer' : 'Vis detaljer'}
      </button>

      {/* Expanded Details */}
      {expanded && (
        <div className="p-4 bg-black/20 border-t border-settlers-gold/10 space-y-4">
          {/* AI Eliminations */}
          {(getPlayerMatchStats('player1').aiEliminations > 0 || getPlayerMatchStats('player2').aiEliminations > 0) && (
            <div>
              <h4 className="font-bold text-settlers-wheat/70 text-xs uppercase tracking-wider mb-2 flex items-center gap-2">
                <Skull className="w-4 h-4 text-purple-400" /> AI Elimineringer
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {players.map((player, idx) => {
                  const stats = getPlayerMatchStats(player.id)
                  return (
                    <div key={idx} className="bg-black/30 rounded-lg p-3 text-center">
                      <p className="text-xs text-settlers-wheat/50 mb-1">{player.name}</p>
                      <p className="text-2xl font-bold text-purple-400">{stats.aiEliminations || 0}</p>
                      <p className="text-[10px] text-settlers-wheat/30 mt-0.5">
                        +{((stats.aiEliminations || 0) * 0.5).toFixed(1)} poeng
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* AI Deaths */}
          {(getPlayerMatchStats('player1').aiDeaths > 0 || getPlayerMatchStats('player2').aiDeaths > 0) && (
            <div>
              <h4 className="font-bold text-settlers-wheat/70 text-xs uppercase tracking-wider mb-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400" /> Slått av AI
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {players.map((player, idx) => {
                  const stats = getPlayerMatchStats(player.id)
                  return (
                    <div
                      key={idx}
                      className={`rounded-lg p-3 text-center ${stats.aiDeaths > 0 ? 'bg-red-500/10' : 'bg-black/30'}`}
                    >
                      <p className="text-xs text-settlers-wheat/50 mb-1">{player.name}</p>
                      <p className={`text-xl font-bold ${stats.aiDeaths > 0 ? 'text-red-400' : 'text-settlers-wheat/30'}`}>
                        {stats.aiDeaths > 0 ? 'Ja' : 'Nei'}
                      </p>
                      {stats.aiDeaths > 0 && (
                        <p className="text-[10px] text-red-400/70 mt-0.5">-1 poeng</p>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Notes */}
          {match.notes && (
            <div>
              <h4 className="font-bold text-settlers-wheat/70 text-xs uppercase tracking-wider mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4 text-settlers-gold/50" /> Notater
              </h4>
              <p className="text-sm text-settlers-wheat/60 bg-black/30 rounded-lg p-3">
                {match.notes}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 justify-end pt-2">
            {(match.battleReport || match.isLiveMatch || match.events?.length > 0) && (
              <button
                onClick={() => onViewReport(match)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-settlers-gold/10 text-settlers-gold text-xs font-medium hover:bg-settlers-gold/20 transition-colors"
              >
                <Eye className="w-3.5 h-3.5" /> Kamprapport
              </button>
            )}
            <button
              onClick={() => onDelete(match.id)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-red-500/10 text-red-400 text-xs font-medium hover:bg-red-500/20 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" /> Slett
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function PlayerDisplay({ player, isWinner, isDraw, stats }) {
  return (
    <div className={`flex-1 text-center ${isWinner && !isDraw ? '' : isDraw ? 'opacity-80' : 'opacity-50'}`}>
      <div
        className={`
          w-14 h-14 rounded-full mx-auto mb-2 flex items-center justify-center text-white font-bold text-lg
          shadow-lg transition-all
          ${isWinner && !isDraw ? 'ring-4 ring-settlers-gold ring-offset-2 ring-offset-[#2a1a10]' : ''}
        `}
        style={{ backgroundColor: player?.color }}
      >
        {isWinner && !isDraw ? (
          <Trophy className="w-6 h-6" />
        ) : (
          player?.name?.charAt(0) || '?'
        )}
      </div>

      <p className="font-bold text-settlers-wheat text-sm">{player?.name}</p>

      {/* Result badge */}
      {!isDraw && (
        <div className="mt-1.5">
          {isWinner ? (
            <span className="inline-block px-3 py-0.5 rounded-full text-xs font-bold bg-green-500/20 text-green-400 border border-green-500/30">
              SEIER
            </span>
          ) : (
            <span className="inline-block px-3 py-0.5 rounded-full text-xs font-bold bg-red-500/20 text-red-400 border border-red-500/30">
              TAP
            </span>
          )}
        </div>
      )}

      {/* AI stats badges */}
      {(stats.aiEliminations > 0 || stats.aiDeaths > 0) && (
        <div className="mt-2 flex items-center justify-center gap-1">
          {stats.aiEliminations > 0 && (
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400 text-[10px]">
              <Skull className="w-2.5 h-2.5" />
              {stats.aiEliminations}
            </span>
          )}
          {stats.aiDeaths > 0 && (
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 text-[10px]">
              <AlertTriangle className="w-2.5 h-2.5" />
            </span>
          )}
        </div>
      )}
    </div>
  )
}
