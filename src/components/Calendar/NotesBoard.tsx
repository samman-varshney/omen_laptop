'use client';

import React from 'react';
import { StickyNote } from './StickyNote';
import { ThemeConfig, Note } from '../../types/calendar.types';
import { MONTHS } from '../../constants/calendar.constants';

export interface NotesBoardProps {
    month: number;
    theme: ThemeConfig;
    notes: Note[];
    onOpenCreate: () => void;
    onOpenNote: (note: Note) => void;
    onDeleteNote: (id: string) => void;
    calHeight: number | null;
}

export function NotesBoard({ month, theme, notes, onOpenCreate, onOpenNote, onDeleteNote, calHeight }: NotesBoardProps) {
    const tc = theme.textPrimary;

    return (
        <div style={{
            background: theme.cardBg, 
            borderRadius: 18, 
            overflow: 'hidden',
            boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
            display: 'flex', 
            flexDirection: 'column',
            height: calHeight ? `${calHeight}px` : 'auto',
            maxHeight: calHeight ? `${calHeight}px` : 'none',
            transition: 'background 0.3s',
        }}>
            <div style={{
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                padding: '18px 22px 14px', 
                borderBottom: `1px solid ${theme.border}`,
                flexShrink: 0,
            }}>
                <div>
                    <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, fontWeight: 700, color: tc }}>
                        {MONTHS[month]}
                    </div>
                    <div style={{ fontSize: 10.5, color: theme.accent, fontWeight: 500, letterSpacing: '0.09em', marginTop: 1 }}>
                        {notes.length} NOTE{notes.length !== 1 ? 'S' : ''}
                    </div>
                </div>
                <button 
                    onClick={onOpenCreate} 
                    className="ibtn" 
                    style={{
                        padding: '8px 18px', 
                        borderRadius: 9, 
                        border: 'none',
                        background: theme.accent, 
                        color: '#fff', 
                        fontWeight: 600, 
                        fontSize: 11.5, 
                        letterSpacing: '0.06em',
                        cursor: 'pointer',
                        transition: 'all 0.15s'
                    }}
                >
                    + NEW
                </button>
            </div>

            <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: '22px 20px 26px',
                scrollBehavior: 'smooth',
            }}>
                {notes.length === 0 ? (
                    <div style={{ padding: '36px 0', textAlign: 'center' }}>
                        <div style={{ fontSize: 38, marginBottom: 12 }}>📌</div>
                        <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 15, color: theme.textMuted, marginBottom: 7 }}>
                            No notes for {MONTHS[month]}
                        </div>
                        <div style={{ fontSize: 12, color: theme.textMuted, lineHeight: 1.75 }}>
                            Select a date range on the calendar<br />then "Add Note" — or tap + NEW
                        </div>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, paddingTop: 10 }}>
                        {notes.map((n, i) => (
                            <StickyNote 
                                key={n.id} 
                                note={n} 
                                theme={theme} 
                                idx={i}
                                onOpen={onOpenNote}
                                onDelete={onDeleteNote} 
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
