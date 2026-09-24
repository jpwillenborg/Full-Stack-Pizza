import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function SiteNavbar() {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hasScrolledDown, setHasScrolledDown] = useState(false);

  useEffect(() => {
    const handleWindowScroll = () => {
      if (window.scrollY > 4) {
        setHasScrolledDown(true);
      } else {
        setHasScrolledDown(false);
      }
    };
    window.addEventListener('scroll', handleWindowScroll);
    return () => window.removeEventListener('scroll', handleWindowScroll);
  }, []);

  const handleNavClick = (sectionId) => {
    setIsMobileMenuOpen(false);

    // Since we are inside the Pizza App (port 5175), force all portfolio anchors back to port 5173
    if (sectionId === 'top') {
      window.location.href = 'http://localhost:5173/';
      return;
    }
    
    // Point sections directly to your home page anchors on port 5173
    window.location.href = `http://localhost:5173/#${sectionId}`;
  };

  return (
    <div className="portfolio-component-scope">
      <nav className={`nav-container-minimal py-3 z-3 ${hasScrolledDown ? 'navbar-scrolled-active' : 'navbar-scrolled-top'}`}>
        <div className="container max-w-5xl mx-auto px-3">
          <div className="nav align-items-center m-0 w-100">
            <div className="col-6 col-md-3 p-0 text-start">
              <div 
                className="fs-3 fw-bold text-white tracking-tight d-inline-block text-lowercase" 
                style={{ cursor: 'pointer' }}
                onClick={() => window.location.href = 'http://localhost:5173/'}
              >
                john
                {/* 📍 TRUE ALIGNMENT FIX: Adds geometric padding to push the trailing text block cleanly to the right */}
                <span 
                  className="text-accent"
                  style={{ 
                    padding: '0 0.08em',
                    display: 'inline-block'
                  }}
                >
                  .
                </span>
                willenborg
              </div>
            </div>
            <div className="d-none d-md-flex col-md-6 p-0 justify-content-center align-items-center">
              <div className="d-flex" style={{ gap: '2.5rem' }}>
                {[
                  { label: 'Overview', id: 'top' },
                  { label: 'Tech Stack', id: 'skills' },
                  { label: 'Web Apps', id: 'projects' },
                  { label: 'Game Dev', id: 'gamedev' },
                  { label: '3D Modeling', id: 'modeling' }
                ].map((item) => (
                  <button 
                    key={item.label} 
                    onClick={() => handleNavClick(item.id)} 
                    className="btn btn-link p-0 text-decoration-none font-mono"
                    style={{ fontSize: '1.1rem', color: 'var(--text-secondary)' }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="col-6 col-md-3 p-0 text-end d-flex justify-content-end align-items-center">
              <button 
                onClick={() => handleNavClick('contact')} 
                className="btn btn-accent-action btn-sm d-none d-md-block button-elevated-shadow" 
                style={{ fontSize: '0.85rem', padding: '0.45rem 1.25rem' }}
              >
                Let&apos;s Connect
              </button>
              <button 
                className="btn btn-link fs-3 p-0 border-0 d-md-none" 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                <span style={{ color: 'var(--text-secondary)' }}>{isMobileMenuOpen ? '✕' : '☰'}</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {isMobileMenuOpen && (
        <div className="fixed-top vh-100 w-100 z-2 d-flex flex-column justify-content-center align-items-center d-md-none gap-4" style={{ backgroundColor: 'var(--portfolio-bg)' }}>
          {[
            { label: 'Overview', id: 'top' },
            { label: 'Tech Stack', id: 'skills' },
            { label: 'Web Apps', id: 'projects' },
            { label: 'Game Dev', id: 'gamedev' },
            { label: '3D Modeling', id: 'modeling' },
            { label: 'Let&apos;s Connect', id: 'contact' }
          ].map((item) => (
            <button 
              key={item.label} 
              onClick={() => handleNavClick(item.id)} 
              className="btn btn-link text-decoration-none text-light font-mono fw-bold"
              style={{ fontSize: '1.1rem' }}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
