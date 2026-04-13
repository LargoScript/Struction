import React from 'react';
import { SectionManifest } from './types';
import { getByPath } from './contentPath';
import { Field } from './controls';
import FieldEditor from './FieldEditor';
import ListEditor from './ListEditor';

interface Props {
  manifest: SectionManifest;
  content: any;
  /** Called with (dotPath, value) for scalar fields */
  onUpdate: (path: string, value: any) => void;
  /** Called with (dotPath, newArray) for list fields */
  onUpdateList: (path: string, items: any[]) => void;
  icons?: Record<string, React.FC<{ className?: string }>>;
  iconLabels?: Record<string, string>;
}

const CMSContentEditor: React.FC<Props> = ({
  manifest,
  content,
  onUpdate,
  onUpdateList,
  icons,
  iconLabels,
}) => {
  if (!manifest) {
    return <div className="text-xs text-zinc-500 pt-2">No editor available for this section type.</div>;
  }

  return (
    <div className="space-y-4">
      {/* Scalar fields */}
      {manifest.fields.map(field => (
        <FieldEditor
          key={field.key}
          schema={field}
          value={getByPath(content, field.key)}
          onChange={v => onUpdate(field.key, v)}
          icons={icons}
          iconLabels={iconLabels}
        />
      ))}

      {/* List fields */}
      {manifest.lists?.map(list => (
        <ListEditor
          key={list.key}
          schema={list}
          items={getByPath(content, list.key) ?? []}
          onChange={items => onUpdateList(list.key, items)}
          icons={icons}
          iconLabels={iconLabels}
        />
      ))}

      {/* Animation options */}
      {manifest.animations && manifest.animations.length > 0 && (
        <div className="pt-3 border-t border-zinc-800/60 space-y-3">
          <div className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Animations</div>
          {manifest.animations.map(anim => (
            <Field key={anim.key} label={anim.label}>
              <select
                value={getByPath(content, anim.key) ?? anim.default}
                onChange={e => onUpdate(anim.key, e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
              >
                {anim.options.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </Field>
          ))}
        </div>
      )}
    </div>
  );
};

export default CMSContentEditor;
