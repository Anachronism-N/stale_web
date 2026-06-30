import { useState, useRef, useCallback, useEffect } from 'react';
import { GripVertical, Plus, Trash2, ZoomIn, Link as LinkIcon, FileText, MoveUp, MoveDown } from 'lucide-react';
import SlashMenu from './SlashMenu';
import FormatToolbar from './FormatToolbar';

/* ====== 工具函数 ====== */
const uid = () => 'cb' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

function newBlock(type) {
  const id = uid();
  switch (type) {
    case 'paragraph': return { id, type, data: { html: '' } };
    case 'heading': return { id, type, data: { html: '', level: 2 } };
    case 'image': return { id, type, data: { src: '', caption: '' } };
    case 'list': return { id, type, data: { items: [''] } };
    case 'table': return { id, type, data: { headers: ['列1', '列2'], rows: [['', '']] } };
    case 'terms': return { id, type, data: { terms: [{ id: uid(), name: '', desc: '' }] } };
    case 'models': return { id, type, data: { models: [{ id: uid(), name: '', tag: '标签', tagColor: 'red', desc: '' }] } };
    case 'divider': return { id, type, data: {} };
    case 'attachment': return { id, type, data: { name: '', url: '' } };
    default: return { id, type: 'paragraph', data: { html: '' } };
  }
}

const tagColors = {
  red: { bg: 'rgba(248,81,73,0.1)', text: 'var(--danger)', border: 'rgba(248,81,73,0.25)' },
  green: { bg: 'rgba(63,185,80,0.1)', text: 'var(--success)', border: 'rgba(63,185,80,0.25)' },
  yellow: { bg: 'rgba(210,153,34,0.1)', text: 'var(--warning)', border: 'rgba(210,153,34,0.25)' },
  purple: { bg: 'rgba(163,113,247,0.1)', text: 'var(--purple)', border: 'rgba(163,113,247,0.25)' },
};

/* ====== 文本块（段落/标题） ====== */
function TextBlock({ block, onChange, onSlash, onFormat, focused, editMode }) {
  const ref = useRef(null);
  const Tag = block.type === 'heading' ? `h${Math.min(block.data.level || 2, 3)}` : 'div';
  const prevBlockKey = useRef(block.id + '-' + block.type);

  // 仅在 block 切换或标题等级变化时设置 HTML（避免光标跳动）
  useEffect(() => {
    const currentKey = block.id + '-' + block.type;
    if (ref.current && prevBlockKey.current !== currentKey) {
      ref.current.innerHTML = block.data.html || '';
      prevBlockKey.current = currentKey;
    }
  }, [block.id, block.type, block.data.html]);

  // 首次挂载设置内容
  useEffect(() => {
    if (ref.current && prevBlockKey.current === block.id + '-' + block.type && ref.current.innerHTML !== (block.data.html || '')) {
      ref.current.innerHTML = block.data.html || '';
    }
  }, []);

  // 自动聚焦
  useEffect(() => {
    if (focused && ref.current) {
      ref.current.focus();
      const sel = window.getSelection();
      sel?.selectAllChildren(ref.current);
      sel?.collapseToEnd();
    }
  }, [focused]);

  const handleInput = () => {
    if (!ref.current) return;
    onChange({ ...block, data: { ...block.data, html: ref.current.innerHTML } });
  };

  const handleKeyDown = (e) => {
    // ⌘Enter 失焦保存
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      ref.current?.blur();
    }
    // 格式化快捷键
    if ((e.metaKey || e.ctrlKey)) {
      const map = { b: 'bold', i: 'italic', u: 'underline' };
      if (map[e.key]) { e.preventDefault(); document.execCommand(map[e.key], false); handleInput(); }
    }
    // slash 触发
    if (e.key === '/' && ref.current) {
      const sel = window.getSelection();
      if (sel && sel.anchorNode) {
        const text = sel.anchorNode.textContent || '';
        const offset = sel.anchorOffset;
        const before = text.slice(0, offset).trim();
        if (before === '' || before.endsWith('<br>') || sel.anchorNode === ref.current) {
          const innerText = ref.current.innerText.trim();
          if (innerText === '' || (sel.anchorOffset === 0 && innerText.length === 0)) {
            e.preventDefault();
            const rect = ref.current.getBoundingClientRect();
            onSlash({ x: rect.left, y: rect.bottom + 4 });
          }
        }
      }
    }
    // Markdown 快捷转换: # → heading
    if (e.key === ' ') {
      const innerText = ref.current.innerText;
      if (innerText === '#') { e.preventDefault(); ref.current.innerHTML = ''; onChange({ ...block, type: 'heading', data: { html: '', level: 1 } }); }
      else if (innerText === '##') { e.preventDefault(); ref.current.innerHTML = ''; onChange({ ...block, type: 'heading', data: { html: '', level: 2 } }); }
      else if (innerText === '###') { e.preventDefault(); ref.current.innerHTML = ''; onChange({ ...block, type: 'heading', data: { html: '', level: 3 } }); }
    }
  };

  const handleMouseUp = () => {
    const sel = window.getSelection();
    if (sel && !sel.isCollapsed && sel.toString().trim().length > 0) {
      const range = sel.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      onFormat({ x: rect.left + rect.width / 2, y: rect.top });
    } else {
      onFormat(null);
    }
  };

  const baseStyle = {
    outline: 'none',
    minHeight: block.type === 'heading' ? undefined : '1.5em',
    color: 'var(--text-primary)',
    lineHeight: 1.7,
  };

  return (
    <Tag
      ref={ref}
      contentEditable={editMode}
      suppressContentEditableWarning
      onInput={editMode ? handleInput : undefined}
      onKeyDown={handleKeyDown}
      onMouseUp={editMode ? handleMouseUp : undefined}
      onBlur={editMode ? handleInput : undefined}
      className="block-editor-text"
      style={{ ...baseStyle, cursor: editMode ? 'text' : 'default' }}
      data-placeholder={editMode ? (block.type === 'heading' ? '输入标题...' : '输入文本，或按 / 插入内容块...') : undefined}
    />
  );
}

