import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

function Home() {
  return (
    <div className="home">
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">
              Prepare for CDS with <span className="highlight">Real Mock Tests</span>
            </h1>
            <p className="hero-subtitle">
              Practice with exam-pattern tests. Get instant analysis. Track your rank. Join thousands preparing for CDS.
            </p>
            <div className="hero-buttons">
              <Link to="/register" className="btn btn-primary btn-large">
                Start Free Trial
              </Link>
              <Link to="/login" className="btn btn-outline btn-large">
                Login
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="features">
        <div className="container">
          <h2 className="section-title">Why Choose Us?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">⏱️</div>
              <h3>Real Exam Timer</h3>
              <p>Practice with actual 2-hour exam timer with auto-submission</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Instant Analysis</h3>
              <p>Get detailed performance analysis after every test</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🏆</div>
              <h3>Leaderboard</h3>
              <p>Compare your rank with other aspirants nationwide</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📝</div>
              <h3>All Subjects</h3>
              <p>English, General Knowledge, and Mathematics</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💯</div>
              <h3>Accurate Scoring</h3>
              <p>Proper negative marking as per CDS pattern</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📱</div>
              <h3>Mobile Friendly</h3>
              <p>Practice anywhere, anytime on any device</p>
            </div>
          </div>
        </div>
      </section>

      <section className="exam-info">
        <div className="container">
          <h2 className="section-title">About CDS Exam</h2>
          <div className="info-grid">
            <div className="info-card">
              <h3>🎯 Conducted By</h3>
              <p>Union Public Service Commission (UPSC)</p>
            </div>
            <div className="info-card">
              <h3>🎖️ For Entry To</h3>
              <p>IMA, INA, AFA, OTA</p>
            </div>
            <div className="info-card">
              <h3>📚 Subjects</h3>
              <p>English, GK, Mathematics</p>
            </div>
            <div className="info-card">
              <h3>⏰ Duration</h3>
              <p>2 Hours (120 Minutes)</p>
            </div>
          </div>
        </div>
      </section>

      <section className="pricing">
        <div className="container">
          <h2 className="section-title">Simple Pricing</h2>
          <div className="pricing-grid">
            <div className="pricing-card">
              <h3>Free</h3>
              <div className="price">₹0</div>
              <ul className="features-list">
                <li>✅ 1 Mock Test per Week</li>
                <li>✅ Basic Score Report</li>
                <li>✅ Leaderboard Access</li>
                <li>❌ Detailed Solutions</li>
                <li>❌ Unlimited Tests</li>
              </ul>
              <Link to="/register" className="btn btn-outline">Get Started</Link>
            </div>
            <div className="pricing-card featured">
              <div className="badge">Most Popular</div>
              <h3>Premium</h3>
              <div className="price">₹99<span>/month</span></div>
              <ul className="features-list">
                <li>✅ Unlimited Mock Tests</li>
                <li>✅ Detailed Solutions</li>
                <li>✅ Performance Analytics</li>
                <li>✅ Rank Prediction</li>
                <li>✅ Priority Support</li>
              </ul>
              <Link to="/register" className="btn btn-primary">Upgrade Now</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="cta">
        <div className="container">
          <h2>Ready to Start Your CDS Journey?</h2>
          <p>Join thousands of aspirants preparing for their dream career</p>
          <Link to="/register" className="btn btn-primary btn-large">
            Start Preparing Now
          </Link>
        </div>
      </section>
    </div>
  );
}

export default Home;
