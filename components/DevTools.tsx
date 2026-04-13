"use client";
import React, { useState, useEffect } from 'react';
import { useRegistry } from '../lib/context/RegistryContext';
import { effectSchemas } from '../lib/schemas';

// --- Helpers ---

const parseColorValue = (colorStr: string) => {
  if (!colorStr) return { hex: '#000000', alpha: 1 };
  if (colorStr === 'transparent') return { hex: '#000000', alpha: 0 };
  
  if (colorStr.startsWith('#')) {
      let hex = colorStr;
      if (hex.length === 4) {
          hex = '#' + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
      }
      return { hex: hex, alpha: 1 };
  }
  
  if (colorStr.startsWith('rgb')) {
    const match = colorStr.match(/[\d.]+/g);
    if (match && match.length >= 3) {
      const r = parseInt(match[0]);
      const g = parseInt(match[1]);
      const b = parseInt(match[2]);
      const a = match[3] ? parseFloat(match[3]) : 1;
      const toHex = (n: number) => { 
          const hex = Math.min(255, Math.max(0, n)).toString(16); 
          return hex.length === 1 ? '0' + hex : hex; 
      };
      return { hex: `#${toHex(r)}${toHex(g)}${toHex(b)}`, alpha: a };
    }
  }
  return { hex: '#000000', alpha: 1 };
};

