import './MetricRow.css';

export default function MetricRow({ metrics }) {
  return (
    <div className="metric-row" id="metric-row">
      {metrics.map((m, i) => (
        <div
          key={i}
          className="metric-card card animate-fadeInUp"
          style={{
            '--metric-color': m.color || 'var(--color-accent-blue)',
            animationDelay: `${i * 0.1}s`,
          }}
          id={`metric-${i}`}
        >
          <div className="metric-value">{m.value}</div>
          <div className="metric-label">{m.label}</div>
          {m.sublabel && <div className="metric-sublabel">{m.sublabel}</div>}
        </div>
      ))}
    </div>
  );
}
