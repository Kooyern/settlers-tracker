import React, { useState, useRef, useEffect } from 'react'
import { Search, Map, X, Check, Plus } from 'lucide-react'

export function MapSelector({ maps, selectedMapId, onSelect, onAddMap }) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [showAddNew, setShowAddNew] = useState(false)
  const [newMapName, setNewMapName] = useState('')
  const inputRef = useRef(null)
  const containerRef = useRef(null)

  const selectedMap = maps.find(m => m.id === selectedMapId)

  const filteredMaps = maps.filter(map =>
    map.name.toLowerCase().includes(search.toLowerCase())
  )

  const groupedMaps = filteredMaps.reduce((acc, map) => {
    const cat = map.category || 'Annet'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(map)
    return acc
  }, {})

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false)
        setSearch('')
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  const handleSelect = (mapId) => {
    onSelect(mapId)
    setIsOpen(false)
    setSearch('')
  }

  const handleAddNew = async () => {
    if (!newMapName.trim()) return

    try {
      const newMap = await onAddMap({ name: newMapName.trim() })
      if (newMap?.id) {
        onSelect(newMap.id)
      }
      setNewMapName('')
      setShowAddNew(false)
      setIsOpen(false)
    } catch (err) {
      alert('Kunne ikke legge til kart')
    }
  }

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full p-3 rounded-xl text-left flex items-center gap-2 transition-all border
          ${isOpen
            ? 'border-settlers-gold bg-settlers-gold/10'
            : 'border-settlers-border bg-settlers-dark'
          }`}
      >
        <Map className="w-5 h-5 text-settlers-muted" />
        <span className={`flex-1 ${selectedMap ? 'text-settlers-text font-medium' : 'text-settlers-muted'}`}>
          {selectedMap?.name || 'Velg kart...'}
        </span>
        {selectedMap?.category && (
          <span className="text-xs text-settlers-muted bg-settlers-border px-2 py-0.5 rounded">
            {selectedMap.category}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-settlers-card rounded-xl border border-settlers-border shadow-xl max-h-[60vh] overflow-hidden flex flex-col">
          {/* Search */}
          <div className="p-2 border-b border-settlers-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-settlers-muted" />
              <input
                ref={inputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Søk etter kart..."
                className="input w-full pl-9 pr-8 py-2 text-sm"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-settlers-muted"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Maps list */}
          <div className="overflow-y-auto flex-1 p-2">
            {Object.keys(groupedMaps).length === 0 ? (
              <div className="text-center py-4 text-settlers-muted">
                <p>Ingen kart funnet</p>
                {search && (
                  <button
                    type="button"
                    onClick={() => {
                      setNewMapName(search)
                      setShowAddNew(true)
                    }}
                    className="mt-2 text-settlers-gold text-sm"
                  >
                    Legg til "{search}" som nytt kart?
                  </button>
                )}
              </div>
            ) : (
              Object.entries(groupedMaps).map(([category, categoryMaps]) => (
                <div key={category} className="mb-3">
                  <h4 className="text-xs font-medium text-settlers-muted uppercase px-2 mb-1">
                    {category} ({categoryMaps.length})
                  </h4>
                  <div className="space-y-1">
                    {categoryMaps.map(map => (
                      <button
                        key={map.id}
                        type="button"
                        onClick={() => handleSelect(map.id)}
                        className={`w-full p-2 rounded-lg text-left flex items-center gap-2 transition-all
                          ${selectedMapId === map.id
                            ? 'bg-settlers-gold/20 text-settlers-text'
                            : 'hover:bg-settlers-dark text-settlers-muted'
                          }`}
                      >
                        {selectedMapId === map.id && <Check className="w-4 h-4 text-settlers-gold" />}
                        <span className="flex-1 truncate">{map.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Add new map */}
          <div className="border-t border-settlers-border p-2">
            {showAddNew ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMapName}
                  onChange={(e) => setNewMapName(e.target.value)}
                  placeholder="Kartnavn..."
                  className="input flex-1 px-3 py-2 text-sm"
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && handleAddNew()}
                />
                <button
                  type="button"
                  onClick={handleAddNew}
                  className="px-3 py-2 bg-settlers-gold text-settlers-dark rounded-lg font-medium text-sm"
                >
                  Legg til
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddNew(false)}
                  className="px-3 py-2 text-settlers-muted"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowAddNew(true)}
                className="w-full p-2 text-settlers-muted hover:text-settlers-text flex items-center justify-center gap-2 text-sm"
              >
                <Plus className="w-4 h-4" /> Legg til nytt kart
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
