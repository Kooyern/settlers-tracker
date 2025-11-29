import { useState, useEffect } from 'react'
import { db } from '../firebase'
import {
  collection,
  doc,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  setDoc,
  query,
  orderBy
} from 'firebase/firestore'

// Default players
const DEFAULT_PLAYERS = [
  { id: 'player1', name: 'Stian', color: '#1E90FF' },
  { id: 'player2', name: 'Espen', color: '#DC143C' },
]

// Historical points from before the app (played with notepad)
const HISTORICAL_POINTS = {
  player1: 37.5, // Stian
  player2: 37,   // Espen
}

// Some starter maps
const DEFAULT_MAPS = [
  { id: 'default-1', name: 'Tutorial Island', category: 'Standard' },
  { id: 'default-2', name: 'Green Valley', category: 'Standard' },
  { id: 'default-3', name: 'River Delta', category: 'Standard' },
]

export function useFirestore() {
  const [players, setPlayers] = useState(DEFAULT_PLAYERS)
  const [matches, setMatches] = useState([])
  const [maps, setMaps] = useState([])
  const [activeMatch, setActiveMatch] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Listen to players collection
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'players'),
      (snapshot) => {
        if (snapshot.empty) {
          DEFAULT_PLAYERS.forEach(player => {
            setDoc(doc(db, 'players', player.id), player)
          })
          setPlayers(DEFAULT_PLAYERS)
        } else {
          const playersData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }))
          playersData.sort((a, b) => a.id.localeCompare(b.id))
          setPlayers(playersData)
        }
      },
      (err) => {
        console.error('Error fetching players:', err)
        setError(err.message)
      }
    )
    return () => unsubscribe()
  }, [])

  // Listen to maps collection
  useEffect(() => {
    const q = query(collection(db, 'maps'), orderBy('name', 'asc'))

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (snapshot.empty) {
          // Initialize with default maps
          DEFAULT_MAPS.forEach(map => {
            setDoc(doc(db, 'maps', map.id), map)
          })
          setMaps(DEFAULT_MAPS)
        } else {
          const mapsData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }))
          setMaps(mapsData)
        }
      },
      (err) => {
        console.error('Error fetching maps:', err)
      }
    )
    return () => unsubscribe()
  }, [])

  // Listen to matches collection
  useEffect(() => {
    const q = query(collection(db, 'matches'), orderBy('date', 'desc'))

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const matchesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        setMatches(matchesData)
        setLoading(false)
      },
      (err) => {
        console.error('Error fetching matches:', err)
        setError(err.message)
        setLoading(false)
      }
    )
    return () => unsubscribe()
  }, [])

  // Listen to active match (live game)
  useEffect(() => {
    const unsubscribe = onSnapshot(
      doc(db, 'liveMatch', 'current'),
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          setActiveMatch({ id: docSnapshot.id, ...docSnapshot.data() })
        } else {
          setActiveMatch(null)
        }
      },
      (err) => {
        console.error('Error fetching active match:', err)
      }
    )
    return () => unsubscribe()
  }, [])

  // Add a new match
  const addMatch = async (matchData) => {
    try {
      const newMatch = {
        ...matchData,
        date: matchData.date || new Date().toISOString(), // Use provided date or default to now
        createdAt: new Date().toISOString(),
      }
      const docRef = await addDoc(collection(db, 'matches'), newMatch)
      return { id: docRef.id, ...newMatch }
    } catch (err) {
      console.error('Error adding match:', err)
      setError(err.message)
      throw err
    }
  }

  // Update an existing match
  const updateMatch = async (matchId, updates) => {
    try {
      await updateDoc(doc(db, 'matches', matchId), updates)
    } catch (err) {
      console.error('Error updating match:', err)
      setError(err.message)
      throw err
    }
  }

  // Delete a match
  const deleteMatch = async (matchId) => {
    try {
      await deleteDoc(doc(db, 'matches', matchId))
    } catch (err) {
      console.error('Error deleting match:', err)
      setError(err.message)
      throw err
    }
  }

  // Update player
  const updatePlayer = async (playerId, updates) => {
    try {
      await updateDoc(doc(db, 'players', playerId), updates)
    } catch (err) {
      console.error('Error updating player:', err)
      setError(err.message)
      throw err
    }
  }

  // Add a new map
  const addMap = async (mapData) => {
    try {
      const newMap = {
        name: mapData.name.trim(),
        category: mapData.category || 'Custom',
        createdAt: new Date().toISOString(),
      }
      const docRef = await addDoc(collection(db, 'maps'), newMap)
      return { id: docRef.id, ...newMap }
    } catch (err) {
      console.error('Error adding map:', err)
      throw err
    }
  }

  // Add multiple maps at once
  const addMaps = async (mapNames, category = 'Map Pack') => {
    try {
      const promises = mapNames.map(name =>
        addDoc(collection(db, 'maps'), {
          name: name.trim(),
          category,
          createdAt: new Date().toISOString(),
        })
      )
      await Promise.all(promises)
      return true
    } catch (err) {
      console.error('Error adding maps:', err)
      throw err
    }
  }

  // Delete a map
  const deleteMap = async (mapId) => {
    try {
      await deleteDoc(doc(db, 'maps', mapId))
    } catch (err) {
      console.error('Error deleting map:', err)
      throw err
    }
  }

  // Start a live match
  const startLiveMatch = async (mapId, aiColors = ['green', 'yellow', 'red', 'purple', 'cyan', 'orange']) => {
    try {
      const matchData = {
        mapId,
        startedAt: new Date().toISOString(),
        events: [],
        players: players.map(p => ({ playerId: p.id })),
        status: 'active',
        pausedDuration: 0,
        aiColors, // Store which AI colors are active
        aiCount: aiColors.length,
      }
      await setDoc(doc(db, 'liveMatch', 'current'), matchData)
      return matchData
    } catch (err) {
      console.error('Error starting live match:', err)
      throw err
    }
  }

  // Log event in live match
  const logLiveEvent = async (event) => {
    if (!activeMatch) return
    try {
      const updatedEvents = [...(activeMatch.events || []), event]
      await updateDoc(doc(db, 'liveMatch', 'current'), {
        events: updatedEvents
      })
    } catch (err) {
      console.error('Error logging event:', err)
      throw err
    }
  }

  // End live match and save to matches collection
  const endLiveMatch = async (elapsedSeconds, winnerId, result = 'win') => {
    if (!activeMatch) return
    try {
      // Count AI eliminations and AI deaths per player
      const playerStats = players.map(p => {
        const aiKills = (activeMatch.events || []).filter(
          e => e.type === 'ai_eliminated' && e.playerId === p.id
        ).length
        const aiDeaths = (activeMatch.events || []).filter(
          e => e.type === 'ai_attack' && e.playerId === p.id
        ).length > 0 ? 1 : 0 // Max 1 AI death per match
        return { playerId: p.id, aiEliminations: aiKills, aiDeaths }
      })

      // Create match record
      const matchData = {
        mapId: activeMatch.mapId,
        mapName: maps.find(m => m.id === activeMatch.mapId)?.name || '',
        duration: Math.round(elapsedSeconds / 60), // Convert to minutes
        winnerId: result === 'draw' ? null : winnerId,
        result,
        players: playerStats,
        events: activeMatch.events || [],
        notes: '',
        date: new Date().toISOString(),
        createdAt: activeMatch.startedAt,
        isLiveMatch: true,
        aiColors: activeMatch.aiColors || [],
        aiCount: activeMatch.aiCount || 6,
      }

      // Save to matches collection
      await addDoc(collection(db, 'matches'), matchData)

      // Delete live match
      await deleteDoc(doc(db, 'liveMatch', 'current'))

      return matchData
    } catch (err) {
      console.error('Error ending live match:', err)
      throw err
    }
  }

  // Cancel live match without saving
  const cancelLiveMatch = async () => {
    try {
      await deleteDoc(doc(db, 'liveMatch', 'current'))
    } catch (err) {
      console.error('Error canceling live match:', err)
      throw err
    }
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
    let validAiKills = 0 // AI kills that count for points
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

      // Count AI deaths
      const playerAiDeaths = playerData?.aiDeaths || 0
      aiDeaths += playerAiDeaths

      // Count total AI kills
      const playerAiKills = playerData?.aiEliminations || 0
      aiKills += playerAiKills

      // For live matches with events, calculate valid AI kills
      if (match.events?.length > 0) {
        const opponentEliminatedByAi = match.events.find(
          e => e.type === 'ai_attack' && e.playerId === opponentId
        )

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
        // For manual matches, all AI kills count
        validAiKills += playerAiKills
      }

      if (match.duration) {
        totalPlayTime += match.duration
      }
    })

    // Points: Win=1, Draw=0.5, Valid AI Kill=0.5, AI Death=-1
    // Add historical points from before the app
    const historicalPoints = HISTORICAL_POINTS[playerId] || 0
    const points = historicalPoints + wins + (draws * 0.5) + (validAiKills * 0.5) - aiDeaths

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

  // Get map name by ID
  const getMapName = (mapId) => {
    if (!mapId) return 'Ukjent kart'
    const map = maps.find(m => m.id === mapId)
    return map?.name || mapId
  }

  // Format duration
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
  }
}
