import React from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';

const HomePage = () => {
  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>Build, Deploy, and Monetize AI Agents</h1>
          <p className="hero-subtitle">
            The comprehensive platform for creating intelligent AI solutions without coding expertise
          </p>
          <div className="hero-buttons">
            <Link to="/register" className="btn btn-primary">Get Started</Link>
            <Link to="/marketplace" className="btn btn-outline">Explore Marketplace</Link>
          </div>
        </div>
        <div className="hero-image">
          <img src="/images/hero-illustration.svg" alt="AI Platform Illustration" />
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <h2>Why Choose Our Platform?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <i className="fas fa-robot"></i>
            </div>
            <h3>No-Code Agent Builder</h3>
            <p>Create sophisticated AI agents with our intuitive drag-and-drop interface</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <i className="fas fa-cloud-upload-alt"></i>
            </div>
            <h3>One-Click Deployment</h3>
            <p>Deploy your agents to production with a single click</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <i className="fas fa-chart-line"></i>
            </div>
            <h3>Advanced Analytics</h3>
            <p>Track performance and gain insights from comprehensive dashboards</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <i className="fas fa-store"></i>
            </div>
            <h3>AI Marketplace</h3>
            <p>Monetize your agents or find pre-built solutions for your needs</p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works">
        <h2>How It Works</h2>
        <div className="steps">
          <div className="step">
            <div className="step-number">1</div>
            <h3>Create</h3>
            <p>Design your AI agent with our intuitive builder or customize from templates</p>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <h3>Train</h3>
            <p>Feed your agent with data and fine-tune it to match your specific needs</p>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <h3>Deploy</h3>
            <p>Launch your agent with one click and monitor its performance</p>
          </div>
          <div className="step">
            <div className="step-number">4</div>
            <h3>Monetize</h3>
            <p>List your agent on our marketplace and start earning revenue</p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="testimonials">
        <h2>What Our Users Say</h2>
        <div className="testimonials-grid">
          <div className="testimonial-card">
            <div className="testimonial-content">
              <p>"This platform has revolutionized how we implement AI in our business. In just weeks, we deployed a customer service agent that saved us thousands."</p>
            </div>
            <div className="testimonial-author">
              <img src="/images/testimonial-1.jpg" alt="Testimonial Author" />
              <div>
                <h4>Sarah Johnson</h4>
                <p>CTO, TechCorp Inc.</p>
              </div>
            </div>
          </div>
          <div className="testimonial-card">
            <div className="testimonial-content">
              <p>"As a solo entrepreneur, I was able to build and monetize an AI marketing assistant in days. The marketplace gave me a global customer base instantly."</p>
            </div>
            <div className="testimonial-author">
              <img src="/images/testimonial-2.jpg" alt="Testimonial Author" />
              <div>
                <h4>David Chen</h4>
                <p>Founder, MarketBoost</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <h2>Ready to Transform Your Business with AI?</h2>
        <p>Join thousands of businesses and developers building the future with our platform</p>
        <Link to="/register" className="btn btn-primary btn-large">Start Building for Free</Link>
      </section>
    </div>
  );
};

export default HomePage;
