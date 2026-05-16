import React, { useMemo, useState } from 'react'
import { ScrollText, Search, Trash2, Trophy, X } from 'lucide-react'
import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns'
import { nb } from 'date-fns/locale'
import { Screen } from '../components/ui/AppShell'
import { Card, EmptyState, SectionLabel } from '../components/ui/Primitives'
import { Sheet } from '../components/ui/Sheet'

export function MatchesScreen({
  matches,
  players,
  maps,
  formatDuration,
  onDeleteMatch,
  onViewMatch,
}) {
  const [search, setSearch] = useState('')
  const [winnerFilter, setWinnerFilter] = useState('')

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    return matches.filter(m => {
      if (winnerFilter === 'draw' && m.result !== 'draw') return false
      if (winnerFilter && winnerFilter !== 'draw' && m.winnerId !== winnerFilter) return false
      if (term) {
        const mapName = (m.mapName || '').toLowerCase()
        const notes = (m.notes || '').toLowerCase()
        if (!mapName.includes(term) && !notes.includes(term)) return false
      }
      return true
    })
  }, [matches, search, winnerFilter])

  const grouped = useMemo(() => {
    const groups = []
    let currentKey = null
    let currentList = null
    for (const m of filtered) {
      const date = new Date(m.date)
      let key
      if (isToday(date)) key = 'I dag'
      else if (isYesterday(date)) key = 'I går'
      else key = format(date, 'MMMM yyyy', { locale: nb })
      if (key !== currentKey) {
        currentKey = key
        currentList = []
        groups.push({ key, list: currentList })
      }
      currentList.push(m)
    }
    return groups
  }, [filtered])

  const hasFilters = !!search || !!winnerFilter

  return (
    <Screen
      title="Kamper"
      action={
        <span className="badge badge-accent">
          {matches.length} totalt
        </span>
      }
    >
      <Card className="space-y-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Søk i kart eller notater…"
            className="input pl-10"
          />
        </div>

        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 scrollbar-hide">
          <Chip active={!winnerFilter} onClick={() => setWinnerFilter('')}>Alle</Chip>
          {players.map(p => (
            <Chip
              key={p.id}
              active={winnerFilter === p.id}
              onClick={() => setWinnerFilter(p.id)}
              color={p.color}
            >
              {p.name} vant
            </Chip>
          ))}
          <Chip active={winnerFilter === 'draw'} onClick={() => setWinnerFilter('draw')}>
            Uavgjort
          </Chip>
          {hasFilters && (
            <button
              type="button"
              onClick={() => { setSearch(''); setWinnerFilter('') }}
              className="ml-1 flex shrink-0 items-center gap-1 rounded-full border border-border bg-bg-soft px-3 py-1.5 text-xs text-text-muted"
            >
              <X className="w-3 h-3" /> Tøm
            </button>
          )}
        </div>
      </Card>

      {grouped.length === 0 ? (
        <EmptyState
          icon={ScrollText}
          title={matches.length === 0 ? 'Ingen kamper enda' : 'Ingen treff'}
          description={
            matches.length === 0
              ? 'Start en live kamp eller registrer en kamp manuelt.'
              : 'Justér filtre eller søk på noe annet.'
          }
        />
      ) : (
        <div className="space-y-5">
          {grouped.map(group => (
            <div key={group.key} className="space-y-2">
              <SectionLabel>{group.key}</SectionLabel>
              <div className="space-y-2">
                {group.list.map(match => (
                  <MatchRow
                    key={match.id}
                    match={match}
                    players={players}
                    formatDuration={formatDuration}
                    onClick={() => onViewMatch(match)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </Screen>
  )
}

function MatchRow({ match, players, formatDuration, onClick }) {
  const isDraw = match.result === 'draw'
  const winner = players.find(p => p.id === match.winnerId)
  const date = new Date(match.date)

  return (
    <button
      type="button"
      onClick={onClick}
      className="card flex w-full items-center gap-3 px-3 py-3 text-left"
    >
      <div className="flex shrink-0 items-center gap-1">
        {players.map(p => (
          <span
            key={p.id}
            className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-white shadow ${
              !isDraw && match.winnerId === p.id ? 'ring-2 ring-accent ring-offset-1 ring-offset-bg-card' : 'opacity-55'
            }`}
            style={{ backgroundColor: p.color }}
          >
            {!isDraw && match.winnerId === p.id ? <Trophy className="w-3.5 h-3.5" /> : p.name.charAt(0)}
          </span>
        ))}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-text-primary">
          {isDraw ? 'Uavgjort' : `${winner?.name || 'Ukjent'} vant`}
        </p>
        <p className="truncate text-xs text-text-muted">
          {match.mapName || 'Ukjent kart'}
          {match.duration ? ` · ${formatDuration(match.duration)}` : ''}
        </p>
      </div>
      <span className="shrink-0 text-[11px] text-text-muted">
        {format(date, 'd. MMM', { locale: nb })}
      </span>
    </button>
  )
}

function Chip({ active, onClick, children, color }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
        active
          ? 'border-accent/40 bg-accent/10 text-accent'
          : 'border-border bg-bg-soft text-text-secondary'
      }`}
    >
      {color && <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />}
      {children}
    </button>
  )
}

export function MatchDetailSheet({ match, players, onClose, onDelete, formatDuration }) {
  if (!match) return null
  const isDraw = match.result === 'draw'
  const winner = players.find(p => p.id === match.winnerId)
  const date = new Date(match.date)

  const handleDelete = () => {
    if (window.confirm('Er du sikker på at du vil slette denne kampen?')) {
      onDelete?.(match.id)
      onClose?.()
    }
  }

  return (
    <Sheet open={!!match} onClose={onClose} title="Kampdetaljer">
      <div className="space-y-4">
        <div className="card-flat p-4 text-center">
          <p className="text-xs uppercase tracking-wider text-text-muted">
            {format(date, 'EEEE d. MMMM yyyy · HH:mm', { locale: nb })}
          </p>
          <p className="mt-1 text-lg font-semibold text-text-primary">
            {isDraw ? 'Uavgjort' : `${winner?.name || 'Ukjent'} vant`}
          </p>
          <p className="text-sm text-text-muted">{match.mapName || 'Ukjent kart'}</p>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <DetailStat label="Varighet" value={formatDuration(match.duration)} />
          <DetailStat label="AI" value={match.aiCount ?? (match.aiColors?.length || 0)} />
          <DetailStat label="Hendelser" value={match.events?.length || 0} />
        </div>

        <div className="space-y-2">
          {players.map(player => {
            const data = match.players?.find(p => p.playerId === player.id)
            const won = !isDraw && match.winnerId === player.id
            const winPoints = won ? 1 : isDraw ? 0.5 : 0
            const aiBonus = (data?.aiEliminations || 0) * 0.5
            const aiPenalty = data?.aiDeaths || 0
            const total = winPoints + aiBonus - aiPenalty
            return (
              <div key={player.id} className="card-flat px-4 py-3">
                <div className="flex items-center gap-3">
                  <span
                    className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white shadow ${
                      won ? 'ring-2 ring-accent ring-offset-1 ring-offset-bg-soft' : ''
                    }`}
                    style={{ backgroundColor: player.color }}
                  >
                    {won ? <Trophy className="w-5 h-5" /> : player.name.charAt(0)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-text-primary">{player.name}</p>
                    <p className="text-xs text-text-muted">
                      {isDraw ? 'Uavgjort' : won ? 'Seier' : 'Tap'}
                      {data?.aiEliminations ? ` · ${data.aiEliminations} AI eliminert` : ''}
                      {data?.aiDeaths ? ' · slått av AI' : ''}
                    </p>
                  </div>
                  <span className={`number-display text-lg font-bold ${total > 0 ? 'text-accent' : total < 0 ? 'text-danger' : 'text-text-muted'}`}>
                    {total > 0 ? '+' : ''}{total.toFixed(1)}p
                  </span>
                </div>
              </div>
            )
          })}
        </div>

        {match.notes && (
          <div className="card-flat px-4 py-3">
            <p className="text-xs uppercase tracking-wider text-text-muted">Notater</p>
            <p className="mt-1 whitespace-pre-wrap text-sm text-text-secondary">{match.notes}</p>
          </div>
        )}

        <button type="button" onClick={handleDelete} className="btn btn-danger btn-block">
          <Trash2 className="w-4 h-4" />
          Slett kamp
        </button>
      </div>
    </Sheet>
  )
}

function DetailStat({ label, value }) {
  return (
    <div className="card-flat px-3 py-2 text-center">
      <p className="text-[10px] uppercase tracking-wider text-text-muted">{label}</p>
      <p className="number-display mt-0.5 text-base font-bold text-text-primary">{value}</p>
    </div>
  )
}
