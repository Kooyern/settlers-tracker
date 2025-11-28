import React from 'react'
import { Trophy, Swords, TrendingUp, Clock, Map, Skull, Target } from 'lucide-react'
import { Leaderboard } from './Leaderboard'
import { MatchCard } from './MatchCard'
import { MAPS } from '../data/maps'

export function Dashboard({ players, matches, getPlayerStats, formatDuration, onDeleteMatch, onViewReport, onNewMatch }) {
  const recentMatches = matches.slice(0, 3)

  // Calculate some fun stats
  const totalPlayTime = matches.reduce((acc, m) => acc + (m.duration || 0), 0)
  const totalAiKills = matches.reduce((acc, m) =>
    acc + (m.players?.[0]?.aiEliminations || 0) + (m.players?.[1]?.aiEliminations || 0), 0
  )
  const favoriteMap = matches.length > 0
    ? Object.entries(
        matches.reduce((acc, m) => {
          acc[m.mapId] = (acc[m.mapId] || 0) + 1
          return acc
        }, {})
      ).sort((a, b) => b[1] - a[1])[0]
    : null

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="parchment rounded-xl p-6 wood-frame text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-5">
          <div className="absolute top-4 left-4 text-6xl">⚔️</div>
          <div className="absolute top-4 right-4 text-6xl">🏰</div>
          <div className="absolute bottom-4 left-1/4 text-4xl">🛡️</div>
          <div className="absolute bottom-4 right-1/4 text-4xl">👑</div>
        </div>

        <div className="relative">
          <h1 className="text-3xl font-bold text-settlers-dark-brown font-medieval mb-2">
            Velkommen til Slagmarken!
          </h1>
          <p className="text-settlers-brown text-lg">
            Settlers 10th Anniversary - Kampoversikt
          </p>

          <button
            onClick={onNewMatch}
            className="btn-settlers mt-4 inline-flex items-center gap-2 text-lg pulse-gold"
          >
            <Swords className="w-5 h-5" />
            Registrer Ny Kamp
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <QuickStat
          icon={<Target className="w-6 h-6" />}
          value={matches.length}
          label="Kamper spilt"
          color="text-settlers-gold"
        />
        <QuickStat
          icon={<Clock className="w-6 h-6" />}
          value={formatDuration(totalPlayTime)}
          label="Total spilletid"
          color="text-blue-500"
        />
        <QuickStat
          icon={<Skull className="w-6 h-6" />}
          value={totalAiKills}
          label="AI eliminert"
          color="text-purple-500"
        />
        <QuickStat
          icon={<Map className="w-6 h-6" />}
          value={favoriteMap ? MAPS.find(m => m.id === favoriteMap[0])?.name || '-' : '-'}
          label="Favoritt kart"
          color="text-green-500"
          small
        />
      </div>

      {/* Leaderboard */}
      <Leaderboard
        players={players}
        getPlayerStats={getPlayerStats}
        formatDuration={formatDuration}
      />

      {/* Recent Matches */}
      <div className="parchment rounded-xl p-6 wood-frame">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-settlers-dark-brown font-medieval flex items-center gap-2">
            <Swords className="w-6 h-6 text-settlers-gold" />
            Siste Kamper
          </h2>
          {matches.length > 3 && (
            <span className="text-sm text-settlers-brown">
              Viser {recentMatches.length} av {matches.length}
            </span>
          )}
        </div>

        {recentMatches.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-settlers-brown text-lg mb-4">
              Ingen kamper registrert ennå!
            </p>
            <p className="text-settlers-brown/70">
              Klikk "Registrer Ny Kamp" for å komme i gang.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {recentMatches.map(match => (
              <MatchCard
                key={match.id}
                match={match}
                players={players}
                formatDuration={formatDuration}
                onDelete={onDeleteMatch}
                onViewReport={onViewReport}
              />
            ))}
          </div>
        )}
      </div>

      {/* Tips Section */}
      {matches.length < 3 && (
        <div className="parchment rounded-xl p-6">
          <h3 className="font-bold text-settlers-dark-brown mb-3">Tips</h3>
          <ul className="space-y-2 text-settlers-brown text-sm">
            <li className="flex items-start gap-2">
              <span className="text-settlers-gold">•</span>
              Husk å registrere AI-elimineringer for å få bonuspoeng (+0.5 per eliminering)
            </li>
            <li className="flex items-start gap-2">
              <span className="text-settlers-gold">•</span>
              Legg til notater for å huske spesielle hendelser i kampen
            </li>
            <li className="flex items-start gap-2">
              <span className="text-settlers-gold">•</span>
              Gå til Innstillinger for å endre spillernavn og farger
            </li>
            <li className="flex items-start gap-2">
              <span className="text-settlers-gold">•</span>
              Bruk Krønike-siden for å se full kamphistorikk med filtre
            </li>
          </ul>
        </div>
      )}
    </div>
  )
}

function QuickStat({ icon, value, label, color, small = false }) {
  return (
    <div className="parchment rounded-lg p-4 text-center">
      <div className={`${color} mb-2 flex justify-center`}>
        {icon}
      </div>
      <p className={`font-bold text-settlers-dark-brown ${small ? 'text-sm' : 'text-2xl'}`}>
        {value}
      </p>
      <p className="text-xs text-settlers-brown">{label}</p>
    </div>
  )
}
