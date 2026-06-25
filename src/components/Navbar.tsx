import { useState, useEffect } from 'react';
import type { NavLink } from '../types';

interface NavbarProps {
  links: NavLink[];
  onNavigate?: (page: string) => void;
  currentPage?: string;
  lightTop?: boolean;
}

export default function Navbar({ links, onNavigate, currentPage = 'home', lightTop = false }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLink = (e: React.MouseEvent<HTMLAnchorElement>, link: NavLink) => {
    if (link.page && onNavigate) {
      e.preventDefault();
      onNavigate(link.page);
    }
  };

  const handleLogo = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (onNavigate) {
      e.preventDefault();
      onNavigate('home');
    }
  };

  return (
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
        <button className="navbar__lang" aria-label="Change language">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <circle cx="12" cy="12" r="10"/>
            <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
          </svg>
        </button>
        <div className="navbar__divider" />
        <a href="#join" className="navbar__cta">Join Us</a>
      </div>
    </nav>
  );
}
