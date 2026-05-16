import React, { useMemo, useState } from 'react'
import { Check, Map as MapIcon, Plus, Search, Star, X } from 'lucide-react'
import { Sheet } from '../components/ui/Sheet'

export function MapPickerSheet({
  open,
  onClose,
  maps,
  matches = [],
  selectedMapId,
  onSelect,
  onAddMap,
}) {
  const [search, setSearch] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [newName, setNewName] = useState('')

  const mapStats = useMemo(() => {
    const stats = {}
    for (const map of maps) {
      const mapMatches = matches.filter(m => m.mapId === map.id || m.mapName === map.name)
      stats[map.id] = {
        plays: mapMatches.length,
        lastPlayed: mapMatches[0]?.date || null,
      }
    }
    return stats
  }, [maps, matches])

  const recentlyPlayed = useMemo(() => {
    const seen = new Set()
    const list = []
    for (const m of matches) {
      const map = maps.find(x => x.id === m.mapId) ||
                  maps.find(x => x.name === m.mapName)
      if (map && !seen.has(map.id)) {
        seen.add(map.id)
        list.push(map)
        if (list.length >= 5) break
      }
    }
    return list
  }, [matches, maps])

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    let list = [...maps]
    if (term) {
      list = list.filter(m => m.name.toLowerCase().includes(term))
    }
    return list.sort((a, b) => {
      const ap = mapStats[a.id]?.plays || 0
      const bp = mapStats[b.id]?.plays || 0
      if (ap !== bp) return bp - ap
      return (a.sortName || a.name).localeCompare(b.sortName || b.name)
    })
  }, [maps, mapStats, search])

  const grouped = useMemo(() => {
    if (search) return { [`${filtered.length} treff`]: filtered }
    return filtered.reduce((acc, m) => {
      const k = m.category || 'Annet'
      if (!acc[k]) acc[k] = []
      acc[k].push(m)
      return acc
    }, {})
  }, [filtered, search])

  const handleAdd = async () => {
    const name = newName.trim()
    if (!name) return
    try {
      const created = await onAddMap?.({ name })
      if (created?.id) onSelect?.(created.id)
      setNewName('')
      setShowAdd(false)
    } catch {
      alert('Kunne ikke legge til kart')
    }
  }

  return (
    <Sheet open={open} onClose={onClose} title="Velg kart">
      <div className="space-y-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Søk i kart…"
            className="input pl-10"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 btn-icon"
              aria-label="Tøm søk"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {!search && recentlyPlayed.length > 0 && (
          <div>
            <p className="mb-1 px-1 text-[11px] font-semibold uppercase tracking-wider text-text-muted">
              <Star className="inline-block h-3 w-3 -translate-y-0.5 text-accent" /> Sist spilt
            </p>
            <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 scrollbar-hide">
              {recentlyPlayed.map(map => (
                <button
                  key={`recent-${map.id}`}
                  type="button"
                  onClick={() => onSelect?.(map.id)}
                  className={`shrink-0 rounded-xl border px-3 py-2 text-xs font-medium transition-colors ${
                    selectedMapId === map.id
                      ? 'border-accent/40 bg-accent/10 text-accent'
                      : 'border-border bg-bg-soft text-text-secondary'
                  }`}
                >
                  {map.name}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-3">
          {Object.keys(grouped).length === 0 ? (
            <div className="rounded-xl border border-border bg-bg-soft p-5 text-center">
              <p className="text-sm text-text-muted">Ingen kart matcher søket.</p>
              {search && (
                <button
                  type="button"
                  onClick={() => { setNewName(search); setShowAdd(true) }}
                  className="mt-2 text-sm text-accent"
                >
                  Legg til "{search}" som nytt kart?
                </button>
              )}
            </div>
          ) : (
            Object.entries(grouped).map(([category, list]) => (
              <div key={category}>
                <p className="mb-1.5 px-1 text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                  {category} <span className="text-text-muted/70">({list.length})</span>
                </p>
                <div className="space-y-1">
                  {list.map(map => {
                    const isSelected = selectedMapId === map.id
                    const plays = mapStats[map.id]?.plays || 0
                    return (
                      <button
                        key={map.id}
                        type="button"
                        onClick={() => onSelect?.(map.id)}
                        className={`flex w-full items-center gap-2 rounded-xl border px-3 py-2.5 text-left transition-colors ${
                          isSelected
                            ? 'border-accent/40 bg-accent/8'
                            : 'border-border bg-bg-soft hover:border-border-light'
                        }`}
                      >
                        <MapIcon className={`h-4 w-4 shrink-0 ${isSelected ? 'text-accent' : 'text-text-muted'}`} />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium text-text-primary">
                            {map.name}
                          </span>
                          <span className="block truncate text-[11px] text-text-muted">
                            {map.source || map.category || 'Kart'}
                          </span>
                        </span>
                        <span className="shrink-0 text-[11px] text-text-muted number-display">
                          {plays}
                        </span>
                        {isSelected && <Check className="h-4 w-4 shrink-0 text-accent" />}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="pt-2">
          {showAdd ? (
            <div className="flex gap-2">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                placeholder="Kartnavn"
                className="input flex-1"
                autoFocus
              />
              <button type="button" onClick={handleAdd} className="btn btn-primary">
                Legg til
              </button>
              <button type="button" onClick={() => setShowAdd(false)} className="btn-icon" aria-label="Avbryt">
                <X className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowAdd(true)}
              className="btn btn-ghost btn-block btn-sm"
            >
              <Plus className="w-4 h-4" />
              Legg til nytt kart
            </button>
          )}
        </div>
      </div>
    </Sheet>
  )
}
