'use client';

import React, { useState, useRef } from 'react';
import { ThemeConfig } from '../../types/calendar.types';

export interface HeroImageProps {
    month: number;
    year: number;
    theme: ThemeConfig;
    custom: string | null;
    onUpload: (img: string) => void;
}

export function HeroImage({ month, year, theme, custom, onUpload }: HeroImageProps) {
    const [err, setErr] = useState(false);
    const ref = useRef<HTMLInputElement>(null);
    const src = (!err && custom) ? custom : theme.img;

    return (
        <div style={{ position: 'relative', height: 192, overflow: 'hidden', flexShrink: 0 }}>
            <img 
                src={src} 
                alt={theme.name} 
                onError={() => setErr(true)}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'opacity 0.4s' }} 
            />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(165deg,transparent 20%,rgba(0,0,0,0.62) 100%)' }} />
            <div style={{ position: 'absolute', bottom: 18, left: 22, color: '#fff' }}>
                <div style={{
                    fontFamily: "'Playfair Display',serif", 
                    fontSize: 28, 
                    fontWeight: 700, 
                    letterSpacing: '-0.01em',
                    textShadow: '0 2px 14px rgba(0,0,0,0.5)', 
                    lineHeight: 1.1
                }}>
                    {theme.name}
                </div>
                <div style={{ fontSize: 12.5, opacity: 0.72, marginTop: 3, letterSpacing: '0.07em' }}>{year}</div>
            </div>
            
            <button 
                onClick={() => ref.current?.click()} 
                className="ibtn" 
                style={{
                    position: 'absolute', 
                    top: 13, 
                    right: 13,
                    background: 'rgba(255,255,255,0.15)', 
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.28)', 
                    borderRadius: 7,
                    color: '#fff', 
                    padding: '5px 12px', 
                    fontSize: 10, 
                    fontWeight: 600, 
                    letterSpacing: '0.09em',
                    cursor: 'pointer',
                    transition: 'all 0.15s'
                }}
            >
                UPLOAD
            </button>
            <input 
                ref={ref} 
                type="file" 
                accept="image/*" 
                style={{ display: 'none' }}
                onChange={e => {
                    const f = e.target.files?.[0]; 
                    if (!f) return;
                    const r = new FileReader();
                    r.onload = ev => { 
                        if (ev.target?.result && typeof ev.target.result === 'string') {
                            onUpload(ev.target.result); 
                            setErr(false);
                        }
                    };
                    r.readAsDataURL(f);
                }} 
            />
        </div>
    );
}
