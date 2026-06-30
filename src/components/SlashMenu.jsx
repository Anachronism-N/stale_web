import { useEffect, useRef } from 'react';

const ITEMS = [
  { type: 'paragraph', icon: '¶', label: '文本段落', desc: '普通文本块' },
  { type: 'heading', icon: 'H', label: '标题', desc: '分级标题，支持 H1-H3' },
  { type: 'image', icon: '🖼️', label: '图片', desc: '插入图片链接' },
  { type: 'list', icon: '≡', label: '列表', desc: '无序或有序列表' },
  { type: 'table', icon: '⊞', label: '表格', desc: '插入数据表格' },
  { type: 'terms', icon: '📋', label: '术语卡片', desc: '名词+解释卡片' },
  { type: 'models', icon: '⭐', label: '模型卡片', desc: '模型名+标签卡片' },
  { type: 'divider', icon: '—', label: '分割线', desc: '视觉分隔线' },
  { type: 'attachment', icon: '📎', label: '附件', desc: '文件引用链接' },
];

export default function SlashMenu({ position, filter, onSelect, onClose }) {
  const ref = useRef(null);
  const filtered = ITEMS.filter((item) =>
    item.label.toLowerCase().includes(filter.toLowerCase()) || item.type.includes(filter.toLowerCase())
  );

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  if (!position || filtered.length === 0) return null;

  return (
    <div
      ref={ref}
      className="fixed z-50 rounded-xl border shadow-2xl overflow-hidden"
      style={{
        left: position.x, top: position.y,
        minWidth: '260px',
        backgroundColor: 'var(--bg-card)',
        borderColor: 'var(--border-color)',
        boxShadow: '0 16px 48px rgba(0,0,0,0.35)',
      }}
    >
      <div className="text-[10px] px-3 py-2 tracking-wide uppercase font-semibold"
        style={{ color: 'var(--text-tertiary)', borderBottom: '1px solid var(--border-color)' }}>
        插入内容块
      </div>
      <div className="max-h-64 overflow-y-auto py-1">
        {filtered.map((item) => (
          <button
            key={item.type}
            onMouseDown={(e) => { e.preventDefault(); onSelect(item.type); }}
            className="w-full flex items-center gap-3 px-3 py-2 text-left transition-colors hover:opacity-80"
            style={{ color: 'var(--text-primary)' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--accent-bg)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <span className="text-base w-7 text-center">{item.icon}</span>
            <div className="flex-1">
              <div className="text-[13px] font-medium">{item.label}</div>
              <div className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>{item.desc}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}