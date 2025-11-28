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

  // Add a new match
  const addMatch = async (matchData) => {
    try {
      const newMatch = {
        ...matchData,
        date: new Date().toISOString(),
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

      if (playerData?.aiEliminations) {
        aiKills += playerData.aiEliminations
      }

      if (match.duration) {
        totalPlayTime += match.duration
      }
    })

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
    loading,
    error,
    addMatch,
    updateMatch,
    deleteMatch,
    updatePlayer,
    addMap,
    addMaps,
    deleteMap,
    getPlayerStats,
    getMapName,
    formatDuration,
  }
}
