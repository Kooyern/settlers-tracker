import React, { useEffect, useState } from 'react'
import { useFirestore } from './hooks/useFirestore'
import { AppShell, ScreenMain } from './components/ui/AppShell'
import { TopBar } from './components/ui/TopBar'
import { BottomNav } from './components/ui/BottomNav'
import { Loader } from './components/ui/Primitives'
import { HomeScreen } from './screens/HomeScreen'
import { LiveScreen } from './screens/LiveScreen'
import { NewMatchScreen } from './screens/NewMatchScreen'
import { MatchesScreen, MatchDetailSheet } from './screens/MatchesScreen'
import { MapsScreen } from './screens/MapsScreen'
import { SettingsSheet } from './screens/SettingsSheet'

const SCREEN_TITLES = {
  home: { title: 'Settlers Tracker', subtitle: '10th Anniversary' },
  live: { title: 'Live kamp' },
  new: { title: 'Ny kamp' },
  matches: { title: 'Kamper' },
  maps: { title: 'Kart' },
}

export default function App() {
  const [tab, setTab] = useState('home')
  const [detailMatch, setDetailMatch] = useState(null)
  const [showSettings, setShowSettings] = useState(false)

  const store = useFirestore()
  const {
    players, matches, maps, activeMatch, loading, error,
    addMatch, deleteMatch, updatePlayer, addMap,
    startLiveMatch, logLiveEvent, endLiveMatch, cancelLiveMatch,
    getPlayerStats, getMapStats, getMapRotation, formatDuration,
  } = store

  // Auto-jump to live tab when an active match exists
  useEffect(() => {
    if (activeMatch && tab === 'home') {
      setTab('live')
    }
  }, [activeMatch?.id])

  const handleNewMatch = async (matchData) => {
    try {
      await addMatch(matchData)
      setTab('home')
    } catch {
      alert('Kunne ikke lagre kampen. Prøv igjen.')
    }
  }

  const handleStartLive = async (mapId, aiColors) => {
    try {
      await startLiveMatch(mapId, aiColors)
      setTab('live')
    } catch {
      alert('Kunne ikke starte kampen. Prøv igjen.')
    }
  }

  const handleEndLive = async (elapsedSeconds, winnerId, result) => {
    try {
      await endLiveMatch(elapsedSeconds, winnerId, result)
      setTab('home')
    } catch {
      alert('Kunne ikke avslutte kampen. Prøv igjen.')
    }
  }

  const handleCancelLive = async () => {
    if (!window.confirm('Avbryte kampen uten å lagre?')) return
    try {
      await cancelLiveMatch()
      setTab('home')
    } catch {
      alert('Kunne ikke avbryte kampen.')
    }
  }

  const handleExport = () => {
    const data = {
      version: '2.0',
      exportDate: new Date().toISOString(),
      players, matches, maps,
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `settlers-tracker-backup-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <AppShell>
        <ScreenMain>
          <Loader label="Laster inn…" />
        </ScreenMain>
      </AppShell>
    )
  }

  if (error) {
    return (
      <AppShell>
        <ScreenMain>
          <div className="card mx-auto mt-12 max-w-sm p-6 text-center">
            <h2 className="text-lg font-semibold text-danger">Tilkoblingsfeil</h2>
            <p className="mt-2 text-sm text-text-muted">{error}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="btn btn-primary btn-block mt-4"
            >
              Prøv igjen
            </button>
          </div>
        </ScreenMain>
      </AppShell>
    )
  }

  const meta = SCREEN_TITLES[tab] || SCREEN_TITLES.home
  const showBack = tab === 'new' || (tab === 'live' && !activeMatch)

  return (
    <AppShell>
      <TopBar
        title={meta.title}
        subtitle={meta.subtitle}
        hasActiveMatch={!!activeMatch}
        onBack={showBack ? () => setTab('home') : undefined}
        onSettings={() => setShowSettings(true)}
      />

      <ScreenMain>
        {tab === 'home' && (
          <HomeScreen
            players={players}
            matches={matches}
            maps={maps}
            activeMatch={activeMatch}
            getPlayerStats={getPlayerStats}
            getMapRotation={getMapRotation}
            formatDuration={formatDuration}
            onStartLive={() => setTab('live')}
            onResumeLive={() => setTab('live')}
            onNewMatch={() => setTab('new')}
            onViewMatch={(m) => setDetailMatch(m)}
            onOpenMaps={() => setTab('maps')}
            onOpenMatches={() => setTab('matches')}
          />
        )}

        {tab === 'live' && (
          <LiveScreen
            players={players}
            maps={maps}
            matches={matches}
            activeMatch={activeMatch}
            onStartMatch={handleStartLive}
            onEndMatch={handleEndLive}
            onLogEvent={logLiveEvent}
            onCancel={handleCancelLive}
            onAddMap={addMap}
          />
        )}

        {tab === 'new' && (
          <NewMatchScreen
            players={players}
            maps={maps}
            matches={matches}
            onSubmit={handleNewMatch}
            onCancel={() => setTab('home')}
            onAddMap={addMap}
          />
        )}

        {tab === 'matches' && (
          <MatchesScreen
            matches={matches}
            players={players}
            maps={maps}
            formatDuration={formatDuration}
            onDeleteMatch={deleteMatch}
            onViewMatch={(m) => setDetailMatch(m)}
          />
        )}

        {tab === 'maps' && (
          <MapsScreen
            maps={maps}
            matches={matches}
            getMapStats={getMapStats}
            onAddMap={addMap}
          />
        )}
      </ScreenMain>

      <BottomNav
        current={tab}
        onChange={setTab}
        hasActiveMatch={!!activeMatch}
      />

      <MatchDetailSheet
        match={detailMatch}
        players={players}
        onClose={() => setDetailMatch(null)}
        onDelete={deleteMatch}
        formatDuration={formatDuration}
      />

      <SettingsSheet
        open={showSettings}
        onClose={() => setShowSettings(false)}
        players={players}
        updatePlayer={updatePlayer}
        onExport={handleExport}
      />
    </AppShell>
  )
}