/* ====== 列表块 ====== */
function ListBlock({ block, onChange, editMode }) {
  const items = block.data.items || [];
  const updateItem = (i, val) => {
    const next = [...items];
    next[i] = val;
    onChange({ ...block, data: { ...block.data, items: next } });
  };
  const addItem = () => {
    onChange({ ...block, data: { ...block.data, items: [...items, ''] } });
  };
  const removeItem = (i) => {
    onChange({ ...block, data: { ...block.data, items: items.filter((_, j) => j !== i) } });
  };

  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex items-start gap-2 group/item">
          <span className="mt-[9px] w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: 'var(--accent)' }} />
          <input
            value={item}
            onChange={(e) => updateItem(i, e.target.value)}
            readOnly={!editMode}
            className="flex-1 bg-transparent text-[13px] leading-relaxed outline-none border-b border-transparent"
            style={{ color: 'var(--text-secondary)', borderColor: editMode ? 'var(--accent)' : 'transparent', cursor: editMode ? 'text' : 'default' }}
            placeholder="列表项..."
            onKeyDown={(e) => {
              if (!editMode) return;
              if (e.key === 'Enter') { e.preventDefault(); addItem(); }
              if (e.key === 'Backspace' && item === '' && items.length > 1) { e.preventDefault(); removeItem(i); }
            }}
          />
          {editMode && (
            <button
              onClick={() => removeItem(i)}
              className="opacity-0 group-hover/item:opacity-100 p-0.5 rounded transition-opacity"
              style={{ color: 'var(--text-tertiary)' }}
            ><Trash2 size={12} /></button>
          )}
        </div>
      ))}
      {editMode && (
        <button onClick={addItem} className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg transition-colors"
          style={{ color: 'var(--accent)', backgroundColor: 'var(--accent-bg)', border: '1px dashed var(--accent)' }}>
          <Plus size={10} /> 添加
        </button>
      )}
    </div>
  );
}

