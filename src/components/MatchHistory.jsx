import React, { useState, useMemo } from 'react'
import { ScrollText, Filter, Calendar, Map, Search, X, ChevronDown, Trophy, SlidersHorizontal } from 'lucide-react'
import { MatchCard } from './MatchCard'

export function MatchHistory({ matches, players, maps, formatDuration, onDeleteMatch, onViewReport }) {
  const [filters, setFilters] = useState({
    mapId: '',
    winnerId: '',
    searchTerm: '',
  })
  const [showFilters, setShowFilters] = useState(false)

  // Get unique maps from matches
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

  const clearFilters = () => {
    setFilters({ mapId: '', winnerId: '', searchTerm: '' })
  }

  // Stats for header
  const player1Wins = matches.filter(m => m.winnerId === 'player1').length
  const player2Wins = matches.filter(m => m.winnerId === 'player2').length
  const draws = matches.filter(m => m.result === 'draw').length

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="rounded-2xl bg-gradient-to-br from-[#2a1a10] to-[#1f1209] border border-settlers-gold/20 overflow-hidden">
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <ScrollText className="w-5 h-5 text-settlers-gold" />
              <h2 className="text-lg font-bold text-settlers-wheat font-medieval">
                Kampkrønike
              </h2>
            </div>
            <span className="text-xs text-settlers-wheat/40 bg-black/20 px-2 py-1 rounded-full">
              {matches.length} kamper
            </span>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="bg-black/20 rounded-lg p-2 text-center">
              <div className="flex items-center justify-center gap-1 mb-0.5">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: players[0]?.color }} />
                <span className="text-xs text-settlers-wheat/50">{players[0]?.name}</span>
              </div>
              <span className="text-lg font-bold text-green-400">{player1Wins}</span>
            </div>
            <div className="bg-black/20 rounded-lg p-2 text-center">
              <span className="text-xs text-settlers-wheat/50 block mb-0.5">Uavgjort</span>
              <span className="text-lg font-bold text-gray-400">{draws}</span>
            </div>
            <div className="bg-black/20 rounded-lg p-2 text-center">
              <div className="flex items-center justify-center gap-1 mb-0.5">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: players[1]?.color }} />
                <span className="text-xs text-settlers-wheat/50">{players[1]?.name}</span>
              </div>
              <span className="text-lg font-bold text-green-400">{player2Wins}</span>
            </div>
          </div>

          {/* Search bar */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-settlers-wheat/30" />
              <input
                type="text"
                placeholder="Søk i notater eller kart..."
                value={filters.searchTerm}
                onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                className="input-settlers w-full pl-10 py-2.5 text-sm"
              />
              {filters.searchTerm && (
                <button
                  onClick={() => setFilters(prev => ({ ...prev, searchTerm: '' }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-settlers-wheat/40 hover:text-settlers-wheat"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`
                px-3 py-2 rounded-xl flex items-center gap-2 transition-all
                ${showFilters || activeFilterCount > 0
                  ? 'bg-settlers-gold/20 text-settlers-gold border border-settlers-gold/30'
                  : 'bg-black/20 text-settlers-wheat/50 border border-transparent hover:bg-black/30'
                }
              `}
            >
              <SlidersHorizontal className="w-4 h-4" />
              {activeFilterCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-settlers-gold text-settlers-dark text-xs flex items-center justify-center font-bold">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Expanded filters */}
        {showFilters && (
          <div className="px-4 pb-4 pt-2 border-t border-settlers-gold/10 space-y-3">
            {/* Map filter */}
            <div>
              <label className="text-xs text-settlers-wheat/50 block mb-1.5">Kart</label>
              <select
                value={filters.mapId}
                onChange={(e) => setFilters(prev => ({ ...prev, mapId: e.target.value }))}
                className="select-settlers w-full py-2.5 text-sm"
              >
                <option value="">Alle kart</option>
                {usedMaps.map(map => (
                  <option key={map.id} value={map.id}>{map.name}</option>
                ))}
              </select>
            </div>

            {/* Winner filter */}
            <div>
              <label className="text-xs text-settlers-wheat/50 block mb-1.5">Vinner</label>
              <select
                value={filters.winnerId}
                onChange={(e) => setFilters(prev => ({ ...prev, winnerId: e.target.value }))}
                className="select-settlers w-full py-2.5 text-sm"
              >
                <option value="">Alle resultater</option>
                {players.map(player => (
                  <option key={player.id} value={player.id}>{player.name} vant</option>
                ))}
              </select>
            </div>

            {/* Clear filters button */}
            {activeFilterCount > 0 && (
              <button
                onClick={clearFilters}
                className="text-sm text-settlers-gold hover:text-settlers-gold/80 flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" />
                Fjern alle filtre
              </button>
            )}
          </div>
        )}
      </div>

      {/* Results count when filtered */}
      {activeFilterCount > 0 && (
        <div className="flex items-center justify-between px-1">
          <span className="text-xs text-settlers-wheat/40">
            Viser {filteredMatches.length} av {matches.length} kamper
          </span>
        </div>
      )}

      {/* Match list */}
      <div className="space-y-3">
        {filteredMatches.length === 0 ? (
          <div className="rounded-2xl bg-gradient-to-br from-[#2a1a10] to-[#1f1209] border border-settlers-gold/10 p-8 text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-settlers-gold/10 flex items-center justify-center">
              <Search className="w-6 h-6 text-settlers-gold/30" />
            </div>
            <p className="text-settlers-wheat/50">
              {matches.length === 0
                ? 'Ingen kamper registrert ennå.'
                : 'Ingen kamper matcher søket ditt.'}
            </p>
            {activeFilterCount > 0 && (
              <button
                onClick={clearFilters}
                className="mt-3 text-sm text-settlers-gold hover:text-settlers-gold/80"
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
