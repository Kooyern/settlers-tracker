import React, { useState } from 'react'
import { Calendar, Clock, Map, Trophy, Skull, ChevronDown, ChevronUp, Trash2, Eye } from 'lucide-react'
import { MAPS } from '../data/maps'
import { format } from 'date-fns'
import { nb } from 'date-fns/locale'

export function MatchCard({ match, players, formatDuration, onDelete, onViewReport }) {
  const [expanded, setExpanded] = useState(false)

  const mapInfo = MAPS.find(m => m.id === match.mapId)
  const winner = players.find(p => p.id === match.winnerId)
  const matchDate = new Date(match.date)

  const getResultBadge = () => {
    if (match.result === 'draw') {
      return <span className="badge-draw px-3 py-1 rounded-full text-sm font-bold">UAVGJORT</span>
    }
    return null
  }

  return (
    <div className="parchment rounded-lg overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl">
      {/* Match Header */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-settlers-brown text-sm">
            <Calendar className="w-4 h-4" />
            <span>{format(matchDate, 'dd. MMMM yyyy', { locale: nb })}</span>
          </div>
          {getResultBadge()}
        </div>

        {/* Players & Result */}
        <div className="flex items-center justify-between gap-4">
          {/* Player 1 */}
          <div className={`flex-1 text-center ${match.winnerId === 'player1' ? 'scale-105' : 'opacity-75'}`}>
            <div
              className={`
                w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center text-white font-bold
                ${match.winnerId === 'player1' ? 'ring-4 ring-settlers-gold shadow-lg' : ''}
              `}
              style={{ backgroundColor: players[0]?.color }}
            >
              {match.winnerId === 'player1' && <Trophy className="w-5 h-5" />}
              {match.winnerId !== 'player1' && (players[0]?.name?.charAt(0) || 'S')}
            </div>
            <p className="font-bold text-settlers-dark-brown text-sm">
              {players[0]?.name || 'Spiller 1'}
            </p>
            {match.winnerId === 'player1' && (
              <span className="badge-victory px-2 py-0.5 rounded text-xs mt-1 inline-block">
                SEIER
              </span>
            )}
            {match.winnerId === 'player2' && (
              <span className="badge-defeat px-2 py-0.5 rounded text-xs mt-1 inline-block">
                TAP
              </span>
            )}
          </div>

          {/* VS */}
          <div className="text-2xl font-bold text-settlers-gold">VS</div>

          {/* Player 2 */}
          <div className={`flex-1 text-center ${match.winnerId === 'player2' ? 'scale-105' : 'opacity-75'}`}>
            <div
              className={`
                w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center text-white font-bold
                ${match.winnerId === 'player2' ? 'ring-4 ring-settlers-gold shadow-lg' : ''}
              `}
              style={{ backgroundColor: players[1]?.color }}
            >
              {match.winnerId === 'player2' && <Trophy className="w-5 h-5" />}
              {match.winnerId !== 'player2' && (players[1]?.name?.charAt(0) || 'S')}
            </div>
            <p className="font-bold text-settlers-dark-brown text-sm">
              {players[1]?.name || 'Spiller 2'}
            </p>
            {match.winnerId === 'player2' && (
              <span className="badge-victory px-2 py-0.5 rounded text-xs mt-1 inline-block">
                SEIER
              </span>
            )}
            {match.winnerId === 'player1' && (
              <span className="badge-defeat px-2 py-0.5 rounded text-xs mt-1 inline-block">
                TAP
              </span>
            )}
          </div>
        </div>

        {/* Quick Info */}
        <div className="flex items-center justify-center gap-6 mt-4 text-sm text-settlers-brown">
          <div className="flex items-center gap-1">
            <Map className="w-4 h-4" />
            <span>{mapInfo?.name || 'Ukjent kart'}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{formatDuration(match.duration)}</span>
          </div>
          {(match.players?.[0]?.aiEliminations > 0 || match.players?.[1]?.aiEliminations > 0) && (
            <div className="flex items-center gap-1 text-purple-700">
              <Skull className="w-4 h-4" />
              <span>AI eliminert</span>
            </div>
          )}
        </div>
      </div>

      {/* Expand/Collapse */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full py-2 bg-settlers-brown/10 hover:bg-settlers-brown/20 transition-colors flex items-center justify-center gap-2 text-settlers-brown text-sm"
      >
        {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        {expanded ? 'Skjul detaljer' : 'Vis detaljer'}
      </button>

      {/* Expanded Details */}
      {expanded && (
        <div className="p-4 bg-settlers-wheat/30 border-t border-settlers-brown/20">
          {/* AI Eliminations */}
          {(match.players?.[0]?.aiEliminations > 0 || match.players?.[1]?.aiEliminations > 0) && (
            <div className="mb-4">
              <h4 className="font-bold text-settlers-dark-brown mb-2 flex items-center gap-2">
                <Skull className="w-4 h-4" /> AI Elimineringer
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {match.players?.map((playerData, idx) => (
                  <div key={idx} className="bg-white/50 rounded p-2 text-center">
                    <p className="text-sm text-settlers-brown">
                      {players[idx]?.name || `Spiller ${idx + 1}`}
                    </p>
                    <p className="text-xl font-bold text-purple-700">
                      {playerData.aiEliminations || 0}
                    </p>
                    <p className="text-xs text-settlers-brown">
                      (+{((playerData.aiEliminations || 0) * 0.5).toFixed(1)} poeng)
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {match.notes && (
            <div className="mb-4">
              <h4 className="font-bold text-settlers-dark-brown mb-2">Notater</h4>
              <p className="text-sm text-settlers-brown bg-white/50 rounded p-2">
                {match.notes}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 justify-end">
            {(match.battleReport || match.isLiveMatch || match.events?.length > 0) && (
              <button
                onClick={() => onViewReport(match)}
                className="btn-settlers-secondary text-xs flex items-center gap-1"
              >
                <Eye className="w-3 h-3" /> Kamprapport
              </button>
            )}
            <button
              onClick={() => onDelete(match.id)}
              className="bg-red-100 text-red-700 px-3 py-1 rounded text-xs flex items-center gap-1 hover:bg-red-200 transition-colors"
            >
              <Trash2 className="w-3 h-3" /> Slett
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
