// pages/influencer/[slug].js - Influencer Dashboard v5
// CLEAN MINIMAL - Twisty-inspired design
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
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return 'Upravo';
  if (hours < 24) return `Pre ${hours}h`;
  const days = Math.floor(diff / 86400000);
  if (days === 1) return 'Juče';
  if (days < 7) return `Pre ${days} dana`;
  return formatDate(dateStr);
};

// ============ GLOBAL STYLES ============
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Serif+Display&display=swap');
    
    * { box-sizing: border-box; margin: 0; padding: 0; }
    
    body {
      font-family: 'DM Sans', -apple-system, sans-serif;
      background: #ECEEF2;
      min-height: 100vh;
      color: #1a1a2e;
    }
    
    @keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes slideIn { from { opacity: 0; transform: translateX(-12px); } to { opacity: 1; transform: translateX(0); } }
    @keyframes scaleIn { from { opacity: 0; transform: scale(0.96); } to { opacity: 1; transform: scale(1); } }
    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.6; } }
    @keyframes barGrow { from { transform: scaleY(0); } to { transform: scaleY(1); } }
    @keyframes spin { to { transform: rotate(360deg); } }
    
    ::-webkit-scrollbar { width: 6px; height: 6px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 10px; }
    
    .card {
      background: white;
      border-radius: 24px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03);
      transition: all 0.3s ease;
    }
    
    .card:hover {
      box-shadow: 0 2px 8px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.06);
    }
    
    .card-static {
      background: white;
      border-radius: 24px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03);
    }
    
    .tag {
      display: inline-flex;
      align-items: center;
      padding: 6px 12px;
      border-radius: 8px;
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.3px;
    }
    
    .tag-paid { background: #E8F5E9; color: #2E7D32; }
    .tag-pending { background: #FFF3E0; color: #E65100; }
    .tag-new { background: #E3F2FD; color: #1565C0; }
    .tag-outline { background: transparent; border: 1px solid #E0E0E0; color: #666; }
    
    .btn-primary {
      background: #1a1a2e;
      color: white;
      border: none;
      padding: 14px 28px;
      border-radius: 14px;
      font-weight: 600;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    
    .btn-primary:hover {
      background: #2d2d4a;
      transform: translateY(-1px);
    }
    
    .btn-secondary {
      background: #F5F5F5;
      color: #1a1a2e;
      border: none;
      padding: 12px 20px;
      border-radius: 12px;
      font-weight: 600;
      font-size: 13px;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    
    .btn-secondary:hover {
      background: #EEEEEE;
    }
    
    .btn-icon {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      border: 1px solid #E8E8E8;
      background: white;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s;
      font-size: 16px;
    }
    
    .btn-icon:hover {
      background: #F5F5F5;
      border-color: #D0D0D0;
    }
    
    input, textarea, select {
      font-family: 'DM Sans', sans-serif;
      background: #F8F9FA;
      border: 1px solid #E8E8E8;
      border-radius: 12px;
      padding: 14px 18px;
      font-size: 14px;
      outline: none;
      transition: all 0.2s;
    }
    
    input:focus, textarea:focus {
      background: white;
      border-color: #1a1a2e;
    }
    
    .serif { font-family: 'DM Serif Display', serif; }
  `}</style>
);

// ============ COMPONENTS ============

// Income/Stats Chart with dots and bars
const IncomeChart = ({ data, label = 'Zarada', showPercentChange = true }) => {
  const maxValue = Math.max(...data.map(d => d.value), 1);
  const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const [hoveredIndex, setHoveredIndex] = useState(null);
  
  // Find highest value for tooltip
  const highestIndex = data.findIndex(d => d.value === maxValue);
  
  return (
    <div className="card-static" style={{ padding: '28px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px',
            background: '#F5F5F5', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <span style={{ fontSize: '18px' }}>💰</span>
          </div>
          <h3 className="serif" style={{ fontSize: '26px', fontWeight: '400', margin: 0 }}>Income Tracker</h3>
        </div>
        <button className="btn-secondary" style={{ padding: '8px 16px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          Week <span style={{ fontSize: '10px' }}>▼</span>
        </button>
      </div>
      
      <p style={{ fontSize: '13px', color: '#888', marginBottom: '32px', maxWidth: '320px', lineHeight: 1.5 }}>
        Track changes in income over time and access detailed data on each project and payments received
      </p>
      
      {/* Chart */}
      <div style={{ position: 'relative', height: '180px', marginBottom: '20px' }}>
        {/* Bars */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '140px', padding: '0 20px' }}>
          {data.map((item, i) => {
            const height = Math.max((item.value / maxValue) * 100, 5);
            const isHighest = i === highestIndex;
            const isHovered = i === hoveredIndex;
            
            return (
              <div 
                key={i} 
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', position: 'relative' }}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* Tooltip */}
                {(isHighest || isHovered) && (
                  <div style={{
                    position: 'absolute', bottom: `${height + 20}%`,
                    background: '#1a1a2e', color: 'white',
                    padding: '6px 12px', borderRadius: '8px',
                    fontSize: '12px', fontWeight: '600',
                    whiteSpace: 'nowrap', zIndex: 10
                  }}>
                    {formatCurrency(item.value)} RSD
                    <div style={{
                      position: 'absolute', bottom: '-5px', left: '50%', transform: 'translateX(-50%)',
                      width: 0, height: 0,
                      borderLeft: '5px solid transparent',
                      borderRight: '5px solid transparent',
                      borderTop: '5px solid #1a1a2e'
                    }} />
                  </div>
                )}
                
                {/* Dot on top */}
                <div style={{
                  width: '10px', height: '10px', borderRadius: '50%',
                  background: isHighest ? '#1a1a2e' : '#CBD5E1',
                  transition: 'all 0.3s',
                  transform: isHovered ? 'scale(1.3)' : 'scale(1)'
                }} />
                
                {/* Bar */}
                <div style={{
                  width: '4px', borderRadius: '4px',
                  background: isHighest ? '#1a1a2e' : '#E2E8F0',
                  height: `${height}%`,
                  minHeight: '8px',
                  transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                  transformOrigin: 'bottom',
                  animation: `barGrow 0.6s ease ${i * 0.05}s both`
                }} />
              </div>
            );
          })}
        </div>
        
        {/* Percentage change */}
        {showPercentChange && (
          <div style={{ position: 'absolute', bottom: '0', left: '0' }}>
            <p style={{ fontSize: '42px', fontWeight: '700', margin: '0', color: '#1a1a2e', letterSpacing: '-2px' }}>+20%</p>
            <p style={{ fontSize: '12px', color: '#888', margin: '4px 0 0' }}>This week's income is<br/>higher than last week's</p>
          </div>
        )}
      </div>
      
      {/* Day circles */}
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 10px' }}>
        {days.map((day, i) => {
          const isActive = i === 2; // Tuesday highlighted
          return (
            <div key={i} style={{
              width: '40px', height: '40px', borderRadius: '50%',
              background: isActive ? '#1a1a2e' : '#F5F5F5',
              color: isActive ? 'white' : '#888',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '13px', fontWeight: '600',
              transition: 'all 0.2s',
              cursor: 'pointer'
            }}>
              {day}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Barcode Progress (like Proposal Progress)
const BarcodeProgress = ({ sent, interviews, hires }) => {
  return (
    <div className="card-static" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', margin: 0 }}>Proposal Progress</h3>
        <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          📅 Decembar 2024 <span style={{ fontSize: '8px' }}>▼</span>
        </button>
      </div>
      
      {/* Stats row */}
      <div style={{ display: 'flex', gap: '32px', marginBottom: '20px' }}>
        <div>
          <p style={{ fontSize: '11px', color: '#888', margin: '0 0 4px', fontWeight: '500' }}>Proposals sent</p>
          <p style={{ fontSize: '32px', fontWeight: '700', margin: 0, letterSpacing: '-1px' }}>{sent}</p>
        </div>
        <div style={{ borderLeft: '1px solid #E8E8E8', paddingLeft: '32px' }}>
          <p style={{ fontSize: '11px', color: '#888', margin: '0 0 4px', fontWeight: '500' }}>Interviews</p>
          <p style={{ fontSize: '32px', fontWeight: '700', margin: 0, letterSpacing: '-1px' }}>{interviews}</p>
        </div>
        <div style={{ borderLeft: '1px solid #E8E8E8', paddingLeft: '32px' }}>
          <p style={{ fontSize: '11px', color: '#888', margin: '0 0 4px', fontWeight: '500' }}>Hires</p>
          <p style={{ fontSize: '32px', fontWeight: '700', margin: 0, letterSpacing: '-1px' }}>{hires}</p>
        </div>
      </div>
      
      {/* Barcode visualization */}
      <div style={{ display: 'flex', gap: '2px', height: '40px', alignItems: 'flex-end' }}>
        {[...Array(40)].map((_, i) => {
          const isAccent = i < hires;
          const height = 20 + Math.random() * 20;
          return (
            <div key={i} style={{
              width: '3px', borderRadius: '1px',
              height: `${height}px`,
              background: isAccent ? '#E57373' : '#E8E8E8',
              transition: 'all 0.3s',
              animation: `barGrow 0.4s ease ${i * 0.01}s both`
            }} />
          );
        })}
      </div>
    </div>
  );
};

// Project/Opportunity Card
const ProjectCard = ({ project, isExpanded, onToggle }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div 
      style={{ 
        padding: '16px', 
        borderBottom: '1px solid #F0F0F0',
        cursor: 'pointer',
        background: isHovered ? '#FAFAFA' : 'transparent',
        transition: 'background 0.2s'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onToggle}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{
          width: '44px', height: '44px', borderRadius: '12px',
          background: project.color || 'linear-gradient(135deg, #FF6B6B, #FF8E53)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '20px', color: 'white'
        }}>
          {project.icon || '💼'}
        </div>
        
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '2px' }}>
            <h4 style={{ fontSize: '14px', fontWeight: '600', margin: 0 }}>{project.name}</h4>
            <span className={`tag ${project.paid ? 'tag-paid' : 'tag-pending'}`}>
              {project.paid ? 'Paid' : 'Not Paid'}
            </span>
          </div>
          <p style={{ fontSize: '12px', color: '#888', margin: 0 }}>{formatCurrency(project.amount)} RSD</p>
        </div>
        
        <button className="btn-icon" style={{ width: '32px', height: '32px', fontSize: '12px', border: 'none', background: '#F5F5F5' }}>
          {isExpanded ? '∧' : '∨'}
        </button>
      </div>
      
      {isExpanded && (
        <div style={{ marginTop: '16px', paddingLeft: '58px', animation: 'fadeIn 0.3s ease' }}>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
            <span className="tag tag-outline">{project.type || 'Remote'}</span>
            <span className="tag tag-outline">{project.duration || 'Part-time'}</span>
          </div>
          <p style={{ fontSize: '13px', color: '#666', lineHeight: 1.6, margin: '0 0 12px' }}>
            {project.description}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '12px', color: '#999' }}>
            <span>📍 {project.location || 'Serbia'}</span>
            <span>|</span>
            <span>{getTimeAgo(project.date)}</span>
          </div>
        </div>
      )}
    </div>
  );
};

// Connection/Application Card
const ConnectionCard = ({ person, onConnect }) => (
  <div style={{ 
    display: 'flex', alignItems: 'center', gap: '14px', 
    padding: '14px 0', borderBottom: '1px solid #F0F0F0'
  }}>
    <img 
      src={person.photo} 
      alt={person.name}
      style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover' }}
    />
    <div style={{ flex: 1 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <h4 style={{ fontSize: '14px', fontWeight: '600', margin: 0 }}>{person.name}</h4>
        <span className={`tag ${person.level === 'Senior' ? 'tag-paid' : 'tag-new'}`} style={{ fontSize: '10px', padding: '3px 8px' }}>
          {person.level}
        </span>
      </div>
      <p style={{ fontSize: '12px', color: '#888', margin: '2px 0 0' }}>{person.role}</p>
    </div>
    <button className="btn-icon" onClick={() => onConnect(person)}>+</button>
  </div>
);

// Premium Unlock Card (with halftone pattern)
const PremiumCard = () => (
  <div className="card-static" style={{ 
    padding: '28px', 
    background: 'linear-gradient(135deg, #F8F9FA 0%, #ECEEF2 100%)',
    position: 'relative',
    overflow: 'hidden'
  }}>
    {/* Halftone dots pattern */}
    <div style={{
      position: 'absolute', bottom: 0, right: 0,
      width: '150px', height: '100px',
      backgroundImage: 'radial-gradient(#CBD5E1 1.5px, transparent 1.5px)',
      backgroundSize: '8px 8px',
      opacity: 0.6
    }} />
    
    <h3 style={{ fontSize: '18px', fontWeight: '700', margin: '0 0 8px', position: 'relative' }}>
      Unlock Premium Features
    </h3>
    <p style={{ fontSize: '13px', color: '#666', margin: '0 0 24px', lineHeight: 1.5, maxWidth: '200px', position: 'relative' }}>
      Get access to exclusive benefits and expand your freelancing opportunities
    </p>
    <button style={{
      background: 'white', border: '1px solid #E0E0E0',
      padding: '12px 20px', borderRadius: '12px',
      fontSize: '13px', fontWeight: '600', cursor: 'pointer',
      display: 'flex', alignItems: 'center', gap: '8px',
      transition: 'all 0.2s', position: 'relative'
    }}>
      Upgrade now <span>→</span>
    </button>
  </div>
);

// Navigation
const NavLink = ({ label, isActive, onClick }) => (
  <button onClick={onClick} style={{
    background: 'none', border: 'none',
    fontSize: '14px', fontWeight: isActive ? '600' : '500',
    color: isActive ? '#1a1a2e' : '#888',
    cursor: 'pointer', padding: '8px 0',
    position: 'relative',
    transition: 'color 0.2s'
  }}>
    {label}
    {isActive && (
      <div style={{
        position: 'absolute', bottom: '0', left: '0', right: '0',
        height: '2px', background: '#1a1a2e', borderRadius: '2px'
      }} />
    )}
  </button>
);

// Profile Field
const ProfileField = ({ icon, label, value, isEditing, onChange }) => (
  <div style={{ 
    display: 'flex', alignItems: 'center', gap: '14px',
    padding: '16px', background: '#F8F9FA', borderRadius: '14px'
  }}>
    <span style={{ fontSize: '20px' }}>{icon}</span>
    <div style={{ flex: 1 }}>
      <label style={{ fontSize: '10px', color: '#888', fontWeight: '600', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
        {label}
      </label>
      {isEditing ? (
        <input type="text" value={value || ''} onChange={onChange} style={{ width: '100%', padding: '6px 0', background: 'transparent', border: 'none', borderBottom: '1px solid #1a1a2e' }} />
      ) : (
        <p style={{ fontSize: '14px', fontWeight: '600', color: '#1a1a2e', margin: '4px 0 0' }}>{value || '—'}</p>
      )}
    </div>
  </div>
);

// ============ MAIN COMPONENT ============
export default function InfluencerDashboard() {
  const router = useRouter();
  const { slug } = router.query;
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeNav, setActiveNav] = useState('Home');
  const [expandedProject, setExpandedProject] = useState(0);
  
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
          shoeSize: '39',
          categories: ['Beauty', 'Fashion', 'Lifestyle']
        },
        stats: {
          totalEarnings: 125000,
          totalViews: 2450000,
          totalClips: 24,
          pendingPayment: 15000,
          proposalsSent: 64,
          interviews: 12,
          hires: 10
        },
        weeklyIncome: [
          { value: 8000 },
          { value: 12000 },
          { value: 25000 },
          { value: 18000 },
          { value: 15000 },
          { value: 9000 },
          { value: 6000 }
        ],
        projects: [
          { id: 1, name: 'Beauty Campaign', icon: '💄', color: 'linear-gradient(135deg, #FF6B6B, #FF8E53)', amount: 12000, paid: true, type: 'Remote', duration: 'Part-time', description: 'This project involves creating authentic beauty content for a major skincare brand.', location: 'Serbia', date: '2024-12-24' },
          { id: 2, name: 'Fashion Collab', icon: '👗', color: 'linear-gradient(135deg, #667eea, #764ba2)', amount: 8000, paid: false, type: 'On-site', duration: 'One-time', description: 'Fashion photoshoot and social media content creation.', location: 'Beograd', date: '2024-12-22' },
          { id: 3, name: 'Tech Review', icon: '📱', color: 'linear-gradient(135deg, #11998e, #38ef7d)', amount: 15000, paid: true, type: 'Remote', duration: 'Part-time', description: 'Unboxing and review content for new smartphone launch.', location: 'Serbia', date: '2024-12-20' }
        ],
        connections: [
          { id: 1, name: 'Ana Stanković', photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100', level: 'Senior', role: 'Beauty specialist' },
          { id: 2, name: 'Marko Nikolić', photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100', level: 'Middle', role: 'Content Creator' }
        ],
        clips: [
          { id: 1, clientName: 'Samsung Serbia', platform: 'Tik Tok', views: 245000, publishDate: '2024-12-22', link: '#' },
          { id: 2, clientName: 'Coca-Cola', platform: 'Instagram', views: 180000, publishDate: '2024-12-18', link: '#' }
        ]
      });
      setLoading(false);
    }, 600);
  }, [slug]);
  
  if (loading) {
    return (
      <>
        <GlobalStyles />
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#ECEEF2' }}>
          <div className="card-static" style={{ padding: '40px', textAlign: 'center' }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '50%',
              border: '3px solid #E8E8E8', borderTopColor: '#1a1a2e',
              animation: 'spin 0.8s linear infinite', margin: '0 auto 16px'
            }} />
            <p style={{ color: '#888', fontSize: '14px' }}>Loading...</p>
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
      
      <div style={{ minHeight: '100vh', padding: '24px', background: '#ECEEF2' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          
          {/* Header */}
          <header style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            marginBottom: '24px', padding: '0 8px'
          }}>
            {/* Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '10px',
                background: 'linear-gradient(135deg, #FF6B6B, #FF8E53)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <span style={{ color: 'white', fontSize: '16px' }}>🎬</span>
              </div>
              <span style={{ fontSize: '18px', fontWeight: '700', color: '#1a1a2e', letterSpacing: '-0.5px' }}>VOICE</span>
            </div>
            
            {/* Nav */}
            <nav style={{ display: 'flex', gap: '32px' }}>
              {['Home', 'Prilike', 'Poruke', 'Wallet', 'Profil'].map(item => (
                <NavLink key={item} label={item} isActive={activeNav === item} onClick={() => setActiveNav(item)} />
              ))}
            </nav>
            
            {/* Right side */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                background: 'white', padding: '8px 16px', borderRadius: '12px',
                border: '1px solid #E8E8E8'
              }}>
                <span style={{ color: '#888' }}>🔍</span>
                <input type="text" placeholder="Enter your search request..." 
                       style={{ border: 'none', background: 'none', outline: 'none', width: '180px', fontSize: '13px' }} />
              </div>
              <button className="btn-icon">⚙️</button>
              <button className="btn-icon">🔔</button>
              <img src={data?.influencer?.photo} alt="" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
            </div>
          </header>
          
          {/* Main Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '24px' }}>
            
            {/* Left Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* Income Chart */}
              <IncomeChart data={data?.weeklyIncome || []} />
              
              {/* Bottom row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px' }}>
                {/* Connections */}
                <div className="card-static" style={{ padding: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '600', margin: 0 }}>Let's Connect</h3>
                    <button style={{ background: 'none', border: 'none', color: '#888', fontSize: '12px', cursor: 'pointer' }}>See all</button>
                  </div>
                  {data?.connections?.map(person => (
                    <ConnectionCard key={person.id} person={person} onConnect={() => {}} />
                  ))}
                </div>
                
                {/* Premium Card */}
                <PremiumCard />
                
                {/* Barcode Progress */}
                <BarcodeProgress 
                  sent={data?.stats?.proposalsSent || 0} 
                  interviews={data?.stats?.interviews || 0} 
                  hires={data?.stats?.hires || 0} 
                />
              </div>
            </div>
            
            {/* Right Column - Projects */}
            <div className="card-static" style={{ padding: '0', height: 'fit-content' }}>
              <div style={{ padding: '24px 24px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', margin: 0 }}>Your Recent Projects</h3>
                <button style={{ background: 'none', border: 'none', color: '#888', fontSize: '12px', cursor: 'pointer' }}>See all Project</button>
              </div>
              
              {data?.projects?.map((project, i) => (
                <ProjectCard 
                  key={project.id} 
                  project={project} 
                  isExpanded={expandedProject === i}
                  onToggle={() => setExpandedProject(expandedProject === i ? -1 : i)}
                />
              ))}
            </div>
            
          </div>
          
        </div>
      </div>
    </>
  );
}
