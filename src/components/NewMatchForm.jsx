import React, { useState } from 'react'
import { Swords, Map, Clock, Trophy, Skull, FileText, Plus, X } from 'lucide-react'
import { MAPS, DIFFICULTY_COLORS } from '../data/maps'

const INITIAL_FORM = {
  mapId: '',
  duration: '',
  winnerId: '',
  result: 'win', // win or draw
  notes: '',
  players: [
    { playerId: 'player1', aiEliminations: 0 },
    { playerId: 'player2', aiEliminations: 0 },
  ],
  battleReport: null,
}

export function NewMatchForm({ players, onSubmit, onCancel }) {
  const [form, setForm] = useState(INITIAL_FORM)
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

    const matchData = {
      ...form,
      duration: form.duration ? parseInt(form.duration) : null,
      winnerId: form.result === 'draw' ? null : form.winnerId,
    }

    onSubmit(matchData)
    setForm(INITIAL_FORM)
  }

  const updatePlayerData = (playerIndex, field, value) => {
    setForm(prev => ({
      ...prev,
      players: prev.players.map((p, idx) =>
        idx === playerIndex ? { ...p, [field]: value } : p
      )
    }))
  }

  return (
    <div className="parchment rounded-xl p-6 wood-frame">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Swords className="w-8 h-8 text-settlers-gold" />
          <h2 className="text-2xl font-bold text-settlers-dark-brown font-medieval">
            Registrer Ny Kamp
          </h2>
        </div>
        {onCancel && (
          <button
            onClick={onCancel}
            className="text-settlers-brown hover:text-settlers-dark-brown transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Map Selection */}
        <div>
          <label className="block text-settlers-dark-brown font-bold mb-2 flex items-center gap-2">
            <Map className="w-4 h-4" /> Velg Kart
          </label>
          <select
            value={form.mapId}
            onChange={(e) => setForm(prev => ({ ...prev, mapId: e.target.value }))}
            className="select-settlers w-full"
            required
          >
            <option value="">-- Velg kart --</option>
            {MAPS.map(map => (
              <option key={map.id} value={map.id}>
                {map.name} ({map.difficulty})
              </option>
            ))}
          </select>
        </div>

        {/* Duration */}
        <div>
          <label className="block text-settlers-dark-brown font-bold mb-2 flex items-center gap-2">
            <Clock className="w-4 h-4" /> Spilletid (minutter)
          </label>
          <input
            type="number"
            value={form.duration}
            onChange={(e) => setForm(prev => ({ ...prev, duration: e.target.value }))}
            placeholder="f.eks. 45"
            className="input-settlers w-full"
            min="1"
          />
        </div>

        {/* Result Type */}
        <div>
          <label className="block text-settlers-dark-brown font-bold mb-2 flex items-center gap-2">
            <Trophy className="w-4 h-4" /> Resultat
          </label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="result"
                value="win"
                checked={form.result === 'win'}
                onChange={(e) => setForm(prev => ({ ...prev, result: e.target.value }))}
                className="w-4 h-4"
              />
              <span className="text-settlers-dark-brown">Seier/Tap</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="result"
                value="draw"
                checked={form.result === 'draw'}
                onChange={(e) => setForm(prev => ({ ...prev, result: e.target.value, winnerId: '' }))}
                className="w-4 h-4"
              />
              <span className="text-settlers-dark-brown">Uavgjort</span>
            </label>
          </div>
        </div>

        {/* Winner Selection (if not draw) */}
        {form.result === 'win' && (
          <div>
            <label className="block text-settlers-dark-brown font-bold mb-2">
              Hvem vant?
            </label>
            <div className="grid grid-cols-2 gap-4">
              {players.map((player) => (
                <button
                  key={player.id}
                  type="button"
                  onClick={() => setForm(prev => ({ ...prev, winnerId: player.id }))}
                  className={`
                    p-4 rounded-lg border-2 transition-all duration-300 flex flex-col items-center gap-2
                    ${form.winnerId === player.id
                      ? 'border-settlers-gold bg-yellow-50 shadow-lg scale-105'
                      : 'border-settlers-brown/30 bg-white/50 hover:border-settlers-gold/50'
                    }
                  `}
                >
                  <div
                    className={`
                      w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl
                      ${form.winnerId === player.id ? 'ring-4 ring-settlers-gold' : ''}
                    `}
                    style={{ backgroundColor: player.color }}
                  >
                    {form.winnerId === player.id ? <Trophy className="w-6 h-6" /> : player.name.charAt(0)}
                  </div>
                  <span className="font-bold text-settlers-dark-brown">{player.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* AI Eliminations */}
        <div>
          <label className="block text-settlers-dark-brown font-bold mb-2 flex items-center gap-2">
            <Skull className="w-4 h-4" /> AI Elimineringer
            <span className="text-xs font-normal text-settlers-brown">(+0.5 poeng per eliminering)</span>
          </label>
          <div className="grid grid-cols-2 gap-4">
            {players.map((player, idx) => (
              <div key={player.id} className="bg-white/50 rounded-lg p-3">
                <p className="text-sm text-settlers-brown mb-2 flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: player.color }} />
                  {player.name}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => updatePlayerData(idx, 'aiEliminations', Math.max(0, form.players[idx].aiEliminations - 1))}
                    className="w-8 h-8 rounded bg-settlers-brown/20 hover:bg-settlers-brown/40 text-settlers-dark-brown font-bold transition-colors"
                  >
                    -
                  </button>
                  <span className="text-2xl font-bold text-settlers-dark-brown w-8 text-center">
                    {form.players[idx].aiEliminations}
                  </span>
                  <button
                    type="button"
                    onClick={() => updatePlayerData(idx, 'aiEliminations', form.players[idx].aiEliminations + 1)}
                    className="w-8 h-8 rounded bg-settlers-brown/20 hover:bg-settlers-brown/40 text-settlers-dark-brown font-bold transition-colors"
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
          <label className="block text-settlers-dark-brown font-bold mb-2 flex items-center gap-2">
            <FileText className="w-4 h-4" /> Notater (valgfritt)
          </label>
          <textarea
            value={form.notes}
            onChange={(e) => setForm(prev => ({ ...prev, notes: e.target.value }))}
            placeholder="Spesielle hendelser, strategier brukt, osv..."
            className="input-settlers w-full h-24 resize-none"
          />
        </div>

        {/* Battle Report Toggle */}
        <div className="border-t border-settlers-brown/20 pt-4">
          <button
            type="button"
            onClick={() => setShowBattleReport(!showBattleReport)}
            className="btn-settlers-secondary w-full flex items-center justify-center gap-2"
          >
            <Plus className={`w-4 h-4 transition-transform ${showBattleReport ? 'rotate-45' : ''}`} />
            {showBattleReport ? 'Skjul Kamprapport' : 'Legg til Kamprapport'}
          </button>
        </div>

        {/* Battle Report Section */}
        {showBattleReport && (
          <BattleReportForm
            form={form}
            setForm={setForm}
            players={players}
          />
        )}

        {/* Submit */}
        <div className="flex gap-4 pt-4">
          <button type="submit" className="btn-settlers flex-1 flex items-center justify-center gap-2">
            <Swords className="w-5 h-5" />
            Registrer Kamp
          </button>
        </div>
      </form>
    </div>
  )
}

function BattleReportForm({ form, setForm, players }) {
  const [report, setReport] = useState(form.battleReport || {
    player1: { buildings: {}, units: {}, events: [] },
    player2: { buildings: {}, units: {}, events: [] },
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
    <div className="bg-settlers-wheat/50 rounded-lg p-4 space-y-4">
      <h3 className="font-bold text-settlers-dark-brown text-lg flex items-center gap-2">
        <FileText className="w-5 h-5" /> Kamprapport
      </h3>

      <p className="text-sm text-settlers-brown">
        Her kan du legge til detaljert informasjon om kampen. Legg til bygninger, enheter og viktige hendelser for hver spiller.
      </p>

      {players.map((player) => (
        <div key={player.id} className="bg-white/50 rounded-lg p-4">
          <h4 className="font-bold text-settlers-dark-brown mb-3 flex items-center gap-2">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: player.color }} />
            {player.name}s Rapport
          </h4>

          {/* Quick Event Buttons */}
          <div className="flex flex-wrap gap-2 mb-3">
            <button
              type="button"
              onClick={() => addEvent(player.id, { type: 'ai_eliminated', description: 'Eliminerte en AI-spiller' })}
              className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded hover:bg-purple-200 transition-colors flex items-center gap-1"
            >
              <Skull className="w-3 h-3" /> AI Eliminert
            </button>
            <button
              type="button"
              onClick={() => addEvent(player.id, { type: 'major_battle', description: 'Vant et stort slag' })}
              className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200 transition-colors flex items-center gap-1"
            >
              <Swords className="w-3 h-3" /> Stort Slag
            </button>
            <button
              type="button"
              onClick={() => addEvent(player.id, { type: 'expansion', description: 'Utvidet territorium' })}
              className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200 transition-colors flex items-center gap-1"
            >
              <Map className="w-3 h-3" /> Ekspansjon
            </button>
          </div>

          {/* Events List */}
          {report[player.id]?.events?.length > 0 && (
            <div className="space-y-1">
              {report[player.id].events.map((event, idx) => (
                <div key={idx} className="text-xs bg-settlers-wheat/50 rounded p-2 flex items-center justify-between">
                  <span>{event.description}</span>
                  <button
                    type="button"
                    onClick={() => {
                      const newEvents = report[player.id].events.filter((_, i) => i !== idx)
                      updateReport({
                        ...report,
                        [player.id]: { ...report[player.id], events: newEvents }
                      })
                    }}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
