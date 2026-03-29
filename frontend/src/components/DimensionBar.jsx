import { useEffect, useState } from 'react';
import './DimensionBar.css';

export default function DimensionBar({ label, score, maxScore = 100, color = 'var(--color-accent-blue)', delay = 0 }) {
  const [width, setWidth] = useState(0);
  const pct = Math.round((score / maxScore) * 100);

  useEffect(() => {
    const timer = setTimeout(() => setWidth(pct), 100 + delay * 150);
    return () => clearTimeout(timer);
  }, [pct, delay]);

  return (
    <div className="dimension-bar" style={{ animationDelay: `${delay * 0.1}s` }}>
      <div className="dim-header">
        <span className="dim-label">{label}</span>
        <span className="dim-score" style={{ color }}>{score}<span className="dim-max">/{maxScore}</span></span>
      </div>
      <div className="dim-track">
        <div
          className="dim-fill"
          style={{ width: `${width}%`, background: color, boxShadow: `0 0 12px ${color}` }}
        />
      </div>
    </div>
  );
}
