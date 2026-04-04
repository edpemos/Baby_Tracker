import { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, getDocs, onSnapshot, query, doc, deleteDoc } from 'firebase/firestore';

const DataContext = createContext();

export function DataProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [birthDate, setBirthDate] = useState(() => localStorage.getItem('ignacio_birth_date') || '');

  // Authentication check
  useEffect(() => {
    const authStatus = localStorage.getItem('ignacio_tracker_auth');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const login = (password) => {
    if (password === 'Ignacio.26') {
      setIsAuthenticated(true);
      localStorage.setItem('ignacio_tracker_auth', 'true');
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('ignacio_tracker_auth');
  };

  // Load Data
  useEffect(() => {
    if (!isAuthenticated) return;

    if (db) {
      // Firebase connection
      const q = query(collection(db, 'entries'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const loadedEntries = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        // Sort by date
        loadedEntries.sort((a, b) => new Date(a.date) - new Date(b.date));
        setEntries(loadedEntries);
        setLoading(false);
        // Backup to localstorage
        localStorage.setItem('ignacio_entries_backup', JSON.stringify(loadedEntries));
      }, (err) => {
        console.error("Firebase error, falling back to local:", err);
        loadLocalData();
      });
      return () => unsubscribe();
    } else {
      // LocalStorage fallback
      console.warn("Utilizando almacenamiento local como fallback");
      loadLocalData();
    }
  }, [isAuthenticated]);

  const loadLocalData = () => {
    const raw = localStorage.getItem('ignacio_entries_backup');
    if (raw) {
      const parsed = JSON.parse(raw);
      parsed.sort((a, b) => new Date(a.date) - new Date(b.date));
      setEntries(parsed);
    }
    setLoading(false);
  };

  // Add Data
  const addEntry = async (entryData) => {
    // entryData: { type: 'breast'|'bottle'|'pee'|'poop', date: ISOString, notes?: string }
    
    if (db) {
      try {
        await addDoc(collection(db, 'entries'), entryData);
      } catch (err) {
        console.error("No se pudo guardar en Firebase, guardando en local en caché.", err);
        saveLocalEntry(entryData);
      }
    } else {
      saveLocalEntry(entryData);
    }
  };

  const saveLocalEntry = (entryData) => {
    const newEntry = { id: Date.now().toString(), ...entryData };
    const updated = [...entries, newEntry];
    setEntries(updated);
    localStorage.setItem('ignacio_entries_backup', JSON.stringify(updated));
  };

  // Delete Data
  const deleteEntry = async (id) => {
    if (db) {
      try {
        await deleteDoc(doc(db, 'entries', id));
      } catch (err) {
        console.error("No se pudo borrar de Firebase", err);
      }
    } else {
      const updated = entries.filter(e => e.id !== id);
      setEntries(updated);
      localStorage.setItem('ignacio_entries_backup', JSON.stringify(updated));
    }
  };


  return (
    <DataContext.Provider value={{
      isAuthenticated,
      login,
      logout,
      entries,
      loading,
      addEntry,
      deleteEntry,
      birthDate,
      setBirthDate: (date) => {
        setBirthDate(date);
        localStorage.setItem('ignacio_birth_date', date);
      }
    }}>
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => useContext(DataContext);
