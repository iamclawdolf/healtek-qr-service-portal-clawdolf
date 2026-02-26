import { useCallback, useEffect, useRef, useState } from 'react';
import './App.css';
import {
  ActionButton,
  // Badge,
  // Divider,
  Flex,
  Item,
  LabeledValue,
  ListView,
  // StatusLight,
  // TabList,
  // TabPanels,
  // Tabs,
  View,
} from '@adobe/react-spectrum';
import { matchBarsToScore, useAISearch } from './chat';
import { fetchRealCandidates } from './chat/realDataService';
import { mapRealResults } from './chat/realDataMapper';

// SVG Icons as components
const CircleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="9" />
  </svg>
);

const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);

// Prompt for session ID on load
if (typeof window !== 'undefined') {
  const urlParams = new URLSearchParams(window.location.search);
  const sessionParam = urlParams.get('session');

  if (sessionParam) {
    window.ATOLLON_SESSION = sessionParam;
  } else {
    const session = window.prompt('Enter Real Search Session:');
    if (session) {
      window.ATOLLON_SESSION = session;
    }
  }
}

const LoadingIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="loading-spinner">
    <circle cx="12" cy="12" r="10" strokeOpacity="0.25"></circle>
    <path d="M12 2a10 10 0 0 1 10 10" strokeOpacity="1"></path>
  </svg>
);

const CloseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);


// Replaces the old "user" glyph with the provided Case Studies icon (normalized for 20x20 usage).
const UserIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="332 65 776 680"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    focusable="false"
  >
    <path d="M 1011.140625 162.46875 L 744.304688 162.46875 L 675.625 93.867188 C 657.433594 75.65625 632.871094 65.4375 607.097656 65.4375 L 428.953125 65.4375 C 375.359375 65.4375 331.921875 108.875 331.921875 162.46875 L 331.921875 647.625 C 331.921875 701.222656 375.359375 744.65625 428.953125 744.65625 L 1011.140625 744.65625 C 1064.738281 744.65625 1108.171875 701.222656 1108.171875 647.625 L 1108.171875 259.5 C 1108.171875 205.984375 1064.660156 162.46875 1011.140625 162.46875 Z M 1059.65625 647.625 C 1059.65625 674.371094 1037.886719 696.140625 1011.140625 696.140625 L 428.953125 696.140625 C 402.210938 696.140625 380.4375 674.371094 380.4375 647.625 L 380.4375 162.46875 C 380.4375 135.726562 402.210938 113.953125 428.953125 113.953125 L 607.097656 113.953125 C 620.058594 113.953125 632.234375 119 641.40625 128.167969 L 724.140625 210.984375 L 1011.140625 210.984375 C 1037.886719 210.984375 1059.65625 232.757812 1059.65625 259.5 Z M 720.046875 453.5625 C 773.644531 453.5625 817.078125 410.128906 817.078125 356.53125 C 817.078125 302.9375 773.644531 259.5 720.046875 259.5 C 666.453125 259.5 623.015625 303.015625 623.015625 356.53125 C 623.015625 410.050781 666.53125 453.5625 720.046875 453.5625 Z M 720.046875 308.015625 C 746.792969 308.015625 768.5625 329.789062 768.5625 356.53125 C 768.5625 383.277344 746.792969 405.046875 720.046875 405.046875 C 693.304688 405.046875 671.53125 383.214844 671.53125 356.53125 C 671.53125 329.847656 693.363281 308.015625 720.046875 308.015625 Z M 768.5625 502.078125 L 671.53125 502.078125 C 604.550781 502.078125 550.242188 556.386719 550.242188 623.367188 C 550.242188 636.710938 561.160156 647.625 574.5 647.625 C 587.84375 647.625 598.757812 636.765625 598.757812 623.367188 C 598.757812 583.191406 631.355469 550.59375 671.53125 550.59375 L 768.5625 550.59375 C 808.757812 550.59375 841.335938 583.175781 841.335938 623.367188 C 841.335938 636.765625 852.199219 647.625 865.59375 647.625 C 878.992188 647.625 889.851562 636.765625 889.851562 623.367188 C 889.851562 556.355469 835.578125 502.078125 768.5625 502.078125 Z M 768.5625 502.078125" />
  </svg>
);

const ChevronDownIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"></polyline>
  </svg>
);

const CheckCircleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
    <polyline points="22 4 12 14.01 9 11.01"></polyline>
  </svg>
);
// eslint-disable-next-line no-unused-vars
const _unusedChecks = [CheckCircleIcon];

const PrinterIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 6 2 18 2 18 9"></polyline>
    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
    <rect x="6" y="14" width="12" height="8"></rect>
  </svg>
);

const EditIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
  </svg>
);

const KeyIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"></path>
  </svg>
);

const TrashIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
  </svg>
);

const MoreIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="1"></circle>
    <circle cx="12" cy="5" r="1"></circle>
    <circle cx="12" cy="19" r="1"></circle>
  </svg>
);

// const FilterIcon = () => (
//   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//     <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
//   </svg>
// );

// const PlusIcon = () => (
//   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//     <line x1="12" y1="5" x2="12" y2="19"></line>
//     <line x1="5" y1="12" x2="19" y2="12"></line>
//   </svg>
// );

// const FormIcon = () => (
//   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//     <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
//     <polyline points="14 2 14 8 20 8"></polyline>
//     <line x1="16" y1="13" x2="8" y2="13"></line>
//     <line x1="16" y1="17" x2="8" y2="17"></line>
//     <polyline points="10 9 9 9 8 9"></polyline>
//   </svg>
// );

// const MailIcon = () => (
//   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//     <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
//     <polyline points="22,6 12,13 2,6"></polyline>
//   </svg>
// );

// const MailOpenIcon = () => (
//   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//     <path d="M21.2 8.4c.5.38.8.97.8 1.6v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V10a2 2 0 0 1 .8-1.6l8-6a2 2 0 0 1 2.4 0l8 6Z"></path>
//     <path d="m22 10-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 10"></path>
//   </svg>
// );

// const SendIcon = () => (
//   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//     <path d="M21.2 8.4c.5.38.8.97.8 1.6v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V10a2 2 0 0 1 .8-1.6l8-6a2 2 0 0 1 2.4 0l8 6Z"></path>
//     <path d="m22 10-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 10"></path>
//     <polyline points="9 12 11 14 15 10"></polyline>
//   </svg>
// );

// const UserXIcon = () => (
//   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//     <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
//     <circle cx="8.5" cy="7" r="4"></circle>
//     <line x1="18" y1="8" x2="23" y2="13"></line>
//     <line x1="23" y1="8" x2="18" y2="13"></line>
//   </svg>
// );

// const ChevronRightIcon = () => (
//   <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//     <polyline points="9 18 15 12 9 6"></polyline>
//   </svg>
// );

// const ExpandIcon = () => (
//   <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//     <circle cx="12" cy="12" r="10"></circle>
//     <line x1="12" y1="8" x2="12" y2="16"></line>
//     <line x1="8" y1="12" x2="16" y2="12"></line>
//   </svg>
// );

