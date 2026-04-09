'use client';

import React, { useState, useEffect } from 'react';
import { ThemeConfig, Note } from '../../types/calendar.types';
import { shiftHex, rgba } from '../../utils/calendar.utils';

export interface NoteModalProps {
    mode: 'create' | 'view' | 'edit';
    note?: Partial<Note>;
    theme: ThemeConfig;
    onSave: (note: Partial<Note>) => void;
    onClose: () => void;
    onEdit: () => void;
    onDelete: (id: string) => void;
}

export function NoteModal({ mode, note, theme, onSave, onClose, onEdit, onDelete }: NoteModalProps) {
    const [title, setTitle] = useState(note?.title || '');
    const [desc, setDesc] = useState(note?.desc || '');
    const [sd, setSd] = useState(note?.startDay != null ? String(note.startDay) : '');
    const [ed, setEd] = useState(note?.endDay != null ? String(note.endDay) : '');
    
    const isView = mode === 'view';
    const isCreate = mode === 'create';

    useEffect(() => {
        setTitle(note?.title || ''); 
        setDesc(note?.desc || '');
        setSd(note?.startDay != null ? String(note.startDay) : '');
        setEd(note?.endDay != null ? String(note.endDay) : '');
    }, [mode, note?.id, note]);

    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => { 
            if (e.key === 'Escape') onClose(); 
        };
        window.addEventListener('keydown', handleEsc); 
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    const tc = theme.textPrimary;
    const muted = theme.textSecondary;
    const ib = theme.inputBg;
    const br = theme.borderAccent;
    
    let dl: string | null = null;
    if (note?.startDay != null) {
        if (note.endDay && note.endDay !== note.startDay) {
            dl = `Day ${note.startDay} – ${note.endDay}`;
        } else {
            dl = `Day ${note.startDay}`;
        }
    }

    const iStyle: React.CSSProperties = {
        width: '100%', padding: '10px 14px', borderRadius: 10,
        border: `1px solid ${br}`, background: ib, color: tc,
        fontSize: 13.5, outline: 'none', lineHeight: 1.55,
        transition: 'border-color 0.15s, box-shadow 0.15s',
    };

    return (
        <div 
            style={{
                position: 'fixed', inset: 0, zIndex: 1000, 
                background: 'rgba(0, 0, 0, 0.52)', backdropFilter: 'blur(6px)', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
                animation: 'backdropIn 0.22s ease'
            }} 
            onClick={onClose}
        >
            <div 
                onClick={e => e.stopPropagation()}
                style={{
                    background: theme.elevated,
                    width: '100%', maxWidth: 460, borderRadius: 24, overflow: 'hidden',
                    animation: 'modalSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                    boxShadow: '0 32px 80px rgba(0, 0, 0, 0.36), 0 0 0 1px rgba(255, 255, 255, 0.06)'
                }}
            >
                <div style={{
                    background: `linear-gradient(135deg, ${theme.accent} 0%, ${shiftHex(theme.accent, -30)} 100%)`,
                    padding: '24px 24px 20px',
                    position: 'relative',
                    overflow: 'hidden',
                }}>
                    <div style={{
                        position: 'absolute', top: -28, right: -28, width: 110, height: 110,
                        borderRadius: '50%', background: 'rgba(255,255,255,0.08)', pointerEvents: 'none',
                    }} />
                    <div style={{
                        position: 'absolute', bottom: -40, left: 60, width: 80, height: 80,
                        borderRadius: '50%', background: 'rgba(255,255,255,0.05)', pointerEvents: 'none',
                    }} />

                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, position: 'relative' }}>
                        <div style={{ flex: 1 }}>
                            <div style={{
                                fontSize: 9, fontWeight: 700, letterSpacing: '0.18em',
                                color: 'rgba(255,255,255,0.6)', marginBottom: 8,
                            }}>
                                {isCreate ? '✦ NEW NOTE' : mode === 'edit' ? '✦ EDITING' : '✦ NOTE'}
                            </div>

                            {isView ? (
                                <div style={{
                                    fontFamily: "'Playfair Display',serif",
                                    fontSize: 24, fontWeight: 700, color: '#fff', lineHeight: 1.2,
                                    wordBreak: 'break-word', letterSpacing: '-0.01em',
                                }}>
                                    {note?.title || 'Untitled'}
                                </div>
                            ) : (
                                <input 
                                    value={title} 
                                    onChange={e => setTitle(e.target.value)}
                                    autoFocus 
                                    placeholder={isCreate ? 'Give it a title…' : 'Edit title…'}
                                    style={{
                                        background: 'rgba(255,255,255,0.15)',
                                        border: '1px solid rgba(255,255,255,0.28)',
                                        borderRadius: 10, padding: '8px 14px',
                                        color: '#fff', fontSize: 19, fontWeight: 600,
                                        fontFamily: "'Playfair Display',serif",
                                        outline: 'none', width: '100%',
                                        backdropFilter: 'blur(4px)',
                                    }} 
                                />
                            )}

                            {dl && isView && (
                                <div style={{
                                    marginTop: 12, display: 'inline-flex', alignItems: 'center', gap: 6,
                                    background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(6px)',
                                    borderRadius: 20, padding: '4px 13px',
                                    fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.92)',
                                    letterSpacing: '0.04em',
                                }}>
                                    📅 {dl}
                                </div>
                            )}
                        </div>

                        <button onClick={onClose} className="ibtn" style={{
                            background: 'rgba(255,255,255,0.16)',
                            border: '1px solid rgba(255,255,255,0.22)',
                            backdropFilter: 'blur(8px)',
                            borderRadius: 10, color: '#fff', fontSize: 16,
                            width: 34, height: 34, flexShrink: 0,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            marginTop: isView ? 22 : 24,
                            cursor: 'pointer'
                        }}>×</button>
                    </div>
                </div>

                <div style={{ padding: '22px 24px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {isView ? (
                        <div style={{
                            fontSize: 14, color: tc, lineHeight: 1.78, minHeight: 56,
                            whiteSpace: 'pre-wrap', padding: '2px 0',
                        }}>
                            {note?.desc ? 
                                note.desc : 
                                <span style={{ color: muted, fontStyle: 'italic', fontSize: 13 }}>No description added yet.</span>
                            }
                        </div>
                    ) : (
                        <div>
                            <label style={{
                                display: 'block', fontSize: 9, fontWeight: 700, color: theme.accent,
                                letterSpacing: '0.15em', marginBottom: 7
                            }}>DESCRIPTION</label>
                            <textarea 
                                value={desc} 
                                onChange={e => setDesc(e.target.value)}
                                placeholder="Write your thoughts…" 
                                rows={4} 
                                style={iStyle} 
                            />
                        </div>
                    )}

                    {!isView && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            <div>
                                <label style={{
                                    display: 'block', fontSize: 9, fontWeight: 700, color: theme.accent,
                                    letterSpacing: '0.15em', marginBottom: 7
                                }}>FROM (day)</label>
                                <input 
                                    type="number" 
                                    value={sd} 
                                    onChange={e => setSd(e.target.value)}
                                    min={1} max={31} 
                                    placeholder="e.g. 5" 
                                    style={iStyle} 
                                />
                            </div>
                            <div>
                                <label style={{
                                    display: 'block', fontSize: 9, fontWeight: 700, color: theme.accent,
                                    letterSpacing: '0.15em', marginBottom: 7
                                }}>TO (day)</label>
                                <input 
                                    type="number" 
                                    value={ed} 
                                    onChange={e => setEd(e.target.value)}
                                    min={1} max={31} 
                                    placeholder="optional" 
                                    style={iStyle} 
                                />
                            </div>
                        </div>
                    )}

                    <div style={{
                        display: 'flex', gap: 10, marginTop: 4,
                        paddingTop: 16, borderTop: `1px solid ${theme.border}`,
                    }}>
                        {isView ? (
                            <>
                                <button onClick={onEdit} className="ibtn" style={{
                                    flex: 1, padding: '11px 16px', borderRadius: 11, border: 'none',
                                    background: theme.accent, color: '#fff', fontWeight: 600, fontSize: 13.5,
                                    letterSpacing: '0.03em', cursor: 'pointer',
                                    boxShadow: `0 4px 16px ${rgba(theme.accent, 0.38)}`,
                                }}>Edit Note</button>
                                <button onClick={() => note?.id && onDelete(note.id)} className="ibtn" style={{
                                    padding: '11px 16px', borderRadius: 11,
                                    border: `1px solid rgba(200,50,50,0.28)`,
                                    background: 'rgba(200,50,50,0.07)', cursor: 'pointer',
                                    color: '#c43232', fontWeight: 600, fontSize: 13,
                                }}>Delete</button>
                            </>
                        ) : (
                            <>
                                <button onClick={() => onSave({ 
                                    title, desc, 
                                    startDay: sd ? +sd : null, 
                                    endDay: ed ? +ed : null 
                                })} className="ibtn" style={{
                                    flex: 1, padding: '11px 16px', borderRadius: 11, border: 'none',
                                    background: theme.accent, color: '#fff', fontWeight: 600, fontSize: 13.5,
                                    letterSpacing: '0.03em', cursor: 'pointer',
                                    boxShadow: `0 4px 16px ${rgba(theme.accent, 0.38)}`,
                                }}>Save Note</button>
                                <button onClick={onClose} className="ibtn" style={{
                                    padding: '11px 18px', borderRadius: 11, cursor: 'pointer',
                                    border: `1px solid ${br}`, background: 'transparent',
                                    color: muted, fontWeight: 600, fontSize: 13,
                                }}>Cancel</button>
                            </>
                        )}
                    </div>
                </div>
            </div>
            
            <style>{`
                @keyframes backdropIn {
                    from { opacity: 0 }
                    to { opacity: 1 }
                }
                @keyframes modalSlideUp {
                    from { opacity: 0; transform: translateY(32px) scale(0.94) }
                    to { opacity: 1; transform: translateY(0) scale(1) }
                }
            `}</style>
        </div>
    );
}
