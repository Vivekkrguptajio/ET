import './RoadmapTimeline.css';

export default function RoadmapTimeline({ milestones = [] }) {
  if (!milestones.length) return null;

  return (
    <div className="roadmap-timeline" id="roadmap-timeline">
      <h3 className="roadmap-title">Your Roadmap</h3>
      <div className="timeline">
        {milestones.map((m, i) => (
          <div
            key={i}
            className="timeline-item animate-fadeInUp"
            style={{ animationDelay: `${i * 0.15}s` }}
          >
            <div className="timeline-marker">
              <span className="marker-dot" style={{ background: m.color || 'var(--color-accent-blue)' }}></span>
              {i < milestones.length - 1 && <span className="marker-line"></span>}
            </div>
            <div className="timeline-card card">
              <div className="timeline-month">{m.month}</div>
              <h4 className="timeline-milestone">{m.title}</h4>
              <p className="timeline-desc">{m.description}</p>
              {m.target && (
                <div className="timeline-target" style={{ color: m.color || 'var(--color-accent-green)' }}>
                  🎯 {m.target}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