// Complete mock data for all contacts
const contactsData = [
  {
    id: 1,
    name: 'Adam Novotný',
    date: '15.11.2024',
    leadId: '9689696007',
    matchBars: [false, false, false, false, false, false, false, false],
    status: 'Initial',
    email: 'adam.novotny@gmail.com',
    phone: '606 876 865',
    address: 'Na Poříčí 34, Praha 1, 110 00, Česká republika',
    summary: {
      intro: 'Mid-level accountant with 5 years of experience in corporate finance.',
      body: 'Specializes in accounts payable and receivable management. Proficient in Czech accounting standards and basic IFRS knowledge. Previously worked at a mid-size manufacturing company handling monthly closings and financial reporting.',
      detail: 'Native Czech speaker with intermediate English skills. Looking for a stable position with growth opportunities in the Prague area.',
      listTitle: 'Key competencies:',
      listItems: ['Financial reporting', 'Month-end closing', 'SAP Business One']
    },
    timeline: [
      { type: 'form', title: 'Application submitted', subtitle: 'Career Portal', app: 'Recruitment', date: '15.11. 2024 | 14:22', tag: { label: 'Status:', value: 'New', dot: 'green' }, hasBadge: true },
      { type: 'email', title: 'From: adam.novotny@gmail.com', subtitle: 'Initial Contact', app: 'Inbox', date: '15.11. 2024 | 14:20', emailSubject: 'Application for Accountant Position' },
      { type: 'email-sent', title: 'Sent to: adam.novotny@gmail.com', subtitle: 'Auto-reply', app: 'Recruitment', date: '15.11. 2024 | 14:25', emailSubject: 'Application Received', emailPreview: 'Thank you for your application...', hasExpand: true },
    ]
  },
  {
    id: 2,
    name: 'Petr Krejčí',
    date: '08.11.2024',
    leadId: '9689696008',
    matchBars: [false, false, false, false, false, false, false, false],
    status: 'Qualified',
    email: 'petr.krejci@firma.cz',
    phone: '721 456 789',
    address: 'Václavské náměstí 12, Praha 1, 110 00, Česká republika',
    summary: {
      intro: 'Senior accountant with 10 years of experience.',
      body: 'Specializes in international tax law and corporate accounting. Fluent in English, French, and German. Previously worked at Big Four accounting firm.',
      detail: 'Currently seeking new opportunities in fintech sector. Strong analytical skills and attention to detail.',
      listTitle: 'Key skills:',
      listItems: ['IFRS reporting', 'Tax optimization', 'SAP expertise']
    },
    timeline: [
      { type: 'email', title: 'From: petr.krejci@firma.cz', subtitle: 'Job Application', app: 'Recruitment', date: '28.2. 2025 | 14:22', emailSubject: 'Application for Senior Accountant' },
      { type: 'form', title: 'Interview scheduled', subtitle: 'HR Department', app: 'Calendar', date: '27.2. 2025 | 10:00', tag: { label: 'Status:', value: 'Confirmed', dot: 'green' }, hasBadge: false },
      { type: 'email-sent', title: 'Sent to: petr.krejci@firma.cz', subtitle: 'Interview Confirmation', app: 'Recruitment', date: '26.2. 2025 | 16:45', emailSubject: 'Interview Details', emailPreview: 'Dobrý den, potvrzuji...', hasExpand: true },
    ]
  },
  {
    id: 3,
    name: 'Alena Pospíšilová',
    date: '22.10.2024',
    leadId: '9689696009',
    matchBars: [false, false, false, false, false, false, false, false],
    status: 'In Progress',
    email: 'alena.pospisilova@email.cz',
    phone: '602 333 444',
    address: 'Karlova 8, Praha 1, 110 00, Česká republika',
    summary: {
      intro: 'Certified public accountant with MBA degree.',
      body: 'Expert in financial auditing and compliance. Led accounting teams of up to 15 people. Experience with multinational corporations.',
      detail: 'Bilingual Czech-French speaker. Strong background in EU financial regulations and reporting standards.',
      listTitle: 'Certifications:',
      listItems: ['CPA certified', 'ACCA member', 'ISO auditor']
    },
    timeline: [
      { type: 'form', title: 'Contract draft sent', subtitle: 'Legal Department', app: 'Documents', date: '2.3. 2025 | 11:30', tag: { label: 'Status:', value: 'Pending', dot: 'yellow' }, hasBadge: true },
      { type: 'email-open', title: 'From: alena.pospisilova@email.cz', subtitle: 'Contract Review', app: 'Legal', date: '1.3. 2025 | 09:15', emailSubject: 'Re: Employment Contract', emailPreview: 'Děkuji za zaslání...', hasExpand: true },
      { type: 'email', title: 'From: hr@company.cz', subtitle: 'Offer Letter', app: 'Recruitment', date: '28.2. 2025 | 14:00', emailSubject: 'Job Offer - Senior Accountant' },
      { type: 'form', title: 'Background check completed', subtitle: 'HR Department', app: 'Verification', date: '25.2. 2025 | 16:00', tag: { label: 'Result:', value: 'Passed' }, hasBadge: false },
    ]
  },
  {
    id: 4,
    name: 'Dominik Novák',
    date: '18.11.2024',
    leadId: '9689696010',
    matchBars: [false, false, false, false, false, false, false, false],
    status: 'New',
    email: 'dominik.novak@outlook.com',
    phone: '777 888 999',
    address: 'Mostecká 15, Praha 1, 118 00, Česká republika',
    summary: {
      intro: 'Junior accountant fresh from university.',
      body: 'Graduate of Prague University of Economics. Completed internship at local accounting firm. Eager to learn and grow professionally.',
      detail: 'Speaks English fluently and has basic French knowledge. Quick learner with strong Excel skills.',
      listTitle: 'Education:',
      listItems: ['BSc in Accounting', 'Minor in Finance', 'Dean\'s list graduate']
    },
    timeline: [
      { type: 'email', title: 'From: dominik.novak@outlook.com', subtitle: 'Initial Contact', app: 'Inbox', date: '3.3. 2025 | 08:45', emailSubject: 'Job Inquiry - Entry Level Position' },
      { type: 'form', title: 'CV received and reviewed', subtitle: 'Recruitment Team', app: 'ATS', date: '3.3. 2025 | 10:30', tag: { label: 'Rating:', value: '4/5 stars' }, hasBadge: false },
    ]
  },
  {
    id: 5,
    name: 'Karel Nechvátil',
    date: '05.11.2024',
    leadId: '9689696011',
    matchBars: [false, false, false, false, false, false, false, false],
    status: 'Contacted',
    email: 'karel.nechvatil@seznam.cz',
    phone: '608 123 456',
    address: 'Nerudova 22, Praha 1, 118 00, Česká republika',
    summary: {
      intro: 'Experienced financial controller with 15 years in industry.',
      body: 'Managed budgets exceeding 50M EUR. Expert in cost optimization and financial planning. Former CFO of mid-size manufacturing company.',
      detail: 'Fluent in English and French. Strong leadership and communication skills. Looking for strategic role.',
      listTitle: 'Achievements:',
      listItems: ['Cost savings of 20%', 'ERP implementation lead', 'M&A experience']
    },
    timeline: [
      { type: 'email-sent', title: 'Sent to: karel.nechvatil@seznam.cz', subtitle: 'Initial Outreach', app: 'Recruitment', date: '2.3. 2025 | 15:00', emailSubject: 'Exciting Opportunity', emailPreview: 'Dobrý den pane Nechvátile...', hasExpand: true, highlighted: true },
      { type: 'form', title: 'Profile added to shortlist', subtitle: 'Hiring Manager', app: 'ATS', date: '1.3. 2025 | 14:30', tag: { label: 'Priority:', value: 'High', dot: 'red' }, hasBadge: true },
      { type: 'email', title: 'From: linkedin@notifications.com', subtitle: 'Profile Update', app: 'LinkedIn', date: '28.2. 2025 | 09:00', emailSubject: 'Karel updated his profile' },
    ]
  },
  {
    id: 6,
    name: 'Eliška Peprná',
    date: '28.09.2024',
    leadId: '9689696012',
    matchBars: [false, false, false, false, false, false, false, false],
    status: 'On Hold',
    email: 'eliska.peprna@gmail.com',
    phone: '739 654 321',
    address: 'Dlouhá 33, Praha 1, 110 00, Česká republika',
    summary: {
      intro: 'Accounting assistant with 3 years of experience.',
      body: 'Skilled in bookkeeping and basic financial reporting. Working knowledge of English. Looking to advance career in accounting.',
      detail: 'Currently employed but open to new opportunities. Prefers part-time or flexible arrangements.',
      listTitle: 'Software skills:',
      listItems: ['QuickBooks', 'Microsoft Excel', 'Pohoda accounting']
    },
    timeline: [
      { type: 'unsubscribe', title: 'Requested pause on communications', subtitle: 'Candidate Request', app: 'CRM', date: '1.3. 2025 | 11:00', contactTag: 'Reason: Personal matters' },
      { type: 'email', title: 'From: eliska.peprna@gmail.com', subtitle: 'Status Update', app: 'Inbox', date: '28.2. 2025 | 16:30', emailSubject: 'Re: Job Application Status' },
      { type: 'form', title: 'Application on hold', subtitle: 'HR Decision', app: 'ATS', date: '27.2. 2025 | 10:00', tag: { label: 'Status:', value: 'Paused', dot: 'yellow' }, hasBadge: false },
    ]
  },
];

