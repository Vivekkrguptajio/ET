import HeroSection from '../components/HeroSection';
import ModuleCard from '../components/ModuleCard';
import CTAFooter from '../components/CTAFooter';
import './Landing.css';

const modules = [
  {
    icon: '🧮',
    title: 'Tax Wizard',
    description: 'AI-powered tax analysis. Old vs New regime comparison, deduction optimizer, and personalized tax-saving strategies.',
    to: '/tax-wizard',
    color: 'blue',
  },
  {
    icon: '❤️‍🩹',
    title: 'Health Score',
    description: 'Take a quick money health quiz and get your financial fitness score with personalized improvement roadmap.',
    to: '/health-score',
    color: 'green',
  },
  {
    icon: '🔥',
    title: 'FIRE Planner',
    description: 'Plan your early retirement. Calculate your FIRE number, required SIPs, and get a month-by-month roadmap.',
    to: '/fire-planner',
    color: 'gold',
  },
  {
    icon: '💑',
    title: 'Couples Planner',
    description: 'Optimize joint finances. Smart expense splitting, combined tax savings, and shared goal tracking.',
    to: '/couples-planner',
    color: 'red',
  },
];

export default function Landing() {
  return (
    <div className="landing-page" id="landing-page">
      <HeroSection
        title="Smart Money,"
        highlight="Powered by AI"
        subtitle="AI-driven financial tools designed for India. Analyze taxes, check your money health, plan early retirement, and optimize couple finances — all in one place."
        ctaText="Explore Tools"
        onCtaClick={() => {
          document.getElementById('module-grid')?.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      <section className="modules-section container" id="modules-section">
        <div className="section-header animate-fadeInUp">
          <span className="section-tag">AI MODULES</span>
          <h2>Your Financial Toolkit</h2>
          <p className="section-desc">Four powerful AI modules to transform your financial life.</p>
        </div>

        <div className="module-grid" id="module-grid">
          {modules.map((m, i) => (
            <ModuleCard key={m.to} {...m} delay={0.1 + i * 0.1} />
          ))}
        </div>
      </section>

      {/* Stats bar */}
      <section className="stats-bar container">
        <div className="stats-inner glass animate-fadeInUp">
          <div className="stat-item">
            <span className="stat-value text-gradient">4</span>
            <span className="stat-label">AI Modules</span>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <span className="stat-value text-green">₹2.4Cr+</span>
            <span className="stat-label">Tax Saved</span>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <span className="stat-value text-gold">15K+</span>
            <span className="stat-label">Users Analyzed</span>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <span className="stat-value" style={{ color: 'var(--color-danger)' }}>98%</span>
            <span className="stat-label">Accuracy</span>
          </div>
        </div>
      </section>

      <CTAFooter />
    </div>
  );
}
