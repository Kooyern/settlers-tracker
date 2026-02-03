import React, { useState } from 'react'
import { Clock, Map, Trophy, Skull, ChevronDown, ChevronUp, Trash2, Eye, FileText } from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'
import { nb } from 'date-fns/locale'

export function MatchCard({ match, players, formatDuration, onDelete, onViewReport, compact = false }) {
  const [expanded, setExpanded] = useState(false)

  const winner = players.find(p => p.id === match.winnerId)
  const matchDate = new Date(match.date)
  const mapName = match.mapName || 'Ukjent kart'
  const isDraw = match.result === 'draw'

  const getPlayerMatchStats = (playerId) => {
    const idx = playerId === 'player1' ? 0 : 1
    return match.players?.[idx] || { aiEliminations: 0, aiDeaths: 0 }
  }

  // Compact view for dashboard
  if (compact) {
    return (
      <div className="card p-3">
        <div className="flex items-center gap-3">
          {/* Players */}
          <div className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold
                ${match.winnerId === 'player1' && !isDraw ? 'ring-2 ring-settlers-gold' : ''}`}
              style={{ backgroundColor: players[0]?.color }}
            >
              {match.winnerId === 'player1' && !isDraw ? (
                <Trophy className="w-3.5 h-3.5" />
              ) : (
                players[0]?.name?.charAt(0)
              )}
            </div>
            <span className="text-xs text-settlers-muted">vs</span>
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold
                ${match.winnerId === 'player2' && !isDraw ? 'ring-2 ring-settlers-gold' : ''}`}
              style={{ backgroundColor: players[1]?.color }}
            >
              {match.winnerId === 'player2' && !isDraw ? (
                <Trophy className="w-3.5 h-3.5" />
              ) : (
                players[1]?.name?.charAt(0)
              )}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            {isDraw ? (
              <span className="text-sm text-settlers-muted">Uavgjort</span>
            ) : (
              <span className="text-sm font-medium text-settlers-text">{winner?.name} vant</span>
            )}
            <div className="flex items-center gap-2 text-xs text-settlers-muted mt-0.5">
              <span className="truncate">{mapName}</span>
              <span>·</span>
              <span>{formatDuration(match.duration)}</span>
            </div>
          </div>

          {/* Time */}
          <span className="text-xs text-settlers-muted">
            {formatDistanceToNow(matchDate, { locale: nb, addSuffix: true })}
          </span>
        </div>
      </div>
    )
  }

  // Full card view
  return (
    <div className="card overflow-hidden">
      {/* Header */}
      <div className="p-4">
        {/* Date */}
        <div className="text-xs text-settlers-muted mb-4">
          {format(matchDate, 'dd. MMM yyyy, HH:mm', { locale: nb })}
        </div>

        {/* Players */}
        <div className="flex items-center justify-between gap-4">
          <PlayerDisplay
            player={players[0]}
            isWinner={match.winnerId === 'player1'}
            isDraw={isDraw}
            stats={getPlayerMatchStats('player1')}
          />

          <div className="text-lg font-bold text-settlers-muted">VS</div>

          <PlayerDisplay
            player={players[1]}
            isWinner={match.winnerId === 'player2'}
            isDraw={isDraw}
            stats={getPlayerMatchStats('player2')}
          />
        </div>

        {/* Match info */}
        <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-settlers-border text-sm text-settlers-muted">
          <div className="flex items-center gap-1.5">
            <Map className="w-4 h-4" />
            <span>{mapName}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            <span>{formatDuration(match.duration)}</span>
          </div>
        </div>
      </div>

      {/* Expand button */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full py-2.5 bg-settlers-dark hover:bg-settlers-border/50 transition-colors flex items-center justify-center gap-2 text-sm text-settlers-muted border-t border-settlers-border"
      >
        {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        {expanded ? 'Skjul detaljer' : 'Vis detaljer'}
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="p-4 bg-settlers-dark border-t border-settlers-border space-y-4">
          {/* AI stats */}
          {(getPlayerMatchStats('player1').aiEliminations > 0 || getPlayerMatchStats('player2').aiEliminations > 0) && (
            <div>
              <h4 className="text-xs font-semibold text-settlers-muted uppercase tracking-wide mb-2 flex items-center gap-2">
                <Skull className="w-4 h-4 text-purple-400" /> AI Elimineringer
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {players.map((player, idx) => {
                  const stats = getPlayerMatchStats(player.id)
                  return (
                    <div key={idx} className="bg-settlers-card rounded-lg p-3 text-center">
                      <p className="text-xs text-settlers-muted mb-1">{player.name}</p>
                      <p className="text-xl font-bold text-purple-400">{stats.aiEliminations || 0}</p>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Notes */}
          {match.notes && (
            <div>
              <h4 className="text-xs font-semibold text-settlers-muted uppercase tracking-wide mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4" /> Notater
              </h4>
              <p className="text-sm text-settlers-text bg-settlers-card rounded-lg p-3">
                {match.notes}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 justify-end pt-2">
            {(match.battleReport || match.isLiveMatch || match.events?.length > 0) && (
              <button
                onClick={() => onViewReport(match)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-settlers-gold/10 text-settlers-gold text-sm font-medium hover:bg-settlers-gold/20"
              >
                <Eye className="w-4 h-4" /> Kamprapport
              </button>
            )}
            <button
              onClick={() => onDelete(match.id)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-red-500/10 text-red-400 text-sm font-medium hover:bg-red-500/20"
            >
              <Trash2 className="w-4 h-4" /> Slett
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function PlayerDisplay({ player, isWinner, isDraw, stats }) {
  return (
    <div className={`flex-1 text-center ${isWinner && !isDraw ? '' : 'opacity-60'}`}>
      <div
        className={`
          w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center text-white font-bold
          ${isWinner && !isDraw ? 'ring-2 ring-settlers-gold ring-offset-2 ring-offset-settlers-card' : ''}
        `}
        style={{ backgroundColor: player?.color }}
      >
        {isWinner && !isDraw ? (
          <Trophy className="w-5 h-5" />
        ) : (
          player?.name?.charAt(0) || '?'
        )}
      </div>

      <p className="font-medium text-settlers-text text-sm">{player?.name}</p>

      {!isDraw && (
        <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium
          ${isWinner ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}
        >
          {isWinner ? 'Seier' : 'Tap'}
        </span>
      )}

      {stats.aiEliminations > 0 && (
        <div className="mt-1.5 flex items-center justify-center gap-1 text-xs text-purple-400">
          <Skull className="w-3 h-3" />
          {stats.aiEliminations} AI
        </div>
      )}
    </div>
  )
}
