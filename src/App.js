import React, { useState } from 'react';
import './App.css';

// --- Icons ---
const GridDotsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <circle cx="5" cy="5" r="1.5"/><circle cx="12" cy="5" r="1.5"/><circle cx="19" cy="5" r="1.5"/>
    <circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/>
    <circle cx="5" cy="19" r="1.5"/><circle cx="12" cy="19" r="1.5"/><circle cx="19" cy="19" r="1.5"/>
  </svg>
);

const DocIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
    <polyline points="14 2 14 8 20 8"></polyline>
  </svg>
);

const WrenchIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
  </svg>
);

const ChatIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
  </svg>
);

const DownloadIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
    <polyline points="7 10 12 15 17 10"></polyline>
    <line x1="12" y1="15" x2="12" y2="3"></line>
  </svg>
);

const GridIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="7" height="7"></rect>
    <rect x="14" y="3" width="7" height="7"></rect>
    <rect x="14" y="14" width="7" height="7"></rect>
    <rect x="3" y="14" width="7" height="7"></rect>
  </svg>
);

const ListIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
  nextPmDate: "1st Mar 2026",
  lastServiced: "15th Feb 2025",
  description: "Economical machine for vacuum forming of foils with built-in vacuum pump. Suitable for the production of bleaching moulds, splints, pads for athletes, etc.",
  warranty: "12 months",
  foilDimensions: "134mm / Square foil: from 120×120mm to 130×130mm",
  dimensions: "24 × 27 × 19 cm",
  weight: "5.4 Kg",
};

function Header() {
  return (
    <header className="app-header">
      <div className="header-left">
        <img
          src={process.env.PUBLIC_URL + '/logo-healtek.png'}
          alt="Healtek Logo"
          className="logo-img"
        />
        <button className="icon-btn"><GridDotsIcon /></button>
        <div className="header-divider"></div>
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
          <div className="cert-title-row">
            <span className="cert-icon"><DocIcon /></span>
            <div>
              <div className="cert-title">Preventive Maintenance Certificate</div>
              <div className="cert-id">{ASSET_DATA.id}</div>
            </div>
          </div>
          <div className="view-toggles">
            <button className="view-btn"><GridIcon /></button>
            <button className="view-btn active"><ListIcon /></button>
          </div>
        </div>

        {/* Tabs (exact structure from atollon-cv-search-frontend-clawdolf) */}
        <div className="custom-tabs-container">
          <div className="custom-tab-list">
            {['Overview', 'Service history', 'Documents', 'Gallery'].map(tab => (
              <div
                key={tab}
                className={`custom-tab-item ${activeTab === tab ? 'is-selected' : ''}`}
                onClick={() => setActiveTab(tab)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') setActiveTab(tab);
                }}
              >
                {tab}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card-body">
        {/* Main Content Grid */}
        <div className="content-grid">
          {/* Left Column */}
          <div className="info-col">
            {/* Product Name */}
            <h2 className="product-name">{ASSET_DATA.name}</h2>

            {/* Product Code & Serial - stacked */}
            <div className="meta-row">
              <div className="meta-item">
                <span className="meta-label">Product code:</span>
                <span className="meta-value link-style">{ASSET_DATA.productCode}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Serial number:</span>
                <span className="meta-value link-style">{ASSET_DATA.serialNumber}</span>
              </div>
            </div>

            {/* Description */}
            <p className="product-desc">{ASSET_DATA.description}</p>

            {/* Status Row - flat horizontal */}
            <div className="status-row">
              <div className="status-col">
                <span className="status-label">Status</span>
                <span className="status-value red">{ASSET_DATA.status}</span>
              </div>
              <div className="status-col">
                <span className="status-label">Next PM due date</span>
                <span className="status-value">{ASSET_DATA.nextPmDate}</span>
              </div>
              <div className="status-col">
                <span className="status-label">Last serviced</span>
                <span className="status-value">{ASSET_DATA.lastServiced}</span>
              </div>
            </div>

            {/* Request Service Button */}
            <button className="btn-primary">
              <WrenchIcon /> Request service
            </button>
          </div>

          {/* Right Column: Image */}
          <div className="image-col">
            <img src={process.env.PUBLIC_URL + '/device-image.jpg'} alt="PlatsVac P7" className="asset-image" />
          </div>
        </div>

        {/* Description & Dimensions */}
        <div className="details-grid">
          <div className="detail-block">
            <h3>Description</h3>
            <p>{ASSET_DATA.description}</p>
            <p className="sub-detail">Warranty: {ASSET_DATA.warranty}</p>
          </div>
          <div className="detail-block">
            <h3>Dimensions</h3>
            <p>Foil dimensions: {ASSET_DATA.foilDimensions}</p>
            <p className="sub-detail">Weight: {ASSET_DATA.weight}</p>
            <p className="sub-detail">Dimensions: {ASSET_DATA.dimensions}</p>
          </div>
        </div>

        {/* Download Manual */}
        <div className="download-section">
          <button className="btn-link-cyan">
            <DownloadIcon /> Download manual
          </button>
        </div>
      </div>

      {/* Need Help Footer */}
      <div className="ai-footer">
        <strong className="ai-title">Need help?</strong>
        <p className="ai-desc">Our AI assistant is here 24/7 to guide you.</p>
        <button className="btn-ask">
          <ChatIcon /> Ask a question
        </button>
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
