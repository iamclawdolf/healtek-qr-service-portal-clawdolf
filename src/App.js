import React, { useState } from 'react';
import './App.css';

// --- Icons ---
const MenuIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="1"></circle>
    <circle cx="19" cy="12" r="1"></circle>
    <circle cx="5" cy="12" r="1"></circle>
    <circle cx="12" cy="19" r="1"></circle>
    <circle cx="19" cy="19" r="1"></circle>
    <circle cx="5" cy="19" r="1"></circle>
    <circle cx="12" cy="5" r="1"></circle>
    <circle cx="19" cy="5" r="1"></circle>
    <circle cx="5" cy="5" r="1"></circle>
  </svg>
);

const WrenchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
  </svg>
);

const ChatIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
  </svg>
);

const DownloadIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
    <polyline points="7 10 12 15 17 10"></polyline>
    <line x1="12" y1="15" x2="12" y2="3"></line>
  </svg>
);

const GridIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"></rect>
    <rect x="14" y="3" width="7" height="7"></rect>
    <rect x="14" y="14" width="7" height="7"></rect>
    <rect x="3" y="14" width="7" height="7"></rect>
  </svg>
);

const ListIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="6" x2="21" y2="6"></line>
    <line x1="8" y1="12" x2="21" y2="12"></line>
    <line x1="8" y1="18" x2="21" y2="18"></line>
    <line x1="3" y1="6" x2="3.01" y2="6"></line>
    <line x1="3" y1="12" x2="3.01" y2="12"></line>
    <line x1="3" y1="18" x2="3.01" y2="18"></line>
  </svg>
);

// --- Mock Data ---
const ASSET_DATA = {
  id: "BTK230012",
  name: "PlatsVac P7",
  productCode: "HNE910369",
  serialNumber: "S234X2323901",
  status: "Service required",
  nextPmDate: "2026-03-01",
  lastServiced: "2025-02-15",
  description: "The PlatsVac P7 is a high-performance vacuum aspiration system designed for surgical suites. Features ultra-quiet operation, HEPA filtration, and a compact footprint.",
  dimensions: "24 x 27 x 19 cm",
  weight: "5.4 Kg",
  image: "https://i.ibb.co/pB29yHsG/IMG-6671.png" // Placeholder
};

function Header() {
  return (
    <header className="app-header">
      <div className="header-left">
        <div className="logo-area">
          <div className="logo-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <rect x="2" y="2" width="20" height="20" rx="4" fill="#00C2E0" />
              <path d="M12 6v12M6 12h12" stroke="white" strokeWidth="3" />
            </svg>
          </div>
          <span className="logo-text">Healtek</span>
        </div>
      </div>
      <div className="header-right">
        <button className="icon-btn"><MenuIcon /></button>
        <div className="avatar-circle">JD</div>
      </div>
    </header>
  );
}

function AssetDetail() {
  const [activeTab, setActiveTab] = useState('Overview');

  return (
    <div className="asset-card">
      {/* Card Header */}
      <div className="card-header">
        <div className="header-top-row">
          <h1 className="asset-title">{ASSET_DATA.name}</h1>
          <div className="view-toggles">
            <button className="view-btn active"><GridIcon /></button>
            <button className="view-btn"><ListIcon /></button>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="tabs-nav">
          {['Overview', 'Service history', 'Documents', 'Parts'].map(tab => (
            <button 
              key={tab} 
              className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="card-body">
        {/* Main Content Grid */}
        <div className="content-grid">
          {/* Left Column: Info */}
          <div className="info-col">
            <div className="info-group">
              <label>Product code</label>
              <button className="link-text">{ASSET_DATA.productCode}</button>
            </div>
            <div className="info-group">
              <label>Serial number</label>
              <button className="link-text">{ASSET_DATA.serialNumber}</button>
            </div>
            
            <div className="status-section">
              <div className="status-badge red">
                <span className="dot"></span>
                {ASSET_DATA.status}
              </div>
              
              <div className="status-dates">
                <div className="date-row">
                  <span className="label">Next PM due date:</span>
                  <span className="value">{ASSET_DATA.nextPmDate}</span>
                </div>
                <div className="date-row">
                  <span className="label">Last serviced:</span>
                  <span className="value">{ASSET_DATA.lastServiced}</span>
                </div>
              </div>
            </div>

            <div className="action-buttons">
              <button className="btn-primary">
                <WrenchIcon /> Request service
              </button>
              <button className="btn-secondary">
                <ChatIcon /> Ask a question
              </button>
              <button className="btn-link">
                <DownloadIcon /> Download manual
              </button>
            </div>
          </div>

          {/* Right Column: Image */}
          <div className="image-col">
            <div className="asset-image-container">
              {/* Using a placeholder image div if the URL fails, or the actual image */}
              <img src="https://placehold.co/400x400/png?text=PlatsVac+P7" alt="PlatsVac P7" className="asset-image" />
            </div>
          </div>
        </div>

        {/* Lower Section */}
        <div className="details-grid">
          <div className="detail-block">
            <h3>Description</h3>
            <p>{ASSET_DATA.description}</p>
          </div>
          <div className="detail-block">
            <h3>Dimensions</h3>
            <p>{ASSET_DATA.dimensions}</p>
            <p className="sub-detail">Weight: {ASSET_DATA.weight}</p>
          </div>
        </div>
      </div>

      {/* AI Helper Footer */}
      <div className="ai-footer">
        <div className="ai-helper-content">
          <div className="ai-icon-circle">✨</div>
          <div className="ai-text">
            <strong>Need help?</strong> Our AI assistant can answer questions about this device from the manual.
          </div>
          <button className="btn-small">Ask AI</button>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <div className="app-container">
      <Header />
      <main className="main-layout">
        <AssetDetail />
      </main>
    </div>
  );
}

export default App;