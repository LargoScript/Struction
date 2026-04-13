"use client";
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  ContentProvider, useContent,
} from '../lib/context/ContentContext';
import { RegistryProvider } from '../lib/context/RegistryContext';
import { ICONS, ICON_LABELS } from '../lib/icons';
import { effectSchemas, defaultConfigs } from '../lib/schemas';
import { getSectionManifest, registerSection } from '../lib/struction-cms/registry';
import CMSContentEditor from '../lib/struction-cms/CMSContentEditor';
import { Field, TextInput, NumberSlider, ColorPicker, Toggle, parseColor, toRgba } from '../lib/struction-cms/controls';
import { manifest as heroManifest } from './sections/HeroSection';
import { manifest as servicesManifest } from './sections/FeatureGrid';
import { manifest as portfolioManifest } from './sections/CarouselSection';
import { manifest as faqManifest } from './sections/FAQSection';
import { manifest as contactManifest } from './sections/Footer';

// Register all section manifests at module load time
registerSection(heroManifest);
registerSection(servicesManifest);
registerSection(portfolioManifest);
registerSection(faqManifest);
registerSection(contactManifest);
import {
  BgType, SectionEffect,
  BG_OPTIONS, BG_LABELS, BG_SCHEMA_KEY,
  loadEffects, saveEffects, DEFAULT_EFFECTS,
} from '../lib/effects';
import {
  SectionInstance, SECTION_TEMPLATES, DEFAULT_SECTIONS,
  loadSections, saveSections, addSection as addSectionMutation,
  removeSection, reorderSection, toggleVisibility,
} from '../lib/sections';

// ─── Device config ────────────────────────────────────────────────────────────

type Device = 'desktop' | 'tablet' | 'mobile';

const DEVICES: { id: Device; label: string; icon: React.ReactNode; width: number }[] = [
  {
    id: 'desktop', label: 'Desktop', width: 1280,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <path d="M8 21h8M12 17v4" />
      </svg>
    ),
  },
  {
    id: 'tablet', label: 'Tablet', width: 768,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
        <rect x="4" y="2" width="16" height="20" rx="2" />
        <circle cx="12" cy="18" r="0.75" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    id: 'mobile', label: 'Mobile', width: 390,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
        <rect x="6" y="2" width="12" height="20" rx="2" />
        <circle cx="12" cy="18" r="0.75" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
];

// ─── Content editor (manifest-driven) ────────────────────────────────────────

const ContentEditor: React.FC<{ templateId: string }> = ({ templateId }) => {
  const { activeContent, updateContent } = useContent();
  const manifest = getSectionManifest(templateId);

  return (
    <CMSContentEditor
      manifest={manifest!}
      content={activeContent}
      onUpdate={updateContent}
      onUpdateList={updateContent}
      icons={ICONS}
      iconLabels={ICON_LABELS}
    />
  );
};

// ─── Effects editor ───────────────────────────────────────────────────────────

