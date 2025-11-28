import React, { useState, useEffect } from 'react'
import { Play, Pause, Square, Skull, Trophy, Mountain, Trees, Gem, Shield, Clock, ChevronLeft, Users, Swords, X, Handshake } from 'lucide-react'

// AI colors matching Settlers game
const AI_COLORS = [
  { id: 'green', name: 'Grønn AI', color: '#22c55e' },
  { id: 'yellow', name: 'Gul AI', color: '#eab308' },
  { id: 'red', name: 'Rød AI', color: '#ef4444' },
  { id: 'purple', name: 'Lilla AI', color: '#a855f7' },
  { id: 'cyan', name: 'Cyan AI', color: '#06b6d4' },
  { id: 'orange', name: 'Oransje AI', color: '#f97316' },
]

// Event types players can log
const EVENT_TYPES = [
  { id: 'gold_found', icon: Gem, label: 'Fant gull', color: 'bg-yellow-100 text-yellow-700' },
  { id: 'coal_found', icon: Mountain, label: 'Fant kull', color: 'bg-gray-100 text-gray-700' },
  { id: 'iron_found', icon: Shield, label: 'Fant jern', color: 'bg-blue-100 text-blue-700' },
  { id: 'expansion', icon: Trees, label: 'Ekspanderte', color: 'bg-green-100 text-green-700' },
  { id: 'battle_won', icon: Swords, label: 'Vant slag', color: 'bg-red-100 text-red-700' },
]

