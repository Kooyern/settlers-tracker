import React, { useState } from 'react'
import { ScrollText, Filter, Calendar, Map, Search } from 'lucide-react'
import { MatchCard } from './MatchCard'
import { MAPS } from '../data/maps'

export function MatchHistory({ matches, players, formatDuration, onDeleteMatch, onViewReport }) {
  const [filters, setFilters] = useState({
    mapId: '',
    winnerId: '',
    searchTerm: '',
  })

  const filteredMatches = matches.filter(match => {
    if (filters.mapId && match.mapId !== filters.mapId) return false
    if (filters.winnerId && match.winnerId !== filters.winnerId) return false
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase()
      const matchNotes = match.notes?.toLowerCase() || ''
      const mapName = MAPS.find(m => m.id === match.mapId)?.name.toLowerCase() || ''
      if (!matchNotes.includes(term) && !mapName.includes(term)) return false
    }
    return true
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="parchment rounded-xl p-6 wood-frame">
        <div className="flex items-center gap-3 mb-4">
          <ScrollText className="w-8 h-8 text-settlers-gold" />
          <h2 className="text-2xl font-bold text-settlers-dark-brown font-medieval">
            Kampkrønike
          </h2>
        </div>

        <p className="text-settlers-brown mb-4">
          En historisk oversikt over alle kamper mellom dere. Totalt {matches.length} registrerte kamper.
        </p>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-settlers-brown" />
            <input
              type="text"
              placeholder="Søk i notater..."
              value={filters.searchTerm}
              onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
              className="input-settlers w-full pl-10"
            />
          </div>

          {/* Map Filter */}
          <select
            value={filters.mapId}
            onChange={(e) => setFilters(prev => ({ ...prev, mapId: e.target.value }))}
            className="select-settlers"
          >
            <option value="">Alle kart</option>
            {MAPS.map(map => (
              <option key={map.id} value={map.id}>{map.name}</option>
            ))}
          </select>

          {/* Winner Filter */}
          <select
            value={filters.winnerId}
            onChange={(e) => setFilters(prev => ({ ...prev, winnerId: e.target.value }))}
            className="select-settlers"
          >
            <option value="">Alle resultater</option>
            {players.map(player => (
              <option key={player.id} value={player.id}>{player.name} vant</option>
            ))}
          </select>
        </div>

        {/* Clear Filters */}
        {(filters.mapId || filters.winnerId || filters.searchTerm) && (
          <button
            onClick={() => setFilters({ mapId: '', winnerId: '', searchTerm: '' })}
            className="mt-3 text-sm text-settlers-brown hover:text-settlers-dark-brown underline"
          >
            Fjern alle filtre
          </button>
        )}
      </div>

      {/* Results */}
      <div className="space-y-4">
        {filteredMatches.length === 0 ? (
          <div className="parchment rounded-xl p-8 text-center">
            <p className="text-settlers-brown text-lg">
              {matches.length === 0
                ? 'Ingen kamper registrert ennå. Registrer din første kamp!'
                : 'Ingen kamper matcher filtrene dine.'}
            </p>
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
