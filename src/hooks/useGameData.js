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
    const opponentId = playerId === 'player1' ? 'player2' : 'player1'
    const playerMatches = matches.filter(m =>
      m.players?.some(p => p.playerId === playerId)
    )

    let wins = 0
    let losses = 0
    let draws = 0
    let aiKills = 0
    let aiDeaths = 0
    let validAiKills = 0 // AI kills that count for points (before opponent was eliminated by AI)
    let totalPlayTime = 0

    playerMatches.forEach(match => {
      const playerData = match.players?.find(p => p.playerId === playerId)
      const opponentData = match.players?.find(p => p.playerId === opponentId)

      if (match.result === 'draw') {
        draws++
      } else if (match.winnerId === playerId) {
        wins++
      } else if (match.winnerId && match.winnerId !== playerId) {
        losses++
      }

      // Check for AI deaths (being eliminated by AI)
      const playerAiDeaths = playerData?.aiDeaths || 0
      aiDeaths += playerAiDeaths

      // Count AI kills from manual match registration
      const playerAiKills = playerData?.aiEliminations || 0
      aiKills += playerAiKills

      // For live matches with events, calculate valid AI kills
      if (match.events?.length > 0) {
        // Find when each player got eliminated by AI (if at all)
        const playerEliminatedByAi = match.events.find(
          e => e.type === 'ai_attack' && e.playerId === playerId
        )
        const opponentEliminatedByAi = match.events.find(
          e => e.type === 'ai_attack' && e.playerId === opponentId
        )

        // Count AI eliminations by this player
        const playerAiEliminations = match.events.filter(
          e => e.type === 'ai_eliminated' && e.playerId === playerId
        )

        playerAiEliminations.forEach(elimination => {
          // AI kill counts only if opponent wasn't eliminated by AI before this kill
          if (!opponentEliminatedByAi || elimination.timestamp < opponentEliminatedByAi.timestamp) {
            validAiKills++
          }
        })
      } else {
        // For manual matches without events, all AI kills count
        // unless the player has AI deaths (then opponent's AI kills might not count)
        validAiKills += playerAiKills
      }

      // Add play time
      if (match.duration) {
        totalPlayTime += match.duration
      }
    })

    // Calculate points:
    // Win = 1, Draw = 0.5, Valid AI Kill = 0.5, AI Death = -1
    const points = wins + (draws * 0.5) + (validAiKills * 0.5) - aiDeaths

    return {
      matches: playerMatches.length,
      wins,
      losses,
      draws,
      aiKills,
      aiDeaths,
      validAiKills,
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
