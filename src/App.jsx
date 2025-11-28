import React, { useState, useEffect } from 'react'
import { Header } from './components/Header'
import { Dashboard } from './components/Dashboard'
import { NewMatchForm } from './components/NewMatchForm'
import { MatchHistory } from './components/MatchHistory'
import { Settings } from './components/Settings'
import { BattleReportModal } from './components/BattleReportModal'
import { LiveMatch } from './components/LiveMatch'
import { useFirestore } from './hooks/useFirestore'
import { Loader2 } from 'lucide-react'

function App() {
  const [currentView, setCurrentView] = useState('dashboard')
  const [selectedMatch, setSelectedMatch] = useState(null)

  const {
    players,
    matches,
    maps,
    activeMatch,
    loading,
    error,
    addMatch,
    updateMatch,
    deleteMatch,
    updatePlayer,
    addMap,
    addMaps,
    deleteMap,
    startLiveMatch,
    logLiveEvent,
    endLiveMatch,
    cancelLiveMatch,
    getPlayerStats,
    getMapName,
    formatDuration,
  } = useFirestore()

  // Auto-switch to live view when there's an active match
  useEffect(() => {
    if (activeMatch && currentView !== 'live-match') {
      setCurrentView('live-match')
    }
  }, [activeMatch])

  const handleNewMatch = async (matchData) => {
    try {
      await addMatch(matchData)
      setCurrentView('dashboard')
    } catch (err) {
      alert('Kunne ikke lagre kampen. Prøv igjen.')
    }
  }

  const handleDeleteMatch = async (matchId) => {
    if (window.confirm('Er du sikker på at du vil slette denne kampen?')) {
      try {
        await deleteMatch(matchId)
      } catch (err) {
        alert('Kunne ikke slette kampen. Prøv igjen.')
      }
    }
  }

  const handleViewReport = (match) => {
    setSelectedMatch(match)
  }

  const handleExport = () => {
    const data = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      players,
      matches,
      maps,
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `settlers-tracker-backup-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Live match handlers
  const handleStartLiveMatch = async (mapId, aiColors) => {
    try {
      await startLiveMatch(mapId, aiColors)
      setCurrentView('live-match')
    } catch (err) {
      alert('Kunne ikke starte kampen. Prøv igjen.')
    }
  }

  const handleEndLiveMatch = async (elapsedSeconds, winnerId, result) => {
    try {
      await endLiveMatch(elapsedSeconds, winnerId, result)
      setCurrentView('dashboard')
    } catch (err) {
      alert('Kunne ikke avslutte kampen. Prøv igjen.')
    }
  }

  const handleCancelLiveMatch = async () => {
    if (window.confirm('Avbryte kampen uten å lagre?')) {
      try {
        await cancelLiveMatch()
        setCurrentView('dashboard')
      } catch (err) {
        alert('Kunne ikke avbryte kampen.')
      }
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-settlers-dark via-[#1a0f09] to-settlers-dark-brown flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-settlers-gold animate-spin mx-auto mb-4" />
          <p className="text-settlers-wheat text-lg">Laster inn slagmarken...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-settlers-dark via-[#1a0f09] to-settlers-dark-brown flex items-center justify-center p-4">
        <div className="parchment rounded-xl p-6 max-w-md text-center">
          <h2 className="text-xl font-bold text-red-700 mb-2">Tilkoblingsfeil</h2>
          <p className="text-settlers-brown mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="btn-settlers"
          >
            Prøv igjen
          </button>
        </div>
      </div>
    )
  }

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <Dashboard
            players={players}
            matches={matches}
            getPlayerStats={getPlayerStats}
            formatDuration={formatDuration}
            onDeleteMatch={handleDeleteMatch}
            onViewReport={handleViewReport}
            onNewMatch={() => setCurrentView('new-match')}
            onStartLive={() => setCurrentView('live-match')}
          />
        )

      case 'new-match':
        return (
          <NewMatchForm
            players={players}
            maps={maps}
            onSubmit={handleNewMatch}
            onCancel={() => setCurrentView('dashboard')}
            onAddMap={addMap}
          />
        )

      case 'history':
        return (
          <MatchHistory
            matches={matches}
            players={players}
            maps={maps}
            getMapName={getMapName}
            formatDuration={formatDuration}
            onDeleteMatch={handleDeleteMatch}
            onViewReport={handleViewReport}
          />
        )

      case 'settings':
        return (
          <Settings
            players={players}
            updatePlayer={updatePlayer}
            matches={matches}
            maps={maps}
            addMap={addMap}
            addMaps={addMaps}
            deleteMap={deleteMap}
            onExport={handleExport}
          />
        )

      case 'live-match':
        return (
          <LiveMatch
            players={players}
            maps={maps}
            activeMatch={activeMatch}
            onStartMatch={handleStartLiveMatch}
            onEndMatch={handleEndLiveMatch}
            onLogEvent={logLiveEvent}
            onCancel={handleCancelLiveMatch}
          />
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-settlers-dark via-[#1a0f09] to-settlers-dark-brown pb-20 pb-safe">
      <Header currentView={currentView} onViewChange={setCurrentView} />

      <main className="container mx-auto px-3 py-4 max-w-lg">
        {renderContent()}
      </main>

      {/* Battle Report Modal */}
      {selectedMatch && (
        <BattleReportModal
          match={selectedMatch}
          players={players}
          getMapName={getMapName}
          onClose={() => setSelectedMatch(null)}
          formatDuration={formatDuration}
        />
      )}

      {/* Sync indicator - smaller and less intrusive */}
      <div className="fixed bottom-2 right-2 bg-green-500/10 text-green-400 text-[10px] px-2 py-0.5 rounded-full">
        <span className="inline-block w-1.5 h-1.5 bg-green-400 rounded-full mr-1 animate-pulse"></span>
        Live
      </div>
    </div>
  )
}

export default App