const EffectsEditor: React.FC<{
  sectionId: string;
  effects: Record<string, SectionEffect>;
  onChange: (id: string, e: SectionEffect) => void;
}> = ({ sectionId, effects, onChange }) => {
  const effect = effects[sectionId] || { type: 'none', config: {} };

  const handleType = (type: BgType) => {
    const config = type !== 'none' ? { ...defaultConfigs[BG_SCHEMA_KEY[type]] } : {};
    onChange(sectionId, { type, config });
  };

  const handleCfg = (key: string, value: any) =>
    onChange(sectionId, { ...effect, config: { ...effect.config, [key]: value } });

  const fields = effectSchemas[BG_SCHEMA_KEY[effect.type]] || [];

  return (
    <div className="space-y-4">
      <Field label="Background effect">
        <select value={effect.type} onChange={e => handleType(e.target.value as BgType)}
          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none">
          {BG_OPTIONS.map(o => <option key={o} value={o}>{BG_LABELS[o]}</option>)}
        </select>
      </Field>

      {effect.type !== 'none' && fields.length > 0 && (
        <div className="pt-3 border-t border-zinc-800/60 space-y-4">
          <div className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Effect parameters</div>
          {fields.map(field => (
            <div key={field.key} className="space-y-1.5">
              <label className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">{field.label}</label>
              {field.type === 'text' && <TextInput value={effect.config[field.key] ?? ''} onChange={v => handleCfg(field.key, v)} />}
              {field.type === 'number' && <NumberSlider value={effect.config[field.key] ?? 0} min={field.min} max={field.max} step={field.step} onChange={v => handleCfg(field.key, v)} />}
              {field.type === 'color' && <ColorPicker value={effect.config[field.key] ?? 'transparent'} onChange={v => handleCfg(field.key, v)} />}
              {field.type === 'boolean' && <Toggle value={effect.config[field.key] ?? false} onChange={v => handleCfg(field.key, v)} />}
              {field.type === 'select' && (
                <select value={effect.config[field.key] ?? ''} onChange={e => handleCfg(field.key, e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none">
                  {field.options?.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              )}
              {field.type === 'colorArray' && Array.isArray(effect.config[field.key]) && (
                <div className="grid grid-cols-5 gap-2">
                  {(effect.config[field.key] as string[]).map((c, i) => (
                    <input key={i} type="color" value={parseColor(c).hex}
                      onChange={e => {
                        const arr = [...effect.config[field.key]];
                        arr[i] = toRgba(e.target.value, parseColor(c).alpha);
                        handleCfg(field.key, arr);
                      }}
                      className="w-full h-8 rounded border border-zinc-600 p-0 cursor-pointer" />
                  ))}
                </div>
              )}
              {field.type === 'colorWeights' && (
                <div className="space-y-2">
                  {((effect.config[field.key] ?? []) as { color: string; weight: number }[]).map((stop, i) => {
                    const stops = effect.config[field.key] as { color: string; weight: number }[];
                    const total = stops.reduce((s: number, st: { weight: number }) => s + (st.weight || 0), 0) || 1;
                    return (
                      <div key={i} className="flex items-center gap-2">
                        <input type="color" value={stop.color.startsWith('#') ? stop.color : parseColor(stop.color).hex}
                          onChange={e => {
                            const arr = stops.map((s, j) => j === i ? { ...s, color: e.target.value } : s);
                            handleCfg(field.key, arr);
                          }}
                          className="w-8 h-8 rounded border border-zinc-600 p-0 cursor-pointer shrink-0" />
                        <input type="range" min={1} max={100} value={stop.weight}
                          onChange={e => {
                            const arr = stops.map((s, j) => j === i ? { ...s, weight: Number(e.target.value) } : s);
                            handleCfg(field.key, arr);
                          }}
                          className="flex-1 accent-indigo-500" />
                        <span className="text-[10px] text-zinc-400 w-8 text-right shrink-0">
                          {Math.round((stop.weight / total) * 100)}%
                        </span>
                        <button onClick={() => handleCfg(field.key, stops.filter((_, j) => j !== i))}
                          className="text-zinc-600 hover:text-red-400 text-xs shrink-0">✕</button>
                      </div>
                    );
                  })}
                  <button
                    onClick={() => {
                      const stops = (effect.config[field.key] ?? []) as { color: string; weight: number }[];
                      handleCfg(field.key, [...stops, { color: '#ffffff', weight: 50 }]);
                    }}
                    className="text-[11px] text-indigo-400 hover:text-indigo-300 transition-colors">
                    + Add color
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Device monitor ───────────────────────────────────────────────────────────

const DeviceMonitor: React.FC<{ device: Device }> = ({ device }) => {
  const outerRef = useRef<HTMLDivElement>(null);
  const [outerW, setOuterW] = useState(900);

  useEffect(() => {
    if (!outerRef.current) return;
    const ro = new ResizeObserver(entries => setOuterW(entries[0].contentRect.width));
    ro.observe(outerRef.current);
    return () => ro.disconnect();
  }, []);

  const deviceWidth = DEVICES.find(d => d.id === device)!.width;
  const scale = Math.min(outerW / deviceWidth, 1);

  const previewSrc = (() => {
    const url = new URL(window.location.href);
    url.searchParams.set('preview', '1');
    return url.toString();
  })();

  return (
    <div ref={outerRef} className="flex-1 overflow-hidden flex items-start justify-center bg-zinc-950 p-4">
      <div
        style={{
          width: deviceWidth,
          height: `${100 / scale}%`,
          transform: `scale(${scale})`,
          transformOrigin: 'top center',
        }}
        className="border border-zinc-800 rounded-lg overflow-hidden shadow-2xl bg-black shrink-0"
      >
        <iframe
          src={previewSrc}
          style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
          title="Site preview"
        />
      </div>
    </div>
  );
};

// ─── Template picker modal ────────────────────────────────────────────────────

const TemplatePickerModal: React.FC<{
  sections: SectionInstance[];
  onAdd: (templateId: string, label: string) => void;
  onClose: () => void;
}> = ({ sections, onAdd, onClose }) => {
  const countOf = (tid: string) => sections.filter(s => s.templateId === tid).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" onClick={onClose}>
      <div
        className="bg-zinc-900 border border-zinc-700 rounded-xl p-5 w-80 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-semibold text-white">Add section</span>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="space-y-2">
          {SECTION_TEMPLATES.map(tmpl => {
            const count = countOf(tmpl.id);
            const disabled = count >= tmpl.maxCount;
            const label = count > 0 ? `${tmpl.label} ${count + 1}` : tmpl.label;
            return (
              <button
                key={tmpl.id}
                disabled={disabled}
                onClick={() => { onAdd(tmpl.id, label); onClose(); }}
                className={`w-full text-left px-3 py-2.5 rounded-lg border transition-colors ${
                  disabled
                    ? 'border-zinc-800 text-zinc-600 cursor-not-allowed bg-zinc-900/50'
                    : 'border-zinc-700 hover:border-indigo-500 hover:bg-zinc-800 text-white'
                }`}
              >
                <div className="text-xs font-medium">{tmpl.label}</div>
                <div className="text-[10px] text-zinc-500 mt-0.5">{tmpl.description}</div>
                {disabled && <div className="text-[10px] text-zinc-600 mt-0.5">Already added (max {tmpl.maxCount})</div>}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ─── Section strip ────────────────────────────────────────────────────────────

const SectionStrip: React.FC<{
  sections: SectionInstance[];
  selected: string;
  onSelect: (id: string) => void;
  onAdd: () => void;
  onToggleVisible: (id: string) => void;
  onDelete: (id: string) => void;
  onMove: (id: string, dir: 'left' | 'right') => void;
}> = ({ sections, selected, onSelect, onAdd, onToggleVisible, onDelete, onMove }) => {
  const stripRef = useRef<HTMLDivElement>(null);

  // Mouse-wheel scrolls the strip horizontally
  const onWheel = (e: React.WheelEvent) => {
    if (stripRef.current) {
      e.preventDefault();
      stripRef.current.scrollLeft += e.deltaY * 0.6;
    }
  };

  return (
    <div className="flex items-center border-b border-zinc-800 shrink-0 bg-zinc-900">
      {/* Add button — always visible, left side */}
      <button
        onClick={onAdd}
        title="Add section"
        className="shrink-0 flex items-center justify-center w-9 h-full text-zinc-400 hover:text-indigo-400 hover:bg-zinc-800 transition-colors border-r border-zinc-800"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
        </svg>
      </button>

      {/* Scrollable pill list */}
      <div
        ref={stripRef}
        onWheel={onWheel}
        className="flex items-center gap-0.5 overflow-x-auto px-1 py-1.5"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' } as React.CSSProperties}
      >
        {[...sections].sort((a, b) => a.order - b.order).map((sec, idx, arr) => {
          const isActive = sec.id === selected;
          const isHero = sec.templateId === 'hero';
          return (
            <div
              key={sec.id}
              className={`group flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium whitespace-nowrap cursor-pointer transition-colors shrink-0 ${
                isActive
                  ? 'bg-indigo-600 text-white'
                  : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200'
              }`}
              onClick={() => onSelect(sec.id)}
            >
              {/* Visibility dot */}
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${sec.visible ? 'bg-green-400' : 'bg-zinc-600'}`} />

              {sec.label}

              {/* Controls: appear on hover/active */}
              <span className={`flex items-center gap-0.5 ml-0.5 ${isActive ? 'flex' : 'hidden group-hover:flex'}`}>
                {/* Reorder left */}
                {idx > 1 && (
                  <button
                    onClick={e => { e.stopPropagation(); onMove(sec.id, 'left'); }}
                    className="text-white/60 hover:text-white transition-colors"
                    title="Move left"
                  >
                    <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                )}
                {/* Reorder right */}
                {idx < arr.length - 1 && !isHero && (
                  <button
                    onClick={e => { e.stopPropagation(); onMove(sec.id, 'right'); }}
                    className="text-white/60 hover:text-white transition-colors"
                    title="Move right"
                  >
                    <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                )}
                {/* Toggle visibility */}
                {!isHero && (
                  <button
                    onClick={e => { e.stopPropagation(); onToggleVisible(sec.id); }}
                    className="text-white/60 hover:text-white transition-colors"
                    title={sec.visible ? 'Hide section' : 'Show section'}
                  >
                    {sec.visible ? (
                      <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    ) : (
                      <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    )}
                  </button>
                )}
                {/* Delete */}
                {!isHero && (
                  <button
                    onClick={e => { e.stopPropagation(); onDelete(sec.id); }}
                    className="text-white/60 hover:text-red-400 transition-colors"
                    title="Remove section"
                  >
                    <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── Main CMS ─────────────────────────────────────────────────────────────────

type SubTab = 'content' | 'background';

// ─── Demo notice modal ────────────────────────────────────────────────────────

const DemoNoticeModal: React.FC<{ onClose: () => void }> = ({ onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" onClick={onClose}>
    <div
      className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 w-80 shadow-2xl text-center"
      onClick={e => e.stopPropagation()}
    >
      <div className="w-10 h-10 bg-indigo-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 110 20A10 10 0 0112 2z" />
        </svg>
      </div>
      <h3 className="text-white font-semibold mb-2">Demo CMS</h3>
      <p className="text-zinc-400 text-sm leading-relaxed mb-5">
        This is a demonstration version of the CMS. Changes are saved locally in your browser and previewed in real time — but the live site is not affected.
      </p>
      <button
        onClick={onClose}
        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium py-2 rounded-lg transition-colors"
      >
        Got it
      </button>
    </div>
  </div>
);

const CMSInner: React.FC = () => {
  const router = useRouter();
  const { reset } = useContent();
  const [device, setDevice] = useState<Device>('desktop');
  const [effects, setEffects] = useState<Record<string, SectionEffect>>(loadEffects);
  const [sections, setSections] = useState<SectionInstance[]>(loadSections);
  const [selectedId, setSelectedId] = useState<string>(sections[0]?.id ?? 'hero-section');
  const [subTab, setSubTab] = useState<SubTab>('content');
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);
  const [showDemoNotice, setShowDemoNotice] = useState(false);

  const selectedSection = sections.find(s => s.id === selectedId) ?? sections[0];

  const updateEffect = useCallback((id: string, ef: SectionEffect) => {
    setEffects(prev => {
      const next = { ...prev, [id]: ef };
      saveEffects(next);
      return next;
    });
  }, []);

  const handleAdd = (templateId: string, label: string) => {
    const next = addSectionMutation(sections, templateId, label);
    setSections(next);
    // Select the newly added section
    const newSec = next[next.length - 1];
    setSelectedId(newSec.id);
    setSubTab('content');
  };

  const handleDelete = (id: string) => {
    const next = removeSection(sections, id);
    setSections(next);
    if (selectedId === id) {
      setSelectedId(next[0]?.id ?? '');
    }
  };

  const handleToggleVisible = (id: string) => {
    setSections(toggleVisibility(sections, id));
  };

  const handleMove = (id: string, dir: 'left' | 'right') => {
    setSections(reorderSection(sections, id, dir));
  };

  const handleReset = () => {
    reset();
    saveEffects(DEFAULT_EFFECTS);
    setEffects({ ...DEFAULT_EFFECTS });
    saveSections(DEFAULT_SECTIONS, true);
    setSections([...DEFAULT_SECTIONS]);
    setSelectedId(DEFAULT_SECTIONS[0].id);
  };

  // Clear CMS draft data when exiting so the main site is never affected
  useEffect(() => {
    return () => {
      localStorage.removeItem('struction_content_en');
      localStorage.removeItem('struction_content_uk');
      localStorage.removeItem('struction_effects');
      localStorage.removeItem('struction_sections');
    };
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem('cms_auth');
    router.push('/');
  };

  return (
    <div className="h-screen bg-zinc-950 text-white flex flex-col font-sans overflow-hidden">

      {/* ── Top bar ── */}
      <div className="h-12 flex items-center justify-between px-4 border-b border-zinc-800 bg-zinc-900 shrink-0">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-amber-500 rounded-md flex items-center justify-center text-black font-bold text-[10px]">ST</div>
          <span className="font-bold text-sm">Struction</span>
          <span className="text-[10px] bg-indigo-600 px-2 py-0.5 rounded text-white font-semibold tracking-wide">CMS</span>
        </div>

        {/* Device selector — centre */}
        <div className="flex items-center bg-zinc-800 rounded-lg p-0.5 gap-0.5">
          {DEVICES.map(d => (
            <button key={d.id} onClick={() => setDevice(d.id)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-colors ${device === d.id ? 'bg-zinc-600 text-white' : 'text-zinc-400 hover:text-zinc-200'}`}>
              {d.icon}
              <span className="hidden sm:inline">{d.label}</span>
            </button>
          ))}
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-3">
          <button onClick={handleReset} className="text-[11px] text-zinc-600 hover:text-zinc-400 transition-colors">Reset defaults</button>
          <span className="text-xs text-zinc-500">admin</span>
          <button
            onClick={() => setShowDemoNotice(true)}
            className="text-xs px-3 py-1.5 rounded-lg font-medium transition-colors bg-indigo-600 hover:bg-indigo-500 text-white"
          >
            Deploy
          </button>
          <button onClick={handleLogout}
            className="text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-3 py-1.5 rounded-lg transition-colors">
            Logout
          </button>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Sidebar */}
        <div className="w-72 shrink-0 border-r border-zinc-800 bg-zinc-900 flex flex-col overflow-hidden">

          {/* Section strip */}
          <SectionStrip
            sections={sections}
            selected={selectedId}
            onSelect={id => { setSelectedId(id); setSubTab('content'); }}
            onAdd={() => setShowTemplatePicker(true)}
            onToggleVisible={handleToggleVisible}
            onDelete={handleDelete}
            onMove={handleMove}
          />

          {/* Sub-tabs: Content / Background */}
          <div className="flex border-b border-zinc-800 shrink-0">
            {(['content', 'background'] as SubTab[]).map(t => (
              <button key={t} onClick={() => setSubTab(t)}
                className={`flex-1 py-2 text-[10px] font-semibold uppercase tracking-wide transition-colors capitalize ${subTab === t ? 'text-white border-b-2 border-indigo-500' : 'text-zinc-500 hover:text-zinc-300'}`}>
                {t}
              </button>
            ))}
          </div>

          {/* Editor content */}
          <div className="flex-1 overflow-y-auto p-4">
            {selectedSection && subTab === 'content' && (
              <ContentEditor templateId={selectedSection.templateId} />
            )}
            {selectedSection && subTab === 'background' && (
              <EffectsEditor
                sectionId={selectedSection.id}
                effects={effects}
                onChange={updateEffect}
              />
            )}
          </div>
        </div>

        {/* Monitor area */}
        <DeviceMonitor device={device} />
      </div>

      {/* Template picker modal */}
      {showTemplatePicker && (
        <TemplatePickerModal
          sections={sections}
          onAdd={handleAdd}
          onClose={() => setShowTemplatePicker(false)}
        />
      )}

      {/* Demo notice modal */}
      {showDemoNotice && <DemoNoticeModal onClose={() => setShowDemoNotice(false)} />}
    </div>
  );
};

// ─── Export ───────────────────────────────────────────────────────────────────

const CMSPage: React.FC = () => (
  <ContentProvider>
    <RegistryProvider>
      <CMSInner />
    </RegistryProvider>
  </ContentProvider>
);

export default CMSPage;
