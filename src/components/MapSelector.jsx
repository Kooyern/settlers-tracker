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

  // Filter maps by search
  const filteredMaps = maps.filter(map =>
    map.name.toLowerCase().includes(search.toLowerCase())
  )

  // Group by category
  const groupedMaps = filteredMaps.reduce((acc, map) => {
    const cat = map.category || 'Annet'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(map)
    return acc
  }, {})

  // Close on outside click
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

  // Focus search when opening
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
      {/* Selected value / trigger button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-full p-3 rounded-lg border-2 text-left flex items-center gap-2 transition-all
          ${isOpen
            ? 'border-settlers-gold bg-yellow-50'
            : 'border-settlers-brown/30 bg-white/80'
          }
        `}
      >
        <Map className="w-5 h-5 text-settlers-brown" />
        <span className={`flex-1 ${selectedMap ? 'text-settlers-dark-brown font-medium' : 'text-settlers-brown/60'}`}>
          {selectedMap?.name || 'Velg kart...'}
        </span>
        {selectedMap && (
          <span className="text-xs text-settlers-brown bg-settlers-wheat px-2 py-0.5 rounded">
            {selectedMap.category}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-xl border-2 border-settlers-brown/20 max-h-[60vh] overflow-hidden flex flex-col">
          {/* Search input */}
          <div className="p-2 border-b border-settlers-brown/10">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-settlers-brown/50" />
              <input
                ref={inputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Søk etter kart..."
                className="w-full pl-9 pr-8 py-2 rounded-lg border border-settlers-brown/20 text-base focus:outline-none focus:border-settlers-gold"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-settlers-brown/50"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Maps list */}
          <div className="overflow-y-auto flex-1 p-2">
            {Object.keys(groupedMaps).length === 0 ? (
              <div className="text-center py-4 text-settlers-brown/60">
                <p>Ingen kart funnet</p>
                {search && (
                  <button
                    type="button"
                    onClick={() => {
                      setNewMapName(search)
                      setShowAddNew(true)
                    }}
                    className="mt-2 text-settlers-gold underline text-sm"
                  >
                    Legg til "{search}" som nytt kart?
                  </button>
                )}
              </div>
            ) : (
              Object.entries(groupedMaps).map(([category, categoryMaps]) => (
                <div key={category} className="mb-3">
                  <h4 className="text-xs font-bold text-settlers-brown/60 uppercase px-2 mb-1">
                    {category} ({categoryMaps.length})
                  </h4>
                  <div className="space-y-1">
                    {categoryMaps.map(map => (
                      <button
                        key={map.id}
                        type="button"
                        onClick={() => handleSelect(map.id)}
                        className={`
                          w-full p-2 rounded-lg text-left flex items-center gap-2 transition-all
                          ${selectedMapId === map.id
                            ? 'bg-settlers-gold/20 text-settlers-dark-brown'
                            : 'hover:bg-settlers-wheat/50 text-settlers-brown'
                          }
                        `}
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
          <div className="border-t border-settlers-brown/10 p-2">
            {showAddNew ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMapName}
                  onChange={(e) => setNewMapName(e.target.value)}
                  placeholder="Kartnavn..."
                  className="flex-1 px-3 py-2 rounded-lg border border-settlers-brown/20 text-base"
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && handleAddNew()}
                />
                <button
                  type="button"
                  onClick={handleAddNew}
                  className="px-3 py-2 bg-settlers-gold text-settlers-dark rounded-lg font-medium"
                >
                  Legg til
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddNew(false)}
                  className="px-3 py-2 text-settlers-brown"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowAddNew(true)}
                className="w-full p-2 text-settlers-brown/70 hover:text-settlers-brown flex items-center justify-center gap-2 text-sm"
              >
                <Plus className="w-4 h-4" />
                Legg til nytt kart
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
