"use client";
import React, { useState, useEffect, useRef } from 'react';
import GradientMesh from './backgrounds/GradientMesh';
import ParticleNetwork from './backgrounds/ParticleNetwork';
import RetroGrid from './backgrounds/RetroGrid';
import FloatingShapes from './backgrounds/FloatingShapes';
import Waves from './backgrounds/Waves';
import LavaLamp from './backgrounds/LavaLamp';
import { effectSchemas, defaultConfigs } from '../lib/schemas';

// --- Helpers ---

const parseColorValue = (colorStr: string) => {
  if (!colorStr) return { hex: '#000000', alpha: 1 };
  if (colorStr === 'transparent') return { hex: '#000000', alpha: 0 };
  if (colorStr.startsWith('#')) return { hex: colorStr, alpha: 1 };
  if (colorStr.startsWith('rgb')) {
    const match = colorStr.match(/[\d.]+/g);
    if (match && match.length >= 3) {
      const r = parseInt(match[0]);
      const g = parseInt(match[1]);
      const b = parseInt(match[2]);
      const a = match[3] ? parseFloat(match[3]) : 1;
      const toHex = (n: number) => { const hex = n.toString(16); return hex.length === 1 ? '0' + hex : hex; };
      return { hex: `#${toHex(r)}${toHex(g)}${toHex(b)}`, alpha: a };
    }
  }
  return { hex: '#000000', alpha: 1 };
};

