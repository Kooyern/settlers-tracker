import React, { useState } from 'react'
import { Settings as SettingsIcon, User, Download, Cloud, Map, Plus, Trash2, Upload, Check, ChevronDown, ChevronUp } from 'lucide-react'

const PLAYER_COLORS = [
  '#1E90FF', '#DC143C', '#228B22', '#FFD700',
  '#9400D3', '#FF8C00', '#00CED1', '#FF69B4',
  '#20B2AA', '#FF6347', '#4169E1', '#32CD32',
]

export function Settings({ players, updatePlayer, matches, maps, addMap, addMaps, deleteMap, onExport }) {
  const [editingPlayer, setEditingPlayer] = useState(null)
  const [tempName, setTempName] = useState('')
  const [saving, setSaving] = useState(false)
  const [newMapName, setNewMapName] = useState('')
  const [bulkMaps, setBulkMaps] = useState('')
  const [showBulkAdd, setShowBulkAdd] = useState(false)
  const [mapCategory, setMapCategory] = useState('Map Pack')
  const [showAllMaps, setShowAllMaps] = useState(false)

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

  // Total play time
  const totalMinutes = matches.reduce((acc, m) => acc + (m.duration || 0), 0)
  const hours = Math.floor(totalMinutes / 60)
  const mins = totalMinutes % 60

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="card p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-settlers-gold" />
            <h2 className="font-semibold text-settlers-text">Innstillinger</h2>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-green-400 bg-green-500/10 px-2.5 py-1 rounded-full">
            <Cloud className="w-3 h-3" />
            <span>Synkronisert</span>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="card p-4">
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-settlers-dark rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-settlers-gold">{matches.length}</p>
            <p className="text-xs text-settlers-muted">Kamper</p>
          </div>
          <div className="bg-settlers-dark rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-settlers-gold">{maps.length}</p>
            <p className="text-xs text-settlers-muted">Kart</p>
          </div>
          <div className="bg-settlers-dark rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-settlers-gold">
              {hours > 0 ? `${hours}t` : ''}{mins}m
            </p>
            <p className="text-xs text-settlers-muted">Spilletid</p>
          </div>
        </div>
      </div>

      {/* Player Settings */}
      <div className="card overflow-hidden">
        <div className="px-4 py-3 border-b border-settlers-border">
          <h3 className="font-medium text-settlers-text flex items-center gap-2">
            <User className="w-4 h-4 text-settlers-gold" /> Spillere
          </h3>
        </div>

        <div className="p-4 space-y-3">
          {players.map((player) => (
            <div key={player.id} className="bg-settlers-dark rounded-xl p-3">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
                  style={{ backgroundColor: player.color }}
                >
                  {player.name?.charAt(0) || '?'}
                </div>
                <div className="flex-1">
                  {editingPlayer === player.id ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={tempName}
                        onChange={(e) => setTempName(e.target.value)}
                        className="input flex-1 py-2 text-sm"
                        autoFocus
                        onKeyDown={(e) => e.key === 'Enter' && savePlayerName()}
                      />
                      <button
                        onClick={savePlayerName}
                        className="bg-settlers-gold text-settlers-dark px-3 rounded-lg font-bold text-sm"
                      >
                        {saving ? '...' : <Check className="w-4 h-4" />}
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-settlers-text">{player.name}</span>
                      <button
                        onClick={() => startEditing(player)}
                        className="text-settlers-gold text-xs hover:underline"
                      >
                        Endre navn
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-2 mt-3 flex-wrap">
                {PLAYER_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => handleColorChange(player.id, color)}
                    className={`
                      w-7 h-7 rounded-full transition-all
                      ${player.color === color
                        ? 'ring-2 ring-settlers-gold ring-offset-2 ring-offset-settlers-dark scale-110'
                        : 'opacity-60 hover:opacity-100'
                      }
                    `}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Map Management */}
      <div className="card overflow-hidden">
        <div className="px-4 py-3 border-b border-settlers-border">
          <h3 className="font-medium text-settlers-text flex items-center gap-2">
            <Map className="w-4 h-4 text-settlers-gold" /> Kart
            <span className="text-settlers-muted font-normal">({maps.length})</span>
          </h3>
        </div>

        <div className="p-4 space-y-3">
          {/* Add single map */}
          <div className="flex gap-2">
            <input
              type="text"
              value={newMapName}
              onChange={(e) => setNewMapName(e.target.value)}
              placeholder="Legg til nytt kart..."
              className="input flex-1 py-2.5 text-sm"
              onKeyDown={(e) => e.key === 'Enter' && handleAddMap()}
            />
            <button
              onClick={handleAddMap}
              className="bg-settlers-gold text-settlers-dark px-4 rounded-xl font-bold"
              disabled={!newMapName.trim()}
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          {/* Bulk add toggle */}
          <button
            onClick={() => setShowBulkAdd(!showBulkAdd)}
            className="w-full py-2.5 text-sm text-settlers-muted bg-settlers-dark hover:bg-settlers-border/50 rounded-xl flex items-center justify-center gap-2 transition-colors"
          >
            <Upload className="w-4 h-4" />
            {showBulkAdd ? 'Skjul import' : 'Importer mange kart'}
          </button>

          {/* Bulk add form */}
          {showBulkAdd && (
            <div className="bg-settlers-dark rounded-xl p-3 space-y-3">
              <p className="text-xs text-settlers-muted">
                Lim inn kartnavn (ett per linje):
              </p>
              <textarea
                value={bulkMaps}
                onChange={(e) => setBulkMaps(e.target.value)}
                placeholder="Mountain Pass&#10;River Delta&#10;Forest Grove"
                className="input w-full h-28 text-sm resize-none"
              />
              <div className="flex gap-2 items-center">
                <input
                  type="text"
                  value={mapCategory}
                  onChange={(e) => setMapCategory(e.target.value)}
                  placeholder="Kategori"
                  className="input flex-1 py-2 text-sm"
                />
                <button
                  onClick={handleBulkAdd}
                  className="btn-primary py-2 text-sm"
                >
                  Legg til
                </button>
              </div>
            </div>
          )}

          {/* Map list */}
          <div className={`space-y-3 ${showAllMaps ? '' : 'max-h-48'} overflow-y-auto scrollbar-hide`}>
            {Object.entries(groupedMaps).map(([category, categoryMaps]) => (
              <div key={category}>
                <h4 className="text-xs font-medium text-settlers-muted uppercase tracking-wide mb-1.5 sticky top-0 bg-settlers-card py-1">
                  {category} ({categoryMaps.length})
                </h4>
                <div className="space-y-1">
                  {(showAllMaps ? categoryMaps : categoryMaps.slice(0, 5)).map(map => (
                    <div
                      key={map.id}
                      className="flex items-center justify-between bg-settlers-dark hover:bg-settlers-border/50 rounded-lg px-3 py-2 text-sm group transition-colors"
                    >
                      <span className="text-settlers-text truncate">{map.name}</span>
                      <button
                        onClick={() => handleDeleteMap(map.id, map.name)}
                        className="text-red-400/50 hover:text-red-400 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  {!showAllMaps && categoryMaps.length > 5 && (
                    <p className="text-xs text-settlers-muted text-center py-1">
                      +{categoryMaps.length - 5} flere
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {maps.length > 10 && (
            <button
              onClick={() => setShowAllMaps(!showAllMaps)}
              className="w-full py-2 text-xs text-settlers-gold hover:underline flex items-center justify-center gap-1"
            >
              {showAllMaps ? (
                <>
                  <ChevronUp className="w-4 h-4" /> Vis mindre
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4" /> Vis alle kart
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Export */}
      <div className="card overflow-hidden">
        <div className="px-4 py-3 border-b border-settlers-border">
          <h3 className="font-medium text-settlers-text flex items-center gap-2">
            <Download className="w-4 h-4 text-settlers-gold" /> Eksporter data
          </h3>
        </div>
        <div className="p-4">
          <p className="text-sm text-settlers-muted mb-3">
            Last ned en backup av alle dine data som JSON-fil.
          </p>
          <button
            onClick={onExport}
            className="btn-primary w-full py-3 flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" /> Last ned backup
          </button>
        </div>
      </div>
    </div>
  )
}
