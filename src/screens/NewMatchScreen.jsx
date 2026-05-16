import React, { useMemo, useState } from 'react'
import {
  AlertTriangle, Calendar, Check, ChevronLeft, ChevronRight, Clock,
  Handshake, Map as MapIcon, Minus, Plus, Skull, Trophy,
} from 'lucide-react'
import { Screen } from '../components/ui/AppShell'
import { Card, PlayerAvatar, PlayerDot, SectionLabel } from '../components/ui/Primitives'
import { MapPickerSheet } from './MapPicker'

const AI_COLORS = [
  { id: 'white', name: 'Hvit', color: '#e5e5e5' },
  { id: 'black', name: 'Svart', color: '#525252' },
  { id: 'yellow', name: 'Gul', color: '#eab308' },
  { id: 'red', name: 'Rød', color: '#ef4444' },
]

const STEPS = [
  { id: 1, label: 'Kart' },
  { id: 2, label: 'Resultat' },
  { id: 3, label: 'Bekreft' },
]

const getLocalDateTime = () => {
  const now = new Date()
  const offset = now.getTimezoneOffset()
  const local = new Date(now.getTime() - offset * 60 * 1000)
  return local.toISOString().slice(0, 16)
}

export function NewMatchScreen({ players, maps, matches, onSubmit, onCancel, onAddMap }) {
  const [step, setStep] = useState(1)
  const [showMapPicker, setShowMapPicker] = useState(false)
  const [form, setForm] = useState({
    mapId: '',
    duration: '',
    winnerId: '',
    result: 'win',
    notes: '',
    matchDateTime: getLocalDateTime(),
    aiColors: AI_COLORS.map(a => a.id),
    players: players.map(p => ({ playerId: p.id, aiEliminations: 0, aiDeaths: 0 })),
  })

  const selectedMap = maps.find(m => m.id === form.mapId)

  const setField = (key, value) => setForm(prev => ({ ...prev, [key]: value }))

  const updatePlayerStat = (playerId, key, delta, min = 0, max = Infinity) => {
    setForm(prev => ({
      ...prev,
      players: prev.players.map(p =>
        p.playerId === playerId
          ? { ...p, [key]: Math.min(max, Math.max(min, (p[key] || 0) + delta)) }
          : p
      ),
    }))
  }

  const toggleAi = (id) => {
    setForm(prev => {
      const has = prev.aiColors.includes(id)
      if (has) {
        return prev.aiColors.length > 1
          ? { ...prev, aiColors: prev.aiColors.filter(x => x !== id) }
          : prev
      }
      return { ...prev, aiColors: [...prev.aiColors, id] }
    })
  }

  const canAdvance =
    (step === 1 && !!form.mapId) ||
    (step === 2 && (form.result === 'draw' || !!form.winnerId)) ||
    step === 3

  const submit = () => {
    const matchData = {
      mapId: form.mapId,
      mapName: selectedMap?.name || '',
      duration: form.duration ? parseInt(form.duration, 10) : null,
      winnerId: form.result === 'draw' ? null : form.winnerId,
      result: form.result,
      notes: form.notes,
      players: form.players,
      date: new Date(form.matchDateTime).toISOString(),
      aiColors: form.aiColors,
      aiCount: form.aiColors.length,
    }
    onSubmit(matchData)
  }

  return (
    <Screen>
      {/* Step indicator */}
      <div className="card-flat flex items-center justify-between gap-2 px-3 py-2">
        {STEPS.map((s, idx) => {
          const isDone = step > s.id
          const isCurrent = step === s.id
          return (
            <React.Fragment key={s.id}>
              <button
                type="button"
                onClick={() => { if (s.id < step) setStep(s.id) }}
                className="flex min-w-0 items-center gap-2"
                disabled={s.id > step}
              >
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                    isCurrent
                      ? 'bg-accent text-bg-primary'
                      : isDone
                      ? 'bg-success/20 text-success'
                      : 'bg-bg-soft text-text-muted'
                  }`}
                >
                  {isDone ? <Check className="w-3.5 h-3.5" /> : s.id}
                </span>
                <span className={`truncate text-xs font-medium ${isCurrent ? 'text-text-primary' : 'text-text-muted'}`}>
                  {s.label}
                </span>
              </button>
              {idx < STEPS.length - 1 && (
                <span className="h-px flex-1 bg-border" />
              )}
            </React.Fragment>
          )
        })}
      </div>

      {step === 1 && (
        <>
          <Card>
            <SectionLabel icon={MapIcon}>Velg kart</SectionLabel>
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
            <SectionLabel icon={Calendar}>Dato og tid</SectionLabel>
            <input
              type="datetime-local"
              value={form.matchDateTime}
              onChange={(e) => setField('matchDateTime', e.target.value)}
              className="input mt-2"
            />
          </Card>

          <Card>
            <SectionLabel icon={Skull}>AI-motstandere ({form.aiColors.length})</SectionLabel>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {AI_COLORS.map(ai => {
                const isOn = form.aiColors.includes(ai.id)
                return (
                  <button
                    key={ai.id}
                    type="button"
                    onClick={() => toggleAi(ai.id)}
                    className={`flex items-center justify-center gap-2 rounded-xl border-2 px-3 py-2.5 text-sm font-medium ${
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
        </>
      )}

      {step === 2 && (
        <>
          <Card>
            <SectionLabel icon={Trophy}>Resultat</SectionLabel>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setForm(prev => ({ ...prev, result: 'win' }))}
                className={`btn ${form.result === 'win' ? 'btn-primary' : 'btn-secondary'}`}
              >
                <Trophy className="w-4 h-4" />
                Seier/Tap
              </button>
              <button
                type="button"
                onClick={() => setForm(prev => ({ ...prev, result: 'draw', winnerId: '' }))}
                className={`btn ${form.result === 'draw' ? 'btn-primary' : 'btn-secondary'}`}
              >
                <Handshake className="w-4 h-4" />
                Uavgjort
              </button>
            </div>
          </Card>

          {form.result === 'win' && (
            <Card>
              <SectionLabel>Vinner</SectionLabel>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {players.map(player => {
                  const isWinner = form.winnerId === player.id
                  return (
                    <button
                      key={player.id}
                      type="button"
                      onClick={() => setField('winnerId', player.id)}
                      className={`flex flex-col items-center gap-2 rounded-xl border-2 px-3 py-4 transition-all ${
                        isWinner ? 'border-accent bg-accent/8' : 'border-border bg-bg-soft'
                      }`}
                    >
                      <PlayerAvatar player={player} size="lg" winner={isWinner} />
                      <span className="truncate text-sm font-semibold text-text-primary">{player.name}</span>
                      {isWinner && <span className="badge badge-accent">Vinner</span>}
                    </button>
                  )
                })}
              </div>
            </Card>
          )}

          <Card>
            <SectionLabel icon={Skull}>AI eliminert (+0.5p hver)</SectionLabel>
            <div className="mt-2 space-y-2">
              {players.map(player => {
                const playerForm = form.players.find(p => p.playerId === player.id)
                return (
                  <div
                    key={player.id}
                    className="flex items-center gap-3 rounded-xl border border-border bg-bg-soft px-3 py-2.5"
                  >
                    <PlayerDot player={player} size={10} />
                    <span className="min-w-0 flex-1 truncate text-sm font-medium text-text-primary">
                      {player.name}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => updatePlayerStat(player.id, 'aiEliminations', -1)}
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-bg-card text-text-primary"
                        aria-label="Minus"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="number-display w-8 text-center text-lg font-bold text-text-primary">
                        {playerForm?.aiEliminations || 0}
                      </span>
                      <button
                        type="button"
                        onClick={() => updatePlayerStat(player.id, 'aiEliminations', 1)}
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-bg-card text-text-primary"
                        aria-label="Pluss"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>

          <Card>
            <SectionLabel icon={AlertTriangle}>Slått av AI (-1p)</SectionLabel>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {players.map(player => {
                const playerForm = form.players.find(p => p.playerId === player.id)
                const died = (playerForm?.aiDeaths || 0) > 0
                return (
                  <button
                    key={player.id}
                    type="button"
                    onClick={() => updatePlayerStat(player.id, 'aiDeaths', died ? -1 : 1, 0, 1)}
                    className={`flex items-center justify-center gap-2 rounded-xl border-2 px-3 py-2.5 text-sm font-medium ${
                      died
                        ? 'border-danger/40 bg-danger/15 text-danger'
                        : 'border-border bg-bg-soft text-text-muted'
                    }`}
                  >
                    <PlayerDot player={player} size={10} />
                    <span className="truncate">{player.name}</span>
                    {died && <Skull className="w-4 h-4" />}
                  </button>
                )
              })}
            </div>
          </Card>

          <Card>
            <SectionLabel icon={Clock}>Spilletid</SectionLabel>
            <input
              type="number"
              value={form.duration}
              onChange={(e) => setField('duration', e.target.value)}
              placeholder="Minutter, f.eks. 45"
              className="input mt-2"
              min="1"
              inputMode="numeric"
            />
          </Card>

          <Card>
            <SectionLabel>Notater</SectionLabel>
            <textarea
              value={form.notes}
              onChange={(e) => setField('notes', e.target.value)}
              placeholder="Spesielle hendelser…"
              className="textarea mt-2"
            />
          </Card>
        </>
      )}

      {step === 3 && (
        <Card className="space-y-3">
          <SectionLabel icon={Check}>Bekreft kamp</SectionLabel>
          <Row label="Kart" value={selectedMap?.name || '—'} />
          <Row label="Dato" value={new Date(form.matchDateTime).toLocaleString('nb-NO', {
            day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
          })} />
          <Row label="AI-motstandere" value={form.aiColors.length} />
          <Row
            label="Resultat"
            value={form.result === 'draw'
              ? 'Uavgjort'
              : `${players.find(p => p.id === form.winnerId)?.name || '—'} vant`}
          />
          <Row label="Varighet" value={form.duration ? `${form.duration} min` : '—'} />
          {form.players.map(p => {
            const player = players.find(pp => pp.id === p.playerId)
            return (
              <Row
                key={p.playerId}
                label={`${player?.name} — AI`}
                value={`${p.aiEliminations || 0} eliminert${p.aiDeaths ? ' · slått av AI' : ''}`}
              />
            )
          })}
          {form.notes && (
            <div>
              <p className="text-[11px] uppercase tracking-wider text-text-muted">Notater</p>
              <p className="mt-1 whitespace-pre-wrap text-sm text-text-secondary">{form.notes}</p>
            </div>
          )}
        </Card>
      )}

      {/* Step navigation */}
      <div className="grid grid-cols-2 gap-2 pt-1">
        <button
          type="button"
          onClick={() => (step === 1 ? onCancel() : setStep(s => s - 1))}
          className="btn btn-secondary"
        >
          <ChevronLeft className="w-4 h-4" />
          {step === 1 ? 'Avbryt' : 'Tilbake'}
        </button>
        {step < 3 ? (
          <button
            type="button"
            onClick={() => setStep(s => s + 1)}
            disabled={!canAdvance}
            className="btn btn-primary"
          >
            Neste
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button type="button" onClick={submit} className="btn btn-primary">
            <Check className="w-4 h-4" />
            Lagre kamp
          </button>
        )}
      </div>

      <MapPickerSheet
        open={showMapPicker}
        onClose={() => setShowMapPicker(false)}
        maps={maps}
        matches={matches}
        selectedMapId={form.mapId}
        onSelect={(id) => { setField('mapId', id); setShowMapPicker(false) }}
        onAddMap={onAddMap}
      />
    </Screen>
  )
}

function Row({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-border/60 pb-2 last:border-b-0 last:pb-0">
      <span className="text-xs uppercase tracking-wider text-text-muted">{label}</span>
      <span className="text-right text-sm font-medium text-text-primary">{value}</span>
    </div>
  )
}
