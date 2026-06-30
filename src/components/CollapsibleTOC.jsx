import { useState, useEffect } from 'react';
import { List, X } from 'lucide-react';

const iconMap = {
  BookOpen: '📖', Layers: '📐', Cpu: '🔬', Network: '🕸️',
  TrendingUp: '📈', GraduationCap: '🎓', FileText: '📝',
};

export default function CollapsibleTOC({ blocks, activeId, onScrollTo }) {
  const [open, setOpen] = useState(false);

  // 按 ESC 关闭
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open]);

  // ⌘K 全局切换
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(o => !o);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <>
      {/* 触发按钮 */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed right-4 top-20 z-50 p-3 rounded-xl shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl"
        style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          color: 'var(--text-primary)',
        }}
        title="目录导航 (⌘K)"
      >
        <List size={20} />
        {!open && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
            style={{ background: 'linear-gradient(135deg, var(--accent), var(--purple))' }}>
            {blocks.length}
          </span>
        )}
      </button>

      {/* 目录面板 */}
      <div
        className="toc-panel fixed right-4 z-50 overflow-hidden rounded-2xl"
        style={{
          top: '88px',
          width: '280px',
          maxHeight: open ? 'calc(100vh - 120px)' : '0px',
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
          backgroundColor: 'var(--bg-card)',
          border: open ? '1px solid var(--border-color)' : '1px solid transparent',
          backdropFilter: 'blur(24px)',
        }}
      >
        {/* 头部 */}
        <div className="flex items-center justify-between px-4 py-3.5" style={{ borderBottom: '1px solid var(--border-color)' }}>
          <span className="font-bold text-sm gradient-text">📚 快速导航</span>
          <div className="flex items-center gap-1">
            <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ color: 'var(--text-tertiary)', backgroundColor: 'var(--accent-bg)' }}>
              {blocks.length} 板块
            </span>
            <button onClick={() => setOpen(false)} className="p-1 rounded-lg hover:opacity-70 transition-opacity" style={{ color: 'var(--text-tertiary)' }}>
              <X size={16} />
            </button>
          </div>
        </div>

        {/* 列表 */}
        <div className="overflow-y-auto px-3 py-3" style={{ maxHeight: 'calc(100vh - 180px)' }}>
          {blocks.map((block) => {
            const Icon = iconMap[block.icon];
            const isActive = activeId === block.id;
            return (
              <button
                key={block.id}
                onClick={() => { onScrollTo(block.id); setOpen(false); }}
                className="toc-item w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm mb-1"
                style={{
                  color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                  backgroundColor: isActive ? `${block.color}12` : 'transparent',
                  borderLeft: isActive ? `3px solid ${block.color}` : '3px solid transparent',
                  boxShadow: isActive ? `inset 0 0 12px ${block.color}08` : 'none',
                }}
              >
                <span className="text-base">{Icon}</span>
                <span className="font-medium truncate">{block.title}</span>
                <span className="text-[10px] ml-auto px-1.5 py-0.5 rounded-full shrink-0" style={{
                  color: block.color,
                  backgroundColor: `${block.color}15`,
                }}>
                  {block.sections.length}节
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 移动端遮罩 */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-40 backdrop-blur-sm" style={{ background: 'rgba(0,0,0,0.25)' }} onClick={() => setOpen(false)} />
      )}
    </>
  );
}