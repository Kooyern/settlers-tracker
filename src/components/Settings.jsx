import React, { useState } from 'react'
import { Settings as SettingsIcon, User, Palette, Download, Save, Cloud } from 'lucide-react'

const PLAYER_COLORS = [
  '#1E90FF', // Blue
  '#DC143C', // Red
  '#228B22', // Green
  '#FFD700', // Gold
  '#9400D3', // Purple
  '#FF8C00', // Orange
  '#00CED1', // Cyan
  '#FF69B4', // Pink
]

export function Settings({ players, updatePlayer, matches, onExport }) {
  const [editingPlayer, setEditingPlayer] = useState(null)
  const [tempName, setTempName] = useState('')
  const [saving, setSaving] = useState(false)

  const startEditing = (player) => {
    setEditingPlayer(player.id)
    setTempName(player.name)
  }

  const savePlayerName = async () => {
    if (tempName.trim()) {
      setSaving(true)
      try {
        await updatePlayer(editingPlayer, { name: tempName.trim() })
      } catch (err) {
        alert('Kunne ikke lagre. Prøv igjen.')
      }
      setSaving(false)
    }
    setEditingPlayer(null)
    setTempName('')
  }

  const handleColorChange = async (playerId, color) => {
    try {
      await updatePlayer(playerId, { color })
    } catch (err) {
      alert('Kunne ikke lagre farge. Prøv igjen.')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="parchment rounded-xl p-6 wood-frame">
        <div className="flex items-center gap-3 mb-4">
          <SettingsIcon className="w-8 h-8 text-settlers-gold" />
          <h2 className="text-2xl font-bold text-settlers-dark-brown font-medieval">
            Innstillinger
          </h2>
        </div>
        <p className="text-settlers-brown">
          Tilpass spillernavn og farger. Alle endringer synkroniseres automatisk.
        </p>
        <div className="mt-3 flex items-center gap-2 text-sm text-green-700 bg-green-100 px-3 py-2 rounded-lg">
          <Cloud className="w-4 h-4" />
          <span>Data lagres i skyen - dere ser samme statistikk på begge telefonene!</span>
        </div>
      </div>

      {/* Player Settings */}
      <div className="parchment rounded-xl p-6">
        <h3 className="font-bold text-settlers-dark-brown text-lg mb-4 flex items-center gap-2">
          <User className="w-5 h-5" /> Spillere
        </h3>

        <div className="space-y-4">
          {players.map((player) => (
            <div key={player.id} className="bg-white/50 rounded-lg p-4">
              <div className="flex items-center gap-4">
                {/* Color Selector */}
                <div className="relative">
                  <div
                    className="w-12 h-12 rounded-full cursor-pointer shadow-lg transition-transform hover:scale-110"
                    style={{ backgroundColor: player.color }}
                  />
                </div>

                {/* Name */}
                <div className="flex-1">
                  {editingPlayer === player.id ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={tempName}
                        onChange={(e) => setTempName(e.target.value)}
                        className="input-settlers flex-1"
                        autoFocus
                        onKeyDown={(e) => e.key === 'Enter' && savePlayerName()}
                      />
                      <button
                        onClick={savePlayerName}
                        disabled={saving}
                        className="btn-settlers flex items-center gap-1"
                      >
                        <Save className="w-4 h-4" /> {saving ? '...' : 'Lagre'}
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-settlers-dark-brown">
                        {player.name}
                      </span>
                      <button
                        onClick={() => startEditing(player)}
                        className="text-settlers-brown hover:text-settlers-dark-brown text-sm underline"
                      >
                        Endre navn
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Color Options */}
              <div className="mt-3">
                <p className="text-sm text-settlers-brown mb-2 flex items-center gap-1">
                  <Palette className="w-4 h-4" /> Velg farge
                </p>
                <div className="flex gap-2 flex-wrap">
                  {PLAYER_COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => handleColorChange(player.id, color)}
                      className={`
                        w-8 h-8 rounded-full transition-all duration-200
                        ${player.color === color ? 'ring-4 ring-settlers-gold scale-110' : 'hover:scale-110'}
                      `}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Data Management */}
      <div className="parchment rounded-xl p-6">
        <h3 className="font-bold text-settlers-dark-brown text-lg mb-4 flex items-center gap-2">
          <Download className="w-5 h-5" /> Data
        </h3>

        <div className="space-y-4">
          {/* Export */}
          <div className="bg-white/50 rounded-lg p-4">
            <h4 className="font-bold text-settlers-dark-brown mb-2">Eksporter Data</h4>
            <p className="text-sm text-settlers-brown mb-3">
              Last ned en sikkerhetskopi av alle dine kamper og innstillinger.
            </p>
            <button onClick={onExport} className="btn-settlers flex items-center gap-2">
              <Download className="w-4 h-4" /> Eksporter til fil
            </button>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="parchment rounded-xl p-6">
        <h3 className="font-bold text-settlers-dark-brown text-lg mb-4">
          Statistikk
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="bg-white/50 rounded-lg p-3">
            <p className="text-2xl font-bold text-settlers-gold">{matches.length}</p>
            <p className="text-sm text-settlers-brown">Kamper totalt</p>
          </div>
          <div className="bg-white/50 rounded-lg p-3">
            <p className="text-2xl font-bold text-settlers-gold">
              {matches.reduce((acc, m) => acc + (m.duration || 0), 0)}
            </p>
            <p className="text-sm text-settlers-brown">Minutter spilt</p>
          </div>
          <div className="bg-white/50 rounded-lg p-3">
            <p className="text-2xl font-bold text-settlers-gold">
              {matches.reduce((acc, m) =>
                acc + (m.players?.[0]?.aiEliminations || 0) + (m.players?.[1]?.aiEliminations || 0), 0
              )}
            </p>
            <p className="text-sm text-settlers-brown">AI eliminert</p>
          </div>
          <div className="bg-white/50 rounded-lg p-3">
            <p className="text-2xl font-bold text-settlers-gold">
              {new Set(matches.map(m => m.mapId)).size}
            </p>
            <p className="text-sm text-settlers-brown">Ulike kart</p>
          </div>
        </div>
      </div>
    </div>
  )
}
