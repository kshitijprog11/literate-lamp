import { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react'
import { initializeApp } from 'firebase/app'
import { getFirestore, collection, addDoc, getDocs, query, orderBy } from 'firebase/firestore'

const FirebaseContext = createContext()

// Firebase configuration - users should update this with their own config
const firebaseConfig = {
  apiKey: "AIzaSyDCZ86Fvr0p0xSF2izG5Kk4UR27qJIQ_OY",
  authDomain: "mindful-dining-test.firebaseapp.com",
  projectId: "mindful-dining-test",
  storageBucket: "mindful-dining-test.firebasestorage.app",
  messagingSenderId: "756250419814",
  appId: "1:756250419814:web:abdd3df98c9884114003a7",
  measurementId: "G-V97Y6YE2X2"
}

export function FirebaseProvider({ children }) {
  const [db, setDb] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const [fastTestingMode, setFastTestingMode] = useState(false)

  useEffect(() => {
    try {
      const app = initializeApp(firebaseConfig)
      const database = getFirestore(app)
      setDb(database)
      setIsConnected(true)
      console.log('✅ Firebase connected successfully')
    } catch (error) {
      console.warn('Firebase connection failed, using localStorage fallback:', error)
      setFastTestingMode(true)
    }
  }, [])

  const saveReservation = useCallback(async (reservationData) => {
    if (!reservationData.email || !reservationData.firstName) {
      throw new Error('Missing required reservation data')
    }

    // Helper to update index
    const updateIndex = (key) => {
      try {
        const indexKey = '__index_reservations__'
        const existingIndex = localStorage.getItem(indexKey)
        const keys = existingIndex ? JSON.parse(existingIndex) : []
        if (!keys.includes(key)) {
          keys.push(key)
          localStorage.setItem(indexKey, JSON.stringify(keys))
        }
      } catch (e) {
        console.warn('Error updating reservation index', e)
      }
    }

    if (fastTestingMode || !db) {
      console.log('⚡ Fallback mode: Using localStorage')
      const reservationId = 'res_' + Date.now()
      const key = 'reservation_' + reservationId
      localStorage.setItem(key, JSON.stringify(reservationData))
      updateIndex(key)
      console.log('✅ Reservation saved locally with ID:', reservationId)
      return reservationId
    }

    try {
      console.log('🔥 Saving to Firebase...')
      
      const savePromise = addDoc(collection(db, 'reservations'), reservationData)
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Firebase timeout')), 3000)
      )
      
      const docRef = await Promise.race([savePromise, timeoutPromise])
      console.log('✅ Reservation saved to Firebase with ID:', docRef.id)
      return docRef.id
      
    } catch (error) {
      console.warn('⚠️ Firebase failed, using localStorage fallback:', error.message)
      const reservationId = 'res_' + Date.now()
      const key = 'reservation_' + reservationId
      localStorage.setItem(key, JSON.stringify(reservationData))
      updateIndex(key)
      console.log('✅ Reservation saved locally with ID:', reservationId)
      return reservationId
    }
  }, [db, fastTestingMode])

  const getReservations = useCallback(async () => {
    if (fastTestingMode || !db) {
      // Get from localStorage using index optimization
      const reservations = []
      const indexKey = '__index_reservations__'
      const index = localStorage.getItem(indexKey)

      if (index) {
        try {
          const keys = JSON.parse(index)
          for (const key of keys) {
            const item = localStorage.getItem(key)
            if (item) {
              try {
                const data = JSON.parse(item)
                reservations.push({ id: key.replace('reservation_', ''), ...data })
              } catch (e) {
                console.warn('Error parsing item from index:', key)
              }
            }
          }
          return reservations
        } catch (e) {
          console.warn('Index corrupted, rebuilding...')
        }
      }

      // Fallback: Full scan and rebuild index
      const keys = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key?.startsWith('reservation_')) {
          try {
            const data = JSON.parse(localStorage.getItem(key))
            reservations.push({ id: key.replace('reservation_', ''), ...data })
            keys.push(key)
          } catch (error) {
            console.warn('Error parsing localStorage reservation:', error)
          }
        }
      }

      // Save index
      localStorage.setItem(indexKey, JSON.stringify(keys))
      return reservations
    }

    try {
      const q = query(collection(db, 'reservations'), orderBy('createdAt', 'desc'))
      const querySnapshot = await getDocs(q)
      const reservations = []
      querySnapshot.forEach((doc) => {
        reservations.push({ id: doc.id, ...doc.data() })
      })
      return reservations
    } catch (error) {
      console.error('Error fetching reservations:', error)
      return []
    }
  }, [db, fastTestingMode])

  const value = useMemo(() => ({
    db,
    isConnected,
    fastTestingMode,
    saveReservation,
    getReservations
  }), [db, isConnected, fastTestingMode, saveReservation, getReservations])

  return (
    <FirebaseContext.Provider value={value}>
      {children}
    </FirebaseContext.Provider>
  )
}

export function useFirebase() {
  const context = useContext(FirebaseContext)
  if (!context) {
    throw new Error('useFirebase must be used within a FirebaseProvider')
  }
  return context
}