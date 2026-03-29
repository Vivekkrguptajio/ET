import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

const navLinks = [
  { path: '/', label: 'Home', icon: 'home' },
  { path: '/tax-wizard', label: 'Tax Wizard', icon: 'calculator' },
  { path: '/health-score', label: 'Health Score', icon: 'heart-pulse' },
  { path: '/fire-planner', label: 'FIRE Planner', icon: 'flame' },
  { path: '/couples-planner', label: 'Couples', icon: 'heart-handshake' },
];

export default function Navbar() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="navbar glass" id="main-navbar">
      <div className="navbar-inner container">
        {/* Logo */}
        <Link to="/" className="navbar-logo" id="navbar-logo">
          <span className="logo-icon">₹</span>
          <span className="logo-text">ET</span>
        </Link>

        {/* Desktop Nav */}
        <ul className="navbar-links" id="navbar-links">
          {navLinks.map((link) => (
            <li key={link.path}>
              <Link
                to={link.path}
                className={`nav-link ${location.pathname === link.path ? 'active' : ''}`}
                id={`nav-link-${link.label.toLowerCase().replace(/\s/g, '-')}`}
              >
                <i data-lucide={link.icon} className="nav-icon"></i>
                <span>{link.label}</span>
              </Link>
            </li>
          ))}
        </ul>

        {/* AI Badge */}
        <div className="ai-badge" id="ai-badge">
          <span className="badge-dot"></span>
          Powered by ET AI
        </div>

        {/* Mobile Toggle */}
        <button
          className="mobile-toggle"
          id="mobile-toggle"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          <span className={`hamburger ${mobileOpen ? 'open' : ''}`}></span>
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="mobile-menu animate-fadeIn" id="mobile-menu">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`mobile-link ${location.pathname === link.path ? 'active' : ''}`}
              onClick={() => setMobileOpen(false)}
            >
              <i data-lucide={link.icon}></i>
              <span>{link.label}</span>
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
