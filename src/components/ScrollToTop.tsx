'use client';

import { useEffect } from 'react';

export default function ScrollToTop() {
  useEffect(() => {
    const handleClick = () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    window.addEventListener('scroll', () => {
      const btn = document.getElementById('scroll-to-top');
      if (btn) {
        btn.style.display = window.scrollY > 300 ? 'flex' : 'none';
      }
    });

    const btn = document.getElementById('scroll-to-top');
    if (btn) btn.addEventListener('click', handleClick);
  }, []);

  return (
    <button
      id="scroll-to-top"
      className="fixed bottom-6 start-6 z-40 w-10 h-10 rounded-full bg-[#F61A5A]/80 text-white flex items-center justify-center shadow-lg hover:bg-[#F61A5A] transition-all hover:scale-110"
      style={{ display: 'none' }}
      aria-label="Scroll to top"
    >
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    </button>
  );
}
