'use client';

import React from 'react';
import { CalendarDayProps } from '../../types/calendar.types';
import { rgba, heatmapColor } from '../../utils/calendar.utils';

export function CalDay({ 
    day, 
    cur, 
    isToday, 
    theme, 
    inRange, 
    isStart, 
    isEnd, 
    noteCount, 
    maxCount, 
    heatmap, 
    picking, 
    onClick 
}: CalendarDayProps) {
    if (!cur) {
        return (
            <div style={{
                width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: '50%', fontSize: 12, color: theme.textMuted, userSelect: 'none'
            }}>
                {day}
            </div>
        );
    }

    let bg = 'transparent';
    let color = theme.textPrimary;
    let fw = 400;
    let border = '1.5px solid transparent';
    let textColor = theme.textPrimary;

    if (heatmap && noteCount > 0 && maxCount > 0 && !isStart && !isEnd && !inRange) {
        const intensity = noteCount / maxCount;
        bg = heatmapColor(theme.accent, intensity);
        textColor = intensity > 0.55 ? '#ffffff' : theme.textPrimary;
    }

    if (inRange) { 
        bg = rgba(theme.accent, 0.18); 
    }
    if (isStart || isEnd) { 
        bg = theme.accent; 
        textColor = '#fff'; 
        fw = 600; 
    }
    if (isToday && !isStart && !isEnd) { 
        fw = 600; 
        border = `1.5px solid ${theme.accent}`; 
    }

    return (
        <div 
            className="cal-cur" 
            onClick={() => onClick(day)} 
            style={{
                width: 34, 
                height: 34, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                borderRadius: '50%', 
                background: bg, 
                color: textColor, 
                fontWeight: fw, 
                fontSize: 12.5,
                cursor: picking ? 'crosshair' : 'pointer', 
                border, 
                position: 'relative',
                transition: 'transform 0.12s, background 0.12s',
                userSelect: 'none'
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.15)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
            }}
        >
            {day}
            {noteCount > 0 && !heatmap && (
                <div style={{
                    position: 'absolute', 
                    bottom: 3, 
                    left: '50%', 
                    transform: 'translateX(-50%)',
                    width: 3.5, 
                    height: 3.5, 
                    borderRadius: '50%',
                    background: (isStart || isEnd) ? 'rgba(255,255,255,0.78)' : theme.accent,
                }} />
            )}
        </div>
    );
}