const toRgbaString = (hex: string, alpha: number) => {
  let r = 0, g = 0, b = 0;
  const cleanHex = hex.replace('#', '');
  
  if (cleanHex.length === 3) {
    r = parseInt(cleanHex[0] + cleanHex[0], 16);
    g = parseInt(cleanHex[1] + cleanHex[1], 16);
    b = parseInt(cleanHex[2] + cleanHex[2], 16);
  } else if (cleanHex.length === 6) {
    r = parseInt(cleanHex.substring(0, 2), 16);
    g = parseInt(cleanHex.substring(2, 4), 16);
    b = parseInt(cleanHex.substring(4, 6), 16);
  }
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

// --- Atomic Control Components ---

const NumberControl = ({ value, min, max, step, onChange }: { value: number, min?: number, max?: number, step?: number, onChange: (val: number) => void }) => {
    const [localValue, setLocalValue] = useState(value);
    const [isDragging, setIsDragging] = useState(false);

    // Sync only when NOT dragging to prevent fighting the user
    useEffect(() => { 
       if (!isDragging) setLocalValue(value); 
    }, [value, isDragging]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const v = parseFloat(e.target.value);
        setLocalValue(v);
        onChange(v);
    };

    return (
        <div className="flex items-center gap-2">
            <input 
                type="range" 
                min={min} 
                max={max} 
                step={step || 1} 
                value={localValue} 
                onPointerDown={() => setIsDragging(true)}
                onPointerUp={() => setIsDragging(false)}
                // Fallback for keyboard interaction
                onKeyDown={() => setIsDragging(true)}
                onKeyUp={() => setIsDragging(false)}
                onChange={handleChange}
                className="flex-1 accent-indigo-500 h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer" 
            />
            <span className="text-[10px] text-zinc-500 w-8 text-right font-mono">{localValue}</span>
        </div>
    );
};

const ColorControl = ({ value, onChange }: { value: string, onChange: (val: string) => void }) => {
    const parsed = parseColorValue(value);
    const [hex, setHex] = useState(parsed.hex);
    const [alpha, setAlpha] = useState(parsed.alpha);
    const [isDraggingAlpha, setIsDraggingAlpha] = useState(false);

    useEffect(() => {
        // If user is dragging alpha slider, don't overwrite with old props
        if (isDraggingAlpha) return;

        const p = parseColorValue(value);
        if (p.hex !== hex) setHex(p.hex);
        if (p.alpha !== alpha) setAlpha(p.alpha);
    }, [value, isDraggingAlpha]);

    const handleHexChange = (newHex: string) => {
        setHex(newHex);
        onChange(toRgbaString(newHex, alpha));
    };

    const handleAlphaChange = (newAlpha: number) => {
        setAlpha(newAlpha);
        onChange(toRgbaString(hex, newAlpha));
    };

    return (
        <div className="flex gap-2 items-center">
            <input 
                type="color" 
                value={hex} 
                onChange={(e) => handleHexChange(e.target.value)} 
                className="h-6 w-8 rounded cursor-pointer border-0 bg-transparent p-0" 
            />
            <div className="flex-1 flex flex-col justify-center">
                <input 
                    type="range" 
                    min="0" 
                    max="1" 
                    step="0.01" 
                    value={alpha} 
                    onPointerDown={() => setIsDraggingAlpha(true)}
                    onPointerUp={() => setIsDraggingAlpha(false)}
                    onChange={(e) => handleAlphaChange(parseFloat(e.target.value))} 
                    className="w-full accent-indigo-500 h-1 bg-zinc-700 rounded-lg appearance-none" 
                />
            </div>
            <div className="text-[10px] font-mono text-zinc-500 w-16 truncate">{value}</div>
        </div>
    );
};

const TextControl = ({ value, onChange }: { value: string, onChange: (val: string) => void }) => {
    const [localValue, setLocalValue] = useState(value);
    const [isFocused, setIsFocused] = useState(false);
    
    useEffect(() => { 
        if (!isFocused) setLocalValue(value); 
    }, [value, isFocused]);

    return (
        <input 
            type="text" 
            value={localValue || ''} 
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onChange={(e) => {
                setLocalValue(e.target.value);
                onChange(e.target.value);
            }}
            className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-xs focus:border-indigo-500 focus:outline-none text-white"
        />
    );
};

// --- Main DevTools Component ---

const DevTools: React.FC = () => {
  const registry = useRegistry();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editorMode, setEditorMode] = useState<'ui' | 'json' | 'code'>('ui');

  if (!registry) return null;

  const instanceIds = Object.keys(registry.items);
  const selectedItem = selectedId ? registry.items[selectedId] : null;

  useEffect(() => {
      if (!selectedId && instanceIds.length > 0) {
          setSelectedId(instanceIds[0]);
      }
  }, [instanceIds.length, selectedId]);

  const updateConfig = (key: string, value: any) => {
      if (selectedId) {
          registry.updateConfig(selectedId, { [key]: value });
      }
  };

  return (
    <>
        <button 
            onClick={() => setIsOpen(!isOpen)}
            className="fixed bottom-4 right-4 z-[9999] bg-zinc-900 text-white p-3 rounded-full shadow-lg border border-zinc-700 hover:scale-105 transition hover:bg-zinc-800"
        >
            {isOpen ? 'Close Tools' : '🛠️ Edit Backgrounds'}
        </button>

        {isOpen && (
            <div className="fixed bottom-16 right-4 w-96 max-h-[80vh] bg-zinc-900/95 backdrop-blur shadow-2xl rounded-xl border border-zinc-700 z-[9999] flex flex-col overflow-hidden text-sm text-white font-sans">
                <div className="p-3 border-b border-zinc-700 bg-zinc-800 font-bold flex justify-between items-center">
                    <span>Config Panel</span>
                    <div className="flex gap-2">
                        <a 
                            href="/admin" 
                            target="_blank" 
                            className="text-[10px] bg-amber-600 hover:bg-amber-500 px-2 py-0.5 rounded text-white transition-colors"
                        >
                            Payload CMS 🚀
                        </a>
                        <span className="text-[10px] bg-indigo-600 px-2 py-0.5 rounded text-white">{instanceIds.length} Active</span>
                    </div>
                </div>

                <div className="p-2 border-b border-zinc-700 max-h-32 overflow-y-auto bg-zinc-950/50">
                    {instanceIds.length === 0 && <div className="text-zinc-500 italic p-2">No active modules detected.</div>}
                    {instanceIds.map(id => (
                        <div 
                            key={id} 
                            onClick={() => setSelectedId(id)}
                            className={`p-2 rounded cursor-pointer flex justify-between items-center mb-1 transition-colors ${selectedId === id ? 'bg-indigo-600' : 'hover:bg-zinc-800'}`}
                        >
                            <span className="font-mono text-xs truncate max-w-[150px]">{id}</span>
                            <span className="text-[10px] opacity-70 truncate max-w-[120px]">{registry.items[id].type}</span>
                        </div>
                    ))}
                </div>

                {selectedItem ? (
                    <div className="flex-1 flex flex-col overflow-hidden">
                        <div className="flex border-b border-zinc-700 bg-zinc-800/50">
                             <button onClick={() => setEditorMode('ui')} className={`flex-1 py-2 text-xs font-semibold ${editorMode === 'ui' ? 'text-white border-b-2 border-indigo-500' : 'text-zinc-400 hover:text-zinc-200'}`}>Controls</button>
                             <button onClick={() => setEditorMode('json')} className={`flex-1 py-2 text-xs font-semibold ${editorMode === 'json' ? 'text-white border-b-2 border-indigo-500' : 'text-zinc-400 hover:text-zinc-200'}`}>JSON</button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                            {editorMode === 'ui' ? (
                                <div className="space-y-5">
                                    {effectSchemas[selectedItem.type]?.map(field => (
                                        <div key={field.key} className="space-y-1.5">
                                            <div className="flex justify-between items-end">
                                                <label className="text-zinc-300 text-xs font-medium">{field.label}</label>
                                            </div>

                                            {field.type === 'text' && (
                                                <TextControl 
                                                    value={selectedItem.config[field.key]} 
                                                    onChange={(val) => updateConfig(field.key, val)} 
                                                />
                                            )}

                                            {field.type === 'select' && (
                                                <select 
                                                    value={selectedItem.config[field.key]} 
                                                    onChange={(e) => updateConfig(field.key, e.target.value)}
                                                    className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-xs focus:border-indigo-500 focus:outline-none text-white"
                                                >
                                                    {field.options?.map(opt => (
                                                        <option key={opt} value={opt}>{opt}</option>
                                                    ))}
                                                </select>
                                            )}

                                            {field.type === 'color' && (
                                                <ColorControl 
                                                    value={selectedItem.config[field.key]} 
                                                    onChange={(val) => updateConfig(field.key, val)} 
                                                />
                                            )}

                                            {field.type === 'number' && (
                                                <NumberControl 
                                                    value={selectedItem.config[field.key]} 
                                                    min={field.min} 
                                                    max={field.max} 
                                                    step={field.step} 
                                                    onChange={(val) => updateConfig(field.key, val)} 
                                                />
                                            )}

                                            {field.type === 'boolean' && (
                                                 <button 
                                                    onClick={() => updateConfig(field.key, !selectedItem.config[field.key])} 
                                                    className={`w-10 h-5 rounded-full p-0.5 transition-colors relative ${selectedItem.config[field.key] ? 'bg-green-600' : 'bg-zinc-700'}`}
                                                 >
                                                     <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${selectedItem.config[field.key] ? 'translate-x-5' : 'translate-x-0'}`} />
                                                 </button>
                                            )}

                                            {field.type === 'colorArray' && Array.isArray(selectedItem.config[field.key]) && (
                                                <div className="grid grid-cols-5 gap-2">
                                                    {selectedItem.config[field.key].map((c: string, i: number) => (
                                                        <div key={i} className="relative group">
                                                            <input 
                                                                type="color" 
                                                                value={parseColorValue(c).hex} 
                                                                onChange={(e) => {
                                                                    const arr = [...selectedItem.config[field.key]];
                                                                    arr[i] = toRgbaString(e.target.value, parseColorValue(c).alpha);
                                                                    updateConfig(field.key, arr);
                                                                }} 
                                                                className="w-full h-8 rounded border border-zinc-600 p-0 cursor-pointer" 
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="h-full flex flex-col">
                                    <textarea 
                                        className="flex-1 w-full bg-black text-green-400 font-mono text-[10px] p-2 rounded border border-zinc-700 resize-none focus:outline-none"
                                        value={JSON.stringify(selectedItem.config, null, 2)}
                                        onChange={(e) => {
                                            try {
                                                const newCfg = JSON.parse(e.target.value);
                                                if (selectedId) registry.updateConfig(selectedId, newCfg);
                                            } catch(err) {}
                                        }}
                                    />
                                    <button 
                                        onClick={() => navigator.clipboard.writeText(JSON.stringify(selectedItem.config, null, 2))}
                                        className="mt-2 bg-indigo-600 hover:bg-indigo-500 text-white py-1.5 rounded text-xs transition"
                                    >
                                        Copy Config Object
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="p-8 text-center text-zinc-500 flex flex-col items-center justify-center h-full">
                        <span className="text-2xl mb-2">👈</span>
                        <p>Select a module from the list above to edit its properties.</p>
                    </div>
                )}
            </div>
        )}
    </>
  );
};

export default DevTools;