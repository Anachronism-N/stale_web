import { useState, useEffect, useRef } from 'react';
import { Bold, Italic, Underline, Strikethrough, Code, Link, Heading1, Heading2, Heading3 } from 'lucide-react';

const ACTIONS = [
  { cmd: 'bold', icon: Bold, label: '加粗 ⌘B' },
  { cmd: 'italic', icon: Italic, label: '斜体 ⌘I' },
  { cmd: 'underline', icon: Underline, label: '下划线 ⌘U' },
  { cmd: 'strikeThrough', icon: Strikethrough, label: '删除线' },
  { cmd: 'code', icon: Code, label: '行内代码' },
  { cmd: 'link', icon: Link, label: '插入链接' },
];

const HEADING_ACTIONS = [
  { level: '1', icon: Heading1, label: '一级标题' },
  { level: '2', icon: Heading2, label: '二级标题' },
  { level: '3', icon: Heading3, label: '三级标题' },
];

export default function FormatToolbar({ position, onAction, onHeading }) {
  if (!position) return null;

  return (
    <div
      className="fixed z-50 flex items-center rounded-lg border shadow-2xl px-1 py-1 animate-fade-in"
      style={{
        left: Math.max(10, position.x - 160),
        top: position.y - 48,
        backgroundColor: 'var(--bg-card)',
        borderColor: 'var(--border-color)',
        boxShadow: '0 8px 28px rgba(0,0,0,0.35)',
        gap: '1px',
      }}
    >
      {ACTIONS.map(({ cmd, icon: Icon, label }) => (
        <button
          key={cmd}
          onMouseDown={(e) => { e.preventDefault(); onAction(cmd); }}
          className="p-1.5 rounded transition-all duration-150"
          style={{ color: 'var(--text-secondary)' }}
          title={label}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--accent-bg)'; e.currentTarget.style.color = 'var(--accent)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
        >
          <Icon size={15} />
        </button>
      ))}
      {onHeading && (
        <>
          <div style={{ width: 1, height: 20, backgroundColor: 'var(--border-color)', margin: '0 2px' }} />
          {HEADING_ACTIONS.map(({ level, icon: Icon, label }) => (
            <button
              key={level}
              onMouseDown={(e) => { e.preventDefault(); onHeading(level); }}
              className="p-1.5 rounded transition-all duration-150"
              style={{ color: 'var(--text-secondary)' }}
              title={label}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--accent-bg)'; e.currentTarget.style.color = 'var(--accent)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
            >
              <Icon size={15} />
            </button>
          ))}
        </>
      )}
    </div>
  );
}