import { useState, useEffect } from 'react';
import type { NavLink } from '../types';

interface NavbarProps {
  links: NavLink[];
  onNavigate?: (page: string) => void;
  currentPage?: string;
  lightTop?: boolean;
  currentUser?: any;
  onLogout?: () => void;
}

export default function Navbar({ links, onNavigate, currentPage = 'home', lightTop = false, currentUser, onLogout }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [showLogout, setShowLogout] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLink = (e: React.MouseEvent<HTMLAnchorElement>, link: NavLink) => {
    if (link.page && onNavigate) { e.preventDefault(); onNavigate(link.page); }
  };

  const handleLogo = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (onNavigate) { e.preventDefault(); onNavigate('home'); }
  };

  const displayName = currentUser?.user_type === 'legal_entity'
    ? currentUser?.legal_entity_name
    : currentUser?.first_name;

  const initial = displayName?.[0]?.toUpperCase() ?? '?';

  return (
    <>
      <nav className={`navbar ${(scrolled || lightTop) ? 'navbar--scrolled' : ''}`}>
        {/* Logo */}
        <a href="/" className="navbar__logo" aria-label="SookD Home" onClick={handleLogo}>
          <img src="/img/logo.png" alt="SookD logo" className="navbar__logo-img" />
        </a>

        {/* Center links */}
        <ul className="navbar__links">
          {links.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className={`navbar__link${link.page === currentPage ? ' navbar__link--active' : ''}`}
                onClick={(e) => handleLink(e, link)}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        {/* Right side */}
        <div className="navbar__right">
          {currentUser ? (
            <>
              {/* Cart */}
              <button className="navbar__icon-btn" aria-label="Cart">
                <img src="/img/cart icon.png" alt="Cart" width="26" height="26" style={{ objectFit: 'contain', borderRadius: 2 }} />
              </button>
              <div className="navbar__divider" />
              {/* Avatar + Name */}
              <button className="navbar__user-btn" onClick={() => onNavigate?.('profile')}>
                <div className="navbar__avatar">{initial}</div>
                <span className="navbar__username">{displayName}</span>
              </button>
              {/* Logout */}
              <button className="navbar__icon-btn" aria-label="Logout" onClick={() => setShowLogout(true)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16 17 21 12 16 7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
              </button>
            </>
          ) : (
            <>
              <a href="#join" className="navbar__cta" onClick={e => { e.preventDefault(); onNavigate?.('login'); }}>Join Us</a>
            </>
          )}
        </div>
      </nav>

      {/* Logout confirmation modal */}
      {showLogout && (
        <div className="navbar-logout-overlay" onClick={() => setShowLogout(false)}>
          <div className="navbar-logout-modal" onClick={e => e.stopPropagation()}>
            <button className="navbar-logout-modal__x" onClick={() => setShowLogout(false)}>×</button>
            <h3 className="navbar-logout-modal__title">Are you sure?</h3>
            <p className="navbar-logout-modal__body">Do you really want to delete the comment/rating? This action cannot be done.</p>
            <div className="navbar-logout-modal__btns">
              <button className="navbar-logout-modal__btn navbar-logout-modal__btn--confirm"
                onClick={() => { setShowLogout(false); onLogout?.(); }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                  <path d="M10 11v6M14 11v6"/>
                  <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                </svg>
                Confirm
              </button>
              <button className="navbar-logout-modal__btn navbar-logout-modal__btn--cancel"
                onClick={() => setShowLogout(false)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
