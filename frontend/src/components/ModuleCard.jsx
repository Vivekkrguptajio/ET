import { Link } from 'react-router-dom';
import './ModuleCard.css';

export default function ModuleCard({ icon, title, description, to, color = 'blue', delay = 0 }) {
  const colorMap = {
    blue:  '--color-accent-blue',
    green: '--color-accent-green',
    gold:  '--color-accent-gold',
    red:   '--color-danger',
  };

  return (
    <Link
      to={to}
      className="module-card card animate-fadeInUp"
      id={`module-card-${title.toLowerCase().replace(/\s/g, '-')}`}
      style={{
        '--card-accent': `var(${colorMap[color]})`,
        animationDelay: `${delay}s`,
      }}
    >
      <div className="module-icon-wrap">
        <span className="module-icon">{icon}</span>
      </div>
      <h3 className="module-title">{title}</h3>
      <p className="module-desc">{description}</p>
      <div className="module-cta">
        <span>Try Now</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12h14M12 5l7 7-7 7"/>
        </svg>
      </div>
    </Link>
  );
}
