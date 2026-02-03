import React from 'react'
import { X, FileText, Skull, Swords, Map, Calendar, Clock, Trophy, Gem, Mountain, Shield, Trees, AlertTriangle } from 'lucide-react'
import { format } from 'date-fns'
import { nb } from 'date-fns/locale'

const AI_COLORS = {
  white: { name: 'Hvit AI', color: '#e5e5e5' },
  black: { name: 'Svart AI', color: '#525252' },
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
      case 'coal_found': return <Mountain className="w-4 h-4 text-zinc-400" />
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
    <div className="fixed inset-0 bg-black/85 flex items-center justify-center p-4 z-50">
      <div className="card max-w-2xl w-full max-h-[90vh] overflow-auto">
        <div className="sticky top-0 bg-bg-card p-4 border-b border-border flex items-center justify-between z-10">
          <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
            <FileText className="w-5 h-5 text-accent" />
            Kamprapport
          </h2>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-primary p-1"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Match Info */}
          <div className="bg-bg-elevated rounded-xl p-4 border border-border">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <Calendar className="w-5 h-5 mx-auto text-text-muted mb-1.5" />
                <p className="text-xs text-text-muted">Dato</p>
                <p className="font-semibold text-text-primary">
                  {format(matchDate, 'dd. MMM yyyy', { locale: nb })}
                </p>
              </div>
              <div>
                <Map className="w-5 h-5 mx-auto text-text-muted mb-1.5" />
                <p className="text-xs text-text-muted">Kart</p>
                <p className="font-semibold text-text-primary">{mapName}</p>
              </div>
              <div>
                <Clock className="w-5 h-5 mx-auto text-text-muted mb-1.5" />
                <p className="text-xs text-text-muted">Varighet</p>
                <p className="font-semibold text-text-primary number-display">{formatDuration(match.duration)}</p>
              </div>
              <div>
                <Trophy className="w-5 h-5 mx-auto text-accent mb-1.5" />
                <p className="text-xs text-text-muted">Vinner</p>
                <p className="font-semibold text-text-primary">
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
                <div key={player.id} className="bg-bg-elevated rounded-xl p-4 border border-border">
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className={`w-11 h-11 rounded-full flex items-center justify-center text-white font-bold shadow-lg
                        ${match.winnerId === player.id ? 'ring-2 ring-accent ring-offset-2 ring-offset-bg-elevated' : ''}`}
                      style={{ backgroundColor: player.color }}
                    >
                      {match.winnerId === player.id ? <Trophy className="w-5 h-5" /> : player.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-text-primary">{player.name}</h3>
                      {match.winnerId === player.id && (
                        <span className="badge-win px-2 py-0.5 rounded text-xs font-semibold">SEIER</span>
                      )}
                      {match.winnerId && match.winnerId !== player.id && (
                        <span className="badge-loss px-2 py-0.5 rounded text-xs font-semibold">TAP</span>
                      )}
                      {match.result === 'draw' && (
                        <span className="badge-draw px-2 py-0.5 rounded text-xs font-semibold">UAVGJORT</span>
                      )}
                    </div>
                  </div>

                  {playerData?.aiEliminations > 0 && (
                    <div className="bg-purple-500/10 rounded-xl p-3 mb-3 border border-purple-500/20">
                      <div className="flex items-center gap-2">
                        <Skull className="w-5 h-5 text-purple-400" />
                        <span className="font-semibold text-purple-400">
                          {playerData.aiEliminations} AI eliminert
                        </span>
                      </div>
                      <p className="text-xs text-purple-400/70 mt-1">
                        +{(playerData.aiEliminations * 0.5).toFixed(1)} bonuspoeng
                      </p>
                    </div>
                  )}

                  {match.events?.filter(e => e.playerId === player.id).length > 0 && (
                    <div>
                      <h4 className="text-xs font-medium text-text-muted mb-2">Hendelser</h4>
                      <div className="space-y-1.5 max-h-32 overflow-y-auto">
                        {match.events
                          .filter(e => e.playerId === player.id)
                          .sort((a, b) => a.matchTime - b.matchTime)
                          .map((event, eventIdx) => (
                            <div
                              key={eventIdx}
                              className="flex items-center gap-2 text-sm bg-bg-card rounded-lg p-2 border border-border"
                            >
                              <span className="text-xs text-text-muted font-mono w-10 number-display">
                                {formatMatchTime(event.matchTime)}
                              </span>
                              {getEventIcon(event.type)}
                              <span className="text-text-secondary">
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
                    <p className="text-sm text-text-muted">
                      Ingen detaljert rapport.
                    </p>
                  )}
                </div>
              )
            })}
          </div>

          {match.notes && (
            <div className="bg-bg-elevated rounded-xl p-4 border border-border">
              <h3 className="font-semibold text-text-primary mb-2">Notater</h3>
              <p className="text-text-secondary whitespace-pre-wrap">{match.notes}</p>
            </div>
          )}

          {/* Points Summary */}
          <div className="bg-accent/10 rounded-xl p-4 border border-accent/20">
            <h3 className="font-semibold text-text-primary mb-4 text-center">Poengoppsummering</h3>
            <div className="grid grid-cols-2 gap-4">
              {players.map((player, idx) => {
                const playerData = match.players?.[idx]
                const winPoints = match.winnerId === player.id ? 1 : (match.result === 'draw' ? 0.5 : 0)
                const aiPoints = (playerData?.aiEliminations || 0) * 0.5
                const totalPoints = winPoints + aiPoints

                return (
                  <div key={player.id} className="text-center">
                    <p className="font-semibold text-text-primary">{player.name}</p>
                    <div className="text-sm text-text-muted mt-1 space-y-0.5">
                      <p>Kamp: +{winPoints.toFixed(1)}</p>
                      <p>AI-bonus: +{aiPoints.toFixed(1)}</p>
                    </div>
                    <p className="text-3xl font-bold text-accent-gradient mt-2 number-display">
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
