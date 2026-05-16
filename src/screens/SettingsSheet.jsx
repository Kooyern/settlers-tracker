import React, { useState } from 'react'
import { Check, Cloud, Download, Pencil, User } from 'lucide-react'
import { Sheet } from '../components/ui/Sheet'
import { Card, PlayerAvatar, SectionLabel } from '../components/ui/Primitives'

const PLAYER_COLORS = [
  '#3b82f6', '#ef4444', '#22c55e', '#f59e0b',
  '#8b5cf6', '#f97316', '#06b6d4', '#ec4899',
  '#14b8a6', '#f43f5e', '#6366f1', '#84cc16',
]

export function SettingsSheet({ open, onClose, players, updatePlayer, onExport }) {
  return (
    <Sheet open={open} onClose={onClose} title="Innstillinger">
      <div className="space-y-4">
        <div className="flex items-center gap-2 rounded-xl border border-success/30 bg-success/10 px-3 py-2">
          <Cloud className="h-4 w-4 text-success" />
          <span className="text-sm font-medium text-success">Synkronisert mot skyen</span>
        </div>

        <div className="space-y-2">
          <SectionLabel icon={User}>Spillere</SectionLabel>
          {players.map(player => (
            <PlayerEditor key={player.id} player={player} updatePlayer={updatePlayer} />
          ))}
        </div>

        <div className="space-y-2">
          <SectionLabel icon={Download}>Eksport</SectionLabel>
          <Card>
            <p className="text-sm text-text-secondary">
              Last ned en JSON-backup av alle dine data.
            </p>
            <button type="button" onClick={onExport} className="btn btn-primary btn-block mt-3">
              <Download className="w-4 h-4" />
              Last ned backup
            </button>
          </Card>
        </div>
      </div>
    </Sheet>
  )
}

function PlayerEditor({ player, updatePlayer }) {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(player.name)

  const save = async () => {
    if (name.trim() && name !== player.name) {
      try { await updatePlayer(player.id, { name: name.trim() }) } catch { alert('Kunne ikke lagre.') }
    }
    setEditing(false)
  }

  const setColor = async (color) => {
    try { await updatePlayer(player.id, { color }) } catch { alert('Kunne ikke lagre farge.') }
  }

  return (
    <Card>
      <div className="flex items-center gap-3">
        <PlayerAvatar player={player} size="md" />
        <div className="min-w-0 flex-1">
          {editing ? (
            <div className="flex gap-2">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && save()}
                className="input py-2 text-sm"
                autoFocus
              />
              <button type="button" onClick={save} className="btn btn-primary btn-sm">
                <Check className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-2">
              <span className="truncate text-base font-semibold text-text-primary">{player.name}</span>
              <button
                type="button"
                onClick={() => { setName(player.name); setEditing(true) }}
                className="btn-icon"
                aria-label="Endre navn"
              >
                <Pencil className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="mt-3 grid grid-cols-6 gap-2">
        {PLAYER_COLORS.map(color => (
          <button
            key={color}
            type="button"
            onClick={() => setColor(color)}
            aria-label={`Velg farge ${color}`}
            className={`h-8 w-8 rounded-full transition-transform ${
              player.color === color
                ? 'ring-2 ring-accent ring-offset-2 ring-offset-bg-card scale-110'
                : 'opacity-60 hover:opacity-100'
            }`}
            style={{ backgroundColor: color }}
          />
        ))}
      </div>
    </Card>
  )
}
