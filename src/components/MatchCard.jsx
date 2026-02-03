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
      <div className="card p-3 hover:border-border-light transition-colors">
        <div className="flex items-center gap-3">
          {/* Players */}
          <div className="flex items-center gap-2">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold
                shadow-lg transition-all
                ${match.winnerId === 'player1' && !isDraw ? 'ring-2 ring-accent ring-offset-1 ring-offset-bg-card' : ''}`}
              style={{ backgroundColor: players[0]?.color }}
            >
              {match.winnerId === 'player1' && !isDraw ? (
                <Trophy className="w-4 h-4" />
              ) : (
                players[0]?.name?.charAt(0)
              )}
            </div>
            <span className="text-xs text-text-muted font-medium">vs</span>
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold
                shadow-lg transition-all
                ${match.winnerId === 'player2' && !isDraw ? 'ring-2 ring-accent ring-offset-1 ring-offset-bg-card' : ''}`}
              style={{ backgroundColor: players[1]?.color }}
            >
              {match.winnerId === 'player2' && !isDraw ? (
                <Trophy className="w-4 h-4" />
              ) : (
                players[1]?.name?.charAt(0)
              )}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            {isDraw ? (
              <span className="text-sm text-text-muted font-medium">Uavgjort</span>
            ) : (
              <span className="text-sm font-semibold text-text-primary">{winner?.name} vant</span>
            )}
            <div className="flex items-center gap-2 text-xs text-text-muted mt-0.5">
              <span className="truncate">{mapName}</span>
              <span className="text-border-light">•</span>
              <span className="number-display">{formatDuration(match.duration)}</span>
            </div>
          </div>

          {/* Time */}
          <span className="text-[11px] text-text-muted">
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
        <div className="text-xs text-text-muted mb-4">
          {format(matchDate, 'dd. MMMM yyyy, HH:mm', { locale: nb })}
        </div>

        {/* Players */}
        <div className="flex items-center justify-between gap-4">
          <PlayerDisplay
            player={players[0]}
            isWinner={match.winnerId === 'player1'}
            isDraw={isDraw}
            stats={getPlayerMatchStats('player1')}
          />

          <div className="flex flex-col items-center">
            <span className="text-lg font-bold text-text-muted">VS</span>
          </div>

          <PlayerDisplay
            player={players[1]}
            isWinner={match.winnerId === 'player2'}
            isDraw={isDraw}
            stats={getPlayerMatchStats('player2')}
          />
        </div>

        {/* Match info */}
        <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-border text-sm text-text-secondary">
          <div className="flex items-center gap-2">
            <Map className="w-4 h-4 text-text-muted" />
            <span>{mapName}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-text-muted" />
            <span className="number-display">{formatDuration(match.duration)}</span>
          </div>
        </div>
      </div>

      {/* Expand button */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full py-3 bg-bg-primary hover:bg-bg-elevated transition-colors flex items-center justify-center gap-2 text-sm text-text-muted border-t border-border"
      >
        {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        {expanded ? 'Skjul detaljer' : 'Vis detaljer'}
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="p-4 bg-bg-primary border-t border-border space-y-4">
          {/* AI stats */}
          {(getPlayerMatchStats('player1').aiEliminations > 0 || getPlayerMatchStats('player2').aiEliminations > 0) && (
            <div>
              <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-2 flex items-center gap-2">
                <Skull className="w-4 h-4 text-purple-400" /> AI Elimineringer
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {players.map((player, idx) => {
                  const stats = getPlayerMatchStats(player.id)
                  return (
                    <div key={idx} className="bg-bg-card rounded-xl p-3 text-center border border-border">
                      <p className="text-xs text-text-muted mb-1">{player.name}</p>
                      <p className="text-2xl font-bold text-purple-400 number-display">{stats.aiEliminations || 0}</p>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Notes */}
          {match.notes && (
            <div>
              <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4" /> Notater
              </h4>
              <p className="text-sm text-text-secondary bg-bg-card rounded-xl p-3 border border-border">
                {match.notes}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 justify-end pt-2">
            {(match.battleReport || match.isLiveMatch || match.events?.length > 0) && (
              <button
                onClick={() => onViewReport(match)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent/10 text-accent text-sm font-medium hover:bg-accent/20 transition-colors border border-accent/20"
              >
                <Eye className="w-4 h-4" /> Kamprapport
              </button>
            )}
            <button
              onClick={() => onDelete(match.id)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-danger/10 text-danger text-sm font-medium hover:bg-danger/20 transition-colors border border-danger/20"
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
          w-14 h-14 rounded-full mx-auto mb-2 flex items-center justify-center text-white font-bold text-lg
          shadow-lg transition-all
          ${isWinner && !isDraw ? 'ring-2 ring-accent ring-offset-2 ring-offset-bg-card' : ''}
        `}
        style={{ backgroundColor: player?.color }}
      >
        {isWinner && !isDraw ? (
          <Trophy className="w-6 h-6" />
        ) : (
          player?.name?.charAt(0) || '?'
        )}
      </div>

      <p className="font-semibold text-text-primary text-sm">{player?.name}</p>

      {!isDraw && (
        <span className={`inline-block mt-1.5 px-3 py-1 rounded-full text-xs font-semibold
          ${isWinner ? 'badge-win' : 'badge-loss'}`}
        >
          {isWinner ? 'Seier' : 'Tap'}
        </span>
      )}

      {stats.aiEliminations > 0 && (
        <div className="mt-2 flex items-center justify-center gap-1 text-xs text-purple-400">
          <Skull className="w-3 h-3" />
          <span className="number-display">{stats.aiEliminations} AI</span>
        </div>
      )}
    </div>
  )
}