/* ====== 图片块 ====== */
function ImageBlockComp({ block, onChange, onLightbox, editMode }) {
  const [editing, setEditing] = useState(!block.data.src);
  const [url, setUrl] = useState(block.data.src || '');

  if (!block.data.src || (editing && editMode)) {
    if (!editMode && block.data.src) {
      // 非编辑模式有src就直接展示
      return (
        <div className="relative group/img rounded-xl overflow-hidden border cursor-pointer"
          style={{ borderColor: 'var(--border-color)' }}
          onClick={() => onLightbox && onLightbox(block.data.src)}
        >
          <img src={block.data.src} alt="" className="w-full h-auto block max-h-96 object-contain" style={{ backgroundColor: 'var(--bg-tertiary)' }} />
        </div>
      );
    }
    return (
      <div className="rounded-xl border-2 border-dashed p-6 text-center" style={{ borderColor: 'var(--border-color)' }}>
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          readOnly={!editMode}
          onKeyDown={(e) => {
            if (!editMode) return;
            if (e.key === 'Enter' && url.trim()) {
              onChange({ ...block, data: { ...block.data, src: url.trim() } });
              setEditing(false);
            }
          }}
          placeholder="粘贴图片URL，然后回车..."
          className="w-full bg-transparent text-sm outline-none text-center"
          style={{ color: 'var(--text-primary)' }}
          autoFocus
        />
        <div className="text-[10px] mt-2" style={{ color: 'var(--text-tertiary)' }}>
          支持外部链接，也可以粘贴截图（Ctrl+V）
        </div>
      </div>
    );
  }

  return (
    <div className="relative group/img rounded-xl overflow-hidden border cursor-pointer"
      style={{ borderColor: 'var(--border-color)' }}
      onClick={() => onLightbox && onLightbox(block.data.src)}
    >
      <img src={block.data.src} alt="" className="w-full h-auto block max-h-96 object-contain" style={{ backgroundColor: 'var(--bg-tertiary)' }} />
      {editMode && (
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-3">
          <button onClick={(e) => { e.stopPropagation(); setEditing(true); }}
            className="px-3 py-1.5 rounded-lg text-white text-xs" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>换图</button>
          <button onClick={(e) => { e.stopPropagation(); onLightbox && onLightbox(block.data.src); }}
            className="px-3 py-1.5 rounded-lg text-white text-xs" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}><ZoomIn size={14} className="inline mr-1" />放大</button>
        </div>
      )}
    </div>
  );
}

/* ====== 表格块 ====== */
function TableBlock({ block, onChange, editMode }) {
  const { headers, rows } = block.data;
  const updateCell = (ri, ci, val) => {
    const next = rows.map((r, i) => i === ri ? r.map((c, j) => j === ci ? val : c) : r);
    onChange({ ...block, data: { ...block.data, rows: next } });
  };
  const addRow = () => onChange({ ...block, data: { ...block.data, rows: [...rows, headers.map(() => '')] } });
  const delRow = (ri) => onChange({ ...block, data: { ...block.data, rows: rows.filter((_, i) => i !== ri) } });
  const updateHeader = (ci, val) => {
    const next = [...headers];
    next[ci] = val;
    onChange({ ...block, data: { ...block.data, headers: next } });
  };

  return (
    <div className="data-table-wrapper">
      <div className="overflow-x-auto">
        <table>
          <thead><tr>{headers.map((h, i) => (
            <th key={i}><input value={h} onChange={(e) => updateHeader(i, e.target.value)} readOnly={!editMode} className="bg-transparent outline-none text-inherit w-full"
              style={{ color: 'var(--text-primary)', cursor: editMode ? 'text' : 'default' }} /></th>
          ))}</tr></thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr key={ri} className="group/row">
                {row.map((cell, ci) => (
                  <td key={ci}><input value={cell} onChange={(e) => updateCell(ri, ci, e.target.value)}
                    readOnly={!editMode} className="bg-transparent outline-none text-inherit w-full"
                    style={{ color: 'var(--text-secondary)', cursor: editMode ? 'text' : 'default' }} /></td>
                ))}
                {editMode && <td className="w-8"><button onClick={() => delRow(ri)} className="opacity-0 group-hover/row:opacity-100 p-0.5" style={{ color: 'var(--text-tertiary)' }}><Trash2 size={12} /></button></td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {editMode && (
        <button onClick={addRow} className="w-full py-2 text-xs transition-colors"
          style={{ color: 'var(--accent)', backgroundColor: 'var(--accent-bg)' }}>+ 添加行</button>
      )}
    </div>
  );
}

/* ====== 术语块 ====== */
function TermsBlock({ block, onChange, editMode }) {
  const terms = block.data.terms || [];
  const updateTerm = (i, field, val) => {
    const next = terms.map((t, j) => j === i ? { ...t, [field]: val } : t);
    onChange({ ...block, data: { ...block.data, terms: next } });
  };
  const addTerm = () => onChange({ ...block, data: { ...block.data, terms: [...terms, { id: uid(), name: '', desc: '' }] } });
  const delTerm = (i) => onChange({ ...block, data: { ...block.data, terms: terms.filter((_, j) => j !== i) } });

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {terms.map((t, i) => (
          <div key={t.id} className="term-card group/term relative">
            {editMode && (
              <button onClick={() => delTerm(i)} className="absolute top-2 right-2 opacity-0 group-hover/term:opacity-100 p-0.5"
                style={{ color: 'var(--text-tertiary)' }}><Trash2 size={12} /></button>
            )}
            <input value={t.name} onChange={(e) => updateTerm(i, 'name', e.target.value)} readOnly={!editMode}
              className="font-bold text-[13px] bg-transparent outline-none w-full mb-1.5" style={{ color: 'var(--accent)', cursor: editMode ? 'text' : 'default' }} placeholder="术语名" />
            <textarea value={t.desc} onChange={(e) => updateTerm(i, 'desc', e.target.value)} readOnly={!editMode}
              className="text-xs leading-relaxed bg-transparent outline-none w-full resize-none" style={{ color: 'var(--text-secondary)', cursor: editMode ? 'text' : 'default' }}
              placeholder="描述..." rows={2} />
          </div>
        ))}
      </div>
      {editMode && (
        <button onClick={addTerm} className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg"
          style={{ color: 'var(--accent)', backgroundColor: 'var(--accent-bg)', border: '1px dashed var(--accent)' }}>
          <Plus size={10} /> 添加术语
        </button>
      )}
    </div>
  );
}

