import React from 'react'
import { Activity, Clock, Flame, Map as MapIcon, Play, Plus, Sparkles, Trophy } from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'
import { nb } from 'date-fns/locale'
import { Screen } from '../components/ui/AppShell'
import { Card, Panel, PlayerDot, SectionLabel, StatTile } from '../components/ui/Primitives'

export function HomeScreen({
  players,
  matches,
  maps,
  activeMatch,
  getPlayerStats,
  getMapRotation,
  formatDuration,
  onStartLive,
  onNewMatch,
  onResumeLive,
  onViewMatch,
  onOpenMaps,
  onOpenMatches,
}) {
  const latestMatch = matches[0]
  const playerRows = players.map(p => ({ ...p, stats: getPlayerStats(p.id) }))
  const ranked = [...playerRows].sort((a, b) => b.stats.points - a.stats.points)
  const leader = ranked[0]
  const challenger = ranked[1]
  const gap = leader && challenger ? Math.abs(leader.stats.points - challenger.stats.points) : 0
  const totalPlayTime = matches.reduce((acc, m) => acc + (m.duration || 0), 0)
  const playedMapNames = new Set(
    matches.map(m => m.mapName || maps.find(map => map.id === m.mapId)?.name).filter(Boolean)
  )
  const suggestion = (getMapRotation?.(1) || [])[0]
  const streak = getCurrentStreak(matches, players)

  return (
    <Screen>
      {/* Hero score */}
      <Card className="overflow-hidden p-0">
        <div className="bg-gradient-to-br from-bg-elevated/70 via-bg-card to-bg-card px-4 py-5">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-accent">
                Stilling
              </p>
              <p className="mt-0.5 truncate text-sm text-text-muted">
                {matches.length} {matches.length === 1 ? 'kamp' : 'kamper'} totalt
              </p>
            </div>
            {leader && challenger && gap > 0 && (
              <span className="badge badge-accent shrink-0">
                +{gap.toFixed(1)} {leader.name}
              </span>
            )}
            {leader && challenger && gap === 0 && (
              <span className="badge badge-draw shrink-0">Likt</span>
            )}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            {playerRows.map(player => {
              const isLeader = leader?.id === player.id && gap > 0
              return (
                <div
                  key={player.id}
                  className={`rounded-2xl border p-3 ${isLeader ? 'border-accent/40 bg-accent/8' : 'border-border bg-bg-soft'}`}
                >
                  <div className="flex items-center gap-2">
                    <PlayerDot player={player} size={12} />
                    <span className="truncate text-sm font-semibold text-text-primary">{player.name}</span>
                  </div>
                  <p className={`number-display mt-2 text-2xl font-bold leading-none ${isLeader ? 'text-accent' : 'text-text-primary'}`}>
                    {player.stats.points.toFixed(1)}
                  </p>
                  <p className="mt-1 text-[11px] text-text-muted">
                    {player.stats.wins}-{player.stats.losses}-{player.stats.draws}
                    {' · '}{player.stats.winRate}%
                  </p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Primary actions */}
        <div className="grid grid-cols-2 gap-2 border-t border-border bg-bg-card/60 p-3">
          <button
            type="button"
            onClick={activeMatch ? onResumeLive : onStartLive}
            className="btn btn-primary"
          >
            <Play className="w-4 h-4" />
            {activeMatch ? 'Fortsett live' : 'Start live'}
          </button>
          <button type="button" onClick={onNewMatch} className="btn btn-secondary">
            <Plus className="w-4 h-4" />
            Registrer
          </button>
        </div>
      </Card>

      {/* Active match callout */}
      {activeMatch && (
        <button
          type="button"
          onClick={onResumeLive}
          className="card flex w-full items-center gap-3 border-success/30 bg-success/8 px-4 py-3 text-left"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-success/15">
            <Activity className="h-5 w-5 text-success" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-success">Aktiv kamp pågår</p>
            <p className="truncate text-xs text-text-secondary">
              {maps.find(m => m.id === activeMatch.mapId)?.name || 'Ukjent kart'} · startet{' '}
              {formatDistanceToNow(new Date(activeMatch.startedAt), { addSuffix: true, locale: nb })}
            </p>
          </div>
        </button>
      )}

      {/* Streak */}
      {streak && (
        <div className="card flex items-center gap-3 border-orange-500/20 bg-orange-500/8 px-4 py-3">
          <Flame className="h-5 w-5 shrink-0 text-orange-400" />
          <p className="text-sm text-text-secondary">
            <span className="font-semibold text-text-primary">{streak.playerName}</span> har{' '}
            {streak.count} {streak.count === 1 ? 'seier' : 'seire'} på rad.
          </p>
        </div>
      )}

      {/* Stats strip */}
      <div className="grid grid-cols-3 gap-2">
        <StatTile label="Kamper" value={matches.length} />
        <StatTile label="Spilletid" value={formatDuration(totalPlayTime)} />
        <StatTile label="Kart spilt" value={`${playedMapNames.size}/${maps.length}`} />
      </div>

      {/* Last match */}
      {latestMatch && (
        <div className="space-y-2">
          <SectionLabel icon={Trophy}>
            Siste kamp
          </SectionLabel>
          <button
            type="button"
            onClick={() => onViewMatch?.(latestMatch)}
            className="card flex w-full items-center gap-3 px-4 py-3 text-left"
          >
            <div className="flex shrink-0 items-center gap-1.5">
              {players.map(p => (
                <span
                  key={p.id}
                  className={`h-8 w-8 rounded-full text-xs font-bold text-white shadow-md flex items-center justify-center
                    ${latestMatch.winnerId === p.id ? 'ring-2 ring-accent ring-offset-1 ring-offset-bg-card' : 'opacity-60'}`}
                  style={{ backgroundColor: p.color }}
                >
                  {latestMatch.winnerId === p.id ? <Trophy className="w-3.5 h-3.5" /> : p.name.charAt(0)}
                </span>
              ))}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-text-primary">
                {latestMatch.result === 'draw'
                  ? 'Uavgjort'
                  : `${players.find(p => p.id === latestMatch.winnerId)?.name || 'Ukjent'} vant`}
              </p>
              <p className="truncate text-xs text-text-muted">
                {latestMatch.mapName || 'Ukjent kart'}
                {' · '}{formatDuration(latestMatch.duration)}
              </p>
            </div>
            <span className="shrink-0 text-[11px] text-text-muted">
              {format(new Date(latestMatch.date), 'd. MMM', { locale: nb })}
            </span>
          </button>
          <button
            type="button"
            onClick={onOpenMatches}
            className="block w-full px-2 py-2 text-center text-xs font-medium text-text-muted hover:text-text-primary"
          >
            Se alle kamper →
          </button>
        </div>
      )}

      {/* Map suggestion */}
      {suggestion && (
        <div className="space-y-2">
          <SectionLabel icon={MapIcon}>Forslag i dag</SectionLabel>
          <button
            type="button"
            onClick={onOpenMaps}
            className="card flex w-full items-center gap-3 px-4 py-3 text-left"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/15">
              <Sparkles className="h-5 w-5 text-accent" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-text-primary">{suggestion.name}</p>
              <p className="truncate text-xs text-text-muted">
                {suggestion.stats?.matches > 0
                  ? `Spilt ${suggestion.stats.matches} ${suggestion.stats.matches === 1 ? 'gang' : 'ganger'}`
                  : 'Aldri spilt — prøv den i kveld'}
              </p>
            </div>
            <span className="badge badge-accent shrink-0">
              {suggestion.category || 'Kart'}
            </span>
          </button>
        </div>
      )}
    </Screen>
  )
}

function getCurrentStreak(matches, players) {
  if (!matches.length || matches[0].result === 'draw' || !matches[0].winnerId) return null
  const winnerId = matches[0].winnerId
  const count = matches.findIndex(match => match.winnerId !== winnerId)
  const streakCount = count === -1 ? matches.length : count
  if (streakCount < 2) return null
  const playerName = players.find(p => p.id === winnerId)?.name || 'Lederen'
  return { playerName, count: streakCount }
}
