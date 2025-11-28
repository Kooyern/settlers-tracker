import React from 'react'
import { X, FileText, Skull, Swords, Map, Calendar, Clock, Trophy, Gem, Mountain, Shield, Trees, AlertTriangle } from 'lucide-react'
import { MAPS } from '../data/maps'
import { format } from 'date-fns'
import { nb } from 'date-fns/locale'

// AI colors for reference
const AI_COLORS = {
  green: { name: 'Grønn AI', color: '#22c55e' },
  yellow: { name: 'Gul AI', color: '#eab308' },
  red: { name: 'Rød AI', color: '#ef4444' },
  purple: { name: 'Lilla AI', color: '#a855f7' },
  cyan: { name: 'Cyan AI', color: '#06b6d4' },
  orange: { name: 'Oransje AI', color: '#f97316' },
}

export function BattleReportModal({ match, players, onClose, formatDuration }) {
  if (!match) return null

  const mapInfo = MAPS.find(m => m.id === match.mapId)
  const winner = players.find(p => p.id === match.winnerId)
  const matchDate = new Date(match.date)

  const getEventIcon = (type) => {
    switch (type) {
      case 'ai_eliminated': return <Skull className="w-4 h-4 text-purple-500" />
      case 'gold_found': return <Gem className="w-4 h-4 text-yellow-500" />
      case 'coal_found': return <Mountain className="w-4 h-4 text-gray-500" />
      case 'iron_found': return <Shield className="w-4 h-4 text-blue-500" />
      case 'expansion': return <Trees className="w-4 h-4 text-green-500" />
      case 'ai_attack': return <AlertTriangle className="w-4 h-4 text-red-500" />
      case 'major_battle': return <Swords className="w-4 h-4 text-red-500" />
      default: return <FileText className="w-4 h-4 text-blue-500" />
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
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="parchment rounded-xl max-w-2xl w-full max-h-[90vh] overflow-auto wood-frame">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-b from-settlers-wheat to-settlers-parchment p-4 border-b border-settlers-brown/20">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-settlers-dark-brown font-medieval flex items-center gap-2">
              <FileText className="w-6 h-6 text-settlers-gold" />
              Kamprapport
            </h2>
            <button
              onClick={onClose}
              className="text-settlers-brown hover:text-settlers-dark-brown transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Match Info */}
          <div className="bg-white/50 rounded-lg p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <Calendar className="w-5 h-5 mx-auto text-settlers-brown mb-1" />
                <p className="text-sm text-settlers-brown">Dato</p>
                <p className="font-bold text-settlers-dark-brown">
                  {format(matchDate, 'dd. MMM yyyy', { locale: nb })}
                </p>
                <p className="text-xs text-settlers-brown">
                  kl. {format(matchDate, 'HH:mm', { locale: nb })}
                </p>
              </div>
              <div>
                <Map className="w-5 h-5 mx-auto text-settlers-brown mb-1" />
                <p className="text-sm text-settlers-brown">Kart</p>
                <p className="font-bold text-settlers-dark-brown">{mapInfo?.name || '-'}</p>
              </div>
              <div>
                <Clock className="w-5 h-5 mx-auto text-settlers-brown mb-1" />
                <p className="text-sm text-settlers-brown">Varighet</p>
                <p className="font-bold text-settlers-dark-brown">{formatDuration(match.duration)}</p>
              </div>
              <div>
                <Trophy className="w-5 h-5 mx-auto text-settlers-gold mb-1" />
                <p className="text-sm text-settlers-brown">Vinner</p>
                <p className="font-bold text-settlers-dark-brown">
                  {match.result === 'draw' ? 'Uavgjort' : winner?.name || '-'}
                </p>
              </div>
            </div>
          </div>

          {/* Player Reports */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {players.map((player, idx) => {
              const playerData = match.players?.[idx]
              const report = match.battleReport?.[player.id]

              return (
                <div key={player.id} className="bg-white/50 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className={`
                        w-10 h-10 rounded-full flex items-center justify-center text-white font-bold
                        ${match.winnerId === player.id ? 'ring-4 ring-settlers-gold' : ''}
                      `}
                      style={{ backgroundColor: player.color }}
                    >
                      {match.winnerId === player.id ? <Trophy className="w-5 h-5" /> : player.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-settlers-dark-brown">{player.name}</h3>
                      {match.winnerId === player.id && (
                        <span className="badge-victory px-2 py-0.5 rounded text-xs">SEIERHERRE</span>
                      )}
                      {match.winnerId && match.winnerId !== player.id && (
                        <span className="badge-defeat px-2 py-0.5 rounded text-xs">NEDKJEMPET</span>
                      )}
                      {match.result === 'draw' && (
                        <span className="badge-draw px-2 py-0.5 rounded text-xs">UAVGJORT</span>
                      )}
                    </div>
                  </div>

                  {/* AI Eliminations */}
                  {playerData?.aiEliminations > 0 && (
                    <div className="bg-purple-100 rounded p-3 mb-3">
                      <div className="flex items-center gap-2">
                        <Skull className="w-5 h-5 text-purple-700" />
                        <span className="font-bold text-purple-700">
                          {playerData.aiEliminations} AI eliminert
                        </span>
                      </div>
                      <p className="text-xs text-purple-600 mt-1">
                        +{(playerData.aiEliminations * 0.5).toFixed(1)} bonuspoeng
                      </p>
                    </div>
                  )}

                  {/* Live Match Events */}
                  {match.events?.filter(e => e.playerId === player.id).length > 0 && (
                    <div>
                      <h4 className="text-sm font-bold text-settlers-brown mb-2">Hendelser</h4>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {match.events
                          .filter(e => e.playerId === player.id)
                          .sort((a, b) => a.matchTime - b.matchTime)
                          .map((event, eventIdx) => (
                            <div
                              key={eventIdx}
                              className="flex items-center gap-2 text-sm bg-settlers-wheat/50 rounded p-2"
                            >
                              <span className="text-xs text-settlers-brown/60 font-mono w-10">
                                {formatMatchTime(event.matchTime)}
                              </span>
                              {getEventIcon(event.type)}
                              <span className="text-settlers-dark-brown">
                                {event.type === 'ai_eliminated' && AI_COLORS[event.aiId]
                                  ? `Eliminerte ${AI_COLORS[event.aiId].name}`
                                  : getEventLabel(event.type)
                                }
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

                  {/* No report data */}
                  {!playerData?.aiEliminations && !match.events?.filter(e => e.playerId === player.id).length && (
                    <p className="text-sm text-settlers-brown/60 italic">
                      Ingen detaljert rapport for denne spilleren.
                    </p>
                  )}
                </div>
              )
            })}
          </div>

          {/* Notes */}
          {match.notes && (
            <div className="bg-white/50 rounded-lg p-4">
              <h3 className="font-bold text-settlers-dark-brown mb-2">Notater</h3>
              <p className="text-settlers-brown whitespace-pre-wrap">{match.notes}</p>
            </div>
          )}

          {/* Points Summary */}
          <div className="bg-settlers-gold/20 rounded-lg p-4">
            <h3 className="font-bold text-settlers-dark-brown mb-3 text-center">Poengoppsummering</h3>
            <div className="grid grid-cols-2 gap-4">
              {players.map((player, idx) => {
                const playerData = match.players?.[idx]
                const winPoints = match.winnerId === player.id ? 1 : (match.result === 'draw' ? 0.5 : 0)
                const aiPoints = (playerData?.aiEliminations || 0) * 0.5
                const totalPoints = winPoints + aiPoints

                return (
                  <div key={player.id} className="text-center">
                    <p className="font-bold text-settlers-dark-brown">{player.name}</p>
                    <div className="text-sm text-settlers-brown mt-1 space-y-1">
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
