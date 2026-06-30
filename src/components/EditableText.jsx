import { useState } from 'react';
import { Pencil, Check, X } from 'lucide-react';

export default function EditableText({ value, onChange, multiline = false, className = '' }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  const save = () => {
    onChange(draft);
    setEditing(false);
  };
  const cancel = () => {
    setDraft(value);
    setEditing(false);
  };

  if (!editing) {
    return (
      <span className={`group/editable relative ${className}`}>
        {value || <span style={{ color: 'var(--text-tertiary)', fontStyle: 'italic' }}>点击编辑...</span>}
        <button
          onClick={() => { setDraft(value); setEditing(true); }}
          className="inline-flex ml-1.5 opacity-0 group-hover/editable:opacity-100 transition-opacity align-middle p-0.5 rounded hover:opacity-100"
          style={{ color: 'var(--text-tertiary)' }}
          title="编辑"
        >
          <Pencil size={12} />
        </button>
      </span>
    );
  }

  if (multiline) {
    return (
      <div className="relative">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          className="w-full min-h-[80px] rounded-lg p-3 text-sm focus:outline-none resize-y"
          style={{
            backgroundColor: 'var(--bg-tertiary)',
            color: 'var(--text-primary)',
            border: '2px solid var(--accent)',
            boxShadow: '0 0 0 3px var(--accent-glow)',
          }}
          autoFocus
          onKeyDown={(e) => {
            if (e.key === 'Escape') cancel();
            if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') save();
          }}
        />
        <div className="flex gap-2 mt-2">
          <button onClick={save} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-white text-xs font-semibold"
            style={{ background: 'linear-gradient(135deg, var(--accent), var(--purple))' }}>
            <Check size={14} /> 保存 (⌘Enter)
          </button>
          <button onClick={cancel} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs"
            style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}>
            <X size={14} /> 取消
          </button>
        </div>
      </div>
    );
  }

  return (
    <span className="inline-flex items-center gap-2">
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        className="rounded-lg px-3 py-1.5 text-sm focus:outline-none flex-1"
        style={{
          backgroundColor: 'var(--bg-tertiary)',
          color: 'var(--text-primary)',
          border: '2px solid var(--accent)',
          boxShadow: '0 0 0 3px var(--accent-glow)',
        }}
        autoFocus
        onKeyDown={(e) => {
          if (e.key === 'Escape') cancel();
          if (e.key === 'Enter') save();
        }}
      />
      <button onClick={save} className="p-1.5 rounded-lg text-white" style={{ background: 'linear-gradient(135deg, var(--accent), var(--purple))' }}>
        <Check size={14} />
      </button>
      <button onClick={cancel} className="p-1.5 rounded-lg" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>
        <X size={14} />
      </button>
    </span>
  );
}