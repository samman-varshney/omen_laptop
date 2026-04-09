'use client';

import { useState } from 'react';
import { Note, NoteDB } from '../types/calendar.types';
import { uid } from '../utils/calendar.utils';

// Manages the state of calendar notes per month/year, including CRUD operations
export function useNotes() {
    const [db, setDb] = useState<NoteDB>({});

    const k = (y: number, m: number) => `${y}::${m}`;

    const get = (y: number, m: number): Note[] => db[k(y, m)] || [];

    const add = (y: number, m: number, n: Partial<Note>) => {
        setDb(p => ({
            ...p,
            [k(y, m)]: [...(p[k(y, m)] || []), { ...n, id: uid() }] as Note[]
        }));
    };

    const upd = (y: number, m: number, id: string, patch: Partial<Note>) => {
        setDb(p => ({
            ...p,
            [k(y, m)]: (p[k(y, m)] || []).map(n => n.id === id ? { ...n, ...patch } : n)
        }));
    };

    const del = (y: number, m: number, id: string) => {
        setDb(p => ({
            ...p,
            [k(y, m)]: (p[k(y, m)] || []).filter(n => n.id !== id)
        }));
    };

    return { get, add, upd, del };
}
