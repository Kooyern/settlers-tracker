import React, { useEffect, useMemo, useState } from 'react'
import {
  Activity, AlertTriangle, Clock, Handshake, Map as MapIcon,
  Minus, Pause, Play, Plus, Skull, Square, Trophy, X,
} from 'lucide-react'
import { Screen } from '../components/ui/AppShell'
import { Card, EmptyState, Panel, PlayerAvatar, PlayerDot, SectionLabel } from '../components/ui/Primitives'
import { Sheet } from '../components/ui/Sheet'
import { MapPickerSheet } from './MapPicker'

const AI_COLORS = [
  { id: 'white', name: 'Hvit', color: '#e5e5e5' },
  { id: 'black', name: 'Svart', color: '#525252' },
  { id: 'yellow', name: 'Gul', color: '#eab308' },
  { id: 'red', name: 'Rød', color: '#ef4444' },
]

const EVENT_TYPES = [
  { id: 'gold_found', label: 'Gull', tone: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30' },
  { id: 'coal_found', label: 'Kull', tone: 'bg-zinc-500/15 text-zinc-300 border-zinc-500/30' },
  { id: 'iron_found', label: 'Jern', tone: 'bg-blue-500/15 text-blue-300 border-blue-500/30' },
  { id: 'expansion', label: 'Ekspandert', tone: 'bg-green-500/15 text-green-300 border-green-500/30' },
]

export function LiveScreen({
  players,
  maps,
  matches,
  activeMatch,
  onStartMatch,
  onEndMatch,
  onLogEvent,
  onCancel,
  onAddMap,
}) {
  if (!activeMatch) {
    return (
      <PreLive
        players={players}
        maps={maps}
        matches={matches}
        onStart={onStartMatch}
        onAddMap={onAddMap}
      />
    )
  }
  return (
    <ActiveLive
      players={players}
      maps={maps}
      activeMatch={activeMatch}
      onEndMatch={onEndMatch}
      onLogEvent={onLogEvent}
      onCancel={onCancel}
    />
  )
}

function PreLive({ players, maps, matches, onStart, onAddMap }) {
  const [mapId, setMapId] = useState('')
  const [aiColors, setAiColors] = useState(AI_COLORS.map(a => a.id))
  const [showMapPicker, setShowMapPicker] = useState(false)
  const selectedMap = maps.find(m => m.id === mapId)

  const toggleAi = (id) => {
    setAiColors(prev => {
      if (prev.includes(id)) {
        return prev.length > 1 ? prev.filter(x => x !== id) : prev
      }
      return [...prev, id]
    })
  }

  return (
    <Screen title="Start live kamp">
      <Card>
        <SectionLabel icon={MapIcon}>Kart</SectionLabel>
        <button
          type="button"
          onClick={() => setShowMapPicker(true)}
          className="mt-2 flex w-full items-center justify-between gap-3 rounded-xl border border-border bg-bg-soft px-4 py-3 text-left"
        >
          <span className="min-w-0 flex-1">
            <span className={`block truncate text-sm ${selectedMap ? 'font-semibold text-text-primary' : 'text-text-muted'}`}>
              {selectedMap?.name || 'Velg kart…'}
            </span>
            {selectedMap && (
              <span className="block truncate text-[11px] text-text-muted">
                {selectedMap.category || 'Kart'}
              </span>
            )}
          </span>
          <span className="badge badge-accent shrink-0">Velg</span>
        </button>
      </Card>

      <Card>
        <SectionLabel icon={Skull}>AI-motstandere ({aiColors.length})</SectionLabel>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {AI_COLORS.map(ai => {
            const isOn = aiColors.includes(ai.id)
            return (
              <button
                key={ai.id}
                type="button"
                onClick={() => toggleAi(ai.id)}
                className={`flex items-center justify-center gap-2 rounded-xl border-2 px-3 py-3 text-sm font-medium transition-all ${
                  isOn ? 'opacity-100' : 'opacity-40'
                }`}
                style={{
                  backgroundColor: ai.color + '20',
                  borderColor: ai.color,
                  color: ai.id === 'white' ? '#cccccc' : ai.color,
                }}
              >
                <span className="h-3 w-3 rounded-full" style={{ backgroundColor: ai.color }} />
                {ai.name}
              </button>
            )
          })}
        </div>
      </Card>

      <Card>
        <SectionLabel>Spillere</SectionLabel>
        <div className="mt-3 space-y-2">
          {players.map(p => (
            <div key={p.id} className="flex items-center gap-3 rounded-xl border border-border bg-bg-soft px-3 py-2.5">
              <PlayerAvatar player={p} size="sm" />
              <span className="truncate text-sm font-semibold text-text-primary">{p.name}</span>
            </div>
          ))}
        </div>
      </Card>

      <button
        type="button"
        onClick={() => onStart(mapId, aiColors)}
        disabled={!mapId || aiColors.length === 0}
        className="btn btn-primary btn-block"
      >
        <Play className="w-4 h-4" />
        Start kamp
      </button>

      <MapPickerSheet
        open={showMapPicker}
        onClose={() => setShowMapPicker(false)}
        maps={maps}
        matches={matches}
        selectedMapId={mapId}
        onSelect={(id) => { setMapId(id); setShowMapPicker(false) }}
        onAddMap={onAddMap}
      />
    </Screen>
  )
}

function ActiveLive({ players, maps, activeMatch, onEndMatch, onLogEvent, onCancel }) {
  const [elapsed, setElapsed] = useState(0)
  const [paused, setPaused] = useState(false)
  const [pauseStartedAt, setPauseStartedAt] = useState(null)
  const [pausedMs, setPausedMs] = useState(activeMatch.pausedDuration || 0)
  const [showEnd, setShowEnd] = useState(false)

  useEffect(() => {
    setElapsed(0)
    setPaused(false)
    setPauseStartedAt(null)
    setPausedMs(activeMatch.pausedDuration || 0)
  }, [activeMatch.startedAt])

  useEffect(() => {
    const startTime = new Date(activeMatch.startedAt).getTime()
    const tick = () => {
      const currentPauseMs = paused && pauseStartedAt ? Date.now() - pauseStartedAt : 0
      setElapsed(Math.max(0, Math.floor((Date.now() - startTime - pausedMs - currentPauseMs) / 1000)))
    }
    tick()
    if (paused) return
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [activeMatch.startedAt, paused, pauseStartedAt, pausedMs])

  const togglePause = () => {
    if (paused) {
      setPausedMs(total => total + (pauseStartedAt ? Date.now() - pauseStartedAt : 0))
      setPauseStartedAt(null)
      setPaused(false)
      return
    }
    setPauseStartedAt(Date.now())
    setPaused(true)
  }

  const mapName = maps.find(m => m.id === activeMatch.mapId)?.name || 'Ukjent kart'
  const activeAis = useMemo(() => {
    const ids = activeMatch.aiColors || AI_COLORS.map(a => a.id)
    return AI_COLORS.filter(a => ids.includes(a.id))
  }, [activeMatch.aiColors])

  const handleAiKill = (playerId, aiId) => {
    const already = activeMatch.events?.some(e => e.type === 'ai_eliminated' && e.aiId === aiId)
    if (already) return
    onLogEvent({ type: 'ai_eliminated', playerId, aiId, timestamp: Date.now(), matchTime: elapsed })
  }

  const handleEvent = (playerId, eventType) => {
    onLogEvent({ type: eventType, playerId, timestamp: Date.now(), matchTime: elapsed })
  }

  const timeline = useMemo(
    () => [...(activeMatch.events || [])].sort((a, b) => b.timestamp - a.timestamp),
    [activeMatch.events]
  )

  return (
    <Screen>
      {/* Timer */}
      <Card className="text-center">
        <div className="flex items-center justify-center gap-2 text-xs uppercase tracking-[0.18em] text-text-muted">
          <Activity className="h-3.5 w-3.5 text-success pulse-dot" />
          Live · {mapName}
        </div>
        <p className="number-display mt-2 font-mono text-5xl font-bold leading-none text-text-primary">
          {formatTime(elapsed)}
        </p>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={togglePause}
            className={`btn ${paused ? 'btn-success' : 'btn-secondary'}`}
          >
            {paused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            {paused ? 'Fortsett' : 'Pause'}
          </button>
          <button type="button" onClick={() => setShowEnd(true)} className="btn btn-danger">
            <Square className="w-4 h-4" />
            Avslutt
          </button>
        </div>
      </Card>

      {/* Player panels */}
      {players.map(player => {
        const playerKills = (activeMatch.events || []).filter(
          e => e.type === 'ai_eliminated' && e.playerId === player.id
        )
        const wasAttacked = (activeMatch.events || []).some(
          e => e.type === 'ai_attack' && e.playerId === player.id
        )
        return (
          <Card key={player.id}>
            <div className="flex items-center gap-3">
              <PlayerAvatar player={player} size="md" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-base font-semibold text-text-primary">{player.name}</p>
                <p className="text-xs text-text-muted">{playerKills.length} AI eliminert</p>
              </div>
              {wasAttacked && (
                <span className="badge badge-loss">Slått</span>
              )}
            </div>

            <p className="mt-4 text-[11px] font-semibold uppercase tracking-wider text-text-muted">
              Eliminer AI
            </p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {activeAis.map(ai => {
                const eliminated = activeMatch.events?.some(e => e.type === 'ai_eliminated' && e.aiId === ai.id)
                const byMe = playerKills.some(e => e.aiId === ai.id)
                return (
                  <button
                    key={ai.id}
                    type="button"
                    onClick={() => handleAiKill(player.id, ai.id)}
                    disabled={eliminated}
                    className={`flex items-center justify-center gap-2 rounded-xl border-2 px-2 py-2.5 text-sm font-medium transition-all ${
                      eliminated ? 'opacity-30' : 'active:scale-95'
                    }`}
                    style={{
                      backgroundColor: eliminated ? '#1a1a1f' : ai.color + '22',
                      borderColor: ai.color,
                      color: ai.id === 'white' ? '#cccccc' : ai.color,
                    }}
                  >
                    <Skull className="h-3.5 w-3.5" />
                    <span className="truncate">{ai.name}</span>
                    {byMe && <span>✓</span>}
                  </button>
                )
              })}
            </div>

            <p className="mt-4 text-[11px] font-semibold uppercase tracking-wider text-text-muted">
              Hendelser
            </p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {EVENT_TYPES.map(ev => (
                <button
                  key={ev.id}
                  type="button"
                  onClick={() => handleEvent(player.id, ev.id)}
                  className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-semibold active:scale-95 ${ev.tone}`}
                >
                  {ev.label}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => handleEvent(player.id, 'ai_attack')}
              className="btn btn-danger btn-block mt-2 btn-sm"
            >
              <AlertTriangle className="w-4 h-4" />
              AI slo meg ut
            </button>
          </Card>
        )
      })}

      {/* Timeline */}
      <Card>
        <SectionLabel icon={Clock}>Tidslinje</SectionLabel>
        <div className="mt-2 max-h-72 overflow-y-auto">
          {timeline.length === 0 ? (
            <p className="py-6 text-center text-sm text-text-muted">Ingen hendelser ennå.</p>
          ) : (
            <ul className="space-y-1.5">
              {timeline.map((event, idx) => {
                const player = players.find(p => p.id === event.playerId)
                const ai = AI_COLORS.find(a => a.id === event.aiId)
                const ev = EVENT_TYPES.find(e => e.id === event.type)
                let label = ev?.label || event.type
                if (event.type === 'ai_eliminated' && ai) label = `eliminerte ${ai.name} AI`
                if (event.type === 'ai_attack') label = 'ble slått ut av AI'
                return (
                  <li
                    key={idx}
                    className="flex items-center gap-2 rounded-xl border border-border bg-bg-soft px-3 py-2 text-xs"
                  >
                    <span className="number-display w-12 shrink-0 font-mono text-text-muted">
                      {formatTime(event.matchTime)}
                    </span>
                    {player && <PlayerDot player={player} size={8} />}
                    <span className="min-w-0 flex-1 truncate text-text-secondary">
                      <span className="font-semibold text-text-primary">{player?.name}</span>{' '}
                      {label}
                    </span>
                    {ai && <PlayerDot player={ai} size={8} />}
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </Card>

      <button type="button" onClick={onCancel} className="btn btn-ghost btn-block">
        <X className="w-4 h-4" />
        Avbryt kamp uten å lagre
      </button>

      <Sheet open={showEnd} onClose={() => setShowEnd(false)} title="Avslutt kamp">
        <p className="mb-4 text-sm text-text-secondary">Hvem vant?</p>
        <div className="space-y-2">
          {players.map(player => {
            const kills = (activeMatch.events || []).filter(
              e => e.type === 'ai_eliminated' && e.playerId === player.id
            ).length
            return (
              <button
                key={player.id}
                type="button"
                onClick={() => { onEndMatch(elapsed, player.id, 'win'); setShowEnd(false) }}
                className="card flex w-full items-center gap-3 px-4 py-3 text-left"
              >
                <PlayerAvatar player={player} size="md" winner />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-base font-semibold text-text-primary">{player.name}</p>
                  <p className="text-xs text-text-muted">{kills} AI eliminert</p>
                </div>
                <Trophy className="h-5 w-5 shrink-0 text-accent" />
              </button>
            )
          })}
          <button
            type="button"
            onClick={() => { onEndMatch(elapsed, null, 'draw'); setShowEnd(false) }}
            className="btn btn-secondary btn-block"
          >
            <Handshake className="w-4 h-4" />
            Uavgjort
          </button>
        </div>
      </Sheet>
    </Screen>
  )
}

function formatTime(seconds) {
  const hrs = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`
}
