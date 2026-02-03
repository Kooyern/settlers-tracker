import React from 'react'
import { X, FileText, Skull, Swords, Map, Calendar, Clock, Trophy, Gem, Mountain, Shield, Trees, AlertTriangle } from 'lucide-react'
import { format } from 'date-fns'
import { nb } from 'date-fns/locale'

const AI_COLORS = {
  white: { name: 'Hvit AI', color: '#e5e5e5' },
  black: { name: 'Svart AI', color: '#374151' },
  yellow: { name: 'Gul AI', color: '#eab308' },
  red: { name: 'Rød AI', color: '#ef4444' },
}

export function BattleReportModal({ match, players, onClose, formatDuration }) {
  if (!match) return null

  const winner = players.find(p => p.id === match.winnerId)
  const matchDate = new Date(match.date)
  const mapName = match.mapName || 'Ukjent kart'

  const getEventIcon = (type) => {
    switch (type) {
      case 'ai_eliminated': return <Skull className="w-4 h-4 text-purple-400" />
      case 'gold_found': return <Gem className="w-4 h-4 text-yellow-400" />
      case 'coal_found': return <Mountain className="w-4 h-4 text-gray-400" />
      case 'iron_found': return <Shield className="w-4 h-4 text-blue-400" />
      case 'expansion': return <Trees className="w-4 h-4 text-green-400" />
      case 'ai_attack': return <AlertTriangle className="w-4 h-4 text-red-400" />
      case 'major_battle': return <Swords className="w-4 h-4 text-red-400" />
      default: return <FileText className="w-4 h-4 text-blue-400" />
    }
  }

  const getEventLabel = (type) => {
    switch (type) {
      case 'ai_eliminated': return 'Eliminerte AI'
      case 'gold_found': return 'Fant gull'
      case 'coal_found': return 'Fant kull'
      case 'iron_found': return 'Fant jern'
      case 'expansion': return 'Ekspanderte'
      case 'ai_attack': return 'AI angrep'
      default: return type
    }
  }

  const formatMatchTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <div className="card max-w-2xl w-full max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="sticky top-0 bg-settlers-card p-4 border-b border-settlers-border flex items-center justify-between">
          <h2 className="text-lg font-semibold text-settlers-text flex items-center gap-2">
            <FileText className="w-5 h-5 text-settlers-gold" />
            Kamprapport
          </h2>
          <button
            onClick={onClose}
            className="text-settlers-muted hover:text-settlers-text"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Match Info */}
          <div className="bg-settlers-dark rounded-xl p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <Calendar className="w-5 h-5 mx-auto text-settlers-muted mb-1" />
                <p className="text-xs text-settlers-muted">Dato</p>
                <p className="font-medium text-settlers-text">
                  {format(matchDate, 'dd. MMM yyyy', { locale: nb })}
                </p>
              </div>
              <div>
                <Map className="w-5 h-5 mx-auto text-settlers-muted mb-1" />
                <p className="text-xs text-settlers-muted">Kart</p>
                <p className="font-medium text-settlers-text">{mapName}</p>
              </div>
              <div>
                <Clock className="w-5 h-5 mx-auto text-settlers-muted mb-1" />
                <p className="text-xs text-settlers-muted">Varighet</p>
                <p className="font-medium text-settlers-text">{formatDuration(match.duration)}</p>
              </div>
              <div>
                <Trophy className="w-5 h-5 mx-auto text-settlers-gold mb-1" />
                <p className="text-xs text-settlers-muted">Vinner</p>
                <p className="font-medium text-settlers-text">
                  {match.result === 'draw' ? 'Uavgjort' : winner?.name || '-'}
                </p>
              </div>
            </div>
          </div>

          {/* Player Reports */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {players.map((player, idx) => {
              const playerData = match.players?.[idx]

              return (
                <div key={player.id} className="bg-settlers-dark rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold
                        ${match.winnerId === player.id ? 'ring-2 ring-settlers-gold ring-offset-2 ring-offset-settlers-dark' : ''}`}
                      style={{ backgroundColor: player.color }}
                    >
                      {match.winnerId === player.id ? <Trophy className="w-5 h-5" /> : player.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-medium text-settlers-text">{player.name}</h3>
                      {match.winnerId === player.id && (
                        <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded">SEIER</span>
                      )}
                      {match.winnerId && match.winnerId !== player.id && (
                        <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded">TAP</span>
                      )}
                      {match.result === 'draw' && (
                        <span className="text-xs bg-gray-500/20 text-gray-400 px-2 py-0.5 rounded">UAVGJORT</span>
                      )}
                    </div>
                  </div>

                  {/* AI Eliminations */}
                  {playerData?.aiEliminations > 0 && (
                    <div className="bg-purple-500/20 rounded-lg p-3 mb-3">
                      <div className="flex items-center gap-2">
                        <Skull className="w-5 h-5 text-purple-400" />
                        <span className="font-medium text-purple-400">
                          {playerData.aiEliminations} AI eliminert
                        </span>
                      </div>
                      <p className="text-xs text-purple-400/70 mt-1">
                        +{(playerData.aiEliminations * 0.5).toFixed(1)} bonuspoeng
                      </p>
                    </div>
                  )}

                  {/* Events */}
                  {match.events?.filter(e => e.playerId === player.id).length > 0 && (
                    <div>
                      <h4 className="text-xs font-medium text-settlers-muted mb-2">Hendelser</h4>
                      <div className="space-y-1 max-h-32 overflow-y-auto">
                        {match.events
                          .filter(e => e.playerId === player.id)
                          .sort((a, b) => a.matchTime - b.matchTime)
                          .map((event, eventIdx) => (
                            <div
                              key={eventIdx}
                              className="flex items-center gap-2 text-sm bg-settlers-card rounded p-2"
                            >
                              <span className="text-xs text-settlers-muted font-mono w-10">
                                {formatMatchTime(event.matchTime)}
                              </span>
                              {getEventIcon(event.type)}
                              <span className="text-settlers-text">
                                {event.type === 'ai_eliminated' && AI_COLORS[event.aiId]
                                  ? `Eliminerte ${AI_COLORS[event.aiId].name}`
                                  : getEventLabel(event.type)}
                              </span>
                              {event.aiId && AI_COLORS[event.aiId] && (
                                <div
                                  className="w-3 h-3 rounded-full ml-auto"
                                  style={{ backgroundColor: AI_COLORS[event.aiId].color }}
                                />
                              )}
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {!playerData?.aiEliminations && !match.events?.filter(e => e.playerId === player.id).length && (
                    <p className="text-sm text-settlers-muted">
                      Ingen detaljert rapport.
                    </p>
                  )}
                </div>
              )
            })}
          </div>

          {/* Notes */}
          {match.notes && (
            <div className="bg-settlers-dark rounded-xl p-4">
              <h3 className="font-medium text-settlers-text mb-2">Notater</h3>
              <p className="text-settlers-muted whitespace-pre-wrap">{match.notes}</p>
            </div>
          )}

          {/* Points Summary */}
          <div className="bg-settlers-gold/10 rounded-xl p-4">
            <h3 className="font-medium text-settlers-text mb-3 text-center">Poengoppsummering</h3>
            <div className="grid grid-cols-2 gap-4">
              {players.map((player, idx) => {
                const playerData = match.players?.[idx]
                const winPoints = match.winnerId === player.id ? 1 : (match.result === 'draw' ? 0.5 : 0)
                const aiPoints = (playerData?.aiEliminations || 0) * 0.5
                const totalPoints = winPoints + aiPoints

                return (
                  <div key={player.id} className="text-center">
                    <p className="font-medium text-settlers-text">{player.name}</p>
                    <div className="text-sm text-settlers-muted mt-1 space-y-0.5">
                      <p>Kamp: +{winPoints.toFixed(1)}</p>
                      <p>AI-bonus: +{aiPoints.toFixed(1)}</p>
                    </div>
                    <p className="text-2xl font-bold text-settlers-gold mt-2">
                      +{totalPoints.toFixed(1)}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