const toRgbaString = (hex: string, alpha: number) => {
  let r = 0, g = 0, b = 0;
  if (hex.length === 4) {
    r = parseInt("0x" + hex[1] + hex[1]);
    g = parseInt("0x" + hex[2] + hex[2]);
    b = parseInt("0x" + hex[3] + hex[3]);
  } else if (hex.length === 7) {
    r = parseInt("0x" + hex[1] + hex[2]);
    g = parseInt("0x" + hex[3] + hex[4]);
    b = parseInt("0x" + hex[5] + hex[6]);
  }
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const generateId = () => Math.random().toString(36).substr(2, 9);
const STORAGE_KEY = 'dbk_layers_config_v2';

// --- Types ---

type BackgroundType = 'Particle Network' | 'Gradient Mesh' | 'Retro Grid' | 'Sine Waves' | 'Floating Shapes' | 'Lava Lamp';
type ViewportMode = 'fullscreen' | 'card' | 'button';

interface Layer {
  id: string;
  type: BackgroundType;
  config: any;
  visible: boolean;
}

const COMPONENTS: Record<BackgroundType, React.FC<any>> = {
  'Particle Network': ParticleNetwork,
  'Gradient Mesh': GradientMesh,
  'Retro Grid': RetroGrid,
  'Sine Waves': Waves,
  'Floating Shapes': FloatingShapes,
  'Lava Lamp': LavaLamp,
};

const Sandbox: React.FC = () => {
  const [layers, setLayers] = useState<Layer[]>(() => {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) return JSON.parse(saved);
    } catch (e) { console.error(e); }
    return [
        { id: generateId(), type: 'Gradient Mesh', config: defaultConfigs['Gradient Mesh'], visible: true },
        { id: generateId(), type: 'Particle Network', config: { ...defaultConfigs['Particle Network'], backgroundColor: 'transparent' }, visible: true },
    ];
  });

  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(layers[0]?.id || null);
  const [showUI, setShowUI] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [viewportMode, setViewportMode] = useState<ViewportMode>('fullscreen');
  const [editorMode, setEditorMode] = useState<'ui' | 'json' | 'code'>('ui');
  const [codeContainerTag, setCodeContainerTag] = useState<string>('div');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Persistence
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(layers));
  }, [layers]);

  // Close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setIsDropdownOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const addLayer = (type: BackgroundType) => {
    const newLayer: Layer = {
      id: generateId(),
      type,
      config: JSON.parse(JSON.stringify(defaultConfigs[type])), 
      visible: true,
    };
    if (layers.length > 0 && newLayer.config.backgroundColor) newLayer.config.backgroundColor = 'transparent'; 
    setLayers([...layers, newLayer]);
    setSelectedLayerId(newLayer.id);
    setIsDropdownOpen(false);
  };

  const removeLayer = (id: string) => {
    setLayers(layers.filter(l => l.id !== id));
    if (selectedLayerId === id) setSelectedLayerId(null);
  };

  const updateConfig = (id: string, key: string, value: any) => {
    setLayers(layers.map(l => {
      if (l.id !== id) return l;
      return { ...l, config: { ...l.config, [key]: value } };
    }));
  };

  // Replace entire config (for JSON editor)
  const replaceLayerConfig = (id: string, newConfig: any) => {
      setLayers(layers.map(l => l.id === id ? { ...l, config: newConfig } : l));
  };

  const selectedLayer = layers.find(l => l.id === selectedLayerId);

  // --- Code Generation Helper ---
  const generateCode = (layer: Layer, tag: string) => {
      const compName = layer.type.replace(/\s/g, '');
      return `<${tag} className="relative w-full h-screen overflow-hidden">\n` +
             `  <${compName} \n` +
             `    config={${JSON.stringify(layer.config, null, 2).replace(/^/gm, '    ')}} \n` +
             `  />\n` +
             `  <div className="relative z-10">\n` +
             `    {/* Your Content Here */}\n` +
             `  </div>\n` +
             `</${tag}>`;
  };

  // --- Render Scene ---
  const renderLayers = () => (
    <>
      {layers.map((layer, index) => {
        if (!layer.visible) return null;
        const Component = COMPONENTS[layer.type];
        return (
          <div 
            key={layer.id} 
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ zIndex: index, borderRadius: 'inherit' }} 
          >
            <div className="w-full h-full pointer-events-auto" style={{ borderRadius: 'inherit', overflow: 'hidden' }}>
                <Component config={layer.config} />
            </div>
          </div>
        );
      })}
    </>
  );

  return (
    <div className="relative w-full h-screen overflow-hidden bg-zinc-950 text-white font-sans">
      
      {/* --- TOP BAR (Viewport) --- */}
      <div className="absolute top-0 left-0 w-full h-14 bg-zinc-900/50 backdrop-blur-sm border-b border-zinc-800 z-40 flex items-center justify-center gap-4">
        <span className="text-zinc-500 text-xs font-bold uppercase tracking-wider">Viewport:</span>
        <button onClick={() => setViewportMode('fullscreen')} className={`px-3 py-1 rounded text-sm ${viewportMode === 'fullscreen' ? 'bg-indigo-600 text-white' : 'text-zinc-400 hover:text-white'}`}>Full Screen</button>
        <button onClick={() => setViewportMode('card')} className={`px-3 py-1 rounded text-sm ${viewportMode === 'card' ? 'bg-indigo-600 text-white' : 'text-zinc-400 hover:text-white'}`}>Card (Div)</button>
        <button onClick={() => setViewportMode('button')} className={`px-3 py-1 rounded text-sm ${viewportMode === 'button' ? 'bg-indigo-600 text-white' : 'text-zinc-400 hover:text-white'}`}>Button</button>
      </div>

      {/* --- RENDER AREA --- */}
      <div className="absolute top-14 left-0 right-0 bottom-0 bg-neutral-900 overflow-hidden flex items-center justify-center">
        {viewportMode === 'fullscreen' && (
             <div className="w-full h-full relative">
                 {renderLayers()}
                 <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                     <h1 className="text-4xl font-bold text-white drop-shadow-lg opacity-80 mix-blend-overlay">Content Overlay</h1>
                 </div>
             </div>
        )}
        {viewportMode === 'card' && (
            <div className="relative w-96 h-64 bg-white/5 rounded-2xl shadow-2xl border border-white/10 overflow-hidden">
                {renderLayers()}
                <div className="relative z-20 p-8 flex flex-col justify-end h-full pointer-events-none">
                    <h2 className="text-2xl font-bold mb-2">Glass Card</h2>
                    <p className="text-sm opacity-80">Background demo inside a container.</p>
                </div>
            </div>
        )}
        {viewportMode === 'button' && (
            <div className="relative group cursor-pointer">
                <div className="relative overflow-hidden rounded-full w-48 h-14 ring-1 ring-white/20">
                    {renderLayers()}
                    <div className="absolute inset-0 flex items-center justify-center z-20 font-bold tracking-wide">HOVER ME</div>
                </div>
            </div>
        )}
      </div>

      {/* --- UI TOGGLE --- */}
      <button onClick={() => setShowUI(!showUI)} className="fixed top-20 right-4 z-50 bg-white/10 backdrop-blur text-white p-2 rounded-full hover:bg-white/20 transition">
        {showUI ? '👁️' : '⚙️'}
      </button>

      {/* --- SETTINGS PANEL --- */}
      {showUI && (
        <div className="fixed top-20 right-16 bottom-4 w-80 bg-zinc-900/95 backdrop-blur-md border border-zinc-700 shadow-2xl rounded-2xl flex flex-col z-50 overflow-hidden text-sm">
            
            {/* Layers Header */}
            <div className="p-4 border-b border-zinc-700 bg-zinc-800/50">
                 <div className="flex justify-between items-center mb-4">
                    <h2 className="text-white font-bold">Layers</h2>
                    <div className="relative" ref={dropdownRef}>
                        <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="text-emerald-400 hover:text-emerald-300 font-bold text-xs bg-emerald-400/10 px-2 py-1 rounded">
                            + ADD NEW
                        </button>
                        {isDropdownOpen && (
                            <div className="absolute right-0 top-full mt-1 bg-zinc-800 border border-zinc-600 rounded shadow-xl w-48 py-1 z-50">
                                {Object.keys(COMPONENTS).map(type => (
                                    <button key={type} onClick={() => addLayer(type as BackgroundType)} className="block w-full text-left px-4 py-2 hover:bg-zinc-700 transition-colors">
                                        {type}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
                <div className="space-y-1 max-h-32 overflow-y-auto pr-1">
                    {layers.map((layer) => (
                        <div key={layer.id} onClick={() => setSelectedLayerId(layer.id)} className={`p-2 rounded border cursor-pointer flex items-center gap-2 ${selectedLayerId === layer.id ? 'bg-indigo-600/20 border-indigo-500' : 'bg-zinc-800 border-transparent hover:border-zinc-600'}`}>
                             <input type="checkbox" checked={layer.visible} onChange={(e) => {
                                 e.stopPropagation();
                                 setLayers(prev => prev.map(l => l.id === layer.id ? {...l, visible: e.target.checked} : l));
                             }} />
                             <span className="flex-1 truncate text-xs font-medium">{layer.type}</span>
                             <button onClick={(e) => {e.stopPropagation(); removeLayer(layer.id)}} className="text-red-400 font-bold px-1">×</button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Config Area */}
            {selectedLayer ? (
                <div className="flex-1 flex flex-col overflow-hidden">
                    <div className="flex border-b border-zinc-700 bg-zinc-800/30">
                        <button onClick={() => setEditorMode('ui')} className={`flex-1 py-2 text-xs font-bold ${editorMode === 'ui' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-zinc-500 hover:text-white'}`}>CONTROLS</button>
                        <button onClick={() => setEditorMode('json')} className={`flex-1 py-2 text-xs font-bold ${editorMode === 'json' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-zinc-500 hover:text-white'}`}>{`{ } JSON`}</button>
                        <button onClick={() => setEditorMode('code')} className={`flex-1 py-2 text-xs font-bold ${editorMode === 'code' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-zinc-500 hover:text-white'}`}>{`< > CODE`}</button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4">
                        {/* UI MODE */}
                        {editorMode === 'ui' && (
                            <div className="space-y-5">
                                {effectSchemas[selectedLayer.type]?.map(field => (
                                    <div key={field.key} className="space-y-1">
                                        <div className="flex justify-between">
                                            <label className="text-zinc-400 font-medium text-xs">{field.label}</label>
                                            {field.type === 'number' && <span className="text-zinc-600 text-[10px] font-mono">{selectedLayer.config[field.key]}</span>}
                                        </div>
                                        {field.type === 'color' && (
                                            <div className="flex gap-2">
                                                <input type="color" value={parseColorValue(selectedLayer.config[field.key]).hex} onChange={(e) => updateConfig(selectedLayer.id, field.key, toRgbaString(e.target.value, parseColorValue(selectedLayer.config[field.key]).alpha))} className="h-6 w-8 rounded cursor-pointer border-0 bg-transparent p-0" />
                                                <input type="range" min="0" max="1" step="0.01" value={parseColorValue(selectedLayer.config[field.key]).alpha} onChange={(e) => updateConfig(selectedLayer.id, field.key, toRgbaString(parseColorValue(selectedLayer.config[field.key]).hex, parseFloat(e.target.value)))} className="flex-1 accent-indigo-500 h-1 bg-zinc-700 rounded-lg appearance-none mt-2" />
                                            </div>
                                        )}
                                        {field.type === 'number' && (
                                            <input type="range" min={field.min} max={field.max} step={field.step || 1} value={selectedLayer.config[field.key]} onChange={(e) => updateConfig(selectedLayer.id, field.key, parseFloat(e.target.value))} className="w-full accent-indigo-500 h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer" />
                                        )}
                                        {field.type === 'boolean' && (
                                            <button onClick={() => updateConfig(selectedLayer.id, field.key, !selectedLayer.config[field.key])} className={`w-8 h-4 rounded-full p-0.5 transition-colors ${selectedLayer.config[field.key] ? 'bg-indigo-500' : 'bg-zinc-700'}`}>
                                                <div className={`w-3 h-3 bg-white rounded-full transition-transform ${selectedLayer.config[field.key] ? 'translate-x-4' : 'translate-x-0'}`} />
                                            </button>
                                        )}
                                        {field.type === 'colorArray' && Array.isArray(selectedLayer.config[field.key]) && (
                                            <div className="grid grid-cols-5 gap-1">
                                                {selectedLayer.config[field.key].map((c: string, i: number) => (
                                                    <input key={i} type="color" value={parseColorValue(c).hex} onChange={(e) => {
                                                        const arr = [...selectedLayer.config[field.key]];
                                                        arr[i] = toRgbaString(e.target.value, parseColorValue(c).alpha);
                                                        updateConfig(selectedLayer.id, field.key, arr);
                                                    }} className="w-full h-6 rounded border-0 p-0 cursor-pointer" />
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* JSON MODE */}
                        {editorMode === 'json' && (
                            <div className="h-full flex flex-col">
                                <p className="text-zinc-500 text-xs mb-2">Full configuration object:</p>
                                <textarea 
                                    className="flex-1 w-full bg-black text-green-400 font-mono text-xs p-3 rounded border border-zinc-700 focus:outline-none focus:border-indigo-500"
                                    value={JSON.stringify(selectedLayer.config, null, 2)}
                                    onChange={(e) => {
                                        try {
                                            const newCfg = JSON.parse(e.target.value);
                                            replaceLayerConfig(selectedLayer.id, newCfg);
                                        } catch(err) {}
                                    }}
                                />
                            </div>
                        )}

                         {/* CODE EXPORT MODE */}
                         {editorMode === 'code' && (
                            <div className="h-full flex flex-col">
                                <div className="mb-3">
                                    <label className="text-zinc-500 text-xs mb-1 block">Container Tag</label>
                                    <select 
                                        value={codeContainerTag} 
                                        onChange={(e) => setCodeContainerTag(e.target.value)}
                                        className="w-full bg-zinc-800 text-white text-xs p-2 rounded border border-zinc-700"
                                    >
                                        <option value="div">div</option>
                                        <option value="section">section</option>
                                        <option value="main">main</option>
                                        <option value="header">header</option>
                                        <option value="span">span</option>
                                        <option value="article">article</option>
                                    </select>
                                </div>
                                <div className="flex gap-2 mb-2">
                                     <button 
                                        onClick={() => navigator.clipboard.writeText(JSON.stringify(selectedLayer.config, null, 2))}
                                        className="flex-1 bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 py-1.5 rounded text-xs border border-indigo-600/50"
                                    >
                                        Copy Config JSON
                                    </button>
                                    <button 
                                        onClick={() => navigator.clipboard.writeText(generateCode(selectedLayer, codeContainerTag))}
                                        className="flex-1 bg-zinc-700 hover:bg-zinc-600 text-white py-1.5 rounded text-xs"
                                    >
                                        Copy JSX
                                    </button>
                                </div>
                                <div className="relative flex-1 min-h-0">
                                    <textarea 
                                        readOnly
                                        className="w-full h-full bg-black text-blue-300 font-mono text-[10px] p-3 rounded border border-zinc-700 resize-none whitespace-pre"
                                        value={generateCode(selectedLayer, codeContainerTag)}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="flex-1 flex items-center justify-center text-zinc-600">No layer selected</div>
            )}
        </div>
      )}
    </div>
  );
};

export default Sandbox;