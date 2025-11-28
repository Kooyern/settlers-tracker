import React, { useState } from 'react'
import { Swords, Clock, Trophy, Skull, FileText, Plus, X, ChevronLeft, Map, Calendar } from 'lucide-react'
import { MapSelector } from './MapSelector'

// Helper to get current date/time in local format for input
const getLocalDateTime = () => {
  const now = new Date()
  const offset = now.getTimezoneOffset()
  const local = new Date(now.getTime() - offset * 60 * 1000)
  return local.toISOString().slice(0, 16)
}

export function NewMatchForm({ players, maps, onSubmit, onCancel, onAddMap }) {
  const [form, setForm] = useState({
    mapId: '',
    mapName: '', // Store map name for display
    duration: '',
    winnerId: '',
    result: 'win',
    notes: '',
    players: players.map(p => ({ playerId: p.id, aiEliminations: 0 })),
    battleReport: null,
    matchDateTime: getLocalDateTime(), // Default to now
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

    // Find map name to store with match
    const selectedMap = maps.find(m => m.id === form.mapId)

    // Convert local datetime to ISO string
    const matchDate = form.matchDateTime
      ? new Date(form.matchDateTime).toISOString()
      : new Date().toISOString()

    const matchData = {
      ...form,
      mapName: selectedMap?.name || '',
      duration: form.duration ? parseInt(form.duration) : null,
      winnerId: form.result === 'draw' ? null : form.winnerId,
      date: matchDate,
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

  return (
    <div className="parchment rounded-xl p-4 sm:p-6 wood-frame">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={onCancel}
          className="p-2 -ml-2 text-settlers-brown hover:text-settlers-dark-brown transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div className="flex items-center gap-2 flex-1">
          <Swords className="w-6 h-6 text-settlers-gold" />
          <h2 className="text-xl sm:text-2xl font-bold text-settlers-dark-brown font-medieval">
            Ny Kamp
          </h2>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Map Selection - Now with search! */}
        <div>
          <label className="block text-settlers-dark-brown font-bold mb-2 text-sm flex items-center gap-2">
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
          <label className="block text-settlers-dark-brown font-bold mb-2 text-sm flex items-center gap-2">
            <Calendar className="w-4 h-4" /> Dato og tid
          </label>
          <input
            type="datetime-local"
            value={form.matchDateTime}
            onChange={(e) => setForm(prev => ({ ...prev, matchDateTime: e.target.value }))}
            className="input-settlers w-full text-base"
          />
        </div>

        {/* Duration */}
        <div>
          <label className="block text-settlers-dark-brown font-bold mb-2 text-sm flex items-center gap-2">
            <Clock className="w-4 h-4" /> Spilletid (minutter)
          </label>
          <input
            type="number"
            value={form.duration}
            onChange={(e) => setForm(prev => ({ ...prev, duration: e.target.value }))}
            placeholder="f.eks. 45"
            className="input-settlers w-full text-base"
            min="1"
            inputMode="numeric"
          />
        </div>

        {/* Result Type */}
        <div>
          <label className="block text-settlers-dark-brown font-bold mb-2 text-sm flex items-center gap-2">
            <Trophy className="w-4 h-4" /> Resultat
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setForm(prev => ({ ...prev, result: 'win' }))}
              className={`flex-1 py-3 px-4 rounded-lg font-bold transition-all ${
                form.result === 'win'
                  ? 'bg-settlers-gold text-settlers-dark border-2 border-settlers-dark-brown'
                  : 'bg-white/50 text-settlers-brown border-2 border-transparent'
              }`}
            >
              Seier/Tap
            </button>
            <button
              type="button"
              onClick={() => setForm(prev => ({ ...prev, result: 'draw', winnerId: '' }))}
              className={`flex-1 py-3 px-4 rounded-lg font-bold transition-all ${
                form.result === 'draw'
                  ? 'bg-settlers-gold text-settlers-dark border-2 border-settlers-dark-brown'
                  : 'bg-white/50 text-settlers-brown border-2 border-transparent'
              }`}
            >
              Uavgjort
            </button>
          </div>
        </div>

        {/* Winner Selection */}
        {form.result === 'win' && (
          <div>
            <label className="block text-settlers-dark-brown font-bold mb-3 text-sm">
              Hvem vant?
            </label>
            <div className="grid grid-cols-2 gap-3">
              {players.map((player) => (
                <button
                  key={player.id}
                  type="button"
                  onClick={() => setForm(prev => ({ ...prev, winnerId: player.id }))}
                  className={`
                    p-4 rounded-xl border-3 transition-all duration-200 flex flex-col items-center gap-2
                    ${form.winnerId === player.id
                      ? 'border-settlers-gold bg-yellow-50 shadow-lg transform scale-[1.02]'
                      : 'border-settlers-brown/20 bg-white/50 active:scale-95'
                    }
                  `}
                >
                  <div
                    className={`
                      w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-md
                      ${form.winnerId === player.id ? 'ring-4 ring-settlers-gold ring-offset-2' : ''}
                    `}
                    style={{ backgroundColor: player.color }}
                  >
                    {form.winnerId === player.id ? <Trophy className="w-7 h-7" /> : player.name.charAt(0)}
                  </div>
                  <span className="font-bold text-settlers-dark-brown text-base">{player.name}</span>
                  {form.winnerId === player.id && (
                    <span className="text-xs text-green-700 font-bold">VINNER</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* AI Eliminations */}
        <div>
          <label className="block text-settlers-dark-brown font-bold mb-2 text-sm flex items-center gap-2">
            <Skull className="w-4 h-4" /> AI Elimineringer
            <span className="text-xs font-normal text-settlers-brown">(+0.5p hver)</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            {players.map((player) => (
              <div key={player.id} className="bg-white/50 rounded-xl p-3">
                <p className="text-sm text-settlers-brown mb-2 flex items-center gap-2 font-medium">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: player.color }}
                  />
                  {player.name}
                </p>
                <div className="flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => updatePlayerAiKills(player.id, -1)}
                    className="w-10 h-10 rounded-lg bg-settlers-brown/20 hover:bg-settlers-brown/40 active:bg-settlers-brown/50 text-settlers-dark-brown font-bold text-xl transition-colors"
                  >
                    −
                  </button>
                  <span className="text-3xl font-bold text-settlers-dark-brown w-10 text-center">
                    {getPlayerAiKills(player.id)}
                  </span>
                  <button
                    type="button"
                    onClick={() => updatePlayerAiKills(player.id, 1)}
                    className="w-10 h-10 rounded-lg bg-settlers-brown/20 hover:bg-settlers-brown/40 active:bg-settlers-brown/50 text-settlers-dark-brown font-bold text-xl transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-settlers-dark-brown font-bold mb-2 text-sm flex items-center gap-2">
            <FileText className="w-4 h-4" /> Notater
          </label>
          <textarea
            value={form.notes}
            onChange={(e) => setForm(prev => ({ ...prev, notes: e.target.value }))}
            placeholder="Spesielle hendelser..."
            className="input-settlers w-full h-20 resize-none text-base"
          />
        </div>

        {/* Battle Report Toggle */}
        <button
          type="button"
          onClick={() => setShowBattleReport(!showBattleReport)}
          className="w-full py-3 rounded-lg bg-settlers-brown/10 text-settlers-brown font-medium flex items-center justify-center gap-2"
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
          className="btn-settlers w-full py-4 text-lg flex items-center justify-center gap-2"
        >
          <Swords className="w-5 h-5" />
          Registrer Kamp
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
    <div className="bg-settlers-wheat/30 rounded-xl p-4 space-y-3">
      {players.map((player) => (
        <div key={player.id} className="bg-white/50 rounded-lg p-3">
          <h4 className="font-bold text-settlers-dark-brown mb-2 text-sm flex items-center gap-2">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: player.color }} />
            {player.name}
          </h4>

          <div className="flex flex-wrap gap-2 mb-2">
            <button
              type="button"
              onClick={() => addEvent(player.id, { type: 'ai_eliminated', description: 'Eliminerte AI' })}
              className="text-xs bg-purple-100 text-purple-700 px-3 py-1.5 rounded-full active:bg-purple-200"
            >
              <Skull className="w-3 h-3 inline mr-1" /> AI Drept
            </button>
            <button
              type="button"
              onClick={() => addEvent(player.id, { type: 'major_battle', description: 'Vant slag' })}
              className="text-xs bg-red-100 text-red-700 px-3 py-1.5 rounded-full active:bg-red-200"
            >
              <Swords className="w-3 h-3 inline mr-1" /> Slag
            </button>
            <button
              type="button"
              onClick={() => addEvent(player.id, { type: 'expansion', description: 'Ekspanderte' })}
              className="text-xs bg-green-100 text-green-700 px-3 py-1.5 rounded-full active:bg-green-200"
            >
              <Map className="w-3 h-3 inline mr-1" /> Ekspansjon
            </button>
          </div>

          {report[player.id]?.events?.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {report[player.id].events.map((event, idx) => (
                <span
                  key={idx}
                  className="text-xs bg-settlers-wheat rounded px-2 py-1 flex items-center gap-1"
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
                    className="text-red-500 ml-1"
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