/* ====== 模型块 ====== */
function ModelsBlock({ block, onChange, editMode }) {
  const models = block.data.models || [];
  const updateModel = (i, field, val) => {
    const next = models.map((m, j) => j === i ? { ...m, [field]: val } : m);
    onChange({ ...block, data: { ...block.data, models: next } });
  };
  const addModel = () => onChange({ ...block, data: { ...block.data, models: [...models, { id: uid(), name: '', tag: '标签', tagColor: 'red', desc: '' }] } });
  const delModel = (i) => onChange({ ...block, data: { ...block.data, models: models.filter((_, j) => j !== i) } });

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {models.map((m, i) => {
          const c = tagColors[m.tagColor] || tagColors.red;
          return (
            <div key={m.id} className="model-card group/model relative">
              {editMode && (
                <button onClick={() => delModel(i)} className="absolute top-2 right-2 opacity-0 group-hover/model:opacity-100 p-0.5"
                  style={{ color: 'var(--text-tertiary)' }}><Trash2 size={12} /></button>
              )}
              <div className="flex items-center gap-2 mb-2">
                <input value={m.name} onChange={(e) => updateModel(i, 'name', e.target.value)} readOnly={!editMode}
                  className="font-semibold text-[13px] bg-transparent outline-none flex-1" style={{ color: 'var(--text-primary)', cursor: editMode ? 'text' : 'default' }} placeholder="模型名" />
                {editMode ? (
                  <select value={m.tagColor} onChange={(e) => updateModel(i, 'tagColor', e.target.value)}
                    className="text-[10px] rounded px-1 py-0.5 outline-none" style={{ backgroundColor: 'transparent', color: c.text, border: `1px solid ${c.border}` }}>
                    <option value="red">红色</option><option value="green">绿色</option>
                    <option value="yellow">黄色</option><option value="purple">紫色</option>
                  </select>
                ) : (
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                    style={{ backgroundColor: c.bg, color: c.text, border: `1px solid ${c.border}` }}>{m.tag}</span>
                )}
              </div>
              <input value={m.tag} onChange={(e) => updateModel(i, 'tag', e.target.value)} readOnly={!editMode}
                className="text-[10px] bg-transparent outline-none w-full mb-1" style={{ color: c.text, cursor: editMode ? 'text' : 'default' }} placeholder="标签" />
              {m.desc !== undefined && (
                <textarea value={m.desc} onChange={(e) => updateModel(i, 'desc', e.target.value)} readOnly={!editMode}
                  className="text-xs leading-relaxed bg-transparent outline-none w-full resize-none" style={{ color: 'var(--text-secondary)', cursor: editMode ? 'text' : 'default' }} rows={2} />
              )}
            </div>
          );
        })}
      </div>
      {editMode && (
        <button onClick={addModel} className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg"
          style={{ color: 'var(--accent)', backgroundColor: 'var(--accent-bg)', border: '1px dashed var(--accent)' }}>
          <Plus size={10} /> 添加模型
        </button>
      )}
    </div>
  );
}

