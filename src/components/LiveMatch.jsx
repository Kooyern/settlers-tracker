import React, { useState, useEffect } from 'react'
import { Play, Pause, Square, Skull, Trophy, Mountain, Trees, Gem, Shield, Clock, ChevronLeft, Users, Swords, X, Handshake, Minus, Plus, AlertTriangle } from 'lucide-react'

// Settlers AI colors (max 4 AIs when 2 human players)
const AI_COLORS = [
  { id: 'white', name: 'Hvit AI', color: '#e5e5e5' },
  { id: 'black', name: 'Svart AI', color: '#374151' },
  { id: 'yellow', name: 'Gul AI', color: '#eab308' },
  { id: 'red', name: 'Rød AI', color: '#ef4444' },
]

// Event types players can log
const EVENT_TYPES = [
  { id: 'gold_found', icon: Gem, label: 'Fant gull', color: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
  { id: 'coal_found', icon: Mountain, label: 'Fant kull', color: 'bg-gray-200 text-gray-700 border-gray-400' },
  { id: 'iron_found', icon: Shield, label: 'Fant jern', color: 'bg-blue-100 text-blue-700 border-blue-300' },
  { id: 'expansion', icon: Trees, label: 'Ekspanderte', color: 'bg-green-100 text-green-700 border-green-300' },
  { id: 'ai_attack', icon: AlertTriangle, label: 'AI angrep', color: 'bg-red-100 text-red-700 border-red-300' },
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
  const [aiCount, setAiCount] = useState(4)
  const [selectedAiColors, setSelectedAiColors] = useState(AI_COLORS.map(ai => ai.id))

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

  // Handle AI count change
  const handleAiCountChange = (delta) => {
    const newCount = Math.min(4, Math.max(1, aiCount + delta))
    setAiCount(newCount)
    // Keep the first N colors selected
    setSelectedAiColors(AI_COLORS.slice(0, newCount).map(ai => ai.id))
  }

  // Toggle AI color selection
  const toggleAiColor = (aiId) => {
    if (selectedAiColors.includes(aiId)) {
      if (selectedAiColors.length > 1) {
        setSelectedAiColors(selectedAiColors.filter(id => id !== aiId))
        setAiCount(selectedAiColors.length - 1)
      }
    } else {
      if (selectedAiColors.length < 4) {
        setSelectedAiColors([...selectedAiColors, aiId])
        setAiCount(selectedAiColors.length + 1)
      }
    }
  }

  // Get active AIs for current match (either from config or activeMatch)
  const getActiveAIs = () => {
    if (activeMatch?.aiColors) {
      return AI_COLORS.filter(ai => activeMatch.aiColors.includes(ai.id))
    }
    return AI_COLORS.filter(ai => selectedAiColors.includes(ai.id))
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

          {/* AI Configuration */}
          <div className="bg-white/50 rounded-lg p-4">
            <h3 className="font-bold text-settlers-dark-brown mb-3 flex items-center gap-2">
              <Skull className="w-4 h-4" /> AI-motstandere ({selectedAiColors.length})
            </h3>

            {/* AI Count Selector */}
            <div className="flex items-center justify-center gap-4 mb-4">
              <button
                onClick={() => handleAiCountChange(-1)}
                disabled={aiCount <= 1}
                className="w-12 h-12 rounded-full bg-settlers-brown/10 hover:bg-settlers-brown/20 flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <Minus className="w-5 h-5 text-settlers-dark-brown" />
              </button>
              <span className="text-3xl font-bold text-settlers-dark-brown w-12 text-center">
                {selectedAiColors.length}
              </span>
              <button
                onClick={() => handleAiCountChange(1)}
                disabled={aiCount >= 4}
                className="w-12 h-12 rounded-full bg-settlers-brown/10 hover:bg-settlers-brown/20 flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <Plus className="w-5 h-5 text-settlers-dark-brown" />
              </button>
            </div>

            {/* AI Color Grid */}
            <div className="grid grid-cols-3 gap-2">
              {AI_COLORS.map(ai => {
                const isSelected = selectedAiColors.includes(ai.id)
                return (
                  <button
                    key={ai.id}
                    onClick={() => toggleAiColor(ai.id)}
                    className={`
                      p-3 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2
                      ${isSelected
                        ? 'ring-2 ring-offset-1 ring-settlers-dark-brown shadow-md'
                        : 'opacity-40 hover:opacity-60'
                      }
                    `}
                    style={{
                      backgroundColor: ai.color + (isSelected ? '30' : '15'),
                      color: ai.color,
                      borderWidth: 2,
                      borderColor: ai.color
                    }}
                  >
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: ai.color }}
                    />
                    {ai.name.replace(' AI', '')}
                  </button>
                )
              })}
            </div>
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
            onClick={() => onStartMatch(selectedMap, selectedAiColors)}
            disabled={!selectedMap || selectedAiColors.length === 0}
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
        <div className="flex gap-3">
          <button
            onClick={() => setIsPaused(!isPaused)}
            className={`flex-1 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all active:scale-95 ${
              isPaused
                ? 'bg-green-100 text-green-700 border-2 border-green-300'
                : 'bg-yellow-100 text-yellow-700 border-2 border-yellow-300'
            }`}
          >
            {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
            {isPaused ? 'Fortsett' : 'Pause'}
          </button>
          <button
            onClick={() => setShowEndModal(true)}
            className="flex-1 py-4 rounded-xl bg-red-100 text-red-700 border-2 border-red-300 font-bold text-lg flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <Square className="w-5 h-5" />
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
              <div className={`grid gap-2 ${getActiveAIs().length <= 3 ? 'grid-cols-3' : 'grid-cols-3'}`}>
                {getActiveAIs().map(ai => {
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
                        p-3 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2
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
                      <Skull className="w-4 h-4" />
                      {ai.name.replace(' AI', '')}
                      {isEliminated && eliminatedBy === player.id && ' ✓'}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Quick event buttons - larger for touch */}
            <div>
              <p className="text-xs text-settlers-brown mb-2 font-medium">Hendelser:</p>
              <div className="grid grid-cols-2 gap-2">
                {EVENT_TYPES.slice(0, 4).map(event => (
                  <button
                    key={event.id}
                    onClick={() => handleEvent(player.id, event.id)}
                    className={`${event.color} px-4 py-3 rounded-lg text-sm font-medium flex items-center justify-center gap-2 active:scale-95 transition-transform border`}
                  >
                    <event.icon className="w-4 h-4" />
                    {event.label}
                  </button>
                ))}
              </div>
              {/* AI Attack button - full width for emphasis */}
              <button
                onClick={() => handleEvent(player.id, 'ai_attack')}
                className="w-full mt-2 px-4 py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform border bg-red-100 text-red-700 border-red-300"
              >
                <AlertTriangle className="w-5 h-5" />
                AI angrep meg!
              </button>
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