export function LiveMatch({
  players,
  maps,
  activeMatch,
  onStartMatch,
  onEndMatch,
  onLogEvent,
  onCancel
}) {
  const [selectedMap, setSelectedMap] = useState('')
  const [elapsedTime, setElapsedTime] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [showEndModal, setShowEndModal] = useState(false)

  // Calculate elapsed time from match start
  useEffect(() => {
    if (!activeMatch || isPaused) return

    const startTime = new Date(activeMatch.startedAt).getTime()

    const interval = setInterval(() => {
      const now = Date.now()
      const pausedDuration = activeMatch.pausedDuration || 0
      setElapsedTime(Math.floor((now - startTime - pausedDuration) / 1000))
    }, 1000)

    return () => clearInterval(interval)
  }, [activeMatch, isPaused])

  // Format seconds to MM:SS or HH:MM:SS
  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Get eliminated AIs for a player
  const getPlayerEliminations = (playerId) => {
    if (!activeMatch?.events) return []
    return activeMatch.events
      .filter(e => e.playerId === playerId && e.type === 'ai_eliminated')
      .map(e => e.aiId)
  }

  // Get all events for timeline
  const getTimeline = () => {
    if (!activeMatch?.events) return []
    return [...activeMatch.events].sort((a, b) => a.timestamp - b.timestamp)
  }

  // Handle AI elimination
  const handleAiElimination = (playerId, aiId) => {
    const alreadyEliminated = activeMatch?.events?.some(
      e => e.type === 'ai_eliminated' && e.aiId === aiId
    )

    if (alreadyEliminated) return

    onLogEvent({
      type: 'ai_eliminated',
      playerId,
      aiId,
      timestamp: Date.now(),
      matchTime: elapsedTime
    })
  }

  // Handle other events
  const handleEvent = (playerId, eventType) => {
    onLogEvent({
      type: eventType,
      playerId,
      timestamp: Date.now(),
      matchTime: elapsedTime
    })
  }

  // Start match screen
  if (!activeMatch) {
    return (
      <div className="parchment rounded-xl p-4 sm:p-6 wood-frame">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={onCancel}
            className="p-2 -ml-2 text-settlers-brown hover:text-settlers-dark-brown transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2 flex-1">
            <Play className="w-6 h-6 text-settlers-gold" />
            <h2 className="text-xl sm:text-2xl font-bold text-settlers-dark-brown font-medieval">
              Start Live Kamp
            </h2>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-settlers-dark-brown font-bold mb-2 text-sm">
              Velg kart
            </label>
            <select
              value={selectedMap}
              onChange={(e) => setSelectedMap(e.target.value)}
              className="input-settlers w-full"
            >
              <option value="">Velg et kart...</option>
              {maps.map(map => (
                <option key={map.id} value={map.id}>{map.name}</option>
              ))}
            </select>
          </div>

          <div className="bg-white/50 rounded-lg p-4">
            <h3 className="font-bold text-settlers-dark-brown mb-3 flex items-center gap-2">
              <Users className="w-4 h-4" /> Spillere
            </h3>
            <div className="flex gap-3">
              {players.map(player => (
                <div key={player.id} className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded-full"
                    style={{ backgroundColor: player.color }}
                  />
                  <span className="font-medium text-settlers-dark-brown">{player.name}</span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => onStartMatch(selectedMap)}
            disabled={!selectedMap}
            className="btn-settlers w-full py-4 text-lg flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Play className="w-5 h-5" />
            Start Kamp
          </button>
        </div>
      </div>
    )
  }

  // Active match screen
  return (
    <div className="space-y-4">
      {/* Timer Header */}
      <div className="parchment rounded-xl p-4 wood-frame">
        <div className="text-center mb-4">
          <p className="text-xs text-settlers-brown uppercase tracking-wide mb-1">Spilletid</p>
          <div className="text-5xl font-bold text-settlers-dark-brown font-mono">
            {formatTime(elapsedTime)}
          </div>
          <p className="text-sm text-settlers-brown mt-2">
            {maps.find(m => m.id === activeMatch.mapId)?.name || 'Ukjent kart'}
          </p>
        </div>

        {/* Pause/End buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => setIsPaused(!isPaused)}
            className={`flex-1 py-2 rounded-lg font-medium flex items-center justify-center gap-2 ${
              isPaused
                ? 'bg-green-100 text-green-700'
                : 'bg-yellow-100 text-yellow-700'
            }`}
          >
            {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            {isPaused ? 'Fortsett' : 'Pause'}
          </button>
          <button
            onClick={() => setShowEndModal(true)}
            className="flex-1 py-2 rounded-lg bg-red-100 text-red-700 font-medium flex items-center justify-center gap-2"
          >
            <Square className="w-4 h-4" />
            Avslutt
          </button>
        </div>
      </div>

      {/* End Match Modal */}
      {showEndModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="parchment rounded-xl p-6 max-w-sm w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-settlers-dark-brown">Avslutt kamp</h3>
              <button onClick={() => setShowEndModal(false)} className="text-settlers-brown">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-settlers-brown mb-4">Hvem vant kampen?</p>

            <div className="space-y-2 mb-4">
              {players.map(player => {
                const aiKills = (activeMatch?.events || []).filter(
                  e => e.type === 'ai_eliminated' && e.playerId === player.id
                ).length

                return (
                  <button
                    key={player.id}
                    onClick={() => {
                      onEndMatch(elapsedTime, player.id, 'win')
                      setShowEndModal(false)
                    }}
                    className="w-full p-3 rounded-lg bg-white/50 hover:bg-settlers-gold/20 flex items-center gap-3 transition-colors"
                  >
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: player.color }}
                    >
                      <Trophy className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left flex-1">
                      <p className="font-bold text-settlers-dark-brown">{player.name}</p>
                      <p className="text-xs text-settlers-brown">{aiKills} AI eliminert</p>
                    </div>
                  </button>
                )
              })}
            </div>

            <button
              onClick={() => {
                onEndMatch(elapsedTime, null, 'draw')
                setShowEndModal(false)
              }}
              className="w-full p-3 rounded-lg bg-gray-100 text-gray-700 font-medium flex items-center justify-center gap-2 mb-2"
            >
              <Handshake className="w-5 h-5" />
              Uavgjort
            </button>

            <button
              onClick={() => setShowEndModal(false)}
              className="w-full p-2 text-settlers-brown text-sm"
            >
              Avbryt
            </button>
          </div>
        </div>
      )}

      {/* Player Action Panels */}
      {players.map(player => {
        const eliminations = getPlayerEliminations(player.id)

        return (
          <div key={player.id} className="parchment rounded-xl p-4">
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-10 h-10 rounded-full shadow"
                style={{ backgroundColor: player.color }}
              />
              <h3 className="font-bold text-settlers-dark-brown text-lg">{player.name}</h3>
              <div className="ml-auto flex items-center gap-1 text-sm text-settlers-brown">
                <Skull className="w-4 h-4" />
                {eliminations.length} AI
              </div>
            </div>

            {/* AI Elimination buttons */}
            <div className="mb-4">
              <p className="text-xs text-settlers-brown mb-2 font-medium">Eliminer AI:</p>
              <div className="grid grid-cols-3 gap-2">
                {AI_COLORS.map(ai => {
                  const isEliminated = activeMatch?.events?.some(
                    e => e.type === 'ai_eliminated' && e.aiId === ai.id
                  )
                  const eliminatedBy = activeMatch?.events?.find(
                    e => e.type === 'ai_eliminated' && e.aiId === ai.id
                  )?.playerId

                  return (
                    <button
                      key={ai.id}
                      onClick={() => handleAiElimination(player.id, ai.id)}
                      disabled={isEliminated}
                      className={`
                        p-2 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1
                        ${isEliminated
                          ? 'opacity-40 cursor-not-allowed bg-gray-200'
                          : 'active:scale-95 hover:opacity-80'
                        }
                      `}
                      style={{
                        backgroundColor: isEliminated ? undefined : ai.color + '20',
                        color: isEliminated ? '#666' : ai.color,
                        borderWidth: 2,
                        borderColor: ai.color
                      }}
                    >
                      <Skull className="w-3 h-3" />
                      {ai.name.replace(' AI', '')}
                      {isEliminated && eliminatedBy === player.id && ' ✓'}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Quick event buttons */}
            <div>
              <p className="text-xs text-settlers-brown mb-2 font-medium">Hendelser:</p>
              <div className="flex flex-wrap gap-2">
                {EVENT_TYPES.map(event => (
                  <button
                    key={event.id}
                    onClick={() => handleEvent(player.id, event.id)}
                    className={`${event.color} px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1 active:scale-95 transition-transform`}
                  >
                    <event.icon className="w-3 h-3" />
                    {event.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )
      })}

      {/* Live Timeline */}
      <div className="parchment rounded-xl p-4">
        <h3 className="font-bold text-settlers-dark-brown mb-3 flex items-center gap-2">
          <Clock className="w-4 h-4" /> Tidslinje
        </h3>

        <div className="max-h-48 overflow-y-auto space-y-2">
          {getTimeline().length === 0 ? (
            <p className="text-sm text-settlers-brown/60 text-center py-4">
              Ingen hendelser ennå...
            </p>
          ) : (
            getTimeline().map((event, idx) => {
              const player = players.find(p => p.id === event.playerId)
              const ai = AI_COLORS.find(a => a.id === event.aiId)
              const eventType = EVENT_TYPES.find(e => e.id === event.type)

              return (
                <div
                  key={idx}
                  className="flex items-center gap-2 bg-white/50 rounded-lg px-3 py-2 text-sm"
                >
                  <span className="text-settlers-brown/60 font-mono text-xs w-12">
                    {formatTime(event.matchTime)}
                  </span>
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: player?.color }}
                  />
                  <span className="text-settlers-dark-brown">
                    {player?.name}
                  </span>
                  <span className="text-settlers-brown">
                    {event.type === 'ai_eliminated'
                      ? `eliminerte ${ai?.name}`
                      : eventType?.label.toLowerCase()
                    }
                  </span>
                  {ai && (
                    <div
                      className="w-3 h-3 rounded-full ml-auto"
                      style={{ backgroundColor: ai.color }}
                    />
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
