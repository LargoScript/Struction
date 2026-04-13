import React, { useState, useEffect } from 'react';

// ─── Shared CMS form controls ─────────────────────────────────────────────────
// Used by FieldEditor, ListEditor, and EffectsEditor.

export const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="space-y-1.5">
    <label className="block text-[11px] font-medium text-zinc-400 uppercase tracking-wider">{label}</label>
    {children}
  </div>
);

export const TextInput: React.FC<{
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
  placeholder?: string;
}> = ({ value, onChange, multiline, placeholder }) => {
  const [local, setLocal] = useState(value);
  const [focused, setFocused] = useState(false);
  useEffect(() => { if (!focused) setLocal(value); }, [value, focused]);
  const cls = "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-600 focus:border-indigo-500 focus:outline-none transition-colors resize-none";
  if (multiline) return (
    <textarea rows={3} className={cls} value={local} placeholder={placeholder}
      onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
      onChange={e => { setLocal(e.target.value); onChange(e.target.value); }} />
  );
  return (
    <input type="text" className={cls} value={local} placeholder={placeholder}
      onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
      onChange={e => { setLocal(e.target.value); onChange(e.target.value); }} />
  );
};

export const NumberSlider: React.FC<{
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (v: number) => void;
}> = ({ value, min, max, step, onChange }) => {
  const [local, setLocal] = useState(value);
  const [dragging, setDragging] = useState(false);
  useEffect(() => { if (!dragging) setLocal(value); }, [value, dragging]);
  return (
    <div className="flex items-center gap-2">
      <input type="range" min={min} max={max} step={step || 1} value={local}
        onPointerDown={() => setDragging(true)} onPointerUp={() => setDragging(false)}
        onChange={e => { const v = parseFloat(e.target.value); setLocal(v); onChange(v); }}
        className="flex-1 accent-indigo-500 h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer" />
      <span className="text-[10px] text-zinc-500 w-8 text-right font-mono">{local}</span>
    </div>
  );
};

const parseColor = (s: string) => {
  if (!s) return { hex: '#000000', alpha: 1 };
  if (s === 'transparent') return { hex: '#000000', alpha: 0 };
  if (s.startsWith('#')) {
    let h = s; if (h.length === 4) h = '#' + h[1] + h[1] + h[2] + h[2] + h[3] + h[3];
    return { hex: h, alpha: 1 };
  }
  if (s.startsWith('rgb')) {
    const m = s.match(/[\d.]+/g);
    if (m && m.length >= 3) {
      const toH = (n: number) => { const x = Math.min(255, Math.max(0, n)).toString(16); return x.length === 1 ? '0' + x : x; };
      return { hex: `#${toH(+m[0])}${toH(+m[1])}${toH(+m[2])}`, alpha: m[3] ? parseFloat(m[3]) : 1 };
    }
  }
  return { hex: '#000000', alpha: 1 };
};

const toRgba = (hex: string, a: number) => {
  const c = hex.replace('#', '');
  const r = parseInt(c.substring(0, 2), 16), g = parseInt(c.substring(2, 4), 16), b = parseInt(c.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
};

export const ColorPicker: React.FC<{ value: string; onChange: (v: string) => void }> = ({ value, onChange }) => {
  const p = parseColor(value);
  const [hex, setHex] = useState(p.hex);
  const [alpha, setAlpha] = useState(p.alpha);
  const [dragging, setDragging] = useState(false);
  useEffect(() => {
    if (dragging) return;
    const np = parseColor(value);
    if (np.hex !== hex) setHex(np.hex);
    if (np.alpha !== alpha) setAlpha(np.alpha);
  }, [value, dragging]);
  return (
    <div className="flex gap-2 items-center">
      <input type="color" value={hex}
        onChange={e => { setHex(e.target.value); onChange(toRgba(e.target.value, alpha)); }}
        className="h-7 w-9 rounded cursor-pointer border-0 bg-transparent p-0" />
      <div className="flex-1">
        <input type="range" min="0" max="1" step="0.01" value={alpha}
          onPointerDown={() => setDragging(true)} onPointerUp={() => setDragging(false)}
          onChange={e => { const a = parseFloat(e.target.value); setAlpha(a); onChange(toRgba(hex, a)); }}
          className="w-full accent-indigo-500 h-1 bg-zinc-700 rounded-lg appearance-none" />
      </div>
      <span className="text-[10px] text-zinc-500 font-mono w-14 truncate">{value}</span>
    </div>
  );
};

export const Toggle: React.FC<{ value: boolean; onChange: (v: boolean) => void }> = ({ value, onChange }) => (
  <button onClick={() => onChange(!value)}
    className={`w-10 h-5 rounded-full p-0.5 transition-colors relative ${value ? 'bg-green-600' : 'bg-zinc-700'}`}>
    <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${value ? 'translate-x-5' : 'translate-x-0'}`} />
  </button>
);

export const AddBtn: React.FC<{ label: string; onClick: () => void }> = ({ label, onClick }) => (
  <button onClick={onClick}
    className="w-full border border-dashed border-zinc-700 hover:border-indigo-500 text-zinc-500 hover:text-indigo-400 py-2 rounded-lg text-xs transition-colors mt-1">
    + {label}
  </button>
);

export const DeleteBtn: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <button onClick={e => { e.stopPropagation(); onClick(); }}
    className="text-zinc-600 hover:text-red-400 transition-colors p-1 rounded shrink-0" title="Delete">
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  </button>
);

export const Chevron: React.FC<{ open: boolean }> = ({ open }) => (
  <svg className={`w-3 h-3 text-zinc-600 transition-transform shrink-0 ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
  </svg>
);

export const CollapsibleItem: React.FC<{
  label: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  onDelete: () => void;
  children: React.ReactNode;
}> = ({ label, isOpen, onToggle, onDelete, children }) => (
  <div className="border border-zinc-800 rounded-lg overflow-hidden">
    <div className="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-zinc-800/40 transition-colors gap-2" onClick={onToggle}>
      <div className="flex items-center gap-2 min-w-0">{label}</div>
      <div className="flex items-center gap-1 shrink-0">
        <DeleteBtn onClick={onDelete} />
        <Chevron open={isOpen} />
      </div>
    </div>
    {isOpen && <div className="px-3 pb-3 pt-3 space-y-3 border-t border-zinc-800">{children}</div>}
  </div>
);

// Re-export parseColor/toRgba for EffectsEditor that lives outside the framework
export { parseColor, toRgba };
