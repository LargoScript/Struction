import React from 'react';
import { FieldSchema } from './types';
import { Field, TextInput, NumberSlider, ColorPicker, Toggle } from './controls';

interface Props {
  schema: FieldSchema;
  value: any;
  onChange: (value: any) => void;
  /** Icon map: { [iconKey]: ReactComponent } — only required for 'icon' type */
  icons?: Record<string, React.FC<{ className?: string }>>;
  iconLabels?: Record<string, string>;
}

const FieldEditor: React.FC<Props> = ({ schema, value, onChange, icons, iconLabels }) => {
  const { type, label, placeholder, min, max, step, options } = schema;
  const val = value ?? '';

  return (
    <Field label={label}>
      {type === 'text' && (
        <TextInput value={val} onChange={onChange} placeholder={placeholder} />
      )}
      {type === 'textarea' && (
        <TextInput value={val} onChange={onChange} multiline placeholder={placeholder} />
      )}
      {type === 'url' && (
        <TextInput value={val} onChange={onChange} placeholder={placeholder ?? 'https://...'} />
      )}
      {type === 'image' && (
        <div className="space-y-2">
          <TextInput value={val} onChange={onChange} placeholder={placeholder ?? '/images/...'} />
          {val && (
            <img
              src={val} alt=""
              className="w-full h-24 object-cover rounded-lg border border-zinc-700"
              onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          )}
        </div>
      )}
      {type === 'number' && (
        <NumberSlider value={Number(val) || 0} min={min} max={max} step={step} onChange={onChange} />
      )}
      {type === 'color' && (
        <ColorPicker value={val || '#000000'} onChange={onChange} />
      )}
      {type === 'boolean' && (
        <Toggle value={Boolean(val)} onChange={onChange} />
      )}
      {type === 'select' && (
        <select
          value={val}
          onChange={e => onChange(e.target.value)}
          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
        >
          {options?.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      )}
      {type === 'icon' && icons && iconLabels && (
        <div className="grid grid-cols-5 gap-1.5">
          {Object.keys(iconLabels).map(k => {
            const Icon = icons[k];
            const isSelected = val === k;
            return (
              <button
                key={k}
                type="button"
                onClick={() => onChange(k)}
                title={iconLabels[k]}
                className={`flex flex-col items-center justify-center gap-1 p-2 rounded-lg border transition-colors ${
                  isSelected
                    ? 'border-indigo-500 bg-indigo-600/20 text-indigo-400'
                    : 'border-zinc-700 bg-zinc-800/50 hover:border-zinc-500 text-zinc-400 hover:text-white'
                }`}
              >
                {Icon && <Icon className="w-4 h-4 shrink-0" />}
                <span className="text-[9px] leading-none truncate w-full text-center">{iconLabels[k]}</span>
              </button>
            );
          })}
        </div>
      )}
    </Field>
  );
};

export default FieldEditor;
