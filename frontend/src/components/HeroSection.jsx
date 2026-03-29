import './HeroSection.css';

export default function HeroSection({ title, highlight, subtitle, ctaText, onCtaClick }) {
  return (
    <section className="hero" id="hero-section">
      {/* Background effects */}
      <div className="hero-bg-orb hero-orb-1"></div>
      <div className="hero-bg-orb hero-orb-2"></div>
      <div className="hero-grid-overlay"></div>

      <div className="hero-content container animate-fadeInUp">
        <h1 className="hero-title" id="hero-title">
          {title} <span className="text-gradient">{highlight}</span>
        </h1>
        <p className="hero-subtitle" id="hero-subtitle">{subtitle}</p>
        {ctaText && (
          <button
            className="btn-primary btn-large hero-cta"
            id="hero-cta"
            onClick={onCtaClick}
          >
            {ctaText}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>
        )}
      </div>
    </section>
  );
}
