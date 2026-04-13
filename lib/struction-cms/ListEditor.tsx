import React, { useState } from 'react';
import { ListSchema } from './types';
import { CollapsibleItem, AddBtn } from './controls';
import FieldEditor from './FieldEditor';

interface Props {
  schema: ListSchema;
  items: Record<string, any>[];
  onChange: (items: Record<string, any>[]) => void;
  icons?: Record<string, React.FC<{ className?: string }>>;
  iconLabels?: Record<string, string>;
}

const ListEditor: React.FC<Props> = ({ schema, items, onChange, icons, iconLabels }) => {
  const [expanded, setExpanded] = useState<string | null>(null);

  const addItem = () => {
    const id = Date.now().toString();
    const newItem = { id, ...schema.defaultItem };
    const next = [...items, newItem];
    onChange(next);
    setExpanded(id);
  };

  const removeItem = (id: string) => {
    onChange(items.filter(item => item.id !== id));
  };

  const updateField = (id: string, fieldKey: string, value: any) => {
    onChange(items.map(item => item.id === id ? { ...item, [fieldKey]: value } : item));
  };

  const labelKey = schema.itemLabelKey ?? schema.fields[0]?.key ?? 'title';

  return (
    <div className="pt-1 border-t border-zinc-800/60">
      <div className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider mb-2">
        {schema.label} ({items.length})
      </div>
      <div className="space-y-1.5">
        {items.map(item => (
          <CollapsibleItem
            key={item.id}
            label={<span className="text-xs text-zinc-300 truncate">{item[labelKey] ?? item.id}</span>}
            isOpen={expanded === item.id}
            onToggle={() => setExpanded(expanded === item.id ? null : item.id)}
            onDelete={() => removeItem(item.id)}
          >
            {schema.fields.map(field => (
              <FieldEditor
                key={field.key}
                schema={field}
                value={item[field.key]}
                onChange={v => updateField(item.id, field.key, v)}
                icons={icons}
                iconLabels={iconLabels}
              />
            ))}
          </CollapsibleItem>
        ))}
        <AddBtn label={`Add ${schema.label.toLowerCase().replace(/s$/, '')}`} onClick={addItem} />
      </div>
    </div>
  );
};

export default ListEditor;
