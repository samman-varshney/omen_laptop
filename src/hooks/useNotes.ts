'use client';

import { useState, useEffect } from 'react';
import { Note, NoteDB } from '../types/calendar.types';
import { uid } from '../utils/calendar.utils';

const NOTES_STORAGE_KEY = 'calendar_notes_db';

// Manages the state of calendar notes per month/year, including CRUD operations, synced with localStorage
export function useNotes() {
    const [db, setDb] = useState<NoteDB>({});

    useEffect(() => {
        try {
            const stored = localStorage.getItem(NOTES_STORAGE_KEY);
            if (stored) {
                setDb(JSON.parse(stored));
            }
        } catch (e) {
            console.error('Failed to load notes from local storage', e);
        }
    }, []);

    const saveDb = (action: (prevDb: NoteDB) => NoteDB) => {
        setDb(prevDb => {
            const newDb = action(prevDb);
            try {
                localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(newDb));
            } catch (e) {
                console.error('Failed to save notes to local storage', e);
            }
            return newDb;
        });
    };

    const k = (y: number, m: number) => `${y}::${m}`;

    const get = (y: number, m: number): Note[] => db[k(y, m)] || [];

    const add = (y: number, m: number, n: Partial<Note>) => {
        saveDb(p => ({
            ...p,
            [k(y, m)]: [...(p[k(y, m)] || []), { ...n, id: uid() }] as Note[]
        }));
    };

    const upd = (y: number, m: number, id: string, patch: Partial<Note>) => {
        saveDb(p => ({
            ...p,
            [k(y, m)]: (p[k(y, m)] || []).map(entry => entry.id === id ? { ...entry, ...patch } : entry)
        }));
    };

    const del = (y: number, m: number, id: string) => {
        saveDb(p => ({
            ...p,
            [k(y, m)]: (p[k(y, m)] || []).filter(entry => entry.id !== id)
        }));
    };

    return { get, add, upd, del };
}
