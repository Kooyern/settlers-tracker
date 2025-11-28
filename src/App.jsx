import React, { useState } from 'react'
import { Header } from './components/Header'
import { Dashboard } from './components/Dashboard'
import { NewMatchForm } from './components/NewMatchForm'
import { MatchHistory } from './components/MatchHistory'
import { Settings } from './components/Settings'
import { BattleReportModal } from './components/BattleReportModal'
import { useFirestore } from './hooks/useFirestore'
import { Loader2 } from 'lucide-react'

function App() {
  const [currentView, setCurrentView] = useState('dashboard')
  const [selectedMatch, setSelectedMatch] = useState(null)

  const {
    players,
    matches,
    loading,
    error,
    addMatch,
    updateMatch,
    deleteMatch,
    updatePlayer,
    getPlayerStats,
    formatDuration,
  } = useFirestore()

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
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `settlers-tracker-backup-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
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
          />
        )

      case 'new-match':
        return (
          <NewMatchForm
            players={players}
            onSubmit={handleNewMatch}
            onCancel={() => setCurrentView('dashboard')}
          />
        )

      case 'history':
        return (
          <MatchHistory
            matches={matches}
            players={players}
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
            onExport={handleExport}
          />
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-settlers-dark via-[#1a0f09] to-settlers-dark-brown">
      <Header currentView={currentView} onViewChange={setCurrentView} />

      <main className="container mx-auto px-4 py-6 max-w-4xl">
        {renderContent()}
      </main>

      {/* Battle Report Modal */}
      {selectedMatch && (
        <BattleReportModal
          match={selectedMatch}
          players={players}
          onClose={() => setSelectedMatch(null)}
          formatDuration={formatDuration}
        />
      )}

      {/* Sync indicator */}
      <div className="fixed bottom-4 right-4 bg-green-500/20 text-green-400 text-xs px-3 py-1 rounded-full border border-green-500/30">
        <span className="inline-block w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
        Synkronisert
      </div>

      {/* Footer */}
      <footer className="text-center py-6 text-settlers-brown/50 text-sm">
        <p>Settlers 10th Anniversary Battle Tracker</p>
        <p className="mt-1">La de beste strategene vinne!</p>
      </footer>
    </div>
  )
}

export default App
