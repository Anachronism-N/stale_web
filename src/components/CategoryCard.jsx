import { useState } from 'react';
import { ChevronDown, Plus, Trash2, Edit3 } from 'lucide-react';
import FeishuEditor from './FeishuEditor';

const iconMap = {
  BookOpen: '📖', Layers: '📐', Cpu: '🔬', Network: '🕸️',
  TrendingUp: '📈', GraduationCap: '🎓', FileText: '📝',
};

export default function CategoryCard({ block, expanded, onToggle, onSectionEdit, onAddSection, onDeleteSection, onEditBlockMeta, onImageClick, editMode }) {
  const Icon = iconMap[block.icon] || '📄';
  const [editingTitle, setEditingTitle] = useState(false);
  const [draftTitle, setDraftTitle] = useState(block.title);

  const saveTitle = () => {
    if (draftTitle.trim()) onEditBlockMeta('title', draftTitle.trim());
    setEditingTitle(false);
  };

  return (
    <div
      className="relative rounded-2xl border overflow-hidden transition-all duration-400"
      style={{
        backgroundColor: 'var(--bg-card)',
        borderColor: expanded ? block.color : 'var(--border-color)',
        boxShadow: expanded ? `0 0 30px ${block.color}15` : 'var(--shadow-sm)',
      }}
    >
      {/* 卡片头部 */}
      <button onClick={onToggle} className="w-full flex items-center gap-4 px-6 py-5 text-left transition-colors hover:opacity-90"
        style={{ backgroundColor: expanded ? `${block.color}08` : 'transparent' }}>
        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0 transition-all duration-300"
          style={{
            background: `linear-gradient(135deg, ${block.color}20, ${block.color}10)`,
            border: `1px solid ${block.color}30`,
          }}
          onMouseEnter={(e) => { e.currentTarget.style.boxShadow = `0 0 20px ${block.color}30`; }}
          onMouseLeave={(e) => { e.currentTarget.style.boxShadow = ''; }}
        >
          {Icon}
        </div>
        <div className="flex-1 min-w-0">
          {editingTitle ? (
            <input
              value={draftTitle}
              onChange={(e) => setDraftTitle(e.target.value)}
              onBlur={saveTitle}
              onKeyDown={(e) => { if (e.key === 'Enter') saveTitle(); if (e.key === 'Escape') { setDraftTitle(block.title); setEditingTitle(false); } }}
              className="text-lg lg:text-xl font-bold bg-transparent outline-none w-full"
              style={{ color: 'var(--text-primary)', borderBottom: '2px solid var(--accent)' }}
              autoFocus
            />
          ) : (
            <h2 className="text-lg lg:text-xl font-bold group/title flex items-center gap-2"
              style={{ color: 'var(--text-primary)' }}>
              {block.title}
              {editMode && (
                <button onClick={(e) => { e.stopPropagation(); setDraftTitle(block.title); setEditingTitle(true); }}
                  className="opacity-0 group-hover/title:opacity-100 p-0.5" style={{ color: 'var(--text-tertiary)' }}>
                  <Edit3 size={12} />
                </button>
              )}
            </h2>
          )}
          <p className="text-xs mt-1 truncate" style={{ color: 'var(--text-tertiary)' }}>{block.subtitle}</p>
        </div>
        <div className={`shrink-0 p-2 rounded-full transition-transform duration-400 ${expanded ? 'rotate-180' : ''}`}
          style={{ backgroundColor: `${block.color}10`, color: block.color }}>
          <ChevronDown size={20} />
        </div>
      </button>

      {/* 展开内容 */}
      <div className="overflow-hidden transition-all duration-500 ease-in-out"
        style={{ maxHeight: expanded ? '999999px' : '0px', opacity: expanded ? 1 : 0 }}>
        <div className="px-6 pb-8 pt-4" style={{ borderTop: `1px solid var(--border-color)` }}>

          {/* 板块级 intro */}
          {block.intro && (
            <div className="text-[13px] mb-6 px-4 py-3 rounded-lg"
              style={{ backgroundColor: 'var(--accent-bg)', borderLeft: `3px solid ${block.color}`, color: 'var(--text-secondary)' }}>
              {block.intro}
            </div>
          )}

          {/* 遍历 sections */}
          {block.sections.map((sec, si) => (
            <div key={sec.id || si} className="mb-10 last:mb-0">
              {/* Section 标题行 */}
              <div className="flex items-center gap-3 mb-5 group/sec">
                <h3 className="text-base lg:text-lg font-bold pl-4 border-l-[4px] flex-1 transition-all duration-300 group-hover/sec:translate-x-1"
                  style={{ color: 'var(--text-primary)', borderColor: block.color }}>
                  {sec.title}
                </h3>
                {editMode && (
                  <button
                    onClick={() => onDeleteSection(block.id, sec.id)}
                    className="opacity-0 group-hover/sec:opacity-100 p-1 rounded transition-all"
                    style={{ color: 'var(--danger)' }}
                    title="删除此节"
                  ><Trash2 size={14} /></button>
                )}
              </div>

              {/* 日期信息 */}
              {sec.date && (
                <div className="text-xs mb-4 tracking-wide" style={{ color: 'var(--text-tertiary)' }}>📅 {sec.date}</div>
              )}

              {/* 飞书编辑器 */}
              <FeishuEditor
                content={sec.content || []}
                onChange={(newContent) => onSectionEdit(block.id, sec.id, newContent)}
                color={block.color}
                onImageClick={onImageClick}
                editMode={editMode}
              />
            </div>
          ))}

          {/* 添加新 Section——仅编辑模式 */}
          {editMode && (
            <button
              onClick={() => onAddSection(block.id)}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all mt-4 hover:shadow-lg"
              style={{
                color: block.color,
                backgroundColor: `${block.color}08`,
                border: `1px dashed ${block.color}40`,
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = block.color; e.currentTarget.style.backgroundColor = `${block.color}15`; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = `${block.color}40`; e.currentTarget.style.backgroundColor = `${block.color}08`; e.currentTarget.style.transform = ''; }}
            >
              <Plus size={16} /> 添加小节
            </button>
          )}
        </div>
      </div>
    </div>
  );
}