import React from 'react';

export default function SiteFooter() {
  return (
    <div className="portfolio-component-scope">
      <footer 
        className="py-3 px-4 w-100"
        style={{ 
          backgroundColor: '#090d16', 
          opacity: '1', 
          borderTop: '1px solid #111827' 
        }}
      >
        {/* 📍 PERFECT FOOTER FIX: Calibrated from 950px up to 1024px to balance inner container grids perfectly */}
        <div 
          className="container mx-auto d-flex flex-column flex-sm-row justify-content-between gap-2 font-mono" 
          style={{ fontSize: '1rem', color: '#475569', maxWidth: '1024px', width: '100%', boxSizing: 'border-box' }}
        >
          <div>Made with care © 2026 John Willenborg</div>
          <div>Built using React and a custom Bootstrap Grid.</div>
        </div>
      </footer>
    </div>
  );
}
