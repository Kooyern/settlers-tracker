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
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full p-3.5 rounded-xl text-left flex items-center gap-2 transition-all border
          ${isOpen
            ? 'border-accent bg-accent/5'
            : 'border-border bg-bg-elevated hover:border-border-light'
          }`}
      >
        <Map className="w-5 h-5 text-text-muted" />
        <span className={`flex-1 ${selectedMap ? 'text-text-primary font-medium' : 'text-text-muted'}`}>
          {selectedMap?.name || 'Velg kart...'}
        </span>
        {selectedMap?.category && (
          <span className="text-xs text-text-muted bg-bg-primary px-2 py-0.5 rounded border border-border">
            {selectedMap.category}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute z-50 top-full left-0 right-0 mt-2 bg-bg-card rounded-xl border border-border shadow-2xl max-h-[60vh] overflow-hidden flex flex-col">
          <div className="p-3 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                ref={inputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Søk etter kart..."
                className="input w-full pl-10 pr-8 py-2.5 text-sm"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-text-muted hover:text-text-primary"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <div className="overflow-y-auto flex-1 p-2">
            {Object.keys(groupedMaps).length === 0 ? (
              <div className="text-center py-6 text-text-muted">
                <p>Ingen kart funnet</p>
                {search && (
                  <button
                    type="button"
                    onClick={() => {
                      setNewMapName(search)
                      setShowAddNew(true)
                    }}
                    className="mt-2 text-accent text-sm"
                  >
                    Legg til "{search}" som nytt kart?
                  </button>
                )}
              </div>
            ) : (
              Object.entries(groupedMaps).map(([category, categoryMaps]) => (
                <div key={category} className="mb-3">
                  <h4 className="text-xs font-medium text-text-muted uppercase px-2 mb-1.5 tracking-wide">
                    {category} ({categoryMaps.length})
                  </h4>
                  <div className="space-y-1">
                    {categoryMaps.map(map => (
                      <button
                        key={map.id}
                        type="button"
                        onClick={() => handleSelect(map.id)}
                        className={`w-full p-2.5 rounded-xl text-left flex items-center gap-2 transition-all border
                          ${selectedMapId === map.id
                            ? 'bg-accent/10 text-text-primary border-accent/30'
                            : 'hover:bg-bg-elevated text-text-secondary border-transparent'
                          }`}
                      >
                        {selectedMapId === map.id && <Check className="w-4 h-4 text-accent" />}
                        <span className="flex-1 truncate">{map.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="border-t border-border p-3">
            {showAddNew ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMapName}
                  onChange={(e) => setNewMapName(e.target.value)}
                  placeholder="Kartnavn..."
                  className="input flex-1 px-3 py-2.5 text-sm"
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && handleAddNew()}
                />
                <button
                  type="button"
                  onClick={handleAddNew}
                  className="px-4 py-2.5 bg-accent text-bg-primary rounded-xl font-semibold text-sm"
                >
                  Legg til
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddNew(false)}
                  className="px-3 py-2.5 text-text-muted"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowAddNew(true)}
                className="w-full p-2.5 text-text-muted hover:text-text-primary flex items-center justify-center gap-2 text-sm rounded-xl hover:bg-bg-elevated transition-colors"
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
