import React, { useMemo, useState } from 'react'
import { Map as MapIcon, Plus, Search, Sparkles, X } from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'
import { nb } from 'date-fns/locale'
import { Screen } from '../components/ui/AppShell'
import { Card, EmptyState, SectionLabel, StatTile } from '../components/ui/Primitives'
import { Sheet } from '../components/ui/Sheet'

const SORT_OPTIONS = [
  { id: 'least', label: 'Minst spilt' },
  { id: 'most', label: 'Mest spilt' },
  { id: 'alpha', label: 'A–Å' },
  { id: 'recent', label: 'Sist spilt' },
]

const FILTERS = [
  { id: 'all', label: 'Alle' },
  { id: 'played', label: 'Spilt' },
  { id: 'unplayed', label: 'Uspilt' },
]

export function MapsScreen({ maps, matches, getMapStats, onAddMap }) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [sort, setSort] = useState('least')
  const [category, setCategory] = useState('all')
  const [showAdd, setShowAdd] = useState(false)
  const [newName, setNewName] = useState('')
  const [newCategory, setNewCategory] = useState('Custom')

  const categories = useMemo(() => {
    const set = new Set(maps.map(m => m.category).filter(Boolean))
    return ['all', ...Array.from(set).sort()]
  }, [maps])

  const decorated = useMemo(() => {
    return maps.map(m => ({
      ...m,
      stats: getMapStats?.(m.id) || { matches: 0, lastPlayed: null },
    }))
  }, [maps, getMapStats])

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    let list = decorated
    if (term) list = list.filter(m => m.name.toLowerCase().includes(term))
    if (filter === 'played') list = list.filter(m => m.stats.matches > 0)
    if (filter === 'unplayed') list = list.filter(m => m.stats.matches === 0)
    if (category !== 'all') list = list.filter(m => m.category === category)

    const sorted = [...list]
    sorted.sort((a, b) => {
      if (sort === 'most') return b.stats.matches - a.stats.matches
      if (sort === 'least') return a.stats.matches - b.stats.matches
      if (sort === 'recent') {
        return (b.stats.lastPlayed || '').localeCompare(a.stats.lastPlayed || '')
      }
      return (a.sortName || a.name).localeCompare(b.sortName || b.name)
    })
    return sorted
  }, [decorated, search, filter, sort, category])

  const playedCount = decorated.filter(m => m.stats.matches > 0).length

  const handleAdd = async () => {
    const name = newName.trim()
    if (!name) return
    try {
      await onAddMap?.({ name, category: newCategory })
      setNewName('')
      setShowAdd(false)
    } catch {
      alert('Kunne ikke legge til kart')
    }
  }

  return (
    <Screen
      title="Kart"
      action={
        <button
          type="button"
          onClick={() => setShowAdd(true)}
          className="btn btn-primary btn-sm"
        >
          <Plus className="w-4 h-4" />
          Nytt
        </button>
      }
    >
      <div className="grid grid-cols-3 gap-2">
        <StatTile label="Totalt" value={maps.length} />
        <StatTile label="Spilt" value={playedCount} />
        <StatTile label="Uspilt" value={maps.length - playedCount} accent />
      </div>

      <Card className="space-y-3">
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

        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 scrollbar-hide">
          {FILTERS.map(f => (
            <Chip key={f.id} active={filter === f.id} onClick={() => setFilter(f.id)}>
              {f.label}
            </Chip>
          ))}
          <span className="mx-1 my-auto h-4 w-px bg-border" />
          {SORT_OPTIONS.map(s => (
            <Chip key={s.id} active={sort === s.id} onClick={() => setSort(s.id)}>
              {s.label}
            </Chip>
          ))}
        </div>

        {categories.length > 2 && (
          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 scrollbar-hide">
            {categories.map(c => (
              <Chip
                key={c}
                active={category === c}
                onClick={() => setCategory(c)}
              >
                {c === 'all' ? 'Alle kategorier' : c}
              </Chip>
            ))}
          </div>
        )}
      </Card>

      {filtered.length === 0 ? (
        <EmptyState
          icon={MapIcon}
          title="Ingen kart"
          description="Prøv et bredere søk eller fjern filtre."
        />
      ) : (
        <div className="space-y-1.5">
          {filtered.map(map => (
            <MapRow key={map.id} map={map} />
          ))}
        </div>
      )}

      <Sheet open={showAdd} onClose={() => setShowAdd(false)} title="Legg til kart">
        <div className="space-y-3">
          <div>
            <label className="block px-1 pb-1 text-[11px] font-semibold uppercase tracking-wider text-text-muted">
              Kartnavn
            </label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="input"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            />
          </div>
          <div>
            <label className="block px-1 pb-1 text-[11px] font-semibold uppercase tracking-wider text-text-muted">
              Kategori
            </label>
            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="input"
            />
          </div>
          <button type="button" onClick={handleAdd} className="btn btn-primary btn-block">
            <Plus className="w-4 h-4" />
            Legg til kart
          </button>
        </div>
      </Sheet>
    </Screen>
  )
}

function MapRow({ map }) {
  const plays = map.stats.matches
  const lastPlayed = map.stats.lastPlayed
  return (
    <div className="card flex items-center gap-3 px-3 py-3">
      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
        plays === 0 ? 'bg-accent/10 text-accent' : 'bg-bg-soft text-text-muted'
      }`}>
        {plays === 0 ? <Sparkles className="h-4 w-4" /> : <MapIcon className="h-4 w-4" />}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-text-primary">{map.name}</p>
        <p className="truncate text-[11px] text-text-muted">
          {map.category || 'Kart'}
          {lastPlayed && ` · sist ${formatDistanceToNow(new Date(lastPlayed), { addSuffix: true, locale: nb })}`}
          {!lastPlayed && plays === 0 && ' · aldri spilt'}
        </p>
      </div>
      <div className="shrink-0 text-right">
        <p className="number-display text-base font-bold text-text-primary leading-none">{plays}</p>
        <p className="text-[10px] uppercase tracking-wider text-text-muted">
          {plays === 1 ? 'spilt' : 'spilt'}
        </p>
      </div>
    </div>
  )
}

function Chip({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
        active
          ? 'border-accent/40 bg-accent/10 text-accent'
          : 'border-border bg-bg-soft text-text-secondary'
      }`}
    >
      {children}
    </button>
  )
}
