import React from 'react'
import {
  Activity,
  CalendarDays,
  Clock,
  Flame,
  Map,
  MapPinned,
  Play,
  Shield,
  Skull,
  Sparkles,
  Swords,
  Trophy,
} from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'
import { nb } from 'date-fns/locale'
import { Leaderboard } from './Leaderboard'
import { MatchCard } from './MatchCard'

export function Dashboard({
  players,
  matches,
  maps = [],
  activeMatch,
  getPlayerStats,
  getMapRotation,
  formatDuration,
  onDeleteMatch,
  onViewReport,
  onNewMatch,
  onStartLive,
}) {
  const recentMatches = matches.slice(0, 4)
  const latestMatch = matches[0]
  const totalPlayTime = matches.reduce((acc, match) => acc + (match.duration || 0), 0)
  const totalAiKills = matches.reduce((acc, match) =>
    acc + (match.players?.[0]?.aiEliminations || 0) + (match.players?.[1]?.aiEliminations || 0), 0
  )
  const playedMapNames = new Set(matches.map(match => match.mapName || maps.find(map => map.id === match.mapId)?.name).filter(Boolean))
  const mapRotation = getMapRotation?.(5) || []
  const playerRows = players.map(player => ({ ...player, stats: getPlayerStats(player.id) }))
  const rankedPlayers = [...playerRows].sort((a, b) => b.stats.points - a.stats.points)
  const pointGap = rankedPlayers.length > 1 ? Math.abs(rankedPlayers[0].stats.points - rankedPlayers[1].stats.points) : 0
  const streak = getCurrentStreak(matches, players)

  return (
    <div className="space-y-4">
      <section className="app-hero card overflow-hidden p-4">
        <div className="settlers-map-strip" />
        <div className="relative">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-accent">
                Settlers 10th Anniversary
              </p>
              <h2 className="mt-1 text-2xl font-semibold text-text-primary">Kamprommet</h2>
              <p className="mt-1 text-sm text-text-secondary">
                Oversikt, liveføring og kartrotasjon for neste oppgjør.
              </p>
            </div>
            <div className="rounded-xl border border-border-light bg-bg-primary/70 px-3 py-2 text-right">
              <p className="text-[10px] uppercase text-text-muted">Kartbase</p>
              <p className="number-display text-xl font-bold text-accent">{maps.length}</p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <button onClick={onStartLive} className="btn-primary flex items-center justify-center gap-2 px-3 py-3">
              <Play className="h-5 w-5" />
              Live kamp
            </button>
            <button onClick={onNewMatch} className="btn-secondary flex items-center justify-center gap-2 px-3 py-3">
              <Swords className="h-5 w-5" />
              Registrer
            </button>
          </div>

          {activeMatch ? (
            <div className="mt-4 rounded-xl border border-success/30 bg-success/10 p-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-success">
                <Activity className="h-4 w-4" />
                Aktiv kamp pågår
              </div>
              <p className="mt-1 text-sm text-text-secondary">
                {maps.find(map => map.id === activeMatch.mapId)?.name || 'Ukjent kart'} startet{' '}
                {formatDistanceToNow(new Date(activeMatch.startedAt), { addSuffix: true, locale: nb })}.
              </p>
            </div>
          ) : latestMatch ? (
            <div className="mt-4 rounded-xl border border-border bg-bg-primary/70 p-3">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-wider text-text-muted">Sist spilt</p>
                  <p className="truncate font-semibold text-text-primary">{latestMatch.mapName || 'Ukjent kart'}</p>
                </div>
                <p className="shrink-0 text-right text-xs text-text-secondary">
                  {format(new Date(latestMatch.date), 'dd. MMM HH:mm', { locale: nb })}
                </p>
              </div>
            </div>
          ) : null}
        </div>
      </section>

      <div className="grid grid-cols-4 gap-2">
        <StatCard value={matches.length} label="Kamper" icon={<Trophy className="h-4 w-4" />} />
        <StatCard value={formatDuration(totalPlayTime)} label="Tid" icon={<Clock className="h-4 w-4" />} />
        <StatCard value={totalAiKills} label="AI" icon={<Skull className="h-4 w-4" />} />
        <StatCard value={playedMapNames.size} label="Kart" icon={<Map className="h-4 w-4" />} />
      </div>

      <section className="card p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-text-secondary">
            <Trophy className="h-4 w-4 text-accent" />
            Rivalstatus
          </h2>
          {rankedPlayers.length > 1 && (
            <span className="rounded-full border border-border bg-bg-elevated px-2 py-1 text-xs text-text-muted">
              {pointGap.toFixed(1)} poeng skiller
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2">
          {playerRows.map(player => (
            <div key={player.id} className="rounded-xl border border-border bg-bg-elevated p-3">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full" style={{ backgroundColor: player.color }} />
                <span className="truncate text-sm font-semibold text-text-primary">{player.name}</span>
              </div>
              <p className="number-display mt-2 text-2xl font-bold text-accent">{player.stats.points.toFixed(1)}</p>
              <p className="text-xs text-text-muted">
                {player.stats.wins}-{player.stats.losses}-{player.stats.draws} / {player.stats.winRate}% seiersrate
              </p>
            </div>
          ))}
        </div>

        {streak && (
          <div className="mt-3 flex items-center gap-3 rounded-xl border border-orange-500/20 bg-orange-500/10 px-3 py-2">
            <Flame className="h-5 w-5 text-orange-400" />
            <p className="text-sm text-text-secondary">
              <span className="font-semibold text-text-primary">{streak.playerName}</span> har {streak.count} seire på rad.
            </p>
          </div>
        )}
      </section>

      <Leaderboard players={players} getPlayerStats={getPlayerStats} formatDuration={formatDuration} />

      <section className="card p-4">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-text-secondary">
            <MapPinned className="h-4 w-4 text-accent" />
            Kart å hente frem
          </h2>
          <span className="text-xs text-text-muted">{Math.max(0, maps.length - playedMapNames.size)} uspilt</span>
        </div>

        <div className="space-y-2">
          {mapRotation.map(map => (
            <div key={map.id} className="flex items-center justify-between gap-3 rounded-xl border border-border bg-bg-elevated px-3 py-2">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-text-primary">{map.name}</p>
                <p className="truncate text-xs text-text-muted">{map.category || 'Kart'} · {map.source || 'Egendefinert'}</p>
              </div>
              <div className="text-right">
                <p className="number-display text-sm font-bold text-accent">{map.stats.matches}</p>
                <p className="text-[10px] text-text-muted">spilt</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {recentMatches.length > 0 ? (
        <section className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-text-secondary">
              <CalendarDays className="h-4 w-4 text-accent" />
              Siste oppgjør
            </h2>
            <span className="number-display text-xs text-text-muted">{matches.length} totalt</span>
          </div>
          {recentMatches.map(match => (
            <MatchCard
              key={match.id}
              match={match}
              players={players}
              formatDuration={formatDuration}
              onDelete={onDeleteMatch}
              onViewReport={onViewReport}
              compact
            />
          ))}
        </section>
      ) : (
        <section className="card p-10 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-border bg-bg-elevated">
            <Shield className="h-8 w-8 text-text-muted" />
          </div>
          <p className="font-medium text-text-primary">Kamprommet er klart</p>
          <p className="mt-1 text-sm text-text-muted">
            Start en live kamp eller registrer en gammel kamp for å bygge historikken.
          </p>
        </section>
      )}

      <section className="card p-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-text-primary">
          <Sparkles className="h-4 w-4 text-accent" />
          Neste gode vane
        </div>
        <p className="mt-1 text-sm text-text-secondary">
          Bruk live-kamp mens dere spiller. Da blir hendelser, AI-drap og sluttresultat en kamprapport i stedet for et skjema etterpå.
        </p>
      </section>
    </div>
  )
}

function StatCard({ value, label, icon }) {
  return (
    <div className="card p-3 text-center">
      <div className="mb-2 flex justify-center">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10 text-accent">
          {icon}
        </div>
      </div>
      <p className="number-display truncate text-lg font-bold text-text-primary">{value}</p>
      <p className="mt-1 text-[10px] uppercase tracking-wider text-text-muted">{label}</p>
    </div>
  )
}

function getCurrentStreak(matches, players) {
  if (!matches.length || matches[0].result === 'draw' || !matches[0].winnerId) return null
  const winnerId = matches[0].winnerId
  const count = matches.findIndex(match => match.winnerId !== winnerId)
  const streakCount = count === -1 ? matches.length : count
  if (streakCount < 2) return null
  const playerName = players.find(player => player.id === winnerId)?.name || 'Lederen'
  return { playerName, count: streakCount }
}
