import { useState, useEffect } from 'react';
import type { NavLink } from '../types';

interface NavbarProps {
  links: NavLink[];
  onNavigate?: (page: string) => void;
  currentPage?: string;
  lightTop?: boolean;
  currentUser?: any;
  onLogout?: () => void;
  lang?: 'TH' | 'ENG';
  onLangChange?: (lang: 'TH' | 'ENG') => void;
  cartCount?: number;
}

const NAV_LABELS_TH: Record<string, string> = {
  'Experiences': 'กิจกรรม',
  'Product': 'สินค้า',
  'Discover': 'สำรวจ',
  'Membership': 'ระบบสมาชิก',
  'About': 'เกี่ยวกับเรา',
};

export default function Navbar({ links, onNavigate, currentPage = 'home', lightTop = false, currentUser, onLogout, lang = 'TH', onLangChange, cartCount = 0 }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLink = (e: React.MouseEvent<HTMLAnchorElement>, link: NavLink) => {
    if (link.page && onNavigate) {
      e.preventDefault();
      (window as any).gtag?.('event', 'click_nav_menu', { menu_item: link.label });
      onNavigate(link.page);
      setDrawerOpen(false);
    }
  };

  const handleLogo = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (onNavigate) { e.preventDefault(); onNavigate('home'); }
  };

  const displayName = currentUser?.user_type === 'legal_entity'
    ? currentUser?.legal_entity_name
    : currentUser?.user_name;

  const initial = displayName?.[0]?.toUpperCase() ?? '?';

  return (
    <>
      <nav className={`navbar ${(scrolled || lightTop) ? 'navbar--scrolled' : ''}`}>
        {/* Hamburger button — mobile only */}
        <button
          className="navbar__hamburger"
          aria-label="Open menu"
          onClick={() => setDrawerOpen(true)}
        >
          <span /><span /><span />
        </button>

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
                {lang === 'TH' ? (NAV_LABELS_TH[link.label] ?? link.label) : link.label}
              </a>
            </li>
          ))}
        </ul>

        {/* Right side */}
        <div className="navbar__right">
          {currentUser ? (
            <>
              {/* Cart */}
              <button className="navbar__icon-btn" aria-label="Cart" onClick={() => onNavigate?.('cart')} style={{ position: 'relative' }}>
                <img src="/img/cart icon.png" alt="Cart" width="26" height="26" style={{ objectFit: 'contain', borderRadius: 2 }} />
                {cartCount > 0 && (
                  <span style={{
                    position: 'absolute', top: -6, right: -6,
                    background: '#e53935', color: '#fff',
                    borderRadius: '50%', width: 18, height: 18,
                    fontSize: '0.7rem', fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    lineHeight: 1, pointerEvents: 'none',
                  }}>{cartCount > 99 ? '99+' : cartCount}</span>
                )}
              </button>
              {/* Language switcher */}
              <div className="navbar__lang">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                </svg>
                <button className={`navbar__lang-btn${lang === 'TH' ? ' navbar__lang-btn--active' : ''}`} onClick={() => onLangChange?.('TH')}>TH</button>
                <span className="navbar__lang-sep">|</span>
                <button className={`navbar__lang-btn${lang === 'ENG' ? ' navbar__lang-btn--active' : ''}`} onClick={() => onLangChange?.('ENG')}>ENG</button>
              </div>
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
              {/* Language switcher */}
              <div className="navbar__lang">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                </svg>
                <button className={`navbar__lang-btn${lang === 'TH' ? ' navbar__lang-btn--active' : ''}`} onClick={() => onLangChange?.('TH')}>TH</button>
                <span className="navbar__lang-sep">|</span>
                <button className={`navbar__lang-btn${lang === 'ENG' ? ' navbar__lang-btn--active' : ''}`} onClick={() => onLangChange?.('ENG')}>ENG</button>
              </div>
              <div className="navbar__divider" />
              <a href="#join" className="navbar__cta" onClick={e => { e.preventDefault(); (window as any).gtag?.('event', 'click_join_us'); onNavigate?.('login'); }}>{lang === 'TH' ? 'เข้าร่วมกับเรา' : 'Join Us'}</a>
            </>
          )}
        </div>
      </nav>

      {/* Mobile drawer overlay */}
      {drawerOpen && (
        <div className="navbar__drawer-overlay" onClick={() => setDrawerOpen(false)} />
      )}

      {/* Mobile drawer */}
      <div className={`navbar__drawer ${drawerOpen ? 'navbar__drawer--open' : ''}`}>
        <button className="navbar__drawer-close" onClick={() => setDrawerOpen(false)} aria-label="Close menu">✕</button>

        <a href="/" className="navbar__logo navbar__drawer-logo" onClick={e => { handleLogo(e); setDrawerOpen(false); }}>
          <img src="/img/logo.png" alt="SookD logo" className="navbar__logo-img" />
        </a>

        <ul className="navbar__drawer-links">
          {links.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className={`navbar__drawer-link${link.page === currentPage ? ' navbar__drawer-link--active' : ''}`}
                onClick={(e) => handleLink(e, link)}
              >
                {lang === 'TH' ? (NAV_LABELS_TH[link.label] ?? link.label) : link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="navbar__drawer-bottom">
          <div className="navbar__lang navbar__drawer-lang">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
            </svg>
            <button className={`navbar__lang-btn${lang === 'TH' ? ' navbar__lang-btn--active' : ''}`} onClick={() => onLangChange?.('TH')}>TH</button>
            <span className="navbar__lang-sep">|</span>
            <button className={`navbar__lang-btn${lang === 'ENG' ? ' navbar__lang-btn--active' : ''}`} onClick={() => onLangChange?.('ENG')}>ENG</button>
          </div>

          {currentUser ? (
            <div className="navbar__drawer-user">
              <div className="navbar__avatar">{initial}</div>
              <span className="navbar__username" style={{ color: 'var(--forest)' }}>{displayName}</span>
              <button className="navbar__icon-btn" style={{ color: 'var(--forest)', marginLeft: 'auto' }} onClick={() => { setDrawerOpen(false); setShowLogout(true); }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16 17 21 12 16 7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
              </button>
            </div>
          ) : (
            <a href="#join" className="navbar__cta navbar__drawer-cta"
              onClick={e => { e.preventDefault(); onNavigate?.('login'); setDrawerOpen(false); }}>
              {lang === 'TH' ? 'เข้าร่วมกับเรา' : 'Join Us'}
            </a>
          )}
        </div>
      </div>

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
