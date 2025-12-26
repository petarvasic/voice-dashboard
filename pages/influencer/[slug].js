// pages/influencer/[slug].js - Influencer Dashboard v3
// WARM GLASSMORPHISM - Crextio-inspired design
import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

// ============ UTILITIES ============
const formatNumber = (num) => {
  if (!num || isNaN(num)) return '0';
  const n = parseInt(num);
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return n.toLocaleString('sr-RS');
};

const formatCurrency = (num) => {
  if (!num || isNaN(num)) return '0';
  return parseInt(num).toLocaleString('sr-RS');
};

const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  try {
    return new Date(dateStr).toLocaleDateString('sr-RS', { day: 'numeric', month: 'short' });
  } catch { return '-'; }
};

const getTimeAgo = (dateStr) => {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Danas';
  if (days === 1) return 'Juče';
  if (days < 7) return `Pre ${days} dana`;
  return formatDate(dateStr);
};

// ============ GLOBAL STYLES ============
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
    
    * { box-sizing: border-box; margin: 0; padding: 0; }
    
    body {
      font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
      background: linear-gradient(135deg, #C4C1D4 0%, #D8D5E4 50%, #E8E4D9 100%);
      min-height: 100vh;
    }
    
    @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
    @keyframes pulse { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.05); opacity: 0.9; } }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes slideIn { from { opacity: 0; transform: translateX(-20px); } to { opacity: 1; transform: translateX(0); } }
    @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
    @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes progressFill { from { stroke-dashoffset: 283; } }
    
    ::-webkit-scrollbar { width: 8px; height: 8px; }
    ::-webkit-scrollbar-track { background: rgba(255,255,255,0.1); border-radius: 10px; }
    ::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.15); border-radius: 10px; }
    ::-webkit-scrollbar-thumb:hover { background: rgba(0,0,0,0.25); }
    
    .glass-card {
      background: rgba(255, 255, 255, 0.65);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border-radius: 24px;
      border: 1px solid rgba(255, 255, 255, 0.5);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.06);
      transition: all 0.3s ease;
    }
    
    .glass-card:hover {
      background: rgba(255, 255, 255, 0.75);
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.08);
      transform: translateY(-2px);
    }
    
    .dark-card {
      background: #2D2D3A;
      border-radius: 24px;
      color: white;
    }
    
    .warm-gradient {
      background: linear-gradient(135deg, #FFF8E7 0%, #FFE8B8 50%, #FFD98C 100%);
    }
    
    .tag {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 16px;
      border-radius: 100px;
      font-size: 13px;
      font-weight: 600;
    }
    
    .tag-yellow { background: #F5C842; color: #2D2D3A; }
    .tag-green { background: #7DD87D; color: #2D2D3A; }
    .tag-gray { background: rgba(0,0,0,0.08); color: #666; }
    .tag-pending { background: #FFE082; color: #5D4E37; }
    .tag-accepted { background: #A5D6A7; color: #2E5A2E; }
    .tag-declined { background: #FFAB91; color: #5D3A3A; }
    
    .btn-primary {
      background: #F5C842;
      color: #2D2D3A;
      border: none;
      padding: 14px 28px;
      border-radius: 14px;
      font-weight: 700;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 4px 15px rgba(245, 200, 66, 0.3);
    }
    
    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(245, 200, 66, 0.4);
    }
    
    .btn-secondary {
      background: rgba(255,255,255,0.8);
      color: #2D2D3A;
      border: none;
      padding: 12px 24px;
      border-radius: 12px;
      font-weight: 600;
      font-size: 13px;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    
    .btn-secondary:hover {
      background: white;
    }
    
    input, textarea, select {
      font-family: 'Plus Jakarta Sans', sans-serif;
      background: rgba(255,255,255,0.7);
      border: 1px solid rgba(0,0,0,0.08);
      border-radius: 12px;
      padding: 14px 18px;
      font-size: 14px;
      outline: none;
      transition: all 0.2s;
    }
    
    input:focus, textarea:focus {
      background: white;
      border-color: #F5C842;
      box-shadow: 0 0 0 3px rgba(245, 200, 66, 0.2);
    }
  `}</style>
);

// ============ COMPONENTS ============

// Circular Progress Ring
const CircularProgress = ({ percent, size = 120, strokeWidth = 10, color = '#F5C842', label, value }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percent / 100) * circumference;
  
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={radius} fill="none" 
                stroke="rgba(0,0,0,0.06)" strokeWidth={strokeWidth} />
        <circle cx={size/2} cy={size/2} r={radius} fill="none"
                stroke={color} strokeWidth={strokeWidth}
                strokeDasharray={circumference} strokeDashoffset={offset}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 1s ease', animation: 'progressFill 1.5s ease' }} />
      </svg>
      <div style={{
        position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', textAlign: 'center'
      }}>
        <span style={{ fontSize: size * 0.25, fontWeight: '800', color: '#2D2D3A' }}>{value}</span>
        {label && <span style={{ fontSize: size * 0.1, color: '#888', fontWeight: '500' }}>{label}</span>}
      </div>
    </div>
  );
};

// Progress Bar with dots (like the design)
const ProgressBarDots = ({ data, label }) => {
  const maxValue = Math.max(...data.map(d => d.value), 1);
  const days = ['P', 'U', 'S', 'Č', 'P', 'S', 'N'];
  
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', height: '100px', marginBottom: '10px' }}>
        {data.map((item, i) => (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '8px', borderRadius: '100px',
              background: item.highlight ? '#F5C842' : 'rgba(0,0,0,0.12)',
              height: `${Math.max((item.value / maxValue) * 80, 10)}px`,
              transition: 'height 0.5s ease'
            }} />
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: '12px' }}>
        {days.map((day, i) => (
          <div key={i} style={{ flex: 1, textAlign: 'center', fontSize: '11px', color: '#999', fontWeight: '600' }}>
            {day}
          </div>
        ))}
      </div>
    </div>
  );
};

// Stat Mini Card
const StatMini = ({ icon, value, label }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
    <span style={{ fontSize: '20px' }}>{icon}</span>
    <div>
      <p style={{ fontSize: '24px', fontWeight: '800', margin: 0, color: '#2D2D3A' }}>{value}</p>
      <p style={{ fontSize: '12px', color: '#888', margin: 0 }}>{label}</p>
    </div>
  </div>
);

// Opportunity Card for Dark Section
const OpportunityMini = ({ opportunity, index, onApply }) => {
  const [isHovered, setIsHovered] = useState(false);
  const icons = ['💄', '👗', '💪', '🍕', '📱', '✈️'];
  
  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onApply(opportunity)}
      style={{
        display: 'flex', alignItems: 'center', gap: '14px',
        padding: '14px 16px', borderRadius: '14px',
        background: isHovered ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)',
        cursor: 'pointer', transition: 'all 0.2s',
        animation: `slideIn 0.4s ease ${index * 0.1}s both`
      }}
    >
      <div style={{
        width: '42px', height: '42px', borderRadius: '12px',
        background: 'rgba(245, 200, 66, 0.2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '20px'
      }}>
        {icons[index % icons.length]}
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: '14px', fontWeight: '600', margin: '0 0 3px', color: 'white' }}>
          {opportunity.clientName}
        </p>
        <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', margin: 0 }}>
          {opportunity.niche} • {formatCurrency(opportunity.payment)} RSD
        </p>
      </div>
      <div style={{
        width: '28px', height: '28px', borderRadius: '50%',
        background: isHovered ? '#F5C842' : 'transparent',
        border: isHovered ? 'none' : '2px solid rgba(255,255,255,0.2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.2s'
      }}>
        {isHovered && <span style={{ color: '#2D2D3A', fontSize: '14px' }}>→</span>}
      </div>
    </div>
  );
};

// Application Row
const ApplicationRow = ({ application, index }) => {
  const statusConfig = {
    'Pending': { bg: '#FFE082', color: '#5D4E37', text: 'Čeka se' },
    'Sent': { bg: '#FFE082', color: '#5D4E37', text: 'Čeka se' },
    'Accepted': { bg: '#A5D6A7', color: '#2E5A2E', text: 'Prihvaćeno' },
    'Declined': { bg: '#FFAB91', color: '#5D3A3A', text: 'Odbijeno' }
  };
  const status = statusConfig[application.status] || statusConfig['Pending'];
  
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '14px',
      padding: '12px 0', borderBottom: '1px solid rgba(0,0,0,0.05)',
      animation: `fadeIn 0.4s ease ${index * 0.1}s both`
    }}>
      <div style={{
        width: '40px', height: '40px', borderRadius: '12px',
        background: 'linear-gradient(135deg, #FFE8B8, #FFD98C)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '16px', fontWeight: '700', color: '#5D4E37'
      }}>
        {application.clientName?.charAt(0)}
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: '14px', fontWeight: '600', margin: '0 0 2px', color: '#2D2D3A' }}>
          {application.clientName}
        </p>
        <p style={{ fontSize: '12px', color: '#999', margin: 0 }}>{getTimeAgo(application.dateApplied)}</p>
      </div>
      <span style={{
        padding: '6px 14px', borderRadius: '100px', fontSize: '12px', fontWeight: '600',
        background: status.bg, color: status.color
      }}>
        {status.text}
      </span>
    </div>
  );
};

// Clip Card
const ClipCard = ({ clip, index }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <a href={clip.link} target="_blank" rel="noopener noreferrer"
       onMouseEnter={() => setIsHovered(true)}
       onMouseLeave={() => setIsHovered(false)}
       style={{
         display: 'block', textDecoration: 'none',
         animation: `scaleIn 0.4s ease ${index * 0.1}s both`
       }}>
      <div className="glass-card" style={{
        overflow: 'hidden', padding: 0,
        transform: isHovered ? 'translateY(-4px) scale(1.02)' : 'none'
      }}>
        <div style={{
          height: '100px',
          background: clip.platform === 'Tik Tok' 
            ? 'linear-gradient(135deg, #69C9D0, #EE1D52)' 
            : 'linear-gradient(135deg, #833AB4, #FD1D1D, #F77737)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <span style={{ fontSize: '36px', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }}>
            {clip.platform === 'Tik Tok' ? '🎵' : '📸'}
          </span>
        </div>
        <div style={{ padding: '14px' }}>
          <p style={{ fontSize: '13px', fontWeight: '600', margin: '0 0 6px', color: '#2D2D3A', 
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {clip.clientName}
          </p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '18px', fontWeight: '800', color: '#F5C842' }}>{formatNumber(clip.views)}</span>
            <span style={{ fontSize: '11px', color: '#999' }}>{getTimeAgo(clip.publishDate)}</span>
          </div>
        </div>
      </div>
    </a>
  );
};

// Profile Field
const ProfileField = ({ icon, label, value, isEditing, onChange, type = 'text', options }) => (
  <div style={{ 
    display: 'flex', alignItems: 'center', gap: '14px',
    padding: '16px', background: 'rgba(255,255,255,0.5)', borderRadius: '16px'
  }}>
    <span style={{ fontSize: '22px' }}>{icon}</span>
    <div style={{ flex: 1 }}>
      <label style={{ fontSize: '11px', color: '#888', fontWeight: '600', display: 'block', marginBottom: '4px' }}>
        {label}
      </label>
      {isEditing ? (
        type === 'select' ? (
          <select value={value || ''} onChange={onChange} style={{ width: '100%', padding: '8px 12px' }}>
            <option value="">Izaberi...</option>
            {options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        ) : (
          <input type={type} value={value || ''} onChange={onChange} 
                 style={{ width: '100%', padding: '8px 12px' }} />
        )
      ) : (
        <p style={{ fontSize: '15px', fontWeight: '600', color: '#2D2D3A', margin: 0 }}>{value || '—'}</p>
      )}
    </div>
  </div>
);

// Navigation Pill
const NavPill = ({ label, isActive, onClick, badge }) => (
  <button onClick={onClick} style={{
    padding: '10px 20px', borderRadius: '100px', border: 'none',
    background: isActive ? '#2D2D3A' : 'transparent',
    color: isActive ? 'white' : '#666',
    fontSize: '14px', fontWeight: '600', cursor: 'pointer',
    transition: 'all 0.2s', position: 'relative'
  }}>
    {label}
    {badge > 0 && (
      <span style={{
        position: 'absolute', top: '-4px', right: '-4px',
        width: '20px', height: '20px', borderRadius: '50%',
        background: '#F5C842', color: '#2D2D3A',
        fontSize: '11px', fontWeight: '700',
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>{badge}</span>
    )}
  </button>
);

// Application Modal
const ApplyModal = ({ opportunity, onClose, onSubmit }) => {
  const [note, setNote] = useState('');
  
  if (!opportunity) return null;
  
  return (
    <>
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
        backdropFilter: 'blur(8px)', zIndex: 1000
      }} />
      <div style={{
        position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        width: '460px', maxWidth: '90vw', zIndex: 1001,
        animation: 'scaleIn 0.3s ease'
      }}>
        <div className="glass-card" style={{ padding: '32px', background: 'white' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: '800', margin: '0 0 4px', color: '#2D2D3A' }}>
                {opportunity.clientName}
              </h2>
              <p style={{ fontSize: '14px', color: '#888', margin: 0 }}>{opportunity.niche} • {opportunity.platform}</p>
            </div>
            <button onClick={onClose} style={{
              width: '36px', height: '36px', borderRadius: '50%',
              background: 'rgba(0,0,0,0.05)', border: 'none', cursor: 'pointer',
              fontSize: '18px', color: '#666'
            }}>✕</button>
          </div>
          
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px',
            padding: '20px', background: 'linear-gradient(135deg, #FFF8E7, #FFE8B8)',
            borderRadius: '16px', marginBottom: '24px'
          }}>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '11px', color: '#5D4E37', fontWeight: '600', margin: '0 0 4px' }}>HONORAR</p>
              <p style={{ fontSize: '22px', fontWeight: '800', color: '#2D2D3A', margin: 0 }}>{formatCurrency(opportunity.payment)}</p>
            </div>
            <div style={{ textAlign: 'center', borderLeft: '1px solid rgba(0,0,0,0.1)', borderRight: '1px solid rgba(0,0,0,0.1)' }}>
              <p style={{ fontSize: '11px', color: '#5D4E37', fontWeight: '600', margin: '0 0 4px' }}>VIEWS</p>
              <p style={{ fontSize: '22px', fontWeight: '800', color: '#2D2D3A', margin: 0 }}>{formatNumber(opportunity.viewsRequired)}</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '11px', color: '#5D4E37', fontWeight: '600', margin: '0 0 4px' }}>ROK</p>
              <p style={{ fontSize: '22px', fontWeight: '800', color: '#2D2D3A', margin: 0 }}>{formatDate(opportunity.deadline)}</p>
            </div>
          </div>
          
          <p style={{ fontSize: '14px', color: '#666', lineHeight: 1.6, marginBottom: '20px' }}>
            {opportunity.description}
          </p>
          
          <div style={{ marginBottom: '24px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#2D2D3A', display: 'block', marginBottom: '8px' }}>
              💬 Poruka brendu (opciono)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Zašto si ti pravi/a za ovaj posao? Npr: 'Idem na more sledeće nedelje - savršeno za ovaj brend!'"
              style={{ width: '100%', height: '100px', resize: 'none' }}
            />
          </div>
          
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn-primary" onClick={() => onSubmit(opportunity, note)} style={{ flex: 1 }}>
              ✨ Prijavi se
            </button>
            <button className="btn-secondary" onClick={onClose}>Otkaži</button>
          </div>
        </div>
      </div>
    </>
  );
};

// ============ MAIN COMPONENT ============
export default function InfluencerDashboard() {
  const router = useRouter();
  const { slug } = router.query;
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [selectedOpportunity, setSelectedOpportunity] = useState(null);
  
  useEffect(() => {
    if (!slug) return;
    setTimeout(() => {
      setData({
        influencer: {
          name: 'Marija Petrović',
          photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
          tiktokHandle: '@marija_p',
          instagramHandle: '@marija.petrovic',
          city: 'Beograd',
          phone: '+381 64 123 4567',
          shirtSize: 'M',
          pantsSize: '38',
          shoeSize: '39',
          categories: ['Beauty', 'Fashion', 'Lifestyle']
        },
        stats: {
          totalEarnings: 125000,
          totalViews: 2450000,
          totalClips: 24,
          avgViewsPerClip: 102000,
          pendingPayment: 15000,
          completionRate: 92
        },
        weeklyActivity: [
          { value: 30, highlight: false },
          { value: 80, highlight: true },
          { value: 45, highlight: false },
          { value: 90, highlight: true },
          { value: 60, highlight: false },
          { value: 20, highlight: false },
          { value: 10, highlight: false }
        ],
        opportunities: [
          { id: 1, clientName: 'Nivea Serbia', niche: 'Beauty', platform: 'TikTok', payment: 8000, viewsRequired: 100000, deadline: '2025-01-15', description: 'Tražimo kreativce za zimsku kampanju hidratacije. Potreban autentičan sadržaj o nezi kože!' },
          { id: 2, clientName: 'Fashion Nova', niche: 'Fashion', platform: 'Instagram', payment: 12000, viewsRequired: 150000, deadline: '2025-01-20', description: 'Nova kolekcija - OOTD content za promociju!' },
          { id: 3, clientName: 'Protein World', niche: 'Fitness', platform: 'TikTok', payment: 6000, viewsRequired: 80000, deadline: '2025-01-10', description: 'Fitness influenseri za protein šejk promociju.' },
          { id: 4, clientName: 'Samsung Serbia', niche: 'Tech', platform: 'TikTok', payment: 15000, viewsRequired: 200000, deadline: '2025-01-25', description: 'Unboxing i review novog Galaxy telefona.' },
          { id: 5, clientName: 'Booking.com', niche: 'Travel', platform: 'Instagram', payment: 10000, viewsRequired: 120000, deadline: '2025-01-18', description: 'Travel content za zimske destinacije.' }
        ],
        applications: [
          { id: 1, clientName: 'Samsung Serbia', status: 'Accepted', dateApplied: '2024-12-20' },
          { id: 2, clientName: 'Adidas', status: 'Pending', dateApplied: '2024-12-24' },
          { id: 3, clientName: 'L\'Oreal', status: 'Declined', dateApplied: '2024-12-15' }
        ],
        clips: [
          { id: 1, clientName: 'Samsung Serbia', platform: 'Tik Tok', views: 245000, publishDate: '2024-12-22', link: '#' },
          { id: 2, clientName: 'Coca-Cola', platform: 'Instagram', views: 180000, publishDate: '2024-12-18', link: '#' },
          { id: 3, clientName: 'Nike', platform: 'Tik Tok', views: 320000, publishDate: '2024-12-10', link: '#' },
          { id: 4, clientName: 'Zara', platform: 'Tik Tok', views: 95000, publishDate: '2024-12-05', link: '#' }
        ],
        earnings: [
          { month: 'Jul', amount: 15000 },
          { month: 'Aug', amount: 22000 },
          { month: 'Sep', amount: 18000 },
          { month: 'Okt', amount: 28000 },
          { month: 'Nov', amount: 35000 },
          { month: 'Dec', amount: 42000 }
        ]
      });
      setLoading(false);
    }, 800);
  }, [slug]);
  
  const handleApply = (opportunity, note) => {
    console.log('Applying:', opportunity.clientName, note);
    alert(`✅ Prijava za ${opportunity.clientName} je poslata!`);
    setSelectedOpportunity(null);
  };
  
  if (loading) {
    return (
      <>
        <GlobalStyles />
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="glass-card" style={{ padding: '40px', textAlign: 'center' }}>
            <div style={{
              width: '50px', height: '50px', borderRadius: '50%',
              border: '3px solid #eee', borderTopColor: '#F5C842',
              animation: 'spin 1s linear infinite', margin: '0 auto 16px'
            }} />
            <p style={{ color: '#666', fontWeight: '500' }}>Učitavanje...</p>
          </div>
        </div>
      </>
    );
  }
  
  return (
    <>
      <Head>
        <title>{data?.influencer?.name} | VOICE</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <GlobalStyles />
      
      <div style={{ minHeight: '100vh', padding: '24px' }}>
        <div style={{ maxWidth: '1500px', margin: '0 auto' }}>
          
          {/* Header */}
          <header className="glass-card" style={{
            padding: '16px 28px', marginBottom: '24px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '10px',
                background: 'linear-gradient(135deg, #3D3B73, #5D5B93)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <span style={{ color: 'white', fontWeight: '800', fontSize: '14px' }}>V</span>
              </div>
              <span style={{ fontSize: '20px', fontWeight: '800', color: '#3D3B73' }}>voice</span>
            </div>
            
            <div style={{ display: 'flex', background: 'rgba(0,0,0,0.04)', borderRadius: '100px', padding: '4px' }}>
              <NavPill label="Dashboard" isActive={activeSection === 'dashboard'} onClick={() => setActiveSection('dashboard')} />
              <NavPill label="Prilike" isActive={activeSection === 'opportunities'} onClick={() => setActiveSection('opportunities')} badge={data?.opportunities?.length} />
              <NavPill label="Prijave" isActive={activeSection === 'applications'} onClick={() => setActiveSection('applications')} />
              <NavPill label="Klipovi" isActive={activeSection === 'clips'} onClick={() => setActiveSection('clips')} />
              <NavPill label="Profil" isActive={activeSection === 'profile'} onClick={() => setActiveSection('profile')} />
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button style={{ 
                width: '40px', height: '40px', borderRadius: '12px', border: 'none',
                background: 'rgba(0,0,0,0.04)', cursor: 'pointer', fontSize: '18px'
              }}>🔔</button>
              <button style={{ 
                width: '40px', height: '40px', borderRadius: '12px', border: 'none',
                background: 'rgba(0,0,0,0.04)', cursor: 'pointer', fontSize: '18px'
              }}>⚙️</button>
            </div>
          </header>
          
          {activeSection === 'dashboard' && (
            <>
              {/* Welcome + Quick Stats */}
              <div className="glass-card warm-gradient" style={{ padding: '28px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h1 style={{ fontSize: '32px', fontWeight: '300', margin: '0 0 8px', color: '#2D2D3A' }}>
                      Dobrodošla, <strong>{data?.influencer?.name?.split(' ')[0]}</strong>
                    </h1>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <span className="tag tag-yellow">🔥 {data?.opportunities?.length} novih prilika</span>
                      <span className="tag tag-gray">📊 92% completion rate</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '40px' }}>
                    <StatMini icon="👥" value={formatNumber(data?.stats?.totalViews)} label="Total Views" />
                    <StatMini icon="🎬" value={data?.stats?.totalClips} label="Klipova" />
                    <StatMini icon="💰" value={formatNumber(data?.stats?.totalEarnings)} label="Zarada (RSD)" />
                  </div>
                </div>
              </div>
              
              {/* Main Grid - Bento Layout */}
              <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr 320px', gap: '24px' }}>
                
                {/* Left Column - Profile Card */}
                <div>
                  <div className="glass-card" style={{ padding: '0', overflow: 'hidden', marginBottom: '24px' }}>
                    {/* Profile Image */}
                    <div style={{ position: 'relative', height: '280px' }}>
                      <img 
                        src={data?.influencer?.photo}
                        alt={data?.influencer?.name}
                        style={{
                          width: '100%', height: '100%', objectFit: 'cover',
                          filter: 'brightness(0.95)'
                        }}
                      />
                      <div style={{
                        position: 'absolute', bottom: 0, left: 0, right: 0,
                        background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
                        padding: '60px 20px 20px', color: 'white'
                      }}>
                        <h2 style={{ fontSize: '22px', fontWeight: '700', margin: '0 0 4px' }}>
                          {data?.influencer?.name}
                        </h2>
                        <p style={{ fontSize: '13px', opacity: 0.8, margin: 0 }}>
                          {data?.influencer?.tiktokHandle}
                        </p>
                      </div>
                      <div style={{
                        position: 'absolute', bottom: '20px', right: '20px',
                        background: '#F5C842', padding: '8px 16px', borderRadius: '100px',
                        fontSize: '14px', fontWeight: '700', color: '#2D2D3A'
                      }}>
                        {formatCurrency(data?.stats?.pendingPayment)} RSD
                      </div>
                    </div>
                    
                    {/* Quick Info */}
                    <div style={{ padding: '20px' }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {data?.influencer?.categories?.map(cat => (
                          <span key={cat} style={{
                            padding: '6px 12px', borderRadius: '100px',
                            background: 'rgba(0,0,0,0.05)', fontSize: '12px',
                            fontWeight: '600', color: '#666'
                          }}>{cat}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  {/* Moje prijave */}
                  <div className="glass-card" style={{ padding: '20px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '700', margin: '0 0 16px', color: '#2D2D3A' }}>
                      📋 Moje prijave
                    </h3>
                    {data?.applications?.map((app, i) => (
                      <ApplicationRow key={app.id} application={app} index={i} />
                    ))}
                  </div>
                </div>
                
                {/* Middle Column - Stats & Activity */}
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
                    {/* Progress Card */}
                    <div className="glass-card" style={{ padding: '24px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                        <h3 style={{ fontSize: '16px', fontWeight: '700', margin: 0, color: '#2D2D3A' }}>Aktivnost</h3>
                        <button style={{
                          width: '32px', height: '32px', borderRadius: '50%',
                          background: 'rgba(0,0,0,0.05)', border: 'none', cursor: 'pointer'
                        }}>↗</button>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                        <span style={{ fontSize: '36px', fontWeight: '800', color: '#2D2D3A' }}>
                          {data?.stats?.totalClips}
                        </span>
                        <div>
                          <span style={{ fontSize: '14px', color: '#888' }}>klipova</span>
                          <br />
                          <span style={{ fontSize: '12px', color: '#7DD87D', fontWeight: '600' }}>ovog meseca</span>
                        </div>
                      </div>
                      <ProgressBarDots data={data?.weeklyActivity || []} />
                    </div>
                    
                    {/* Circular Progress */}
                    <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                      <CircularProgress 
                        percent={data?.stats?.completionRate || 0} 
                        size={140} 
                        value={`${data?.stats?.completionRate}%`}
                        label="Completion"
                      />
                      <p style={{ fontSize: '14px', color: '#888', marginTop: '16px', textAlign: 'center' }}>
                        Uspešno završenih kampanja
                      </p>
                    </div>
                  </div>
                  
                  {/* Recent Clips */}
                  <div className="glass-card" style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                      <h3 style={{ fontSize: '16px', fontWeight: '700', margin: 0, color: '#2D2D3A' }}>🎬 Poslednji klipovi</h3>
                      <button className="btn-secondary" onClick={() => setActiveSection('clips')}>Vidi sve →</button>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                      {data?.clips?.slice(0, 4).map((clip, i) => (
                        <ClipCard key={clip.id} clip={clip} index={i} />
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Right Column - Opportunities (Dark) */}
                <div className="dark-card" style={{ padding: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <div>
                      <h3 style={{ fontSize: '18px', fontWeight: '700', margin: '0 0 4px' }}>Prilike</h3>
                      <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', margin: 0 }}>
                        {data?.opportunities?.length} dostupnih
                      </p>
                    </div>
                    <span style={{
                      background: '#F5C842', color: '#2D2D3A',
                      padding: '6px 12px', borderRadius: '100px',
                      fontSize: '13px', fontWeight: '700'
                    }}>{data?.opportunities?.length}</span>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {data?.opportunities?.slice(0, 5).map((opp, i) => (
                      <OpportunityMini key={opp.id} opportunity={opp} index={i} onApply={setSelectedOpportunity} />
                    ))}
                  </div>
                  
                  <button className="btn-primary" onClick={() => setActiveSection('opportunities')} 
                          style={{ width: '100%', marginTop: '20px' }}>
                    Vidi sve prilike →
                  </button>
                </div>
                
              </div>
            </>
          )}
          
          {activeSection === 'opportunities' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '24px' }}>
              {data?.opportunities?.map((opp, i) => (
                <div key={opp.id} className="glass-card" style={{ padding: '24px', animation: `fadeIn 0.4s ease ${i * 0.1}s both` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <span className="tag tag-yellow">🔥 Novo</span>
                    <span style={{ fontSize: '13px', color: '#888' }}>{opp.platform}</span>
                  </div>
                  <h3 style={{ fontSize: '22px', fontWeight: '700', margin: '0 0 8px', color: '#2D2D3A' }}>{opp.clientName}</h3>
                  <p style={{ fontSize: '14px', color: '#666', lineHeight: 1.6, marginBottom: '20px' }}>{opp.description}</p>
                  <div style={{
                    display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px',
                    padding: '16px', background: 'linear-gradient(135deg, #FFF8E7, #FFE8B8)',
                    borderRadius: '14px', marginBottom: '20px'
                  }}>
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ fontSize: '10px', color: '#5D4E37', fontWeight: '600', margin: '0 0 4px' }}>HONORAR</p>
                      <p style={{ fontSize: '18px', fontWeight: '800', color: '#2D2D3A', margin: 0 }}>{formatCurrency(opp.payment)}</p>
                    </div>
                    <div style={{ textAlign: 'center', borderLeft: '1px solid rgba(0,0,0,0.1)', borderRight: '1px solid rgba(0,0,0,0.1)' }}>
                      <p style={{ fontSize: '10px', color: '#5D4E37', fontWeight: '600', margin: '0 0 4px' }}>VIEWS</p>
                      <p style={{ fontSize: '18px', fontWeight: '800', color: '#2D2D3A', margin: 0 }}>{formatNumber(opp.viewsRequired)}</p>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ fontSize: '10px', color: '#5D4E37', fontWeight: '600', margin: '0 0 4px' }}>ROK</p>
                      <p style={{ fontSize: '18px', fontWeight: '800', color: '#2D2D3A', margin: 0 }}>{formatDate(opp.deadline)}</p>
                    </div>
                  </div>
                  <button className="btn-primary" onClick={() => setSelectedOpportunity(opp)} style={{ width: '100%' }}>
                    ✨ Prijavi se
                  </button>
                </div>
              ))}
            </div>
          )}
          
          {activeSection === 'applications' && (
            <div className="glass-card" style={{ padding: '32px', maxWidth: '800px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: '700', margin: '0 0 24px', color: '#2D2D3A' }}>📋 Moje prijave</h2>
              {data?.applications?.map((app, i) => (
                <ApplicationRow key={app.id} application={app} index={i} />
              ))}
            </div>
          )}
          
          {activeSection === 'clips' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' }}>
              {data?.clips?.map((clip, i) => <ClipCard key={clip.id} clip={clip} index={i} />)}
            </div>
          )}
          
          {activeSection === 'profile' && (
            <div className="glass-card" style={{ padding: '32px', maxWidth: '900px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '32px' }}>
                <img src={data?.influencer?.photo} alt="" style={{
                  width: '100px', height: '100px', borderRadius: '24px', objectFit: 'cover'
                }} />
                <div>
                  <h2 style={{ fontSize: '28px', fontWeight: '700', margin: '0 0 4px', color: '#2D2D3A' }}>
                    {data?.influencer?.name}
                  </h2>
                  <p style={{ fontSize: '14px', color: '#888', margin: 0 }}>{data?.influencer?.tiktokHandle} • {data?.influencer?.city}</p>
                </div>
                <button className="btn-primary" style={{ marginLeft: 'auto' }}>✏️ Izmeni profil</button>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                <ProfileField icon="📱" label="Telefon" value={data?.influencer?.phone} />
                <ProfileField icon="📍" label="Grad" value={data?.influencer?.city} />
                <ProfileField icon="🎵" label="TikTok" value={data?.influencer?.tiktokHandle} />
                <ProfileField icon="📸" label="Instagram" value={data?.influencer?.instagramHandle} />
                <ProfileField icon="👕" label="Veličina majice" value={data?.influencer?.shirtSize} />
                <ProfileField icon="👖" label="Veličina pantalona" value={data?.influencer?.pantsSize} />
                <ProfileField icon="👟" label="Broj cipela" value={data?.influencer?.shoeSize} />
              </div>
              
              <div style={{ marginTop: '24px', padding: '20px', background: 'rgba(255,255,255,0.5)', borderRadius: '16px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#2D2D3A', display: 'block', marginBottom: '12px' }}>
                  🏷️ Kategorije
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {['Beauty', 'Fashion', 'Fitness', 'Food', 'Tech', 'Travel', 'Gaming', 'Lifestyle'].map(cat => (
                    <span key={cat} style={{
                      padding: '10px 18px', borderRadius: '100px', fontSize: '13px', fontWeight: '600',
                      background: data?.influencer?.categories?.includes(cat) ? '#F5C842' : 'white',
                      color: data?.influencer?.categories?.includes(cat) ? '#2D2D3A' : '#888',
                      cursor: 'pointer', transition: 'all 0.2s'
                    }}>{cat}</span>
                  ))}
                </div>
              </div>
            </div>
          )}
          
        </div>
      </div>
      
      {selectedOpportunity && (
        <ApplyModal 
          opportunity={selectedOpportunity} 
          onClose={() => setSelectedOpportunity(null)}
          onSubmit={handleApply}
        />
      )}
    </>
  );
}
