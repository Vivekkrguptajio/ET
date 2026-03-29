import './CTAFooter.css';

export default function CTAFooter() {
  return (
    <footer className="cta-footer" id="cta-footer">
      <div className="container cta-inner">
        <div className="cta-content">
          <h3 className="cta-title">Ready to take control of your money?</h3>
          <p className="cta-desc">Get personalized insights and start your financial journey today.</p>
        </div>
        <div className="cta-buttons">
          <button className="btn-primary btn-large" id="cta-open-app">
            📱 Open in ET App
          </button>
          <button className="btn-secondary" id="cta-share">
            🔗 Share Results
          </button>
        </div>
      </div>
      <div className="footer-bottom">
        <span className="footer-brand">
          <span className="logo-icon-sm">₹</span> ET — Smart Money by AI
        </span>
        <span className="footer-copy">© 2026 ET Finance. All rights reserved.</span>
      </div>
    </footer>
  );
}
