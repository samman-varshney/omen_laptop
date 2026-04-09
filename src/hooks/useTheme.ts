'use client';

import { useState, useEffect, useMemo } from 'react';
import { BASE_THEMES } from '../constants/calendar.constants';
import { extractAccent, shiftHex, rgba } from '../utils/calendar.utils';
import { ThemeConfig } from '../types/calendar.types';

// Manages calendar theme selection, dynamic hex accent extraction, and light/dark color generation
export function useTheme(month: number, dark: boolean, customImg: string | null): ThemeConfig {
    const base = BASE_THEMES[month];
    const [extracted, setExtracted] = useState<string | null>(null);

    useEffect(() => {
        if (!customImg) {
            setExtracted(null);
            return;
        }
        extractAccent(customImg, (color) => setExtracted(color));
    }, [customImg]);

    return useMemo(() => {
        const accent = extracted || base.accent;
        const accentLight = shiftHex(accent, 80);
        const accentXLight = shiftHex(accent, 110);

        const D = {
            bg: '#121212',
            surface: '#1A1A1A',
            card: '#242424',
            elevated: '#2E2E2E',
            text: '#EFEFEF',
            textSub: '#A0A0A0',
            textMuted: '#585858',
            border: 'rgba(255,255,255,0.07)',
            borderAccent: rgba(accent, 0.38),
            inputBg: '#2E2E2E',
            noteTints: ['#2A2A2A', '#262626', '#2C2C2C', '#282828'],
        };

        const L = {
            bg: `#${accentXLight.slice(1)}22` || '#F7F7F7',
            surface: '#F4F4F4',
            card: '#FFFFFF',
            elevated: '#FFFFFF',
            text: '#1A1A1A',
            textSub: '#6B6B6B',
            textMuted: '#B0B0B0',
            border: 'rgba(0,0,0,0.07)',
            borderAccent: rgba(accent, 0.22),
            inputBg: rgba(accent, 0.045),
            noteTints: [
                rgba(accent, 0.08),
                rgba(accent, 0.12),
                rgba(accent, 0.065),
                rgba(accent, 0.10),
            ],
        };

        const p = dark ? D : L;

        return {
            name: base.name,
            img: base.img,
            accent,
            bg: p.bg,
            cardBg: p.card,
            surface: p.surface,
            elevated: p.elevated,
            textPrimary: p.text,
            textSecondary: p.textSub,
            textMuted: p.textMuted,
            border: p.border,
            borderAccent: p.borderAccent,
            inputBg: p.inputBg,
            noteBg: (i: number) => p.noteTints[i % 4],
            dark,
        };
    }, [base, extracted, dark]);
}
