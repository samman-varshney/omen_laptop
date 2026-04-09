// Calculates the number of days in a given month and year
export const getDIM = (y: number, m: number): number => new Date(y, m + 1, 0).getDate();

// Determines the day of the week (0-6) for the first day of a given month
export const getFirst = (y: number, m: number): number => new Date(y, m, 1).getDay();

// Generates a random unique identifier
export const uid = (): string => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

// Converts a hex color string to an rgba format with given alpha
export const rgba = (hex: string, a: number): string => {
    if (!hex || hex.length < 7) return `rgba(128,128,128,${a})`;
    const r = parseInt(hex.slice(1, 3), 16),
        g = parseInt(hex.slice(3, 5), 16),
        b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${a})`;
};

// Shifts a hex color brightness by a specified amount (clamped 0-255)
export const shiftHex = (hex: string, amount: number): string => {
    const r = parseInt(hex.slice(1, 3), 16),
        g = parseInt(hex.slice(3, 5), 16),
        b = parseInt(hex.slice(5, 7), 16);
    const clamp = (v: number) => Math.max(0, Math.min(255, v + amount));
    return `#${clamp(r).toString(16).padStart(2, '0')}${clamp(g).toString(16).padStart(2, '0')}${clamp(b).toString(16).padStart(2, '0')}`;
};

// Scales a base hex color's lightness & saturation smoothly based on intensity (0 to 1) for heatmaps
export function heatmapColor(hex: string, intensity: number): string {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max === min) { h = s = 0; }
    else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
            case g: h = ((b - r) / d + 2) / 6; break;
            default: h = ((r - g) / d + 4) / 6;
        }
    }

    const targetL = 0.82 - intensity * 0.54;
    const targetS = Math.min(0.85, 0.30 + intensity * 0.55);
    const hue = h * 360;

    function hslToRgb(h: number, s: number, l: number) {
        const a = s * Math.min(l, 1 - l);
        const f = (n: number) => {
            const k = (n + h / 30) % 12;
            return l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        };
        return [Math.round(f(0) * 255), Math.round(f(8) * 255), Math.round(f(4) * 255)];
    }

    const [rr, gg, bb] = hslToRgb(hue, targetS, targetL);
    return `rgb(${rr},${gg},${bb})`;
}

// Extracts the dominant accent color from a given image data URL via a canvas
export function extractAccent(dataUrl: string, cb: (color: string | null) => void): void {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
        try {
            const c = document.createElement('canvas');
            c.width = c.height = 24;
            const ctx = c.getContext('2d');
            if (!ctx) {
                cb(null);
                return;
            }
            ctx.drawImage(img, 0, 0, 24, 24);
            const px = ctx.getImageData(0, 0, 24, 24).data;
            let rs = 0, gs = 0, bs = 0, n = 0;
            for (let i = 0; i < px.length; i += 16) {
                const r = px[i], g = px[i + 1], b = px[i + 2];
                const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
                const sat = mx === 0 ? 0 : (mx - mn) / mx;
                const lum = (r * 299 + g * 587 + b * 114) / 1000;
                if (sat > 0.2 && lum > 25 && lum < 225) { rs += r; gs += g; bs += b; n++; }
            }
            if (!n) { cb(null); return; }
            const avg = (rs / n + gs / n + bs / n) / 3;
            const boost = 1.5;
            const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
            const fr = clamp(avg + (rs / n - avg) * boost);
            const fg = clamp(avg + (gs / n - avg) * boost);
            const fb = clamp(avg + (bs / n - avg) * boost);
            cb(`#${fr.toString(16).padStart(2, '0')}${fg.toString(16).padStart(2, '0')}${fb.toString(16).padStart(2, '0')}`);
        } catch { cb(null); }
    };
    img.onerror = () => cb(null);
    img.src = dataUrl;
}
