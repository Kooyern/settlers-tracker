import React, { useState } from 'react'
import { Swords, Clock, Trophy, Skull, FileText, Plus, X, ChevronLeft, Map, Calendar, AlertTriangle } from 'lucide-react'
import { MapSelector } from './MapSelector'

const AI_COLORS = [
  { id: 'white', name: 'Hvit', color: '#e5e5e5' },
  { id: 'black', name: 'Svart', color: '#525252' },
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
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onCancel} className="p-2 -ml-2 text-text-muted hover:text-text-primary">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div className="flex items-center gap-2 flex-1">
          <Swords className="w-5 h-5 text-accent" />
          <h2 className="text-lg font-semibold text-text-primary">Ny Kamp</h2>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-text-muted mb-2 flex items-center gap-2">
            <Map className="w-4 h-4" /> Kart
          </label>
          <MapSelector
            maps={maps}
            selectedMapId={form.mapId}
            onSelect={(mapId) => setForm(prev => ({ ...prev, mapId }))}
            onAddMap={onAddMap}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-muted mb-2 flex items-center gap-2">
            <Calendar className="w-4 h-4" /> Dato og tid
          </label>
          <input
            type="datetime-local"
            value={form.matchDateTime}
            onChange={(e) => setForm(prev => ({ ...prev, matchDateTime: e.target.value }))}
            className="input w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-muted mb-2 flex items-center gap-2">
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
                  className={`p-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 border-2 transition-all
                    ${isSelected ? 'opacity-100 shadow-lg' : 'opacity-40'}`}
                  style={{
                    backgroundColor: ai.color + '20',
                    borderColor: ai.color,
                    color: ai.id === 'white' ? '#a3a3a3' : ai.color
                  }}
                >
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: ai.color }} />
                  {ai.name}
                </button>
              )
            })}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-muted mb-2 flex items-center gap-2">
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

        <div>
          <label className="block text-sm font-medium text-text-muted mb-2 flex items-center gap-2">
            <Trophy className="w-4 h-4" /> Resultat
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setForm(prev => ({ ...prev, result: 'win' }))}
              className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all border ${
                form.result === 'win'
                  ? 'bg-accent text-bg-primary border-accent'
                  : 'bg-bg-elevated text-text-muted border-border'
              }`}
            >
              Seier/Tap
            </button>
            <button
              type="button"
              onClick={() => setForm(prev => ({ ...prev, result: 'draw', winnerId: '' }))}
              className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all border ${
                form.result === 'draw'
                  ? 'bg-accent text-bg-primary border-accent'
                  : 'bg-bg-elevated text-text-muted border-border'
              }`}
            >
              Uavgjort
            </button>
          </div>
        </div>

        {form.result === 'win' && (
          <div>
            <label className="block text-sm font-medium text-text-muted mb-3">
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
                      ? 'border-accent bg-accent/10'
                      : 'border-border bg-bg-elevated'
                    }`}
                >
                  <div
                    className={`w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg
                      ${form.winnerId === player.id ? 'ring-2 ring-accent ring-offset-2 ring-offset-bg-card' : ''}`}
                    style={{ backgroundColor: player.color }}
                  >
                    {form.winnerId === player.id ? <Trophy className="w-6 h-6" /> : player.name.charAt(0)}
                  </div>
                  <span className="font-semibold text-text-primary">{player.name}</span>
                  {form.winnerId === player.id && (
                    <span className="text-xs text-success font-semibold">VINNER</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-text-muted mb-2 flex items-center gap-2">
            <Skull className="w-4 h-4" /> AI Elimineringer
            <span className="text-xs font-normal">(+0.5p hver)</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            {players.map((player) => (
              <div key={player.id} className="bg-bg-elevated rounded-xl p-3 border border-border">
                <p className="text-sm text-text-secondary mb-2 flex items-center gap-2 font-medium">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: player.color }} />
                  {player.name}
                </p>
                <div className="flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => updatePlayerAiKills(player.id, -1)}
                    className="w-10 h-10 rounded-xl bg-bg-card hover:bg-bg-card/80 text-text-primary font-bold text-xl border border-border"
                  >
                    −
                  </button>
                  <span className="text-3xl font-bold text-text-primary w-10 text-center number-display">
                    {getPlayerAiKills(player.id)}
                  </span>
                  <button
                    type="button"
                    onClick={() => updatePlayerAiKills(player.id, 1)}
                    className="w-10 h-10 rounded-xl bg-bg-card hover:bg-bg-card/80 text-text-primary font-bold text-xl border border-border"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-muted mb-2 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-danger" /> Slått av AI
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
                      ? 'bg-danger/20 border-danger/50 text-danger'
                      : 'bg-bg-elevated border-border text-text-muted'
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

        <div>
          <label className="block text-sm font-medium text-text-muted mb-2 flex items-center gap-2">
            <FileText className="w-4 h-4" /> Notater
          </label>
          <textarea
            value={form.notes}
            onChange={(e) => setForm(prev => ({ ...prev, notes: e.target.value }))}
            placeholder="Spesielle hendelser..."
            className="input w-full h-20 resize-none"
          />
        </div>

        <button
          type="button"
          onClick={() => setShowBattleReport(!showBattleReport)}
          className="w-full py-3 rounded-xl bg-bg-elevated text-text-muted font-medium flex items-center justify-center gap-2 border border-border"
        >
          <Plus className={`w-4 h-4 transition-transform ${showBattleReport ? 'rotate-45' : ''}`} />
          {showBattleReport ? 'Skjul detaljer' : 'Legg til detaljer'}
        </button>

        {showBattleReport && (
          <BattleReportForm form={form} setForm={setForm} players={players} />
        )}

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
    <div className="bg-bg-elevated rounded-xl p-4 space-y-3 border border-border">
      {players.map((player) => (
        <div key={player.id} className="bg-bg-card rounded-xl p-3 border border-border">
          <h4 className="font-medium text-text-primary mb-2 text-sm flex items-center gap-2">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: player.color }} />
            {player.name}
          </h4>

          <div className="flex flex-wrap gap-2 mb-2">
            <button
              type="button"
              onClick={() => addEvent(player.id, { type: 'ai_eliminated', description: 'Eliminerte AI' })}
              className="text-xs bg-purple-500/20 text-purple-400 px-3 py-1.5 rounded-full border border-purple-500/30"
            >
              <Skull className="w-3 h-3 inline mr-1" /> AI Drept
            </button>
            <button
              type="button"
              onClick={() => addEvent(player.id, { type: 'major_battle', description: 'Vant slag' })}
              className="text-xs bg-danger/20 text-danger px-3 py-1.5 rounded-full border border-danger/30"
            >
              <Swords className="w-3 h-3 inline mr-1" /> Slag
            </button>
            <button
              type="button"
              onClick={() => addEvent(player.id, { type: 'expansion', description: 'Ekspanderte' })}
              className="text-xs bg-success/20 text-success px-3 py-1.5 rounded-full border border-success/30"
            >
              <Map className="w-3 h-3 inline mr-1" /> Ekspansjon
            </button>
          </div>

          {report[player.id]?.events?.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {report[player.id].events.map((event, idx) => (
                <span
                  key={idx}
                  className="text-xs bg-bg-elevated rounded-lg px-2 py-1 flex items-center gap-1 text-text-secondary border border-border"
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
                    className="text-danger ml-1"
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
