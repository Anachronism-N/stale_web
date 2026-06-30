import { useEffect, useCallback } from 'react';
import { X } from 'lucide-react';

export default function ImageLightbox({ src, onClose }) {
  const handleKey = useCallback((e) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [handleKey]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center animate-fade-in"
      style={{ backgroundColor: 'rgba(0,0,0,0.94)', backdropFilter: 'blur(12px)' }}
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-5 right-5 w-10 h-10 rounded-full flex items-center justify-center text-white/70 transition-all duration-300 hover:text-white hover:scale-110 hover:bg-white/10 hover:rotate-90"
        style={{ border: '1px solid rgba(255,255,255,0.12)' }}
      >
        <X size={20} />
      </button>
      <div className="absolute top-5 left-5 text-white/30 text-xs tracking-wide">
        ESC 关闭 · 点击空白关闭
      </div>
      <img
        src={src}
        alt=""
        className="max-w-[92vw] max-h-[92vh] object-contain rounded-xl"
        style={{
          boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
          animation: 'lightboxIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        }}
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}