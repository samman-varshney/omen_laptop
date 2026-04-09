'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { HeroImage } from './HeroImage';
import { CalGrid } from './CalGrid';
import { NotesBoard } from './NotesBoard';
import { NoteModal } from './NoteModal';

import { useTheme } from '../../hooks/useTheme';
import { useNotes } from '../../hooks/useNotes';
import { useWindowWidth } from '../../hooks/useWindowWidth';

import { TODAY, MONTHS } from '../../constants/calendar.constants';
import { rgba, uid } from '../../utils/calendar.utils';
import { DateRange, Note, ModalState, DateRangeTooltip } from '../../types/calendar.types';

export default function Calendar() {
    const [year, setYear] = useState<number>(TODAY.getFullYear());
    const [month, setMonth] = useState<number>(TODAY.getMonth());
    const [dark, setDark] = useState<boolean>(false);
    const [heatmap, setHeatmap] = useState<boolean>(false);
    const [customImgs, setCustomImgs] = useState<Record<string, string>>({});
    
    useEffect(() => {
        try {
            const stored = localStorage.getItem('calendar_imgs_db');
            if (stored) {
                setCustomImgs(JSON.parse(stored));
            }
        } catch (e) {
            console.error('Failed to parse custom images from local storage', e);
        }
    }, []);
    
    const [ranges, setRanges] = useState<DateRange[]>([]);
    const [pickStart, setPickStart] = useState<{ d: number; m: number; y: number } | null>(null);
    const [rangeTooltip, setRangeTooltip] = useState<DateRangeTooltip | null>(null);
    const [modal, setModal] = useState<ModalState | null>(null);

    const calRef = useRef<HTMLDivElement>(null);
    const [calHeight, setCalHeight] = useState<number | null>(null);

    useEffect(() => {
        if (!calRef.current) return;
        const ro = new ResizeObserver((entries) => {
            for (const e of entries) {
                setCalHeight(e.contentRect.height);
            }
        });
        ro.observe(calRef.current);
        return () => ro.disconnect();
    }, []);

    const { get, add, upd, del } = useNotes();
    const mKey = `${year}::${month}`;
    const notes = get(year, month);
    const customImg = customImgs[mKey] || null;
    const handleUploadImg = (img: string) => {
        setCustomImgs(p => {
            const newState = { ...p, [mKey]: img };
            try {
                localStorage.setItem('calendar_imgs_db', JSON.stringify(newState));
            } catch (e) {
                console.error('Failed to save image to storage', e);
            }
            return newState;
        });
    };

    const theme = useTheme(month, dark, customImg);
    const w = useWindowWidth();
    const isMob = w < 700;

    const prevMonth = () => { 
        if (month === 0) { 
            setMonth(11); 
            setYear(y => y - 1); 
        } else {
            setMonth(m => m - 1); 
        }
    };
    
    const nextMonth = () => { 
        if (month === 11) { 
            setMonth(0); 
            setYear(y => y + 1); 
        } else {
            setMonth(m => m + 1); 
        }
    };

    const handleDay = useCallback((day: number) => {
        if (!pickStart) { 
            setPickStart({ d: day, m: month, y: year }); 
        } else {
            let s = pickStart;
            let e = { d: day, m: month, y: year };
            
            if (new Date(s.y, s.m, s.d) > new Date(e.y, e.m, e.d)) {
                const temp = s;
                s = e;
                e = temp;
            }
            
            const r: DateRange = { sd: s.d, sm: s.m, sy: s.y, ed: e.d, em: e.m, ey: e.y, id: uid() };
            setRanges(p => [...p, r]);
            setPickStart(null);
            setRangeTooltip({ sd: r.sd, ed: r.ed });
        }
    }, [pickStart, month, year]);

    const handleModalSave = (data: Partial<Note>) => {
        if (modal?.note?.id) {
            upd(year, month, modal.note.id, data);
        } else {
            add(year, month, data);
        }
        setModal(null);
    };

    const handleModalDelete = (id: string) => { 
        del(year, month, id); 
        setModal(null); 
    };

    const handleDirectDelete = (id: string) => { 
        del(year, month, id); 
    };

    const Btn = ({ label, active, onClick }: { label: string, active: boolean, onClick: () => void }) => (
        <button 
            onClick={onClick} 
            className="ibtn" 
            style={{
                padding: '5px 13px', 
                borderRadius: 20,
                border: `1px solid ${rgba(theme.accent, 0.35)}`,
                background: active ? theme.accent : 'transparent',
                color: active ? '#fff' : theme.accent,
                fontSize: 11, 
                fontWeight: 600, 
                letterSpacing: '0.06em',
                cursor: 'pointer',
                transition: 'all 0.15s'
            }}
        >
            {label}
        </button>
    );

    return (
        <div style={{
            fontFamily: "'DM Sans', sans-serif",
            background: theme.bg,
            minHeight: '100vh',
            padding: isMob ? '12px' : '20px 24px',
            transition: 'background 0.35s ease',
        }}>
            <style>{`
                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(8px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .ibtn:hover { opacity: 0.82; transform: translateY(-1px); }
                .ibtn:active { transform: scale(0.96) translateY(0); }
                @keyframes pinDrop {
                    from { opacity: 0; transform: translateY(-12px) scale(0.95); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
            `}</style>
            
            <div style={{
                maxWidth: 1100, 
                margin: '0 auto',
                display: isMob ? 'block' : 'grid',
                gridTemplateColumns: 'minmax(288px,358px) 1fr',
                gap: 20,
                alignItems: 'start',
            }}>
                <div 
                    ref={calRef} 
                    style={{
                        background: theme.cardBg, 
                        borderRadius: 18, 
                        overflow: 'hidden',
                        boxShadow: dark ? '0 8px 44px rgba(0,0,0,0.5)' : '0 4px 24px rgba(0,0,0,0.08)',
                        marginBottom: isMob ? 18 : 0,
                        transition: 'background 0.3s, box-shadow 0.3s',
                        display: 'flex', 
                        flexDirection: 'column',
                    }}
                >
                    <HeroImage 
                        month={month} 
                        year={year} 
                        theme={theme} 
                        custom={customImg}
                        onUpload={handleUploadImg} 
                    />

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px 4px' }}>
                        <button 
                            onClick={prevMonth} 
                            style={{
                                background: 'none', border: 'none', cursor: 'pointer',
                                fontSize: 22, color: theme.accent, padding: '2px 8px', lineHeight: 1
                            }}
                        >
                            ‹
                        </button>
                        <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 15.5, fontWeight: 700, color: theme.textPrimary }}>
                            {MONTHS[month]} {year}
                        </div>
                        <button 
                            onClick={nextMonth} 
                            style={{
                                background: 'none', border: 'none', cursor: 'pointer',
                                fontSize: 22, color: theme.accent, padding: '2px 8px', lineHeight: 1
                            }}
                        >
                            ›
                        </button>
                    </div>

                    {pickStart && (
                        <div style={{
                            margin: '6px 14px 0', padding: '8px 13px', borderRadius: 9,
                            background: rgba(theme.accent, 0.09),
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            fontSize: 11.5, color: theme.accent, fontWeight: 500,
                            animation: 'fadeUp 0.18s ease',
                        }}>
                            <span>Click an end date to complete the range</span>
                            <button 
                                onClick={() => setPickStart(null)} 
                                style={{
                                    background: 'none', border: 'none',
                                    cursor: 'pointer', fontSize: 15, color: theme.accent, lineHeight: 1
                                }}
                            >
                                ×
                            </button>
                        </div>
                    )}

                    <CalGrid 
                        year={year} 
                        month={month} 
                        theme={theme}
                        ranges={ranges} 
                        picking={!!pickStart} 
                        onDay={handleDay}
                        notes={notes} 
                        heatmap={heatmap} 
                    />

                    {rangeTooltip && (
                        <div style={{
                            margin: '0 14px 12px', padding: '10px 14px', borderRadius: 10,
                            background: rgba(theme.accent, 0.09), border: `1px solid ${rgba(theme.accent, 0.26)}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            flexWrap: 'wrap', gap: 8, animation: 'fadeUp 0.2s ease',
                        }}>
                            <span style={{ fontSize: 12.5, color: theme.accent, fontWeight: 500 }}>
                                Day {rangeTooltip.sd}–{rangeTooltip.ed} · Add a note?
                            </span>
                            <div style={{ display: 'flex', gap: 6 }}>
                                <button 
                                    onClick={() => {
                                        setModal({ mode: 'create', note: { startDay: rangeTooltip.sd, endDay: rangeTooltip.ed } });
                                        setRangeTooltip(null);
                                    }} 
                                    className="ibtn" 
                                    style={{
                                        padding: '5px 13px', borderRadius: 7, border: 'none',
                                        background: theme.accent, color: '#fff', fontWeight: 600, fontSize: 11.5,
                                        cursor: 'pointer'
                                    }}
                                >
                                    Add Note
                                </button>
                                <button 
                                    onClick={() => setRangeTooltip(null)} 
                                    className="ibtn" 
                                    style={{
                                        padding: '5px 9px', borderRadius: 7,
                                        border: `1px solid ${rgba(theme.accent, 0.35)}`, background: 'none',
                                        color: theme.accent, fontSize: 11.5,
                                        cursor: 'pointer'
                                    }}
                                >
                                    ✕
                                </button>
                            </div>
                        </div>
                    )}

                    <div style={{ padding: '6px 14px 18px', display: 'flex', gap: 7, flexWrap: 'wrap', marginTop: 'auto' }}>
                        <Btn label={dark ? '☀ Light' : '☾ Dark'} active={false} onClick={() => setDark(d => !d)} />
                        <Btn label="⊞ Heatmap" active={heatmap} onClick={() => setHeatmap(h => !h)} />
                        <Btn label="✕ Ranges" active={false} onClick={() => { setRanges([]); setPickStart(null); setRangeTooltip(null); }} />
                    </div>
                </div>

                <NotesBoard 
                    month={month} 
                    theme={theme} 
                    notes={notes}
                    calHeight={isMob ? null : calHeight}
                    onOpenCreate={() => setModal({ mode: 'create', note: {} })}
                    onOpenNote={n => setModal({ mode: 'view', note: n })}
                    onDeleteNote={handleDirectDelete} 
                />
            </div>

            {modal && (
                <NoteModal
                    mode={modal.mode}
                    note={modal.note}
                    theme={theme}
                    onSave={handleModalSave}
                    onClose={() => setModal(null)}
                    onEdit={() => setModal(m => m ? ({ ...m, mode: 'edit' }) : null)}
                    onDelete={handleModalDelete} 
                />
            )}
        </div>
    );
}
