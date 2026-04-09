export interface ThemeConfig {
    name: string;
    img: string;
    accent: string;
    bg: string;
    cardBg: string;
    surface: string;
    elevated: string;
    textPrimary: string;
    textSecondary: string;
    textMuted: string;
    border: string;
    borderAccent: string;
    inputBg: string;
    noteBg: (index: number) => string;
    dark: boolean;
}

export interface DateRange {
    id: string;
    sd: number;
    sm: number;
    sy: number;
    ed: number;
    em: number;
    ey: number;
}

export interface Note {
    id: string;
    title?: string;
    desc?: string;
    startDay?: number | null;
    endDay?: number | null;
}

export interface CalendarDayProps {
    day: number;
    cur: boolean;
    isToday: boolean;
    theme: ThemeConfig;
    inRange: boolean;
    isStart: boolean;
    isEnd: boolean;
    noteCount: number;
    maxCount: number;
    heatmap: boolean;
    picking: boolean;
    onClick: (day: number) => void;
}

export interface NoteDB {
    [key: string]: Note[];
}

export interface ModalState {
    mode: 'create' | 'view' | 'edit';
    note: Partial<Note>;
}

export interface DateRangeTooltip {
    sd: number;
    ed: number;
}
