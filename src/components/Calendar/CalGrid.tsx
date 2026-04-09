'use client';

import React, { useMemo } from 'react';
import { CalDay } from './CalDay';
import { ThemeConfig, DateRange, Note } from '../../types/calendar.types';
import { getDIM, getFirst } from '../../utils/calendar.utils';
import { DAYS_S, TODAY } from '../../constants/calendar.constants';

export interface CalGridProps {
    year: number;
    month: number;
    theme: ThemeConfig;
    ranges: DateRange[];
    picking: boolean;
    onDay: (day: number) => void;
    notes: Note[];
    heatmap: boolean;
}

export function CalGrid({ year, month, theme, ranges, picking, onDay, notes, heatmap }: CalGridProps) {
    const dim = getDIM(year, month);
    const first = getFirst(year, month);
    const pDim = getDIM(year, month === 0 ? 11 : month - 1);
    
    const cells: { d: number; cur: boolean }[] = [];
    
    for (let i = first - 1; i >= 0; i--) {
        cells.push({ d: pDim - i, cur: false });
    }
    for (let d = 1; d <= dim; d++) {
        cells.push({ d, cur: true });
    }
    while (cells.length < 42) {
        cells.push({ d: cells.length - first - dim + 1, cur: false });
    }

    const countMap = useMemo(() => {
        const m: Record<number, number> = {};
        notes.forEach(n => {
            if (n.startDay == null) return;
            const s = n.startDay;
            const e = n.endDay || n.startDay;
            for (let d = s; d <= e; d++) {
                m[d] = (m[d] || 0) + 1;
            }
        });
        return m;
    }, [notes]);

    const maxCount = useMemo(() => {
        const counts = Object.values(countMap);
        return counts.length > 0 ? Math.max(...counts) : 0;
    }, [countMap]);

    return (
        <div style={{ padding: '8px 14px 14px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', marginBottom: 4 }}>
                {DAYS_S.map(d => (
                    <div key={d} style={{
                        textAlign: 'center', fontSize: 9.5, fontWeight: 600,
                        color: theme.textMuted, letterSpacing: '0.11em', padding: '4px 0'
                    }}>
                        {d}
                    </div>
                ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 1 }}>
                {cells.map((c, i) => {
                    const nc = c.cur ? (countMap[c.d] || 0) : 0;
                    const iR = c.cur && ranges.some(r => {
                        const d = new Date(year, month, c.d);
                        return d > new Date(r.sy, r.sm, r.sd) && d < new Date(r.ey, r.em, r.ed);
                    });
                    const iS = c.cur && ranges.some(r => r.sd === c.d && r.sm === month && r.sy === year);
                    const iE = c.cur && ranges.some(r => r.ed === c.d && r.em === month && r.ey === year);
                    const iT = c.cur && c.d === TODAY.getDate() && month === TODAY.getMonth() && year === TODAY.getFullYear();
                    
                    return (
                        <div key={i} style={{ display: 'flex', justifyContent: 'center' }}>
                            <CalDay 
                                day={c.d} 
                                cur={c.cur} 
                                isToday={iT}
                                theme={theme} 
                                inRange={iR} 
                                isStart={iS} 
                                isEnd={iE}
                                noteCount={nc} 
                                maxCount={maxCount}
                                heatmap={heatmap} 
                                picking={picking} 
                                onClick={onDay} 
                            />
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
