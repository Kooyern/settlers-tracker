import React, { useState, useMemo } from 'react'
import { ScrollText, Search, X, SlidersHorizontal } from 'lucide-react'
import { MatchCard } from './MatchCard'

export function MatchHistory({ matches, players, formatDuration, onDeleteMatch, onViewReport }) {
  const [filters, setFilters] = useState({
    mapId: '',
    winnerId: '',
    searchTerm: '',
  })
  const [showFilters, setShowFilters] = useState(false)

  const usedMaps = useMemo(() => {
    const mapSet = new Map()
    matches.forEach(match => {
      if (match.mapName && !mapSet.has(match.mapId)) {
        mapSet.set(match.mapId, match.mapName)
      }
    })
    return Array.from(mapSet, ([id, name]) => ({ id, name }))
  }, [matches])

  const filteredMatches = useMemo(() => {
    return matches.filter(match => {
      if (filters.mapId && match.mapId !== filters.mapId) return false
      if (filters.winnerId && match.winnerId !== filters.winnerId) return false
      if (filters.searchTerm) {
        const term = filters.searchTerm.toLowerCase()
        const matchNotes = match.notes?.toLowerCase() || ''
        const mapName = match.mapName?.toLowerCase() || ''
        if (!matchNotes.includes(term) && !mapName.includes(term)) return false
      }
      return true
    })
  }, [matches, filters])

  const activeFilterCount = [filters.mapId, filters.winnerId, filters.searchTerm].filter(Boolean).length

  const clearFilters = () => setFilters({ mapId: '', winnerId: '', searchTerm: '' })

  const player1Wins = matches.filter(m => m.winnerId === 'player1').length
  const player2Wins = matches.filter(m => m.winnerId === 'player2').length
  const draws = matches.filter(m => m.result === 'draw').length

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="card overflow-hidden">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ScrollText className="w-5 h-5 text-accent" />
              <h2 className="font-semibold text-text-primary">Kamphistorikk</h2>
            </div>
            <span className="text-xs text-text-muted bg-bg-elevated px-3 py-1 rounded-full border border-border number-display">
              {matches.length} kamper
            </span>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="bg-bg-elevated rounded-xl p-3 text-center border border-border">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: players[0]?.color }} />
                <span className="text-xs text-text-muted truncate">{players[0]?.name}</span>
              </div>
              <span className="text-xl font-bold text-success number-display">{player1Wins}</span>
            </div>
            <div className="bg-bg-elevated rounded-xl p-3 text-center border border-border">
              <span className="text-xs text-text-muted block mb-1">Uavgjort</span>
              <span className="text-xl font-bold text-text-muted number-display">{draws}</span>
            </div>
            <div className="bg-bg-elevated rounded-xl p-3 text-center border border-border">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: players[1]?.color }} />
                <span className="text-xs text-text-muted truncate">{players[1]?.name}</span>
              </div>
              <span className="text-xl font-bold text-success number-display">{player2Wins}</span>
            </div>
          </div>

          {/* Search */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="text"
                placeholder="Søk i notater eller kart..."
                value={filters.searchTerm}
                onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                className="input pl-10 py-3 text-sm"
              />
              {filters.searchTerm && (
                <button
                  onClick={() => setFilters(prev => ({ ...prev, searchTerm: '' }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-3 rounded-xl flex items-center gap-2 transition-all border
                ${showFilters || activeFilterCount > 0
                  ? 'bg-accent/10 text-accent border-accent/30'
                  : 'bg-bg-elevated text-text-muted border-border hover:border-border-light'
                }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              {activeFilterCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-accent text-bg-primary text-xs flex items-center justify-center font-bold">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="px-4 pb-4 pt-2 border-t border-border space-y-3">
            <div>
              <label className="text-xs text-text-muted block mb-1.5 font-medium">Kart</label>
              <select
                value={filters.mapId}
                onChange={(e) => setFilters(prev => ({ ...prev, mapId: e.target.value }))}
                className="select w-full py-3 text-sm"
              >
                <option value="">Alle kart</option>
                {usedMaps.map(map => (
                  <option key={map.id} value={map.id}>{map.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-text-muted block mb-1.5 font-medium">Vinner</label>
              <select
                value={filters.winnerId}
                onChange={(e) => setFilters(prev => ({ ...prev, winnerId: e.target.value }))}
                className="select w-full py-3 text-sm"
              >
                <option value="">Alle resultater</option>
                {players.map(player => (
                  <option key={player.id} value={player.id}>{player.name} vant</option>
                ))}
              </select>
            </div>

            {activeFilterCount > 0 && (
              <button
                onClick={clearFilters}
                className="text-sm text-accent hover:text-accent-light flex items-center gap-1"
              >
                <X className="w-4 h-4" /> Fjern alle filtre
              </button>
            )}
          </div>
        )}
      </div>

      {/* Results count */}
      {activeFilterCount > 0 && (
        <p className="text-xs text-text-muted px-1">
          Viser {filteredMatches.length} av {matches.length} kamper
        </p>
      )}

      {/* Match list */}
      <div className="space-y-3">
        {filteredMatches.length === 0 ? (
          <div className="card p-10 text-center">
            <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-bg-elevated flex items-center justify-center border border-border">
              <Search className="w-6 h-6 text-text-muted" />
            </div>
            <p className="text-text-secondary">
              {matches.length === 0 ? 'Ingen kamper ennå.' : 'Ingen kamper matcher søket.'}
            </p>
            {activeFilterCount > 0 && (
              <button
                onClick={clearFilters}
                className="mt-3 text-sm text-accent hover:text-accent-light"
              >
                Fjern filtre
              </button>
            )}
          </div>
        ) : (
          filteredMatches.map(match => (
            <MatchCard
              key={match.id}
              match={match}
              players={players}
              formatDuration={formatDuration}
              onDelete={onDeleteMatch}
              onViewReport={onViewReport}
            />
          ))
        )}
      </div>
    </div>
  )
}
