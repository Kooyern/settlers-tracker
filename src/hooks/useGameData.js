import { useLocalStorage } from './useLocalStorage'

// Initial players - you and your friend
const DEFAULT_PLAYERS = [
  { id: 'player1', name: 'Spiller 1', color: '#1E90FF' },
  { id: 'player2', name: 'Spiller 2', color: '#DC143C' },
]

export function useGameData() {
  const [players, setPlayers] = useLocalStorage('settlers-players', DEFAULT_PLAYERS)
  const [matches, setMatches] = useLocalStorage('settlers-matches', [])

  // Add a new match
  const addMatch = (matchData) => {
    const newMatch = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      ...matchData,
    }
    setMatches(prev => [newMatch, ...prev])
    return newMatch
  }

  // Update an existing match
  const updateMatch = (matchId, updates) => {
    setMatches(prev => prev.map(match =>
      match.id === matchId ? { ...match, ...updates } : match
    ))
  }

  // Delete a match
  const deleteMatch = (matchId) => {
    setMatches(prev => prev.filter(match => match.id !== matchId))
  }

  // Update player names
  const updatePlayer = (playerId, updates) => {
    setPlayers(prev => prev.map(player =>
      player.id === playerId ? { ...player, ...updates } : player
    ))
  }

  // Calculate stats for a player
  const getPlayerStats = (playerId) => {
    const playerMatches = matches.filter(m =>
      m.players?.some(p => p.playerId === playerId)
    )

    let wins = 0
    let losses = 0
    let draws = 0
    let aiKills = 0
    let totalPlayTime = 0

    playerMatches.forEach(match => {
      const playerData = match.players?.find(p => p.playerId === playerId)

      if (match.result === 'draw') {
        draws++
      } else if (match.winnerId === playerId) {
        wins++
      } else if (match.winnerId && match.winnerId !== playerId) {
        losses++
      }

      // Count AI kills from battle report
      if (playerData?.aiEliminations) {
        aiKills += playerData.aiEliminations
      }

      // Add play time
      if (match.duration) {
        totalPlayTime += match.duration
      }
    })

    // Calculate points: Win = 1, Draw = 0.5, AI Kill = 0.5
    const points = wins + (draws * 0.5) + (aiKills * 0.5)

    return {
      matches: playerMatches.length,
      wins,
      losses,
      draws,
      aiKills,
      points,
      totalPlayTime,
      winRate: playerMatches.length > 0
        ? ((wins / playerMatches.length) * 100).toFixed(1)
        : 0
    }
  }

  // Get head-to-head stats
  const getHeadToHead = () => {
    const p1Stats = getPlayerStats('player1')
    const p2Stats = getPlayerStats('player2')

    return {
      player1: p1Stats,
      player2: p2Stats,
      totalMatches: matches.length,
    }
  }

  // Get match history with filters
  const getMatchHistory = (filters = {}) => {
    let filtered = [...matches]

    if (filters.mapId) {
      filtered = filtered.filter(m => m.mapId === filters.mapId)
    }

    if (filters.winnerId) {
      filtered = filtered.filter(m => m.winnerId === filters.winnerId)
    }

    if (filters.startDate) {
      filtered = filtered.filter(m => new Date(m.date) >= new Date(filters.startDate))
    }

    if (filters.endDate) {
      filtered = filtered.filter(m => new Date(m.date) <= new Date(filters.endDate))
    }

    return filtered
  }

  // Format duration (minutes) to readable string
  const formatDuration = (minutes) => {
    if (!minutes) return '-'
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}t ${mins}m`
    }
    return `${mins}m`
  }

  return {
    players,
    matches,
    addMatch,
    updateMatch,
    deleteMatch,
    updatePlayer,
    getPlayerStats,
    getHeadToHead,
    getMatchHistory,
    formatDuration,
  }
}
