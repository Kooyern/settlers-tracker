import React, { useState } from 'react'
import { ScrollText, Search, X, Map } from 'lucide-react'
import { MatchCard } from './MatchCard'

export function MatchHistory({
  matches,
  players,
  maps = [],
  getMapName,
  getMapStats,
  formatDuration,
  onDeleteMatch,
  onViewReport,
}) {
  const [filters, setFilters] = useState({
    mapId: '',
    winnerId: '',
    searchTerm: '',
  })

  const filteredMatches = matches.filter(match => {
    if (filters.mapId) {
      const selectedMap = maps.find(map => map.id === filters.mapId)
      if (match.mapId !== filters.mapId && match.mapName !== selectedMap?.name) return false
    }
    if (filters.winnerId && match.winnerId !== filters.winnerId) return false
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase()
      const matchNotes = match.notes?.toLowerCase() || ''
      const mapName = (match.mapName || getMapName?.(match.mapId) || '').toLowerCase()
      if (!matchNotes.includes(term) && !mapName.includes(term)) return false
    }
    return true
  })

  const mostPlayedMaps = maps
    .map(map => ({ ...map, stats: getMapStats?.(map.id) || { matches: 0 } }))
    .filter(map => map.stats.matches > 0)
    .sort((a, b) => b.stats.matches - a.stats.matches)
    .slice(0, 3)

  const hasFilters = filters.mapId || filters.winnerId || filters.searchTerm

  return (
    <div className="mx-auto w-full max-w-4xl space-y-4">
      <div className="card p-4 sm:p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 rounded-xl bg-accent/10 flex items-center justify-center">
            <ScrollText className="w-5 h-5 text-accent" />
          </div>
          <div className="min-w-0">
            <h2 className="text-xl font-semibold text-text-primary">Historikk</h2>
            <p className="text-sm text-text-muted">{matches.length} registrerte kamper</p>
          </div>
        </div>

        {mostPlayedMaps.length > 0 && (
          <div className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
            {mostPlayedMaps.map(map => (
              <div key={map.id} className="rounded-xl border border-border bg-bg-elevated p-2">
                <p className="truncate text-xs font-semibold text-text-primary">{map.name}</p>
                <p className="number-display text-lg font-bold text-accent">{map.stats.matches}</p>
                <p className="text-[10px] text-text-muted">kamper</p>
              </div>
            ))}
          </div>
        )}

        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              placeholder="Søk i kart eller notater..."
              value={filters.searchTerm}
              onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
              className="input pl-10 pr-4"
            />
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <select
              value={filters.mapId}
              onChange={(e) => setFilters(prev => ({ ...prev, mapId: e.target.value }))}
              className="select text-sm"
            >
              <option value="">Alle kart</option>
              {maps.map(map => (
                <option key={map.id} value={map.id}>{map.name}</option>
              ))}
            </select>

            <select
              value={filters.winnerId}
              onChange={(e) => setFilters(prev => ({ ...prev, winnerId: e.target.value }))}
              className="select text-sm"
            >
              <option value="">Alle resultater</option>
              {players.map(player => (
                <option key={player.id} value={player.id}>{player.name} vant</option>
              ))}
            </select>
          </div>

          {hasFilters && (
            <button
              onClick={() => setFilters({ mapId: '', winnerId: '', searchTerm: '' })}
              className="flex items-center gap-1 text-sm text-text-muted hover:text-text-primary"
            >
              <X className="w-4 h-4" /> Fjern filtre
            </button>
          )}
        </div>
      </div>

      <div className="space-y-2">
        {filteredMatches.length === 0 ? (
          <div className="card p-10 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl border border-border bg-bg-elevated">
              <Map className="h-7 w-7 text-text-muted" />
            </div>
            <p className="text-text-primary font-medium">
              {matches.length === 0 ? 'Ingen kamper registrert ennå' : 'Ingen kamper matcher filtrene'}
            </p>
            <p className="text-sm text-text-muted mt-1">
              {matches.length === 0 ? 'Start med live-kamp eller manuell registrering.' : 'Prøv et bredere søk.'}
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
