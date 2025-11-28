import React, { useState } from 'react'
import { Settings as SettingsIcon, User, Palette, Download, Save, Cloud, Map, Plus, Trash2, Upload } from 'lucide-react'

const PLAYER_COLORS = [
  '#1E90FF', '#DC143C', '#228B22', '#FFD700',
  '#9400D3', '#FF8C00', '#00CED1', '#FF69B4',
]

export function Settings({ players, updatePlayer, matches, maps, addMap, addMaps, deleteMap, onExport }) {
  const [editingPlayer, setEditingPlayer] = useState(null)
  const [tempName, setTempName] = useState('')
  const [saving, setSaving] = useState(false)
  const [newMapName, setNewMapName] = useState('')
  const [bulkMaps, setBulkMaps] = useState('')
  const [showBulkAdd, setShowBulkAdd] = useState(false)
  const [mapCategory, setMapCategory] = useState('Map Pack')

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
        alert('Kunne ikke lagre.')
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
      alert('Kunne ikke lagre farge.')
    }
  }

  const handleAddMap = async () => {
    if (!newMapName.trim()) return
    try {
      await addMap({ name: newMapName.trim(), category: mapCategory })
      setNewMapName('')
    } catch (err) {
      alert('Kunne ikke legge til kart.')
    }
  }

  const handleBulkAdd = async () => {
    const mapNames = bulkMaps
      .split('\n')
      .map(name => name.trim())
      .filter(name => name.length > 0)

    if (mapNames.length === 0) {
      alert('Ingen kart å legge til!')
      return
    }

    try {
      await addMaps(mapNames, mapCategory)
      setBulkMaps('')
      setShowBulkAdd(false)
      alert(`${mapNames.length} kart lagt til!`)
    } catch (err) {
      alert('Kunne ikke legge til kart.')
    }
  }

  const handleDeleteMap = async (mapId, mapName) => {
    if (window.confirm(`Slette "${mapName}"?`)) {
      try {
        await deleteMap(mapId)
      } catch (err) {
        alert('Kunne ikke slette.')
      }
    }
  }

  // Group maps by category
  const groupedMaps = maps.reduce((acc, map) => {
    const cat = map.category || 'Annet'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(map)
    return acc
  }, {})

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="parchment rounded-xl p-4 wood-frame">
        <div className="flex items-center gap-2 mb-2">
          <SettingsIcon className="w-6 h-6 text-settlers-gold" />
          <h2 className="text-xl font-bold text-settlers-dark-brown font-medieval">
            Innstillinger
          </h2>
        </div>
        <div className="flex items-center gap-2 text-xs text-green-700 bg-green-100 px-2 py-1 rounded">
          <Cloud className="w-3 h-3" />
          <span>Alt synkroniseres automatisk!</span>
        </div>
      </div>

      {/* Player Settings */}
      <div className="parchment rounded-xl p-4">
        <h3 className="font-bold text-settlers-dark-brown mb-3 flex items-center gap-2">
          <User className="w-4 h-4" /> Spillere
        </h3>

        <div className="space-y-3">
          {players.map((player) => (
            <div key={player.id} className="bg-white/50 rounded-lg p-3">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full shadow"
                  style={{ backgroundColor: player.color }}
                />
                <div className="flex-1">
                  {editingPlayer === player.id ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={tempName}
                        onChange={(e) => setTempName(e.target.value)}
                        className="input-settlers flex-1 py-1 text-sm"
                        autoFocus
                        onKeyDown={(e) => e.key === 'Enter' && savePlayerName()}
                      />
                      <button onClick={savePlayerName} className="btn-settlers py-1 px-3 text-sm">
                        {saving ? '...' : 'OK'}
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-settlers-dark-brown">{player.name}</span>
                      <button
                        onClick={() => startEditing(player)}
                        className="text-settlers-brown text-xs underline"
                      >
                        Endre
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-1.5 mt-2 flex-wrap">
                {PLAYER_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => handleColorChange(player.id, color)}
                    className={`w-6 h-6 rounded-full ${player.color === color ? 'ring-2 ring-settlers-gold ring-offset-1' : ''}`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Map Management */}
      <div className="parchment rounded-xl p-4">
        <h3 className="font-bold text-settlers-dark-brown mb-3 flex items-center gap-2">
          <Map className="w-4 h-4" /> Kart ({maps.length})
        </h3>

        {/* Add single map */}
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={newMapName}
            onChange={(e) => setNewMapName(e.target.value)}
            placeholder="Kartnavn..."
            className="input-settlers flex-1 py-2 text-sm"
            onKeyDown={(e) => e.key === 'Enter' && handleAddMap()}
          />
          <button onClick={handleAddMap} className="btn-settlers py-2 px-3">
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Bulk add toggle */}
        <button
          onClick={() => setShowBulkAdd(!showBulkAdd)}
          className="w-full py-2 text-sm text-settlers-brown bg-settlers-brown/10 rounded-lg mb-3 flex items-center justify-center gap-2"
        >
          <Upload className="w-4 h-4" />
          {showBulkAdd ? 'Skjul bulk-import' : 'Legg til mange kart samtidig'}
        </button>

        {/* Bulk add form */}
        {showBulkAdd && (
          <div className="bg-white/50 rounded-lg p-3 mb-3">
            <p className="text-xs text-settlers-brown mb-2">
              Lim inn kartnavn (ett per linje):
            </p>
            <textarea
              value={bulkMaps}
              onChange={(e) => setBulkMaps(e.target.value)}
              placeholder="Mountain Pass&#10;River Delta&#10;Forest Grove&#10;..."
              className="input-settlers w-full h-32 text-sm resize-none mb-2"
            />
            <div className="flex gap-2 items-center">
              <input
                type="text"
                value={mapCategory}
                onChange={(e) => setMapCategory(e.target.value)}
                placeholder="Kategori"
                className="input-settlers flex-1 py-1 text-sm"
              />
              <button onClick={handleBulkAdd} className="btn-settlers py-1 px-3 text-sm">
                Legg til alle
              </button>
            </div>
          </div>
        )}

        {/* Map list by category */}
        <div className="max-h-60 overflow-y-auto space-y-3">
          {Object.entries(groupedMaps).map(([category, categoryMaps]) => (
            <div key={category}>
              <h4 className="text-xs font-bold text-settlers-brown/60 uppercase mb-1">
                {category} ({categoryMaps.length})
              </h4>
              <div className="space-y-1">
                {categoryMaps.slice(0, 10).map(map => (
                  <div key={map.id} className="flex items-center justify-between bg-white/30 rounded px-2 py-1 text-sm">
                    <span className="text-settlers-dark-brown truncate">{map.name}</span>
                    <button
                      onClick={() => handleDeleteMap(map.id, map.name)}
                      className="text-red-500 p-1"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                {categoryMaps.length > 10 && (
                  <p className="text-xs text-settlers-brown/60 text-center">
                    +{categoryMaps.length - 10} flere...
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Export */}
      <div className="parchment rounded-xl p-4">
        <h3 className="font-bold text-settlers-dark-brown mb-3 flex items-center gap-2">
          <Download className="w-4 h-4" /> Eksporter
        </h3>
        <p className="text-sm text-settlers-brown mb-3">
          Last ned backup av alle data.
        </p>
        <button onClick={onExport} className="btn-settlers w-full py-2 flex items-center justify-center gap-2">
          <Download className="w-4 h-4" /> Last ned
        </button>
      </div>

      {/* Quick stats */}
      <div className="parchment rounded-xl p-4">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-white/50 rounded-lg p-2">
            <p className="text-xl font-bold text-settlers-gold">{matches.length}</p>
            <p className="text-[10px] text-settlers-brown">Kamper</p>
          </div>
          <div className="bg-white/50 rounded-lg p-2">
            <p className="text-xl font-bold text-settlers-gold">{maps.length}</p>
            <p className="text-[10px] text-settlers-brown">Kart</p>
          </div>
          <div className="bg-white/50 rounded-lg p-2">
            <p className="text-xl font-bold text-settlers-gold">
              {matches.reduce((acc, m) => acc + (m.duration || 0), 0)}m
            </p>
            <p className="text-[10px] text-settlers-brown">Spilletid</p>
          </div>
        </div>
      </div>
    </div>
  )
}