/* ====== 附件块 ====== */
function AttachmentBlock({ block, onChange, editMode }) {
  const d = block.data;
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl border" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-tertiary)' }}>
      <FileText size={20} style={{ color: 'var(--text-tertiary)' }} />
      <div className="flex-1 space-y-1">
        <input value={d.name || ''} onChange={(e) => onChange({ ...block, data: { ...d, name: e.target.value } })}
          readOnly={!editMode} className="text-[13px] font-medium bg-transparent outline-none w-full"
          style={{ color: 'var(--text-primary)', cursor: editMode ? 'text' : 'default' }} placeholder="文件名" />
        <input value={d.url || ''} onChange={(e) => onChange({ ...block, data: { ...d, url: e.target.value } })}
          readOnly={!editMode} className="text-[11px] bg-transparent outline-none w-full"
          style={{ color: 'var(--text-tertiary)', cursor: editMode ? 'text' : 'default' }} placeholder="链接URL" />
      </div>
    </div>
  );
}

/* ====== 主编辑器 ====== */
export default function FeishuEditor({ content, onChange, color, onImageClick, editMode }) {
  const [slashPos, setSlashPos] = useState(null);
  const [slashFilter, setSlashFilter] = useState('');
  const [slashIdx, setSlashIdx] = useState(-1);
  const [formatPos, setFormatPos] = useState(null);
  const [hoverIdx, setHoverIdx] = useState(-1);
  const [newFocusIdx, setNewFocusIdx] = useState(-1);

  const updateBlock = (idx, updated) => {
    const next = [...content];
    next[idx] = updated;
    onChange(next);
  };

  const insertBlock = (idx, type) => {
    const next = [...content];
    next.splice(idx + 1, 0, newBlock(type));
    onChange(next);
    setNewFocusIdx(idx + 1);
    setSlashPos(null);
  };

  const deleteBlock = (idx) => {
    if (content.length <= 1) return;
    onChange(content.filter((_, i) => i !== idx));
  };

  const moveBlock = (idx, dir) => {
    const target = idx + dir;
    if (target < 0 || target >= content.length) return;
    const next = [...content];
    [next[idx], next[target]] = [next[target], next[idx]];
    onChange(next);
  };

  const handleFormatAction = (cmd) => {
    if (cmd === 'link') {
      const url = prompt('输入链接URL:');
      if (url) document.execCommand('createLink', false, url);
    } else {
      document.execCommand(cmd, false);
    }
    setFormatPos(null);
    // 触发保存
    const sel = window.getSelection();
    if (sel?.anchorNode?.parentElement) {
      const el = sel.anchorNode.parentElement.closest('[contenteditable]');
      if (el) el.dispatchEvent(new Event('input', { bubbles: true }));
    }
  };

  return (
    <div className="feishu-editor" style={{ position: 'relative' }}>
      {content.map((block, idx) => (
        <div
          key={block.id}
          className="feishu-block group/block relative"
          onMouseEnter={() => setHoverIdx(idx)}
          onMouseLeave={() => setHoverIdx(-1)}
          style={{ paddingLeft: editMode ? '48px' : '0px' }}
        >
          {/* 左侧操作手柄——仅编辑模式 */}
          {editMode && (
          <div
            className="absolute left-0 top-0 flex items-center gap-0.5 transition-opacity"
            style={{ opacity: hoverIdx === idx ? 1 : 0, paddingTop: block.type === 'heading' ? 4 : 6 }}
          >
            <button onClick={() => insertBlock(idx - 1, 'paragraph')}
              className="p-0.5 rounded transition-colors" style={{ color: 'var(--text-tertiary)' }}
              title="上方插入"
            ><Plus size={14} /></button>
            <button className="p-0.5 cursor-grab" style={{ color: 'var(--text-tertiary)' }} title="拖拽排序">
              <GripVertical size={14} />
            </button>
            {content.length > 1 && (
              <button onClick={() => deleteBlock(idx)} className="p-0.5 rounded transition-colors hover:text-red-400"
                style={{ color: 'var(--text-tertiary)' }} title="删除"><Trash2 size={14} /></button>
            )}
            <button onClick={() => moveBlock(idx, -1)} className="p-0.5 rounded" style={{ color: 'var(--text-tertiary)', opacity: idx === 0 ? 0.3 : 1 }}
              title="上移" disabled={idx === 0}><MoveUp size={12} /></button>
            <button onClick={() => moveBlock(idx, 1)} className="p-0.5 rounded"
              style={{ color: 'var(--text-tertiary)', opacity: idx === content.length - 1 ? 0.3 : 1 }}
              title="下移" disabled={idx === content.length - 1}><MoveDown size={12} /></button>
          </div>
          )}

          {/* 内容块渲染 */}
          <div className="min-h-[1.5em]">
            {block.type === 'paragraph' || block.type === 'heading' ? (
              <TextBlock
                block={block}
                onChange={(v) => updateBlock(idx, v)}
                onSlash={(pos) => { setSlashPos(pos); setSlashIdx(idx); }}
                onFormat={setFormatPos}
                focused={newFocusIdx === idx}
                editMode={editMode}
              />
            ) : block.type === 'image' ? (
              <ImageBlockComp block={block} onChange={(v) => updateBlock(idx, v)} onLightbox={onImageClick} editMode={editMode} />
            ) : block.type === 'list' ? (
              <ListBlock block={block} onChange={(v) => updateBlock(idx, v)} editMode={editMode} />
            ) : block.type === 'table' ? (
              <TableBlock block={block} onChange={(v) => updateBlock(idx, v)} editMode={editMode} />
            ) : block.type === 'terms' ? (
              <TermsBlock block={block} onChange={(v) => updateBlock(idx, v)} editMode={editMode} />
            ) : block.type === 'models' ? (
              <ModelsBlock block={block} onChange={(v) => updateBlock(idx, v)} editMode={editMode} />
            ) : block.type === 'attachment' ? (
              <AttachmentBlock block={block} onChange={(v) => updateBlock(idx, v)} editMode={editMode} />
            ) : block.type === 'divider' ? (
              <div className="py-2"><hr style={{ borderColor: 'var(--border-color)' }} /></div>
            ) : null}
          </div>
        </div>
      ))}

      {/* 底部快速插入——仅编辑模式 */}
      {editMode && (
      <div className="flex items-center gap-1.5 mt-3 pl-12">
        {[
          { t: 'paragraph', icon: '¶', label: '文本' },
          { t: 'heading', icon: 'H', label: '标题' },
          { t: 'image', icon: '🖼️', label: '图片' },
          { t: 'list', icon: '≡', label: '列表' },
          { t: 'table', icon: '⊞', label: '表格' },
          { t: 'terms', icon: '📋', label: '术语' },
          { t: 'models', icon: '⭐', label: '模型' },
          { t: 'divider', icon: '—', label: '分割线' },
          { t: 'attachment', icon: '📎', label: '附件' },
        ].map(({ t, icon, label }) => (
          <button key={t} onClick={() => insertBlock(content.length - 1, t)}
            className="text-xs px-2.5 py-1.5 rounded-lg transition-all duration-200 hover:scale-110"
            style={{ color: 'var(--text-tertiary)', backgroundColor: 'var(--bg-tertiary)', border: '1px solid transparent' }}
            title={`插入${label}`}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--accent)';
              e.currentTarget.style.backgroundColor = 'var(--accent-bg)';
              e.currentTarget.style.borderColor = 'var(--accent)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--text-tertiary)';
              e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)';
              e.currentTarget.style.borderColor = 'transparent';
            }}
          >{icon}</button>
        ))}
      </div>
      )}

      {/* Slash 菜单——仅编辑模式 */}
      {editMode && slashPos && (
        <SlashMenu position={slashPos} filter={slashFilter} onSelect={(type) => {
          insertBlock(slashIdx >= 0 ? slashIdx : content.length - 1, type);
        }} onClose={() => { setSlashPos(null); setSlashIdx(-1); }} />
      )}

      {/* 格式化工具栏——仅编辑模式 */}
      {editMode && (
      <FormatToolbar position={formatPos} onAction={handleFormatAction} onHeading={(level) => {
        document.execCommand('formatBlock', false, `h${level}`);
        setFormatPos(null);
        const sel = window.getSelection();
        if (sel?.anchorNode?.parentElement) {
          const el = sel.anchorNode.parentElement.closest('[contenteditable]');
          if (el) el.dispatchEvent(new Event('input', { bubbles: true }));
        }
      }} />
      )}
    </div>
  );
}