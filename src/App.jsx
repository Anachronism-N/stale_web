import { useState, useEffect, useCallback } from 'react';
import { Sun, Moon, ArrowUp } from 'lucide-react';
import { blocks as defaultBlocks, hero } from './data/content';
import CategoryCard from './components/CategoryCard';
import CollapsibleTOC from './components/CollapsibleTOC';
import ScrollProgress from './components/ScrollProgress';
import ImageLightbox from './components/ImageLightbox';

const STORAGE_KEY = 'knowledge_blocks_v2';
const clone = (obj) => JSON.parse(JSON.stringify(obj));
const uid = () => 's' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

/* ====== 数据迁移：旧格式 → 新块格式 ====== */
function migrateOldData(oldBlocks) {
  return oldBlocks.map((block) => ({
    ...block,
    sections: (block.sections || []).map((sec) => {
      const content = sec.content || [];
      // 如果已有 content 数组，直接返回
      if (sec.content && Array.isArray(sec.content) && sec.content.length > 0) return sec;

      // 否则从旧字段迁移
      const blocks = [];
      let _cid = 1;
      const cid = () => 'mcb' + _cid++;
      const t = (name, desc) => ({ id: 'mt' + Math.random().toString(36).slice(2, 8), name, desc });
      const m = (name, tag, tagColor, desc) => ({ id: 'mm' + Math.random().toString(36).slice(2, 8), name, tag, tagColor, desc: desc || '' });

      if (sec.images) sec.images.forEach(src => blocks.push({ id: cid(), type: 'image', data: { src, caption: '' } }));
      if (sec.text) blocks.push({ id: cid(), type: 'paragraph', data: { html: sec.text } });
      if (sec.terms) blocks.push({ id: cid(), type: 'terms', data: { terms: sec.terms.map(x => t(x.name, x.desc)) } });
      if (sec.models) blocks.push({ id: cid(), type: 'models', data: { models: sec.models.map(x => m(x.name, x.tag, x.tagColor, x.desc)) } });
      if (sec.items) blocks.push({ id: cid(), type: 'list', data: { items: [...sec.items] } });
      if (sec.table) blocks.push({ id: cid(), type: 'table', data: { headers: [...sec.table.headers], rows: sec.table.rows.map(r => [...r]) } });
      if (sec.images2) sec.images2.forEach(src => blocks.push({ id: cid(), type: 'image', data: { src, caption: '' } }));
      if (sec.purpose) blocks.push({ id: cid(), type: 'paragraph', data: { html: '🎯 <b>目的：</b>' + sec.purpose } });
      // subs 迁移
      if (sec.subs) sec.subs.forEach(sub => {
        if (sub.subtitle || sub.title) blocks.push({ id: cid(), type: 'heading', data: { html: sub.subtitle || sub.title, level: 3 } });
        if (sub.text) blocks.push({ id: cid(), type: 'paragraph', data: { html: sub.text } });
        if (sub.items) blocks.push({ id: cid(), type: 'list', data: { items: [...sub.items] } });
        if (sub.terms) blocks.push({ id: cid(), type: 'terms', data: { terms: sub.terms.map(x => t(x.name, x.desc)) } });
        if (sub.models) blocks.push({ id: cid(), type: 'models', data: { models: sub.models.map(x => m(x.name, x.tag, x.tagColor, x.desc)) } });
        if (sub.table) blocks.push({ id: cid(), type: 'table', data: { headers: [...sub.table.headers], rows: sub.table.rows.map(r => [...r]) } });
      });

      if (blocks.length === 0) blocks.push({ id: cid(), type: 'paragraph', data: { html: '' } });
      return { ...sec, content: blocks };
    }),
  }));
}

