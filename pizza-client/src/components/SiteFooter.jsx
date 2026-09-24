import React from 'react';

export default function SiteFooter() {
  return (
    <div className="portfolio-component-scope">
      <footer className="py-3 px-4 border-top border-dark opacity-75 w-100">
        <div 
          className="container max-w-4xl mx-auto d-flex flex-column flex-sm-row justify-content-between gap-2 font-mono" 
          style={{ fontSize: '1rem', color: 'var(--text-muted)' }}
        >
          <div>Made with care © 2026 John Willenborg</div>
          <div>Built using React and a custom Bootstrap Grid.</div>
        </div>
      </footer>
    </div>
  );
}
