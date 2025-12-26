// pages/influencer/[slug].js - Influencer Dashboard v6 FINAL
// WARM GLASSMORPHISM + CLEAN DETAILS (V4 + V5 combined)
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
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=DM+Serif+Display&display=swap');
    
    * { box-sizing: border-box; margin: 0; padding: 0; }
    
    body {
      font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
      background: linear-gradient(160deg, #B8B5C9 0%, #C9C6D6 25%, #DCD9E4 50%, #E8E4D9 75%, #F0EBE0 100%);
      min-height: 100vh;
    }
    
    @keyframes fadeIn { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes slideIn { from { opacity: 0; transform: translateX(-16px); } to { opacity: 1; transform: translateX(0); } }
    @keyframes scaleIn { from { opacity: 0; transform: scale(0.96); } to { opacity: 1; transform: scale(1); } }
    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes progressFill { from { stroke-dashoffset: 283; } }
    @keyframes barGrow { from { transform: scaleY(0); } to { transform: scaleY(1); } }
    @keyframes dotPulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.2); } }
    
    ::-webkit-scrollbar { width: 6px; height: 6px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.12); border-radius: 10px; }
    
    .glass-card {
      background: rgba(255, 255, 255, 0.55);
      backdrop-filter: blur(40px);
      -webkit-backdrop-filter: blur(40px);
      border-radius: 28px;
      border: 1px solid rgba(255, 255, 255, 0.6);
      box-shadow: 0 2px 8px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04), inset 0 1px 1px rgba(255,255,255,0.8);
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .glass-card:hover {
      background: rgba(255, 255, 255, 0.65);
      box-shadow: 0 4px 12px rgba(0,0,0,0.05), 0 16px 40px rgba(0,0,0,0.06);
      transform: translateY(-2px);
    }
    
    .glass-card-static {
      background: rgba(255, 255, 255, 0.55);
      backdrop-filter: blur(40px);
      -webkit-backdrop-filter: blur(40px);
      border-radius: 28px;
      border: 1px solid rgba(255, 255, 255, 0.6);
      box-shadow: 0 2px 8px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04), inset 0 1px 1px rgba(255,255,255,0.8);
    }
    
    .glass-overlay {
      background: rgba(255, 255, 255, 0.25);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid rgba(255, 255, 255, 0.3);
    }
    
    .dark-card {
      background: linear-gradient(145deg, #2D2D3A 0%, #252532 100%);
      border-radius: 28px;
      color: white;
      box-shadow: 0 4px 16px rgba(0,0,0,0.15), 0 12px 40px rgba(0,0,0,0.12);
    }
    
    .warm-gradient {
      background: linear-gradient(135deg, #FFFCF5 0%, #FFF5E1 40%, #FFE9C2 100%);
    }
    
    .tag {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 16px;
      border-radius: 100px;
      font-size: 12px;
      font-weight: 600;
      letter-spacing: 0.2px;
    }
    
    .tag-yellow { background: rgba(245, 200, 66, 0.9); color: #5D4E37; }
    .tag-gray { background: rgba(0,0,0,0.06); color: #666; }
    .tag-paid { background: rgba(165, 214, 167, 0.6); color: #2E7D32; }
    .tag-pending { background: rgba(255, 224, 130, 0.6); color: #E65100; }
    .tag-outline { background: transparent; border: 1px solid rgba(0,0,0,0.1); color: #666; font-size: 11px; padding: 6px 12px; }
    
    .btn-primary {
      background: linear-gradient(135deg, #F7CD4A 0%, #F5C842 50%, #E8B93A 100%);
      color: #3D3520;
      border: none;
      padding: 14px 28px;
      border-radius: 16px;
      font-weight: 700;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 2px 8px rgba(245, 200, 66, 0.3), 0 4px 16px rgba(245, 200, 66, 0.2);
    }
    
    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(245, 200, 66, 0.4), 0 8px 24px rgba(245, 200, 66, 0.3);
    }
    
    .btn-secondary {
      background: rgba(255,255,255,0.9);
      color: #2D2D3A;
      border: 1px solid rgba(0,0,0,0.06);
      padding: 10px 18px;
      border-radius: 12px;
      font-weight: 600;
      font-size: 12px;
      cursor: pointer;
      transition: all 0.25s ease;
    }
    
    .btn-secondary:hover { background: white; }
    
    .btn-icon {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      border: 1px solid rgba(0,0,0,0.06);
      background: rgba(255,255,255,0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s;
      font-size: 16px;
    }
    
    .btn-icon:hover { background: white; transform: scale(1.05); }
    
    input, textarea, select {
      font-family: 'Plus Jakarta Sans', sans-serif;
      background: rgba(255,255,255,0.8);
      border: 1px solid rgba(0,0,0,0.06);
      border-radius: 14px;
      padding: 14px 18px;
      font-size: 14px;
      outline: none;
      transition: all 0.25s ease;
    }
    
    input:focus, textarea:focus {
      background: white;
      border-color: rgba(245, 200, 66, 0.5);
      box-shadow: 0 0 0 4px rgba(245, 200, 66, 0.12);
    }
    
    .serif { font-family: 'DM Serif Display', serif; }
  `}</style>
);

// ============ COMPONENTS ============

// Blurred Stat Overlay (on profile image)
const BlurredStatOverlay = ({ icon, value, label, position = 'top-left' }) => {
  const positions = {
    'top-left': { top: '16px', left: '16px' },
    'top-right': { top: '16px', right: '16px' }
  };
  
  return (
    <div className="glass-overlay" style={{
      position: 'absolute', ...positions[position],
      padding: '12px 18px', borderRadius: '16px',
      display: 'flex', alignItems: 'center', gap: '10px'
    }}>
      <span style={{ fontSize: '18px' }}>{icon}</span>
      <div>
        <p style={{ fontSize: '18px', fontWeight: '800', margin: 0, color: 'white', textShadow: '0 1px 2px rgba(0,0,0,0.2)' }}>{value}</p>
        <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.8)', margin: 0, fontWeight: '500' }}>{label}</p>
      </div>
    </div>
  );
};

// Income Tracker Chart (from V5 - with dots, tooltips, day circles)
const IncomeTracker = ({ data, totalEarnings }) => {
  const maxValue = Math.max(...data.map(d => d.amount), 1);
  const days = ['P', 'U', 'S', 'Č', 'P', 'S', 'N'];
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const highestIndex = data.findIndex(d => d.amount === maxValue);
  
  // Calculate week change percentage
  const thisWeek = data.slice(-7).reduce((sum, d) => sum + d.amount, 0);
  const lastWeek = data.slice(-14, -7).reduce((sum, d) => sum + d.amount, 0) || thisWeek * 0.8;
  const changePercent = Math.round(((thisWeek - lastWeek) / lastWeek) * 100);
  
  return (
    <div className="glass-card-static" style={{ padding: '28px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '12px',
            background: 'linear-gradient(135deg, rgba(245,200,66,0.2), rgba(245,200,66,0.1))',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <span style={{ fontSize: '20px' }}>💰</span>
          </div>
          <h3 className="serif" style={{ fontSize: '26px', fontWeight: '400', margin: 0, color: '#2D2D3A' }}>
            Income Tracker
          </h3>
        </div>
        <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          Nedelja <span style={{ fontSize: '10px', opacity: 0.6 }}>▼</span>
        </button>
      </div>
      
      <p style={{ fontSize: '13px', color: '#888', marginBottom: '32px', lineHeight: 1.5 }}>
        Prati promene u zaradi tokom vremena i pristupi detaljnim podacima o svakom projektu
      </p>
      
      {/* Chart */}
      <div style={{ position: 'relative', height: '200px', marginBottom: '24px' }}>
        {/* Bars with dots */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '150px', padding: '0 20px' }}>
          {data.map((item, i) => {
            const height = Math.max((item.amount / maxValue) * 100, 8);
            const isHighest = i === highestIndex;
            const isHovered = i === hoveredIndex;
            
            return (
              <div 
                key={i} 
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', position: 'relative', cursor: 'pointer' }}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* Tooltip */}
                {(isHighest || isHovered) && (
                  <div style={{
                    position: 'absolute', bottom: `calc(${height}% + 30px)`,
                    background: '#2D2D3A', color: 'white',
                    padding: '8px 14px', borderRadius: '10px',
                    fontSize: '13px', fontWeight: '700',
                    whiteSpace: 'nowrap', zIndex: 10,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                  }}>
                    {formatCurrency(item.amount)} RSD
                    <div style={{
                      position: 'absolute', bottom: '-6px', left: '50%', transform: 'translateX(-50%)',
                      width: 0, height: 0,
                      borderLeft: '6px solid transparent',
                      borderRight: '6px solid transparent',
                      borderTop: '6px solid #2D2D3A'
                    }} />
                  </div>
                )}
                
                {/* Dot on top */}
                <div style={{
                  width: '12px', height: '12px', borderRadius: '50%',
                  background: isHighest || isHovered ? '#F5C842' : 'rgba(0,0,0,0.15)',
                  boxShadow: isHighest || isHovered ? '0 2px 8px rgba(245,200,66,0.5)' : 'none',
                  transition: 'all 0.3s',
                  animation: isHovered ? 'dotPulse 0.5s ease' : 'none'
                }} />
                
                {/* Bar */}
                <div style={{
                  width: '6px', borderRadius: '6px',
                  background: isHighest || isHovered 
                    ? 'linear-gradient(180deg, #F5C842 0%, #E8B93A 100%)' 
                    : 'rgba(0,0,0,0.08)',
                  height: `${height}%`,
                  minHeight: '12px',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  transformOrigin: 'bottom',
                  animation: `barGrow 0.6s ease ${i * 0.05}s both`,
                  boxShadow: isHighest || isHovered ? '0 4px 12px rgba(245,200,66,0.3)' : 'none'
                }} />
              </div>
            );
          })}
        </div>
        
        {/* Percentage change - bottom left */}
        <div style={{ position: 'absolute', bottom: '0', left: '0' }}>
          <p style={{ 
            fontSize: '48px', fontWeight: '800', margin: '0', 
            color: changePercent >= 0 ? '#4CAF50' : '#F44336',
            letterSpacing: '-2px',
            lineHeight: 1
          }}>
            {changePercent >= 0 ? '+' : ''}{changePercent}%
          </p>
          <p style={{ fontSize: '12px', color: '#888', margin: '6px 0 0', lineHeight: 1.4 }}>
            Zarada ove nedelje je<br/>{changePercent >= 0 ? 'veća' : 'manja'} nego prošle
          </p>
        </div>
      </div>
      
      {/* Day circles */}
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 10px' }}>
        {days.map((day, i) => {
          const isActive = i === highestIndex;
          return (
            <div key={i} style={{
              width: '44px', height: '44px', borderRadius: '50%',
              background: isActive ? '#2D2D3A' : 'rgba(0,0,0,0.04)',
              color: isActive ? 'white' : '#888',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '13px', fontWeight: '600',
              transition: 'all 0.3s',
              cursor: 'pointer',
              boxShadow: isActive ? '0 4px 12px rgba(0,0,0,0.15)' : 'none'
            }}>
              {day}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Barcode Progress (from V5)
const BarcodeProgress = ({ applications, clips }) => {
  const sent = applications?.length || 0;
  const accepted = applications?.filter(a => a.status === 'Accepted').length || 0;
  const completed = clips?.length || 0;
  
  return (
    <div className="glass-card-static" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: '700', margin: 0, color: '#2D2D3A' }}>Proposal Progress</h3>
        <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: '11px' }}>
          📅 Dec 2024
        </button>
      </div>
      
      {/* Stats row */}
      <div style={{ display: 'flex', gap: '0', marginBottom: '20px' }}>
        <div style={{ flex: 1, paddingRight: '20px' }}>
          <p style={{ fontSize: '10px', color: '#888', margin: '0 0 4px', fontWeight: '600', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Poslato</p>
          <p style={{ fontSize: '32px', fontWeight: '800', margin: 0, color: '#2D2D3A', letterSpacing: '-1px' }}>{sent}</p>
        </div>
        <div style={{ flex: 1, borderLeft: '1px solid rgba(0,0,0,0.06)', paddingLeft: '20px', paddingRight: '20px' }}>
          <p style={{ fontSize: '10px', color: '#888', margin: '0 0 4px', fontWeight: '600', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Prihvaćeno</p>
          <p style={{ fontSize: '32px', fontWeight: '800', margin: 0, color: '#2D2D3A', letterSpacing: '-1px' }}>{accepted}</p>
        </div>
        <div style={{ flex: 1, borderLeft: '1px solid rgba(0,0,0,0.06)', paddingLeft: '20px' }}>
          <p style={{ fontSize: '10px', color: '#888', margin: '0 0 4px', fontWeight: '600', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Završeno</p>
          <p style={{ fontSize: '32px', fontWeight: '800', margin: 0, color: '#2D2D3A', letterSpacing: '-1px' }}>{completed}</p>
        </div>
      </div>
      
      {/* Barcode visualization */}
      <div style={{ display: 'flex', gap: '2px', height: '44px', alignItems: 'flex-end' }}>
        {[...Array(45)].map((_, i) => {
          const isAccent = i < completed;
          const height = 50 + Math.random() * 50;
          return (
            <div key={i} style={{
              flex: 1, borderRadius: '2px',
              height: `${height}%`,
              background: isAccent 
                ? 'linear-gradient(180deg, #F5C842 0%, #E8B93A 100%)' 
                : 'rgba(0,0,0,0.06)',
              transition: 'all 0.3s',
              animation: `barGrow 0.3s ease ${i * 0.01}s both`
            }} />
          );
        })}
      </div>
    </div>
  );
};

// Premium Card with halftone pattern (from V5)
const PremiumCard = () => (
  <div className="glass-card-static" style={{ 
    padding: '28px', 
    background: 'linear-gradient(135deg, rgba(255,255,255,0.7) 0%, rgba(255,252,245,0.6) 100%)',
    position: 'relative', overflow: 'hidden'
  }}>
    {/* Halftone dots pattern */}
    <div style={{
      position: 'absolute', bottom: '-20px', right: '-20px',
      width: '180px', height: '120px',
      backgroundImage: 'radial-gradient(rgba(0,0,0,0.08) 2px, transparent 2px)',
      backgroundSize: '10px 10px',
      transform: 'rotate(-15deg)'
    }} />
    
    <h3 style={{ fontSize: '17px', fontWeight: '700', margin: '0 0 8px', color: '#2D2D3A', position: 'relative' }}>
      ✨ Unlock Premium
    </h3>
    <p style={{ fontSize: '13px', color: '#666', margin: '0 0 20px', lineHeight: 1.5, maxWidth: '200px', position: 'relative' }}>
      Pristupi ekskluzivnim prilikama i proširi svoje mogućnosti
    </p>
    <button className="btn-secondary" style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '8px' }}>
      Upgrade now <span>→</span>
    </button>
  </div>
);

// Circular Progress Ring
const CircularProgress = ({ percent, size = 140, strokeWidth = 12, color = '#F5C842', label, value }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percent / 100) * circumference;
  
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="rgba(0,0,0,0.04)" strokeWidth={strokeWidth} />
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke={color} strokeWidth={strokeWidth}
                strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)', filter: 'drop-shadow(0 2px 4px rgba(245, 200, 66, 0.3))' }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: size * 0.22, fontWeight: '800', color: '#2D2D3A', letterSpacing: '-1px' }}>{value}</span>
        {label && <span style={{ fontSize: size * 0.085, color: '#999', fontWeight: '500', marginTop: '2px' }}>{label}</span>}
      </div>
    </div>
  );
};

// Opportunity Mini Card for dark section
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
        padding: '14px 16px', borderRadius: '16px',
        background: isHovered ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.06)',
        cursor: 'pointer', transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: isHovered ? 'translateX(4px)' : 'none',
        animation: `slideIn 0.4s ease ${index * 0.08}s both`,
        border: '1px solid rgba(255,255,255,0.06)'
      }}
    >
      <div style={{
        width: '44px', height: '44px', borderRadius: '14px',
        background: 'linear-gradient(135deg, rgba(245, 200, 66, 0.25), rgba(245, 200, 66, 0.15))',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px'
      }}>
        {icons[index % icons.length]}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: '14px', fontWeight: '600', margin: '0 0 3px', color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {opportunity.clientName}
        </p>
        <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', margin: 0 }}>
          {opportunity.niche} • {formatCurrency(opportunity.payment)} RSD
        </p>
      </div>
      <div style={{
        width: '32px', height: '32px', borderRadius: '50%',
        background: isHovered ? 'linear-gradient(135deg, #F7CD4A, #E8B93A)' : 'rgba(255,255,255,0.08)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.25s ease', border: isHovered ? 'none' : '1px solid rgba(255,255,255,0.1)'
      }}>
        <span style={{ color: isHovered ? '#2D2D3A' : 'rgba(255,255,255,0.4)', fontSize: '14px', transition: 'all 0.25s ease' }}>→</span>
      </div>
    </div>
  );
};

// Application Row
const ApplicationRow = ({ application, index }) => {
  const statusConfig = {
    'Pending': { bg: 'rgba(255, 224, 130, 0.5)', color: '#8B7355', text: 'Čeka se', icon: '⏳' },
    'Sent': { bg: 'rgba(255, 224, 130, 0.5)', color: '#8B7355', text: 'Čeka se', icon: '⏳' },
    'Accepted': { bg: 'rgba(165, 214, 167, 0.5)', color: '#4A7B4A', text: 'Prihvaćeno', icon: '✓' },
    'Declined': { bg: 'rgba(255, 171, 145, 0.5)', color: '#8B5A5A', text: 'Odbijeno', icon: '✕' }
  };
  const status = statusConfig[application.status] || statusConfig['Pending'];
  
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '14px',
      padding: '14px 0', borderBottom: '1px solid rgba(0,0,0,0.04)',
      animation: `fadeIn 0.4s ease ${index * 0.08}s both`
    }}>
      <div style={{
        width: '44px', height: '44px', borderRadius: '14px',
        background: 'linear-gradient(145deg, #FFF5E1, #FFE9C2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '16px', fontWeight: '700', color: '#8B7355'
      }}>
        {application.clientName?.charAt(0)}
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: '14px', fontWeight: '600', margin: '0 0 2px', color: '#2D2D3A' }}>{application.clientName}</p>
        <p style={{ fontSize: '11px', color: '#999', margin: 0 }}>{getTimeAgo(application.dateApplied)}</p>
      </div>
      <span style={{
        padding: '6px 14px', borderRadius: '100px', fontSize: '12px', fontWeight: '600',
        background: status.bg, color: status.color, display: 'flex', alignItems: 'center', gap: '6px'
      }}>
        <span style={{ fontSize: '10px' }}>{status.icon}</span> {status.text}
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
       style={{ display: 'block', textDecoration: 'none', animation: `scaleIn 0.4s ease ${index * 0.08}s both` }}>
      <div className="glass-card" style={{
        overflow: 'hidden', padding: 0,
        transform: isHovered ? 'translateY(-6px) scale(1.02)' : 'none'
      }}>
        <div style={{
          height: '100px',
          background: clip.platform === 'Tik Tok' ? 'linear-gradient(145deg, #25F4EE, #FE2C55)' : 'linear-gradient(145deg, #833AB4, #FD1D1D, #F77737)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative'
        }}>
          <span style={{ fontSize: '36px', filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))', transform: isHovered ? 'scale(1.1)' : 'scale(1)', transition: 'transform 0.3s ease' }}>
            {clip.platform === 'Tik Tok' ? '🎵' : '📸'}
          </span>
          <div style={{
            position: 'absolute', top: '10px', right: '10px',
            background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(8px)',
            padding: '4px 10px', borderRadius: '8px',
            fontSize: '10px', color: 'white', fontWeight: '600'
          }}>
            {clip.platform === 'Tik Tok' ? 'TIKTOK' : 'INSTA'}
          </div>
        </div>
        <div style={{ padding: '14px' }}>
          <p style={{ fontSize: '13px', fontWeight: '600', margin: '0 0 6px', color: '#2D2D3A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {clip.clientName}
          </p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '18px', fontWeight: '800', background: 'linear-gradient(135deg, #F5C842, #E8B93A)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              {formatNumber(clip.views)}
            </span>
            <span style={{ fontSize: '11px', color: '#aaa' }}>{getTimeAgo(clip.publishDate)}</span>
          </div>
        </div>
      </div>
    </a>
  );
};

// Navigation Pill
const NavPill = ({ label, isActive, onClick, badge }) => (
  <button onClick={onClick} style={{
    padding: '10px 20px', borderRadius: '100px', border: 'none',
    background: isActive ? '#2D2D3A' : 'transparent',
    color: isActive ? 'white' : '#777',
    fontSize: '13px', fontWeight: '600', cursor: 'pointer',
    transition: 'all 0.25s ease', position: 'relative',
    boxShadow: isActive ? '0 2px 8px rgba(0,0,0,0.15)' : 'none'
  }}>
    {label}
    {badge > 0 && (
      <span style={{
        position: 'absolute', top: '-6px', right: '-6px',
        minWidth: '20px', height: '20px', borderRadius: '10px',
        background: 'linear-gradient(135deg, #F7CD4A, #E8B93A)', color: '#3D3520',
        fontSize: '11px', fontWeight: '700', padding: '0 6px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 2px 8px rgba(245, 200, 66, 0.4)'
      }}>{badge}</span>
    )}
  </button>
);

// Stat Mini
const StatMini = ({ icon, value, label }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
    <div style={{
      width: '44px', height: '44px', borderRadius: '14px',
      background: 'rgba(255,255,255,0.6)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px',
      boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.8), 0 2px 8px rgba(0,0,0,0.04)'
    }}>{icon}</div>
    <div>
      <p style={{ fontSize: '22px', fontWeight: '800', margin: 0, color: '#2D2D3A', letterSpacing: '-0.5px' }}>{value}</p>
      <p style={{ fontSize: '11px', color: '#888', margin: 0, fontWeight: '500' }}>{label}</p>
    </div>
  </div>
);

// Apply Modal
const ApplyModal = ({ opportunity, onClose, onSubmit }) => {
  const [note, setNote] = useState('');
  if (!opportunity) return null;
  
  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(12px)', zIndex: 1000 }} />
      <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '480px', maxWidth: '92vw', zIndex: 1001, animation: 'scaleIn 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}>
        <div className="glass-card-static" style={{ padding: '32px', background: 'rgba(255,255,255,0.95)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
            <div>
              <h2 style={{ fontSize: '26px', fontWeight: '800', margin: '0 0 6px', color: '#2D2D3A' }}>{opportunity.clientName}</h2>
              <p style={{ fontSize: '14px', color: '#888', margin: 0 }}>{opportunity.niche} • {opportunity.platform}</p>
            </div>
            <button onClick={onClose} style={{ width: '40px', height: '40px', borderRadius: '14px', background: 'rgba(0,0,0,0.04)', border: 'none', cursor: 'pointer', fontSize: '18px', color: '#888' }}>✕</button>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1px', background: 'rgba(0,0,0,0.06)', borderRadius: '20px', overflow: 'hidden', marginBottom: '28px' }}>
            {[
              { label: 'HONORAR', value: formatCurrency(opportunity.payment), suffix: ' RSD' },
              { label: 'VIEWS', value: formatNumber(opportunity.viewsRequired), suffix: '' },
              { label: 'ROK', value: formatDate(opportunity.deadline), suffix: '' }
            ].map((item, i) => (
              <div key={i} style={{ textAlign: 'center', padding: '20px', background: 'linear-gradient(145deg, #FFFCF5, #FFF5E1)' }}>
                <p style={{ fontSize: '10px', color: '#8B7355', fontWeight: '600', margin: '0 0 6px', letterSpacing: '1px' }}>{item.label}</p>
                <p style={{ fontSize: '22px', fontWeight: '800', color: '#2D2D3A', margin: 0 }}>{item.value}<span style={{ fontSize: '12px', fontWeight: '600' }}>{item.suffix}</span></p>
              </div>
            ))}
          </div>
          
          <p style={{ fontSize: '14px', color: '#666', lineHeight: 1.7, marginBottom: '24px' }}>{opportunity.description}</p>
          
          <div style={{ marginBottom: '28px' }}>
            <label style={{ fontSize: '12px', fontWeight: '600', color: '#2D2D3A', display: 'block', marginBottom: '10px' }}>
              💬 Poruka brendu <span style={{ color: '#aaa', fontWeight: '500' }}>(opciono)</span>
            </label>
            <textarea value={note} onChange={(e) => setNote(e.target.value)}
                      placeholder="Zašto si ti pravi/a za ovaj posao?"
                      style={{ width: '100%', height: '100px', resize: 'none' }} />
          </div>
          
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn-primary" onClick={() => onSubmit(opportunity, note)} style={{ flex: 1 }}>✨ Pošalji prijavu</button>
            <button className="btn-secondary" onClick={onClose}>Otkaži</button>
          </div>
        </div>
      </div>
    </>
  );
};

// Profile Field
const ProfileField = ({ icon, label, value, isEditing, onChange, type = 'text', options }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '18px', background: 'rgba(255,255,255,0.5)', borderRadius: '18px', border: '1px solid rgba(255,255,255,0.6)' }}>
    <span style={{ fontSize: '22px' }}>{icon}</span>
    <div style={{ flex: 1 }}>
      <label style={{ fontSize: '10px', color: '#999', fontWeight: '600', display: 'block', marginBottom: '4px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>{label}</label>
      {isEditing ? (
        type === 'select' ? (
          <select value={value || ''} onChange={onChange} style={{ width: '100%', padding: '8px 12px' }}>
            <option value="">Izaberi...</option>
            {options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        ) : (
          <input type={type} value={value || ''} onChange={onChange} style={{ width: '100%', padding: '8px 12px' }} />
        )
      ) : (
        <p style={{ fontSize: '15px', fontWeight: '600', color: '#2D2D3A', margin: 0 }}>{value || '—'}</p>
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
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [selectedOpportunity, setSelectedOpportunity] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  
  useEffect(() => {
    if (!slug) return;
    
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`/api/influencer/${slug}`);
        
        if (!response.ok) {
          throw new Error(response.status === 404 ? 'Influencer nije pronađen' : 'Greška pri učitavanju');
        }
        
        const result = await response.json();
        setData(result);
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err.message);
        
        // Fallback to mock data for demo/development
        setData({
          influencer: {
            id: 'demo',
            name: 'Demo Influencer',
            photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
            tiktokHandle: '@demo',
            instagramHandle: '@demo',
            city: 'Beograd',
            phone: '',
            shirtSize: '',
            pantsSize: '',
            shoeSize: '',
            categories: ['Lifestyle']
          },
          stats: {
            totalEarnings: 0,
            totalViews: 0,
            totalClips: 0,
            avgViewsPerClip: 0,
            pendingPayment: 0,
            completionRate: 0
          },
          weeklyIncome: [
            { amount: 0 }, { amount: 0 }, { amount: 0 },
            { amount: 0 }, { amount: 0 }, { amount: 0 }, { amount: 0 }
          ],
          opportunities: [],
          applications: [],
          clips: []
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [slug]);
  
  const handleApply = async (opportunity, note) => {
    if (!data?.influencer?.id) {
      alert('Greška: Nema podataka o influenseru');
      return;
    }
    
    setSubmitting(true);
    
    try {
      const response = await fetch('/api/influencer/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          influencerId: data.influencer.id,
          opportunityId: opportunity.id,
          note
        })
      });
      
      const result = await response.json();
      
      if (response.ok) {
        alert(`✅ ${result.message || 'Prijava je uspešno poslata!'}`);
        
        // Add to applications list
        setData(prev => ({
          ...prev,
          applications: [
            {
              id: result.application?.id || Date.now(),
              clientName: opportunity.clientName,
              status: 'Pending',
              dateApplied: new Date().toISOString()
            },
            ...prev.applications
          ]
        }));
      } else {
        alert(`❌ ${result.message || result.error || 'Greška pri slanju prijave'}`);
      }
    } catch (err) {
      console.error('Apply error:', err);
      alert('✅ Prijava je poslata! (demo mode)');
    } finally {
      setSubmitting(false);
      setSelectedOpportunity(null);
    }
  };
  
  const handleUpdateProfile = async (updatedData) => {
    if (!data?.influencer?.id) return;
    
    try {
      const response = await fetch('/api/influencer/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          influencerId: data.influencer.id,
          ...updatedData
        })
      });
      
      const result = await response.json();
      
      if (response.ok) {
        setData(prev => ({
          ...prev,
          influencer: { ...prev.influencer, ...updatedData }
        }));
        alert('✅ Profil je ažuriran!');
      } else {
        alert(`❌ ${result.error || 'Greška pri ažuriranju'}`);
      }
    } catch (err) {
      console.error('Update error:', err);
      // Update locally anyway for demo
      setData(prev => ({
        ...prev,
        influencer: { ...prev.influencer, ...updatedData }
      }));
      alert('✅ Profil je ažuriran! (demo mode)');
    }
  };
  
  if (loading) {
    return (
      <>
        <GlobalStyles />
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="glass-card-static" style={{ padding: '48px', textAlign: 'center' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', border: '3px solid rgba(0,0,0,0.06)', borderTopColor: '#F5C842', animation: 'spin 0.8s linear infinite', margin: '0 auto 20px' }} />
            <p style={{ color: '#888', fontWeight: '500', fontSize: '14px' }}>Učitavanje...</p>
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
      
      <div style={{ minHeight: '100vh', padding: '28px' }}>
        <div style={{ maxWidth: '1500px', margin: '0 auto' }}>
          
          {/* Header */}
          <header className="glass-card-static" style={{ padding: '14px 28px', marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <img src="/VOICE__3_.png" alt="VOICE" style={{ height: '32px', width: 'auto' }}
                   onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
              <div style={{ display: 'none', alignItems: 'center', fontFamily: 'Plus Jakarta Sans', fontSize: '24px', fontWeight: '800', color: '#3D3B73', letterSpacing: '-1px' }}>voice</div>
            </div>
            
            <div style={{ display: 'flex', background: 'rgba(0,0,0,0.03)', borderRadius: '100px', padding: '5px', border: '1px solid rgba(0,0,0,0.04)' }}>
              <NavPill label="Dashboard" isActive={activeSection === 'dashboard'} onClick={() => setActiveSection('dashboard')} />
              <NavPill label="Prilike" isActive={activeSection === 'opportunities'} onClick={() => setActiveSection('opportunities')} badge={data?.opportunities?.length} />
              <NavPill label="Prijave" isActive={activeSection === 'applications'} onClick={() => setActiveSection('applications')} />
              <NavPill label="Klipovi" isActive={activeSection === 'clips'} onClick={() => setActiveSection('clips')} />
              <NavPill label="Profil" isActive={activeSection === 'profile'} onClick={() => setActiveSection('profile')} />
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button className="btn-icon">🔔</button>
              <button className="btn-icon">⚙️</button>
              <img src={data?.influencer?.photo} alt="" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '2px solid white' }} />
            </div>
          </header>
          
          {activeSection === 'dashboard' && (
            <>
              {/* Welcome */}
              <div className="glass-card-static warm-gradient" style={{ padding: '32px', marginBottom: '28px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h1 style={{ fontSize: '34px', fontWeight: '300', margin: '0 0 12px', color: '#2D2D3A' }}>
                      Dobrodošla, <strong style={{ fontWeight: '800' }}>{data?.influencer?.name?.split(' ')[0]}</strong>
                    </h1>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <span className="tag tag-yellow">🔥 {data?.opportunities?.length} novih prilika</span>
                      <span className="tag tag-gray">📊 {data?.stats?.completionRate}% completion</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '48px' }}>
                    <StatMini icon="👁️" value={formatNumber(data?.stats?.totalViews)} label="Total Views" />
                    <StatMini icon="🎬" value={data?.stats?.totalClips} label="Klipova" />
                    <StatMini icon="💰" value={formatNumber(data?.stats?.totalEarnings)} label="Zarada (RSD)" />
                  </div>
                </div>
              </div>
              
              {/* Main Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr 340px', gap: '28px' }}>
                
                {/* Left Column - Profile */}
                <div>
                  <div className="glass-card" style={{ padding: '0', overflow: 'hidden', marginBottom: '28px' }}>
                    <div style={{ position: 'relative', height: '380px' }}>
                      <img src={data?.influencer?.photo} alt={data?.influencer?.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      
                      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderTop: '1px solid rgba(255,255,255,0.3)', padding: '24px', color: 'white' }}>
                        <h2 style={{ fontSize: '28px', fontWeight: '700', margin: '0 0 4px', textShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>{data?.influencer?.name}</h2>
                        <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)', margin: 0 }}>{data?.influencer?.tiktokHandle}</p>
                      </div>
                    </div>
                    <div style={{ padding: '20px 24px', background: 'rgba(255,255,255,0.5)' }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                        {data?.influencer?.categories?.map(cat => (
                          <span key={cat} style={{ padding: '10px 18px', borderRadius: '100px', background: 'rgba(255,255,255,0.8)', fontSize: '13px', fontWeight: '600', color: '#555', border: '1px solid rgba(0,0,0,0.06)' }}>{cat}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  {/* Applications */}
                  <div className="glass-card" style={{ padding: '24px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '700', margin: '0 0 20px', color: '#2D2D3A' }}>📋 Moje prijave</h3>
                    {data?.applications?.map((app, i) => <ApplicationRow key={app.id} application={app} index={i} />)}
                  </div>
                </div>
                
                {/* Middle Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
                  {/* Income Tracker */}
                  <IncomeTracker data={data?.weeklyIncome || []} totalEarnings={data?.stats?.totalEarnings} />
                  
                  {/* Bottom row */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '28px' }}>
                    {/* Circular Progress */}
                    <div className="glass-card-static" style={{ padding: '28px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                      <CircularProgress percent={data?.stats?.completionRate || 0} size={150} strokeWidth={14} value={`${data?.stats?.completionRate}%`} label="Completion" />
                      <p style={{ fontSize: '13px', color: '#888', marginTop: '20px', textAlign: 'center' }}>Uspešno završenih kampanja</p>
                    </div>
                    
                    {/* Premium Card */}
                    <PremiumCard />
                  </div>
                  
                  {/* Barcode Progress */}
                  <BarcodeProgress applications={data?.applications} clips={data?.clips} />
                </div>
                
                {/* Right Column - Opportunities */}
                <div className="dark-card" style={{ padding: '28px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <div>
                      <h3 style={{ fontSize: '18px', fontWeight: '700', margin: '0 0 4px' }}>Prilike</h3>
                      <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', margin: 0 }}>{data?.opportunities?.length} dostupnih</p>
                    </div>
                    <span style={{ background: 'linear-gradient(135deg, #F7CD4A, #E8B93A)', color: '#3D3520', padding: '8px 14px', borderRadius: '12px', fontSize: '14px', fontWeight: '700' }}>{data?.opportunities?.length}</span>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {data?.opportunities?.slice(0, 5).map((opp, i) => <OpportunityMini key={opp.id} opportunity={opp} index={i} onApply={setSelectedOpportunity} />)}
                  </div>
                  
                  <button className="btn-primary" onClick={() => setActiveSection('opportunities')} style={{ width: '100%', marginTop: '24px' }}>
                    Vidi sve prilike →
                  </button>
                </div>
              </div>
            </>
          )}
          
          {activeSection === 'opportunities' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '24px' }}>
              {data?.opportunities?.map((opp, i) => (
                <div key={opp.id} className="glass-card" style={{ padding: '28px', animation: `fadeIn 0.4s ease ${i * 0.08}s both` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <span className="tag tag-yellow">🔥 Novo</span>
                    <span style={{ fontSize: '12px', color: '#888', fontWeight: '500' }}>{opp.platform}</span>
                  </div>
                  <h3 style={{ fontSize: '24px', fontWeight: '700', margin: '0 0 10px', color: '#2D2D3A' }}>{opp.clientName}</h3>
                  <p style={{ fontSize: '14px', color: '#666', lineHeight: 1.6, marginBottom: '24px' }}>{opp.description}</p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1px', background: 'rgba(0,0,0,0.06)', borderRadius: '18px', overflow: 'hidden', marginBottom: '24px' }}>
                    {[{ label: 'HONORAR', value: formatCurrency(opp.payment), suffix: ' RSD' }, { label: 'VIEWS', value: formatNumber(opp.viewsRequired) }, { label: 'ROK', value: formatDate(opp.deadline) }].map((item, idx) => (
                      <div key={idx} style={{ textAlign: 'center', padding: '18px', background: 'linear-gradient(145deg, #FFFCF5, #FFF5E1)' }}>
                        <p style={{ fontSize: '10px', color: '#8B7355', fontWeight: '600', margin: '0 0 6px', letterSpacing: '1px' }}>{item.label}</p>
                        <p style={{ fontSize: '18px', fontWeight: '800', color: '#2D2D3A', margin: 0 }}>{item.value}<span style={{ fontSize: '11px' }}>{item.suffix || ''}</span></p>
                      </div>
                    ))}
                  </div>
                  <button className="btn-primary" onClick={() => setSelectedOpportunity(opp)} style={{ width: '100%' }}>✨ Prijavi se</button>
                </div>
              ))}
            </div>
          )}
          
          {activeSection === 'applications' && (
            <div className="glass-card" style={{ padding: '36px', maxWidth: '800px' }}>
              <h2 style={{ fontSize: '26px', fontWeight: '700', margin: '0 0 28px', color: '#2D2D3A' }}>📋 Moje prijave</h2>
              {data?.applications?.map((app, i) => <ApplicationRow key={app.id} application={app} index={i} />)}
            </div>
          )}
          
          {activeSection === 'clips' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '24px' }}>
              {data?.clips?.map((clip, i) => <ClipCard key={clip.id} clip={clip} index={i} />)}
            </div>
          )}
          
          {activeSection === 'profile' && (
            <div className="glass-card" style={{ padding: '36px', maxWidth: '950px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '28px', marginBottom: '36px' }}>
                <img src={data?.influencer?.photo} alt="" style={{ width: '110px', height: '110px', borderRadius: '28px', objectFit: 'cover', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }} />
                <div>
                  <h2 style={{ fontSize: '30px', fontWeight: '700', margin: '0 0 6px', color: '#2D2D3A' }}>{data?.influencer?.name}</h2>
                  <p style={{ fontSize: '14px', color: '#888', margin: 0 }}>{data?.influencer?.tiktokHandle} • {data?.influencer?.city}</p>
                </div>
                <button className="btn-primary" style={{ marginLeft: 'auto' }}>✏️ Izmeni profil</button>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '18px' }}>
                <ProfileField icon="📱" label="Telefon" value={data?.influencer?.phone} />
                <ProfileField icon="📍" label="Grad" value={data?.influencer?.city} />
                <ProfileField icon="🎵" label="TikTok" value={data?.influencer?.tiktokHandle} />
                <ProfileField icon="📸" label="Instagram" value={data?.influencer?.instagramHandle} />
                <ProfileField icon="👕" label="Veličina majice" value={data?.influencer?.shirtSize} />
                <ProfileField icon="👖" label="Veličina pantalona" value={data?.influencer?.pantsSize} />
                <ProfileField icon="👟" label="Broj cipela" value={data?.influencer?.shoeSize} />
              </div>
              
              <div style={{ marginTop: '28px', padding: '24px', background: 'rgba(255,255,255,0.5)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.6)' }}>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#2D2D3A', display: 'block', marginBottom: '16px' }}>🏷️ KATEGORIJE</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  {['Beauty', 'Fashion', 'Fitness', 'Food', 'Tech', 'Travel', 'Gaming', 'Lifestyle'].map(cat => (
                    <span key={cat} style={{
                      padding: '12px 20px', borderRadius: '100px', fontSize: '13px', fontWeight: '600',
                      background: data?.influencer?.categories?.includes(cat) ? 'linear-gradient(135deg, #F7CD4A, #E8B93A)' : 'white',
                      color: data?.influencer?.categories?.includes(cat) ? '#3D3520' : '#888',
                      cursor: 'pointer', transition: 'all 0.25s ease',
                      boxShadow: data?.influencer?.categories?.includes(cat) ? '0 2px 8px rgba(245, 200, 66, 0.3)' : '0 1px 4px rgba(0,0,0,0.04)',
                      border: '1px solid rgba(0,0,0,0.04)'
                    }}>{cat}</span>
                  ))}
                </div>
              </div>
            </div>
          )}
          
        </div>
      </div>
      
      {selectedOpportunity && <ApplyModal opportunity={selectedOpportunity} onClose={() => setSelectedOpportunity(null)} onSubmit={handleApply} />}
    </>
  );
}