const MODE_OPTIONS = [
  { id: 'real', label: 'Real data' },
  { id: 'test', label: 'Test demo' },
];

function ModeToggle({ mode, onChange }) {
  return (
    <div className="mode-toggle" role="group" aria-label="Demo mode">
      {MODE_OPTIONS.map((option) => (
        <button
          key={option.id}
          type="button"
          className={`mode-btn ${mode === option.id ? 'active' : ''}`}
          onClick={() => onChange(option.id)}
          aria-pressed={mode === option.id}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

function SearchBar({
  query,
  setQuery,
  onSearch,
  onClear,
  isSearching,
  isAIConfigured,
  mode,
  onModeChange,
}) {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      onSearch();
    }
  };

  return (
    <div className="top-header">
      <div className="search-area">
        <div className="search-container">
          <input
            type="text"
            className="main-search-input"
            placeholder="Search an applicants that have Collage graduation, speak English and French, have a experience in accounting"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <div className="search-icon-wrapper" onClick={onSearch}>
            {isSearching ? <LoadingIcon /> : <SearchIcon />}
          </div>
        </div>

        <button
          type="button"
          className={`search-clear-btn ${query ? '' : 'is-hidden'}`}
          onClick={onClear}
          aria-label="Clear search"
          tabIndex={query ? 0 : -1}
        >
          <CloseIcon />
        </button>
      </div>

      <div className="top-header-right">
        <ModeToggle mode={mode} onChange={onModeChange} />
      </div>
    </div>
  );
}

function ContactList({ contacts, selectedId, onSelectContact, isLoading }) {
  const getDisplayBars = (contact, barCount = 5) => {
    const score =
      typeof contact?.aiScore === 'number'
        ? contact.aiScore
        : matchBarsToScore(contact?.matchBars || []);
    const normalized = Math.max(0, Math.min(100, score));
    const filled = Math.round((normalized / 100) * barCount);
    return Array(barCount).fill(false).map((_, idx) => idx < filled);
  };

  // Pretty, stable loading state (prevents one-frame empty list + sidebar resize).
  if (isLoading && (!contacts || contacts.length === 0)) {
    return (
      <div className="candidateListStatic" role="status" aria-label="Loading candidates">
        {Array.from({ length: 7 }).map((_, idx) => (
          <div key={idx} className="candidateCard candidateCard--skeleton">
            <div className="candidateAccent candidateAccent--skeleton" />
            <div className="candidateGrid">
              <div className="skel skel--title" />
              <div className="skel skel--date" />
              <div className="skel skel--meta" />
            </div>
            <div className="candidateMatch candidateMatch--skeleton">
              <div className="skel skel--pillLabel" />
              <div className="skel skel--pillBars" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!contacts || contacts.length === 0) {
    return (
      <div className="candidateListStatic" role="status" aria-label="No candidates">
        <div className="candidateEmpty">
          No candidates to display. Run a search to load results.
        </div>
      </div>
    );
  }

  // Normalize to string keys so real-data numeric IDs match selection keys reliably.
  const selectedKey = selectedId != null ? String(selectedId) : null;
  const selectedKeys = selectedKey != null ? new Set([selectedKey]) : new Set();

  return (
    <ListView
      aria-label="Candidates"
      selectionMode="single"
      selectionStyle="highlight"
      selectionBehavior="replace"
      disallowEmptySelection
      selectedKeys={selectedKeys}
      isDisabled={!!isLoading}
      onSelectionChange={(keys) => {
        if (keys === 'all') {
          return;
        }
        const next = Array.from(keys)[0] ?? null;
        onSelectContact(next == null ? null : String(next));
      }}
      density="compact"
      UNSAFE_className="candidateList"
      items={contacts}
    >
      {(contact) => (
        <Item key={String(contact.id)} textValue={contact.name}>
          <div className="candidateCard">
            <div
              className={`candidateAccent ${contact.status === 'On Hold' ? 'candidateAccent--red' : 'candidateAccent--blue'
                }`}
            />

            <div className="candidateGrid">
              <a
                href={`${process.env.REACT_APP_REAL_SEARCH_TARGET}/finder?id=${contact.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="candidateName candidateName--link"
                onClick={(e) => e.stopPropagation()}
              >
                {contact.name}
              </a>
              <div className="candidateDate">{contact.date}</div>

              <div className="candidateMeta">
                <span className="candidateLead">Lead</span>
                <span className="candidateId">{contact.leadId}</span>
              </div>
            </div>

            <div className="candidateMatch">
              <div className="candidateMatchLabel">Search match</div>
              <div className="candidateBars">
                {getDisplayBars(contact, 5).map((filled, idx) => (
                  <span
                    key={idx}
                    className={`candidateBar ${filled ? 'candidateBar--filled' : 'candidateBar--empty'}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </Item>
      )}
    </ListView>
  );
}

function ContactDetail({ contact }) {
  const [tabKey, setTabKey] = useState('summary');
  // const [rawDataOpen, setRawDataOpen] = useState(false);

  const ai = contact.aiExtracted || null;

  return (
    <View UNSAFE_className="contact-detail-pane">
      <View paddingX="size-400" paddingY="size-300">
        {/* Header Row: Icon + Name + Status + Actions */}
        <Flex justifyContent="space-between" alignItems="center" marginBottom="size-300">
          <Flex alignItems="center" gap="size-150">
            <View UNSAFE_className="detail-avatar-icon">
              <UserIcon />
            </View>
            <a
              href={`${process.env.REACT_APP_REAL_SEARCH_TARGET}/finder?id=${contact.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="detail-name detail-name--link"
            >
              {contact.name}
            </a>
          </Flex>

          <Flex alignItems="center" gap="size-100">
            <div className="status-selector">
              <span className="status-dot"></span>
              <span className="status-text">{contact.status}</span>
              <ChevronDownIcon />
            </div>
            <Flex gap="size-50" marginStart="size-200">
              <ActionButton isQuiet isDisabled aria-label="Icon 1"><CircleIcon /></ActionButton>
              <ActionButton isQuiet isDisabled aria-label="Print"><PrinterIcon /></ActionButton>
              <ActionButton isQuiet isDisabled aria-label="Edit"><EditIcon /></ActionButton>
              <ActionButton isQuiet isDisabled aria-label="Settings"><KeyIcon /></ActionButton>
              <ActionButton isQuiet isDisabled aria-label="Delete"><TrashIcon /></ActionButton>
              <ActionButton isQuiet isDisabled aria-label="More"><MoreIcon /></ActionButton>
            </Flex>
          </Flex>
        </Flex>

        {/* Info Row: Lead/ID, Email, Phone, Address, LinkedIn */}
        <Flex gap="size-400" marginBottom="size-100" wrap>
          <div className="candidateMeta">
            <span className="candidateLead">Lead</span>
            <span className="candidateId">{contact.leadId}</span>
          </div>
          <LabeledValue label="E-mail" value={contact.email} UNSAFE_className="detail-label-value" />
          <LabeledValue label="Phone" value={contact.phone} UNSAFE_className="detail-label-value" />
          <LabeledValue label="Address" value={contact.address} UNSAFE_className="detail-label-value" />
          <div className="detail-label-value linkedin-field">
            <span className="linkedin-label">LinkedIn</span>
            {ai?.linkedin_url ? (
              <a
                href={ai.linkedin_url.startsWith('http') ? ai.linkedin_url : `https://${ai.linkedin_url}`}
                target="_blank"
                rel="noopener noreferrer"
                className="linkedin-link"
              >
                View Profile
              </a>
            ) : (
              <span className="linkedin-value">-</span>
            )}
          </div>
        </Flex>

        {/* Tabs - Custom Implementation */}
        <div className="custom-tabs-container">
          <div className="custom-tab-list">
            {[
              { id: 'summary', label: 'Summary' },
              { id: 'overview', label: 'Overview' },
              { id: 'calendar', label: 'Calendar' },
              { id: 'tasks', label: 'Tasks' },
              { id: 'documents', label: 'Documents' },
              { id: 'gallery', label: 'Gallery' },
            ].map((tab) => (
              <div
                key={tab.id}
                className={`custom-tab-item ${tabKey === tab.id ? 'is-selected' : ''}`}
                onClick={() => setTabKey(tab.id)}
              >
                {tab.label}
              </div>
            ))}
          </div>

          <div className="custom-tab-panel">
            {tabKey === 'summary' && (
              <div className="summary-split">
                <div className="summary-col">
                  <h3 className="summary-heading">Profile</h3>
                  <div className="summary-box">
                    {/* AI Extracted Summary */}
                    {ai?.summary && (
                      <p className="summary-text ai-summary">{ai.summary}</p>
                    )}
                    {!ai?.summary && (
                      <>
                        <p className="summary-text">{contact.summary.intro}</p>
                        <p className="summary-text">{contact.summary.body}</p>
                      </>
                    )}

                    {/* Skills */}
                    {ai?.skills && ai.skills.length > 0 && (
                      <div className="ai-section">
                        <h4 className="ai-section-title">Skills</h4>
                        <div className="skills-grid">
                          {ai.skills.map((skill, idx) => (
                            <span key={idx} className="skill-tag">{skill}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Experience */}
                    {ai?.experience && ai.experience.length > 0 && (
                      <div className="ai-section">
                        <h4 className="ai-section-title">Experience</h4>
                        <div className="experience-list">
                          {ai.experience.map((exp, idx) => (
                            <div key={idx} className="experience-card">
                              <div className="exp-header">
                                <span className="exp-title">{exp.title}</span>
                                <span className="exp-duration">{exp.duration}</span>
                              </div>
                              <div className="exp-company">{exp.company}</div>
                              {exp.description && (
                                <p className="exp-description">{exp.description}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Education */}
                    {ai?.education && ai.education.length > 0 && (
                      <div className="ai-section">
                        <h4 className="ai-section-title">Education</h4>
                        <div className="education-list">
                          {ai.education.map((edu, idx) => (
                            <div key={idx} className="education-card">
                              <div className="edu-header">
                                <span className="edu-degree">{edu.degree} in {edu.field}</span>
                                <span className="edu-year">{edu.year}</span>
                              </div>
                              <div className="edu-institution">{edu.institution}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Fallback if no AI data */}
                    {!ai && (
                      <>
                        <p className="summary-text">{contact.summary.detail}</p>
                        <p className="summary-list-title">{contact.summary.listTitle}</p>
                        <ul className="summary-list">
                          {(contact.summary.listItems || []).map((li, idx) => (
                            <li key={idx}>{li}</li>
                          ))}
                        </ul>
                      </>
                    )}


                  </div>
                </div>

                <div className="timeline-col" aria-label="Timeline">
                  <div className="timeline-skel-header">
                    <div className="timeline-heading">Timeline</div>
                    <div className="timeline-skel-actions">
                      <div className="timeline-skel-action skel" />
                      <div className="timeline-skel-action skel" />
                    </div>
                  </div>

                  <div className="timeline-skel-month skel" />

                  <div className="timeline-skel-list">
                    {Array.from({ length: 4 }).map((_, idx) => (
                      <div className="timeline-skel-row" key={idx}>
                        <div className="timeline-skel-icon skel" />
                        <div className="timeline-skel-card">
                          <div className="skel skel--tl-title" />
                          <div className="skel skel--tl-sub" />
                          <div className="skel skel--tl-tag" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {tabKey !== 'summary' && (
              <div className="placeholder-content">
                <p>{tabKey.charAt(0).toUpperCase() + tabKey.slice(1)} content placeholder</p>
              </div>
            )}
          </div>
        </div>
      </View>
    </View>
  );
}

// TimelineItem component removed (unused)

// Timeline component removed (unused)

function App() {
  const [selectedContactId, setSelectedContactId] = useState('1');
  const [mode, setMode] = useState('real');
  const [realCandidates, setRealCandidates] = useState([]);
  const [realLoading, setRealLoading] = useState(false);
  const [realError, setRealError] = useState(null);
  // const [realHasSearched, setRealHasSearched] = useState(false);
  // const [lastRealQuery, setLastRealQuery] = useState('');
  const defaultRealQuery = 'python developer';

  // AI Search hook - manages search state and candidate scoring
  const {
    query,
    setQuery,
    candidates,
    isSearching,
    error,
    search,
    clearSearch,
    isAIConfigured,
    // hasSearched,
    // stats,
  } = useAISearch(contactsData);

  const loadRealCandidates = useCallback(async (searchQuery) => {
    const trimmedQuery = (searchQuery || '').trim();

    if (!trimmedQuery) {
      setRealError('Please enter a search query');
      // setRealHasSearched(false);
      return;
    }

    setRealLoading(true);
    setRealError(null);

    try {
      const data = await fetchRealCandidates(trimmedQuery);
      const mapped = mapRealResults(data.results || []);

      setRealCandidates(mapped);
      // setRealHasSearched(true);
      // setLastRealQuery(trimmedQuery);
      if (mapped.length > 0) {
        setSelectedContactId(String(mapped[0].id));
      }
    } catch (err) {
      setRealError(err.message || 'Failed to load real candidates');
      setRealCandidates([]);
      // setRealHasSearched(false);
    } finally {
      setRealLoading(false);
    }
  }, [setSelectedContactId]);

  // Default to Real data on first load (guarded to avoid double-fetch in StrictMode dev).
  const didInitRealRef = useRef(false);
  useEffect(() => {
    if (didInitRealRef.current) {
      return;
    }
    didInitRealRef.current = true;

    if (mode !== 'real') {
      return;
    }

    const trimmed = (query || '').trim();
    const seedQuery = trimmed.length > 0 ? trimmed : defaultRealQuery;
    if (!trimmed.length) {
      setQuery(seedQuery);
    }
    loadRealCandidates(seedQuery);
  }, [mode, query, defaultRealQuery, setQuery, loadRealCandidates]);

  const handleModeChange = (nextMode) => {
    if (nextMode === mode) {
      return;
    }

    setMode(nextMode);

    if (nextMode === 'test') {
      setRealCandidates([]);
      setRealError(null);
      // setRealHasSearched(false);
      setSelectedContactId(String(contactsData[0].id));
      clearSearch();
    } else {
      const trimmed = (query || '').trim();
      const seedQuery = trimmed.length > 0 ? trimmed : defaultRealQuery;
      if (!trimmed.length) {
        setQuery(seedQuery);
      }
      loadRealCandidates(seedQuery);
    }
  };

  const handleSearch = () => {
    if (mode === 'test') {
      search();
      return;
    }

    const trimmed = (query || '').trim();
    if (trimmed.length === 0) {
      setQuery(defaultRealQuery);
      loadRealCandidates(defaultRealQuery);
    } else {
      loadRealCandidates(trimmed);
    }
  };

  const handleClear = () => {
    if (mode === 'test') {
      clearSearch();
    } else {
      setQuery('');
      setRealCandidates([]);
      // setRealHasSearched(false);
      setRealError(null);
      setSelectedContactId(null);
    }
  };

  const handleErrorDismiss = () => {
    if (mode === 'test') {
      clearSearch();
    } else {
      setRealError(null);
    }
  };

  const displayCandidates = mode === 'test' ? candidates : realCandidates;
  const selectedContact =
    displayCandidates.find(c => String(c.id) === String(selectedContactId))
    || displayCandidates[0]
    || null;

  const currentError = mode === 'test' ? error : realError;
  const currentIsSearching = mode === 'test' ? isSearching : realLoading;

  return (
    <div className="page">
      <div className="app">
        <SearchBar
          query={query}
          setQuery={setQuery}
          onSearch={handleSearch}
          onClear={handleClear}
          isSearching={currentIsSearching}
          isAIConfigured={isAIConfigured}
          mode={mode}
          onModeChange={handleModeChange}
        />
        {currentError && (
          <div className="search-error">
            <span>Search error: {currentError}</span>
            <span className="error-dismiss" onClick={handleErrorDismiss}>Dismiss</span>
          </div>
        )}
        <div className="main-content">
          <ContactList
            contacts={displayCandidates}
            selectedId={selectedContactId}
            onSelectContact={setSelectedContactId}
            isLoading={mode === 'real' ? realLoading : isSearching}
          />
          {selectedContact ? (
            <ContactDetail contact={selectedContact} />
          ) : (
            <div className="contact-detail-pane empty-state-card">
              <p>No candidate selected. Run a search to get started.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