export default function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const [blocks, setBlocks] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // 检查是否需要迁移（新格式的section有content数组）
        const needsMigration = parsed.some(b => (b.sections || []).some(s => !s.content || !Array.isArray(s.content)));
        return needsMigration ? migrateOldData(parsed) : parsed;
      }
      // 检查旧key
      const oldSaved = localStorage.getItem('knowledge_blocks');
      if (oldSaved) {
        try {
          return migrateOldData(JSON.parse(oldSaved));
        } catch { return clone(defaultBlocks); }
      }
      return clone(defaultBlocks);
    } catch { return clone(defaultBlocks); }
  });
  const [expanded, setExpanded] = useState({});
  const [lightbox, setLightbox] = useState(null);
  const [showBackTop, setShowBackTop] = useState(false);
  const [activeBlock, setActiveBlock] = useState('');
  const [editCount, setEditCount] = useState(0);
  const editMode = false;  // 编辑功能已关闭，纯展示模式
  const [headerScrolled, setHeaderScrolled] = useState(false);

  // 持久化
  useEffect(() => {
    if (editCount > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(blocks));
    }
  }, [blocks, editCount]);

  // 主题
  useEffect(() => {
    document.documentElement.className = theme === 'light' ? 'light' : '';
    localStorage.setItem('theme', theme);
  }, [theme]);

  // 滚动监听
  useEffect(() => {
    const handleScroll = () => {
      setShowBackTop(window.scrollY > 500);
      setHeaderScrolled(window.scrollY > 10);
      for (const b of blocks) {
        const el = document.getElementById(b.id);
        if (el && el.getBoundingClientRect().top < 200) setActiveBlock(b.id);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [blocks]);

  const toggleExpand = useCallback((id) => setExpanded(p => ({ ...p, [id]: !p[id] })), []);

  const scrollTo = (id) => {
    setExpanded(p => ({ ...p, [id]: true }));
    setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
  };

  /* ====== 大模块操作 ====== */
  const addBlock = () => {
    const icons = ['BookOpen', 'Layers', 'Cpu', 'Network', 'TrendingUp', 'GraduationCap', 'FileText'];
    const newBlock = {
      id: 'block-' + Date.now(),
      title: '新板块',
      subtitle: '点击标题编辑',
      icon: icons[Math.floor(Math.random() * icons.length)],
      color: ['#58a6ff', '#a371f7', '#f778ba', '#3fb950', '#d29922', '#f85149'][Math.floor(Math.random() * 6)],
      sections: [{ id: uid(), title: '新小节', content: [{ id: uid(), type: 'paragraph', data: { html: '开始编辑...' } }] }],
    };
    setBlocks(prev => [...prev, newBlock]);
    setExpanded(p => ({ ...p, [newBlock.id]: true }));
    setEditCount(c => c + 1);
  };

  const deleteBlock = (blockId) => {
    if (blocks.length <= 1) return;
    setBlocks(prev => prev.filter(b => b.id !== blockId));
    setEditCount(c => c + 1);
  };

  const editBlockMeta = useCallback((blockId, field, value) => {
    setBlocks(prev => {
      const next = clone(prev);
      const b = next.find(x => x.id === blockId);
      if (b) b[field] = value;
      return next;
    });
    setEditCount(c => c + 1);
  }, []);

  /* ====== Section 操作 ====== */
  const sectionEdit = useCallback((blockId, sectionId, newContent) => {
    setBlocks(prev => {
      const next = clone(prev);
      const b = next.find(x => x.id === blockId);
      if (!b) return next;
      const s = b.sections.find(x => x.id === sectionId);
      if (s) s.content = newContent;
      return next;
    });
    setEditCount(c => c + 1);
  }, []);

  const addSection = useCallback((blockId) => {
    setBlocks(prev => {
      const next = clone(prev);
      const b = next.find(x => x.id === blockId);
      if (!b) return next;
      b.sections.push({ id: uid(), title: '新小节', content: [{ id: uid(), type: 'paragraph', data: { html: '' } }] });
      return next;
    });
    setEditCount(c => c + 1);
  }, []);

  const deleteSection = useCallback((blockId, sectionId) => {
    setBlocks(prev => {
      const next = clone(prev);
      const b = next.find(x => x.id === blockId);
      if (!b || b.sections.length <= 1) return next;
      b.sections = b.sections.filter(s => s.id !== sectionId);
      return next;
    });
    setEditCount(c => c + 1);
  }, []);

  /* ====== 重置 ====== */
  const resetData = () => {
    if (confirm('确定要重置所有数据吗？修改将丢失！')) {
      setBlocks(clone(defaultBlocks));
      setEditCount(0);
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem('knowledge_blocks');
    }
  };

  return (
    <div className="min-h-screen relative z-[1]" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <ScrollProgress />

      {/* 顶栏 */}
      <header className="glass-strong sticky top-0 z-30 flex items-center justify-between px-4 lg:px-8 h-14 transition-all duration-300"
        style={{
          borderBottom: headerScrolled
            ? '1px solid var(--border-color)'
            : '1px solid transparent',
          boxShadow: headerScrolled ? '0 1px 12px var(--accent-glow)' : 'none',
        }}>
        <span className="font-bold text-lg gradient-text">Stale's Knowledge Base</span>
        <div className="flex items-center gap-2">
          <span className="hidden sm:inline text-xs" style={{ color: 'var(--text-tertiary)' }}>
            Stale's Knowledge Base
          </span>
          <button onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-lg transition-all hover:scale-110" style={{ color: 'var(--text-secondary)' }}>
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </header>

      <main className="px-4 lg:px-10 py-8 max-w-4xl mx-auto">
        {/* Hero */}
        <div className="relative rounded-2xl p-6 lg:p-10 mb-10 overflow-hidden border animate-float-up glow-border"
          style={{
            background: 'linear-gradient(145deg, var(--bg-secondary) 0%, color-mix(in srgb, var(--bg-tertiary) 95%, var(--accent)) 100%)',
            borderColor: 'var(--border-color)',
            backgroundSize: '200% 200%',
            animation: 'floatUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards, heroShimmer 8s ease-in-out infinite',
          }}>
          <div className="absolute -top-40 -right-20 w-80 h-80 rounded-full opacity-[0.08] pointer-events-none"
            style={{ background: 'radial-gradient(circle, var(--accent), transparent 70%)' }} />
          <div className="absolute -bottom-20 -left-20 w-60 h-60 rounded-full opacity-[0.06] pointer-events-none"
            style={{ background: 'radial-gradient(circle, var(--purple), transparent 70%)' }} />

          <h1 className="relative z-10 text-3xl lg:text-5xl font-extrabold gradient-text mb-4">{hero.title}</h1>
          <p className="hero-desc relative z-10 text-sm lg:text-base max-w-xl leading-relaxed mb-5" style={{ color: 'var(--text-secondary)' }}>{hero.desc}</p>
          <div className="relative z-10 flex items-end gap-8 lg:gap-14">
            <div className="flex flex-wrap gap-6 lg:gap-10">
              {hero.stats.map(s => (
                <div key={s.label} className="text-center group/stat cursor-default">
                  <div className="text-2xl lg:text-3xl font-extrabold gradient-text transition-transform duration-300 group-hover/stat:scale-110">{s.num}</div>
                  <div className="text-[11px] mt-1.5 uppercase tracking-wider transition-colors duration-300 group-hover/stat:text-accent" style={{ color: 'var(--text-tertiary)' }}>{s.label}</div>
                </div>
              ))}
            </div>
            <div className="ml-auto flex-shrink-0">
              <img src="logo.svg" alt="Stale's Knowledge" className="h-28 lg:h-32 w-auto opacity-90 hover:opacity-100 transition-all duration-500 hover:scale-105 hover:drop-shadow-[0_0_12px_var(--accent-glow)]" />
            </div>
          </div>
        </div>

        {/* 板块卡片 */}
        <div className="space-y-5">
          {blocks.map((block, idx) => (
            <div key={block.id} id={block.id} style={{ scrollMarginTop: '80px' }} className={`group/outer animate-fade-in stagger-${Math.min(idx + 1, 6)}`}>
              <CategoryCard
                block={block}
                expanded={!!expanded[block.id]}
                onToggle={() => toggleExpand(block.id)}
                onSectionEdit={sectionEdit}
                onAddSection={addSection}
                onDeleteSection={deleteSection}
                onEditBlockMeta={(field, val) => editBlockMeta(block.id, field, val)}
                onImageClick={setLightbox}
                editMode={editMode}
              />
            </div>
          ))}
        </div>

        <footer className="mt-16 pt-8 pb-8 border-t text-center"
          style={{ borderColor: 'var(--border-color)' }}>
          <p className="text-xs font-semibold gradient-text mb-3">Stale's Knowledge Base</p>
          <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-tertiary)' }}>
            Stale's Knowledge Base · 多模态大模型知识沉淀站点
          </p>
        </footer>
      </main>

      <CollapsibleTOC blocks={blocks} activeId={activeBlock} onScrollTo={scrollTo} />
      {lightbox && <ImageLightbox src={lightbox} onClose={() => setLightbox(null)} />}

      <button className={`back-to-top glass ${showBackTop ? 'visible' : ''}`}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        title="回到顶部"
      >
        <ArrowUp size={18} />
        <span className="back-to-top-label">TOP</span>
      </button>
    </div>
  );
}