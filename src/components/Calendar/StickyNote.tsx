'use client';

import React from 'react';
import { ThemeConfig, Note } from '../../types/calendar.types';
import { rgba } from '../../utils/calendar.utils';

export interface StickyNoteProps {
    note: Note;
    theme: ThemeConfig;
    idx: number;
    onOpen: (note: Note) => void;
    onDelete: (id: string) => void;
}

export function StickyNote({ note, theme, idx, onOpen, onDelete }: StickyNoteProps) {
    const rots = ['-2.2deg', '1.9deg', '-1.4deg', '2.5deg'];
    const rot = rots[idx % 4];
    const bg = theme.noteBg(idx);
    
    let dl: string | null = null;
    if (note.startDay != null) {
        if (note.endDay && note.endDay !== note.startDay) {
            dl = `Day ${note.startDay}–${note.endDay}`;
        } else {
            dl = `Day ${note.startDay}`;
        }
    }

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        onDelete(note.id);
    };

    return (
        <div 
            className="sticky" 
            onClick={() => onOpen(note)} 
            style={{
                background: bg, 
                border: `1px solid ${theme.borderAccent}`,
                borderRadius: 4, 
                padding: '16px 13px 20px',
                cursor: 'pointer', 
                transform: `rotate(${rot})`,
                boxShadow: '1px 3px 10px rgba(0,0,0,0.10)',
                width: 150, 
                minHeight: 138, 
                position: 'relative', 
                flexShrink: 0,
                animation: `pinDrop 0.28s ease ${idx * 0.06}s both`,
            }}
        >
            <style>{`
                .sticky-container-${note.id} .del-x { opacity: 0; }
                .sticky-container-${note.id}:hover .del-x { opacity: 1; }
            `}</style>
            
            <div className={`sticky-container-${note.id}`} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
                <button
                    className="del-x"
                    onClick={handleDelete}
                    title="Delete note"
                    style={{
                        position: 'absolute',
                        top: 7,
                        right: 8,
                        width: 20,
                        height: 20,
                        borderRadius: '50%',
                        border: 'none',
                        background: theme.dark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.10)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        fontSize: 11,
                        color: theme.dark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)',
                        transition: 'opacity 0.15s, background 0.15s, transform 0.12s',
                        zIndex: 10,
                        pointerEvents: 'auto'
                    }}
                    onMouseEnter={e => {
                        e.currentTarget.style.background = 'rgba(200, 50, 50, 0.22)';
                        e.currentTarget.style.color = '#c43232';
                        e.currentTarget.style.transform = 'scale(1.15)';
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.background = theme.dark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.10)';
                        e.currentTarget.style.color = theme.dark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)';
                        e.currentTarget.style.transform = 'scale(1)';
                    }}
                >
                    ✕
                </button>
            </div>

            <div style={{
                position: 'absolute', top: -8, left: '50%', transform: 'translateX(-50%)',
                width: 13, height: 13, borderRadius: '50%', background: theme.accent,
                boxShadow: `0 2px 6px ${rgba(theme.accent, 0.48)}`
            }} />

            <div style={{
                fontFamily: "'Playfair Display',serif", fontSize: 13.5, fontWeight: 600,
                color: theme.textPrimary, marginBottom: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                paddingRight: 16
            }}>
                {note.title || 'Untitled'}
            </div>
            
            <div style={{
                fontSize: 11.5, color: theme.textSecondary, lineHeight: 1.55,
                overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical'
            }}>
                {note.desc || 'Click to view…'}
            </div>
            
            {dl && (
                <div style={{
                    position: 'absolute', bottom: 9, left: 11, right: 11, fontSize: 9.5, fontWeight: 600,
                    color: theme.accent, letterSpacing: '0.05em', borderTop: `1px solid ${rgba(theme.accent, 0.15)}`, paddingTop: 5
                }}>
                    {dl}
                </div>
            )}
        </div>
    );
}
