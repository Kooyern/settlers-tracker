import React, { useState } from 'react'
import { Swords, Clock, Trophy, Skull, FileText, Plus, X, ChevronLeft, Map, Calendar, AlertTriangle } from 'lucide-react'
import { MapSelector } from './MapSelector'

const AI_COLORS = [
  { id: 'white', name: 'Hvit', color: '#e5e5e5' },
  { id: 'black', name: 'Svart', color: '#374151' },
  { id: 'yellow', name: 'Gul', color: '#eab308' },
  { id: 'red', name: 'Rød', color: '#ef4444' },
]

const getLocalDateTime = () => {
  const now = new Date()
  const offset = now.getTimezoneOffset()
  const local = new Date(now.getTime() - offset * 60 * 1000)
  return local.toISOString().slice(0, 16)
}

export function NewMatchForm({ players, maps, onSubmit, onCancel, onAddMap }) {
  const [form, setForm] = useState({
    mapId: '',
    mapName: '',
    duration: '',
    winnerId: '',
    result: 'win',
    notes: '',
    players: players.map(p => ({ playerId: p.id, aiEliminations: 0, aiDeaths: 0 })),
    battleReport: null,
    matchDateTime: getLocalDateTime(),
    aiColors: AI_COLORS.map(ai => ai.id),
  })
  const [showBattleReport, setShowBattleReport] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!form.mapId) {
      alert('Velg et kart!')
      return
    }

    if (form.result === 'win' && !form.winnerId) {
      alert('Velg en vinner!')
      return
    }

    const selectedMap = maps.find(m => m.id === form.mapId)
    const matchDate = form.matchDateTime
      ? new Date(form.matchDateTime).toISOString()
      : new Date().toISOString()

    const matchData = {
      ...form,
      mapName: selectedMap?.name || '',
      duration: form.duration ? parseInt(form.duration) : null,
      winnerId: form.result === 'draw' ? null : form.winnerId,
      date: matchDate,
      aiColors: form.aiColors,
      aiCount: form.aiColors.length,
    }

    onSubmit(matchData)
  }

  const updatePlayerAiKills = (playerId, delta) => {
    setForm(prev => ({
      ...prev,
      players: prev.players.map(p =>
        p.playerId === playerId
          ? { ...p, aiEliminations: Math.max(0, p.aiEliminations + delta) }
          : p
      )
    }))
  }

  const getPlayerAiKills = (playerId) => {
    return form.players.find(p => p.playerId === playerId)?.aiEliminations || 0
  }

  const updatePlayerAiDeaths = (playerId, delta) => {
    setForm(prev => ({
      ...prev,
      players: prev.players.map(p =>
        p.playerId === playerId
          ? { ...p, aiDeaths: Math.max(0, Math.min(1, (p.aiDeaths || 0) + delta)) }
          : p
      )
    }))
  }

  const getPlayerAiDeaths = (playerId) => {
    return form.players.find(p => p.playerId === playerId)?.aiDeaths || 0
  }

  const toggleAiColor = (aiId) => {
    setForm(prev => {
      const isSelected = prev.aiColors.includes(aiId)
      if (isSelected) {
        if (prev.aiColors.length > 1) {
          return { ...prev, aiColors: prev.aiColors.filter(id => id !== aiId) }
        }
        return prev
      } else {
        return { ...prev, aiColors: [...prev.aiColors, aiId] }
      }
    })
  }

  return (
    <div className="card p-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={onCancel}
          className="p-2 -ml-2 text-settlers-muted hover:text-settlers-text"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div className="flex items-center gap-2 flex-1">
          <Swords className="w-5 h-5 text-settlers-gold" />
          <h2 className="text-lg font-semibold text-settlers-text">Ny Kamp</h2>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Map Selection */}
        <div>
          <label className="block text-sm font-medium text-settlers-muted mb-2 flex items-center gap-2">
            <Map className="w-4 h-4" /> Kart
          </label>
          <MapSelector
            maps={maps}
            selectedMapId={form.mapId}
            onSelect={(mapId) => setForm(prev => ({ ...prev, mapId }))}
            onAddMap={onAddMap}
          />
        </div>

        {/* Date and Time */}
        <div>
          <label className="block text-sm font-medium text-settlers-muted mb-2 flex items-center gap-2">
            <Calendar className="w-4 h-4" /> Dato og tid
          </label>
          <input
            type="datetime-local"
            value={form.matchDateTime}
            onChange={(e) => setForm(prev => ({ ...prev, matchDateTime: e.target.value }))}
            className="input w-full"
          />
        </div>

        {/* AI Selection */}
        <div>
          <label className="block text-sm font-medium text-settlers-muted mb-2 flex items-center gap-2">
            <Skull className="w-4 h-4" /> AI-motstandere ({form.aiColors.length})
          </label>
          <div className="grid grid-cols-2 gap-2">
            {AI_COLORS.map(ai => {
              const isSelected = form.aiColors.includes(ai.id)
              return (
                <button
                  key={ai.id}
                  type="button"
                  onClick={() => toggleAiColor(ai.id)}
                  className={`p-3 rounded-lg text-sm font-medium flex items-center justify-center gap-2 border-2
                    ${isSelected ? 'opacity-100' : 'opacity-40'}`}
                  style={{
                    backgroundColor: ai.color + '20',
                    borderColor: ai.color,
                    color: ai.color
                  }}
                >
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: ai.color }} />
                  {ai.name}
                </button>
              )
            })}
          </div>
        </div>

        {/* Duration */}
        <div>
          <label className="block text-sm font-medium text-settlers-muted mb-2 flex items-center gap-2">
            <Clock className="w-4 h-4" /> Spilletid (minutter)
          </label>
          <input
            type="number"
            value={form.duration}
            onChange={(e) => setForm(prev => ({ ...prev, duration: e.target.value }))}
            placeholder="f.eks. 45"
            className="input w-full"
            min="1"
            inputMode="numeric"
          />
        </div>

        {/* Result Type */}
        <div>
          <label className="block text-sm font-medium text-settlers-muted mb-2 flex items-center gap-2">
            <Trophy className="w-4 h-4" /> Resultat
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setForm(prev => ({ ...prev, result: 'win' }))}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
                form.result === 'win'
                  ? 'bg-settlers-gold text-settlers-dark'
                  : 'bg-settlers-dark text-settlers-muted'
              }`}
            >
              Seier/Tap
            </button>
            <button
              type="button"
              onClick={() => setForm(prev => ({ ...prev, result: 'draw', winnerId: '' }))}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
                form.result === 'draw'
                  ? 'bg-settlers-gold text-settlers-dark'
                  : 'bg-settlers-dark text-settlers-muted'
              }`}
            >
              Uavgjort
            </button>
          </div>
        </div>

        {/* Winner Selection */}
        {form.result === 'win' && (
          <div>
            <label className="block text-sm font-medium text-settlers-muted mb-3">
              Hvem vant?
            </label>
            <div className="grid grid-cols-2 gap-3">
              {players.map((player) => (
                <button
                  key={player.id}
                  type="button"
                  onClick={() => setForm(prev => ({ ...prev, winnerId: player.id }))}
                  className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2
                    ${form.winnerId === player.id
                      ? 'border-settlers-gold bg-settlers-gold/10'
                      : 'border-settlers-border bg-settlers-dark'
                    }`}
                >
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg
                      ${form.winnerId === player.id ? 'ring-2 ring-settlers-gold ring-offset-2 ring-offset-settlers-card' : ''}`}
                    style={{ backgroundColor: player.color }}
                  >
                    {form.winnerId === player.id ? <Trophy className="w-6 h-6" /> : player.name.charAt(0)}
                  </div>
                  <span className="font-medium text-settlers-text">{player.name}</span>
                  {form.winnerId === player.id && (
                    <span className="text-xs text-green-400 font-semibold">VINNER</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* AI Eliminations */}
        <div>
          <label className="block text-sm font-medium text-settlers-muted mb-2 flex items-center gap-2">
            <Skull className="w-4 h-4" /> AI Elimineringer
            <span className="text-xs font-normal">(+0.5p hver)</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            {players.map((player) => (
              <div key={player.id} className="bg-settlers-dark rounded-xl p-3">
                <p className="text-sm text-settlers-muted mb-2 flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: player.color }} />
                  {player.name}
                </p>
                <div className="flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => updatePlayerAiKills(player.id, -1)}
                    className="w-10 h-10 rounded-lg bg-settlers-border hover:bg-settlers-border/80 text-settlers-text font-bold text-xl"
                  >
                    −
                  </button>
                  <span className="text-3xl font-bold text-settlers-text w-10 text-center">
                    {getPlayerAiKills(player.id)}
                  </span>
                  <button
                    type="button"
                    onClick={() => updatePlayerAiKills(player.id, 1)}
                    className="w-10 h-10 rounded-lg bg-settlers-border hover:bg-settlers-border/80 text-settlers-text font-bold text-xl"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Deaths */}
        <div>
          <label className="block text-sm font-medium text-settlers-muted mb-2 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400" /> Slått av AI
            <span className="text-xs font-normal">(-1p)</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            {players.map((player) => {
              const hasDied = getPlayerAiDeaths(player.id) > 0
              return (
                <button
                  key={player.id}
                  type="button"
                  onClick={() => updatePlayerAiDeaths(player.id, hasDied ? -1 : 1)}
                  className={`p-3 rounded-xl border-2 transition-all flex items-center justify-center gap-2
                    ${hasDied
                      ? 'bg-red-500/20 border-red-500/50 text-red-400'
                      : 'bg-settlers-dark border-settlers-border text-settlers-muted'
                    }`}
                >
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: player.color }} />
                  <span className="font-medium">{player.name}</span>
                  {hasDied && <Skull className="w-4 h-4" />}
                </button>
              )
            })}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-settlers-muted mb-2 flex items-center gap-2">
            <FileText className="w-4 h-4" /> Notater
          </label>
          <textarea
            value={form.notes}
            onChange={(e) => setForm(prev => ({ ...prev, notes: e.target.value }))}
            placeholder="Spesielle hendelser..."
            className="input w-full h-20 resize-none"
          />
        </div>

        {/* Battle Report Toggle */}
        <button
          type="button"
          onClick={() => setShowBattleReport(!showBattleReport)}
          className="w-full py-3 rounded-lg bg-settlers-dark text-settlers-muted font-medium flex items-center justify-center gap-2"
        >
          <Plus className={`w-4 h-4 transition-transform ${showBattleReport ? 'rotate-45' : ''}`} />
          {showBattleReport ? 'Skjul detaljer' : 'Legg til detaljer'}
        </button>

        {showBattleReport && (
          <BattleReportForm form={form} setForm={setForm} players={players} />
        )}

        {/* Submit */}
        <button
          type="submit"
          className="btn-primary w-full py-4 text-lg flex items-center justify-center gap-2"
        >
          <Swords className="w-5 h-5" /> Registrer Kamp
        </button>
      </form>
    </div>
  )
}

function BattleReportForm({ form, setForm, players }) {
  const [report, setReport] = useState(form.battleReport || {
    player1: { events: [] },
    player2: { events: [] },
  })

  const updateReport = (newReport) => {
    setReport(newReport)
    setForm(prev => ({ ...prev, battleReport: newReport }))
  }

  const addEvent = (playerId, event) => {
    updateReport({
      ...report,
      [playerId]: {
        ...report[playerId],
        events: [...(report[playerId]?.events || []), { ...event, timestamp: Date.now() }]
      }
    })
  }

  return (
    <div className="bg-settlers-dark rounded-xl p-4 space-y-3">
      {players.map((player) => (
        <div key={player.id} className="bg-settlers-card rounded-lg p-3">
          <h4 className="font-medium text-settlers-text mb-2 text-sm flex items-center gap-2">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: player.color }} />
            {player.name}
          </h4>

          <div className="flex flex-wrap gap-2 mb-2">
            <button
              type="button"
              onClick={() => addEvent(player.id, { type: 'ai_eliminated', description: 'Eliminerte AI' })}
              className="text-xs bg-purple-500/20 text-purple-400 px-3 py-1.5 rounded-full"
            >
              <Skull className="w-3 h-3 inline mr-1" /> AI Drept
            </button>
            <button
              type="button"
              onClick={() => addEvent(player.id, { type: 'major_battle', description: 'Vant slag' })}
              className="text-xs bg-red-500/20 text-red-400 px-3 py-1.5 rounded-full"
            >
              <Swords className="w-3 h-3 inline mr-1" /> Slag
            </button>
            <button
              type="button"
              onClick={() => addEvent(player.id, { type: 'expansion', description: 'Ekspanderte' })}
              className="text-xs bg-green-500/20 text-green-400 px-3 py-1.5 rounded-full"
            >
              <Map className="w-3 h-3 inline mr-1" /> Ekspansjon
            </button>
          </div>

          {report[player.id]?.events?.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {report[player.id].events.map((event, idx) => (
                <span
                  key={idx}
                  className="text-xs bg-settlers-border rounded px-2 py-1 flex items-center gap-1 text-settlers-text"
                >
                  {event.description}
                  <button
                    type="button"
                    onClick={() => {
                      const newEvents = report[player.id].events.filter((_, i) => i !== idx)
                      updateReport({
                        ...report,
                        [player.id]: { ...report[player.id], events: newEvents }
                      })
                    }}
                    className="text-red-400 ml-1"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
