import { useState, useEffect } from 'react';

export default function ScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      setProgress(scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <div className="fixed top-0 left-0 h-[3px] z-50 transition-all duration-150" style={{
        width: `${progress}%`,
        background: 'linear-gradient(90deg, var(--accent), var(--purple), #f778ba)',
        boxShadow: '0 0 10px var(--accent-glow), 0 0 30px rgba(163,113,247,0.3)',
      }} />
      <div className="fixed top-0 left-0 h-[3px] z-50 opacity-30 pointer-events-none" style={{
        width: `${Math.min(progress + 3, 100)}%`,
        background: 'linear-gradient(90deg, var(--accent), var(--purple))',
        filter: 'blur(6px)',
        transition: 'width 0.3s ease-out',
      }} />
    </>
  );
}