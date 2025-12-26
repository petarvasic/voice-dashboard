// pages/influencer/[slug].js - Influencer Dashboard v4
// PREMIUM WARM GLASSMORPHISM - Pixel-perfect Crextio-inspired design
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
      background: linear-gradient(160deg, #B8B5C9 0%, #C9C6D6 25%, #DCD9E4 50%, #E8E4D9 75%, #F0EBE0 100%);
      min-height: 100vh;
    }
    
    @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
    @keyframes pulse { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.02); opacity: 0.95; } }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes slideIn { from { opacity: 0; transform: translateX(-16px); } to { opacity: 1; transform: translateX(0); } }
    @keyframes scaleIn { from { opacity: 0; transform: scale(0.96); } to { opacity: 1; transform: scale(1); } }
    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes progressFill { from { stroke-dashoffset: 283; } }
    @keyframes barGrow { from { transform: scaleY(0); } to { transform: scaleY(1); } }
    
    ::-webkit-scrollbar { width: 6px; height: 6px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.12); border-radius: 10px; }
    ::-webkit-scrollbar-thumb:hover { background: rgba(0,0,0,0.2); }
    
    .glass-card {
      background: rgba(255, 255, 255, 0.55);
      backdrop-filter: blur(40px);
      -webkit-backdrop-filter: blur(40px);
      border-radius: 28px;
      border: 1px solid rgba(255, 255, 255, 0.6);
      box-shadow: 
        0 2px 8px rgba(0, 0, 0, 0.04),
        0 8px 24px rgba(0, 0, 0, 0.04),
        inset 0 1px 1px rgba(255, 255, 255, 0.8);
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .glass-card:hover {
      background: rgba(255, 255, 255, 0.65);
      box-shadow: 
        0 4px 12px rgba(0, 0, 0, 0.05),
        0 16px 40px rgba(0, 0, 0, 0.06),
        inset 0 1px 1px rgba(255, 255, 255, 0.9);
      transform: translateY(-2px);
    }
    
    .glass-card-static {
      background: rgba(255, 255, 255, 0.55);
      backdrop-filter: blur(40px);
      -webkit-backdrop-filter: blur(40px);
      border-radius: 28px;
      border: 1px solid rgba(255, 255, 255, 0.6);
      box-shadow: 
        0 2px 8px rgba(0, 0, 0, 0.04),
        0 8px 24px rgba(0, 0, 0, 0.04),
        inset 0 1px 1px rgba(255, 255, 255, 0.8);
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
      box-shadow: 
        0 4px 16px rgba(0, 0, 0, 0.15),
        0 12px 40px rgba(0, 0, 0, 0.12);
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
    .tag-green { background: rgba(125, 216, 125, 0.9); color: #2E5A2E; }
    .tag-gray { background: rgba(0,0,0,0.06); color: #666; }
    .tag-pending { background: rgba(255, 224, 130, 0.9); color: #5D4E37; }
    .tag-accepted { background: rgba(165, 214, 167, 0.9); color: #2E5A2E; }
    .tag-declined { background: rgba(255, 171, 145, 0.9); color: #5D3A3A; }
    
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
      box-shadow: 
        0 2px 8px rgba(245, 200, 66, 0.3),
        0 4px 16px rgba(245, 200, 66, 0.2),
        inset 0 1px 1px rgba(255, 255, 255, 0.4);
    }
    
    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 
        0 4px 12px rgba(245, 200, 66, 0.4),
        0 8px 24px rgba(245, 200, 66, 0.3),
        inset 0 1px 1px rgba(255, 255, 255, 0.5);
    }
    
    .btn-secondary {
      background: rgba(255,255,255,0.9);
      color: #2D2D3A;
      border: 1px solid rgba(0,0,0,0.06);
      padding: 12px 24px;
      border-radius: 14px;
      font-weight: 600;
      font-size: 13px;
      cursor: pointer;
      transition: all 0.25s ease;
      box-shadow: 0 2px 8px rgba(0,0,0,0.04);
    }
    
    .btn-secondary:hover {
      background: white;
      box-shadow: 0 4px 12px rgba(0,0,0,0.08);
    }
    
    input, textarea, select {
      font-family: 'Plus Jakarta Sans', sans-serif;
      background: rgba(255,255,255,0.8);
      border: 1px solid rgba(0,0,0,0.06);
      border-radius: 14px;
      padding: 14px 18px;
      font-size: 14px;
      outline: none;
      transition: all 0.25s ease;
      box-shadow: inset 0 1px 3px rgba(0,0,0,0.02);
    }
    
    input:focus, textarea:focus {
      background: white;
      border-color: rgba(245, 200, 66, 0.5);
      box-shadow: 
        0 0 0 4px rgba(245, 200, 66, 0.12),
        inset 0 1px 3px rgba(0,0,0,0.02);
    }
  `}</style>
);

// ============ COMPONENTS ============

// Blurred Stat Overlay (on image)
const BlurredStatOverlay = ({ icon, value, label, position = 'top-left' }) => {
  const positions = {
    'top-left': { top: '16px', left: '16px' },
    'top-right': { top: '16px', right: '16px' },
    'bottom-left': { bottom: '80px', left: '16px' },
    'bottom-right': { bottom: '80px', right: '16px' }
  };
  
  return (
    <div className="glass-overlay" style={{
      position: 'absolute',
      ...positions[position],
      padding: '12px 18px',
      borderRadius: '16px',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      animation: 'fadeIn 0.6s ease'
    }}>
      <span style={{ fontSize: '18px' }}>{icon}</span>
      <div>
        <p style={{ fontSize: '18px', fontWeight: '800', margin: 0, color: 'white', textShadow: '0 1px 2px rgba(0,0,0,0.2)' }}>
          {value}
        </p>
        <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.8)', margin: 0, fontWeight: '500', letterSpacing: '0.5px' }}>
          {label}
        </p>
      </div>
    </div>
  );
};

// Circular Progress Ring
const CircularProgress = ({ percent, size = 140, strokeWidth = 12, color = '#F5C842', label, value }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percent / 100) * circumference;
  
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        {/* Background track */}
        <circle cx={size/2} cy={size/2} r={radius} fill="none" 
                stroke="rgba(0,0,0,0.04)" strokeWidth={strokeWidth} />
        {/* Progress arc */}
        <circle cx={size/2} cy={size/2} r={radius} fill="none"
                stroke={color} strokeWidth={strokeWidth}
                strokeDasharray={circumference} strokeDashoffset={offset}
                strokeLinecap="round"
                style={{ 
                  transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)', 
                  filter: 'drop-shadow(0 2px 4px rgba(245, 200, 66, 0.3))'
                }} />
      </svg>
      <div style={{
        position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', textAlign: 'center'
      }}>
        <span style={{ fontSize: size * 0.22, fontWeight: '800', color: '#2D2D3A', letterSpacing: '-1px' }}>{value}</span>
        {label && <span style={{ fontSize: size * 0.085, color: '#999', fontWeight: '500', marginTop: '2px' }}>{label}</span>}
      </div>
    </div>
  );
};

// Notched Progress Bar (like original design)
const NotchedProgressBar = ({ data, label, highlightColor = '#F5C842' }) => {
  const maxValue = Math.max(...data.map(d => d.value), 1);
  const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  
  return (
    <div>
      {/* Notch indicators at top */}
      <div style={{ 
        display: 'flex', alignItems: 'center', gap: '6px', 
        marginBottom: '12px', paddingLeft: '2px'
      }}>
        {data.map((item, i) => (
          <div key={`notch-${i}`} style={{
            flex: 1, height: '3px', borderRadius: '2px',
            background: item.highlight ? highlightColor : 'rgba(0,0,0,0.08)',
            transition: 'all 0.3s ease'
          }} />
        ))}
      </div>
      
      {/* Bar chart */}
      <div style={{ 
        display: 'flex', alignItems: 'flex-end', gap: '10px', 
        height: '100px', padding: '0 2px',
        borderBottom: '1px solid rgba(0,0,0,0.06)'
      }}>
        {data.map((item, i) => (
          <div key={i} style={{ 
            flex: 1, display: 'flex', flexDirection: 'column', 
            alignItems: 'center', gap: '0', height: '100%', justifyContent: 'flex-end'
          }}>
            {/* Tooltip on hover */}
            {item.highlight && (
              <div style={{
                background: '#2D2D3A', color: 'white',
                padding: '4px 10px', borderRadius: '8px',
                fontSize: '11px', fontWeight: '600',
                marginBottom: '6px', whiteSpace: 'nowrap'
              }}>
                {item.label || `${item.value}h`}
              </div>
            )}
            {/* Bar */}
            <div style={{
              width: '100%', maxWidth: '8px', borderRadius: '4px',
              background: item.highlight 
                ? `linear-gradient(180deg, ${highlightColor} 0%, #E8B93A 100%)`
                : 'rgba(0,0,0,0.08)',
              height: `${Math.max((item.value / maxValue) * 80, 8)}%`,
              transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
              transformOrigin: 'bottom',
              animation: `barGrow 0.6s ease ${i * 0.05}s both`,
              boxShadow: item.highlight ? '0 2px 8px rgba(245, 200, 66, 0.4)' : 'none'
            }} />
          </div>
        ))}
      </div>
      
      {/* Day labels */}
      <div style={{ display: 'flex', gap: '10px', marginTop: '10px', padding: '0 2px' }}>
        {days.map((day, i) => (
          <div key={i} style={{ 
            flex: 1, textAlign: 'center', 
            fontSize: '11px', color: data[i]?.highlight ? '#2D2D3A' : '#aaa', 
            fontWeight: data[i]?.highlight ? '700' : '500'
          }}>
            {day}
          </div>
        ))}
      </div>
    </div>
  );
};

// Stat Mini Card with better styling
const StatMini = ({ icon, value, label }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
    <div style={{
      width: '44px', height: '44px', borderRadius: '14px',
      background: 'rgba(255,255,255,0.6)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '20px',
      boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.8), 0 2px 8px rgba(0,0,0,0.04)'
    }}>{icon}</div>
    <div>
      <p style={{ fontSize: '22px', fontWeight: '800', margin: 0, color: '#2D2D3A', letterSpacing: '-0.5px' }}>{value}</p>
      <p style={{ fontSize: '11px', color: '#888', margin: 0, fontWeight: '500' }}>{label}</p>
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
        padding: '14px 16px', borderRadius: '16px',
        background: isHovered ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.06)',
        cursor: 'pointer', 
        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: isHovered ? 'translateX(4px)' : 'none',
        animation: `slideIn 0.4s ease ${index * 0.08}s both`,
        border: '1px solid rgba(255,255,255,0.06)'
      }}
    >
      <div style={{
        width: '44px', height: '44px', borderRadius: '14px',
        background: 'linear-gradient(135deg, rgba(245, 200, 66, 0.25), rgba(245, 200, 66, 0.15))',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '20px'
      }}>
        {icons[index % icons.length]}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ 
          fontSize: '14px', fontWeight: '600', margin: '0 0 3px', color: 'white',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
        }}>
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
        transition: 'all 0.25s ease',
        border: isHovered ? 'none' : '1px solid rgba(255,255,255,0.1)'
      }}>
        <span style={{ 
          color: isHovered ? '#2D2D3A' : 'rgba(255,255,255,0.4)', 
          fontSize: '14px',
          transition: 'all 0.25s ease',
          transform: isHovered ? 'translateX(2px)' : 'none'
        }}>→</span>
      </div>
    </div>
  );
};

// Application Row with refined styling
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
      padding: '14px 0', 
      borderBottom: '1px solid rgba(0,0,0,0.04)',
      animation: `fadeIn 0.4s ease ${index * 0.08}s both`
    }}>
      <div style={{
        width: '44px', height: '44px', borderRadius: '14px',
        background: 'linear-gradient(145deg, #FFF5E1, #FFE9C2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '16px', fontWeight: '700', color: '#8B7355',
        boxShadow: 'inset 0 -2px 4px rgba(0,0,0,0.04)'
      }}>
        {application.clientName?.charAt(0)}
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: '14px', fontWeight: '600', margin: '0 0 2px', color: '#2D2D3A' }}>
          {application.clientName}
        </p>
        <p style={{ fontSize: '11px', color: '#999', margin: 0 }}>{getTimeAgo(application.dateApplied)}</p>
      </div>
      <span style={{
        padding: '6px 14px', borderRadius: '100px', fontSize: '12px', fontWeight: '600',
        background: status.bg, color: status.color,
        display: 'flex', alignItems: 'center', gap: '6px'
      }}>
        <span style={{ fontSize: '10px' }}>{status.icon}</span>
        {status.text}
      </span>
    </div>
  );
};

// Clip Card with refined styling
const ClipCard = ({ clip, index }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <a href={clip.link} target="_blank" rel="noopener noreferrer"
       onMouseEnter={() => setIsHovered(true)}
       onMouseLeave={() => setIsHovered(false)}
       style={{
         display: 'block', textDecoration: 'none',
         animation: `scaleIn 0.4s ease ${index * 0.08}s both`
       }}>
      <div className="glass-card" style={{
        overflow: 'hidden', padding: 0,
        transform: isHovered ? 'translateY(-6px) scale(1.02)' : 'none'
      }}>
        <div style={{
          height: '110px',
          background: clip.platform === 'Tik Tok' 
            ? 'linear-gradient(145deg, #25F4EE, #FE2C55)' 
            : 'linear-gradient(145deg, #833AB4, #FD1D1D, #F77737)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative'
        }}>
          <span style={{ 
            fontSize: '40px', 
            filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))',
            transform: isHovered ? 'scale(1.1)' : 'scale(1)',
            transition: 'transform 0.3s ease'
          }}>
            {clip.platform === 'Tik Tok' ? '🎵' : '📸'}
          </span>
          {/* Platform badge */}
          <div style={{
            position: 'absolute', top: '10px', right: '10px',
            background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(8px)',
            padding: '4px 10px', borderRadius: '8px',
            fontSize: '10px', color: 'white', fontWeight: '600', letterSpacing: '0.5px'
          }}>
            {clip.platform === 'Tik Tok' ? 'TIKTOK' : 'INSTA'}
          </div>
        </div>
        <div style={{ padding: '16px' }}>
          <p style={{ 
            fontSize: '13px', fontWeight: '600', margin: '0 0 8px', color: '#2D2D3A', 
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
          }}>
            {clip.clientName}
          </p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ 
              fontSize: '20px', fontWeight: '800', 
              background: 'linear-gradient(135deg, #F5C842, #E8B93A)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
            }}>{formatNumber(clip.views)}</span>
            <span style={{ fontSize: '11px', color: '#aaa', fontWeight: '500' }}>{getTimeAgo(clip.publishDate)}</span>
          </div>
        </div>
      </div>
    </a>
  );
};

// Profile Field with refined styling
const ProfileField = ({ icon, label, value, isEditing, onChange, type = 'text', options }) => (
  <div style={{ 
    display: 'flex', alignItems: 'center', gap: '14px',
    padding: '18px', background: 'rgba(255,255,255,0.5)', borderRadius: '18px',
    border: '1px solid rgba(255,255,255,0.6)'
  }}>
    <span style={{ fontSize: '22px' }}>{icon}</span>
    <div style={{ flex: 1 }}>
      <label style={{ 
        fontSize: '10px', color: '#999', fontWeight: '600', 
        display: 'block', marginBottom: '4px', letterSpacing: '0.5px', textTransform: 'uppercase'
      }}>
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

// Navigation Pill with refined styling
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

// Application Modal with refined styling
const ApplyModal = ({ opportunity, onClose, onSubmit }) => {
  const [note, setNote] = useState('');
  
  if (!opportunity) return null;
  
  return (
    <>
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
        backdropFilter: 'blur(12px)', zIndex: 1000
      }} />
      <div style={{
        position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        width: '480px', maxWidth: '92vw', zIndex: 1001,
        animation: 'scaleIn 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
      }}>
        <div className="glass-card-static" style={{ padding: '32px', background: 'rgba(255,255,255,0.95)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
            <div>
              <h2 style={{ fontSize: '26px', fontWeight: '800', margin: '0 0 6px', color: '#2D2D3A', letterSpacing: '-0.5px' }}>
                {opportunity.clientName}
              </h2>
              <p style={{ fontSize: '14px', color: '#888', margin: 0 }}>{opportunity.niche} • {opportunity.platform}</p>
            </div>
            <button onClick={onClose} style={{
              width: '40px', height: '40px', borderRadius: '14px',
              background: 'rgba(0,0,0,0.04)', border: 'none', cursor: 'pointer',
              fontSize: '18px', color: '#888', transition: 'all 0.2s'
            }}>✕</button>
          </div>
          
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1px',
            background: 'rgba(0,0,0,0.06)',
            borderRadius: '20px', overflow: 'hidden', marginBottom: '28px'
          }}>
            {[
              { label: 'HONORAR', value: formatCurrency(opportunity.payment), suffix: ' RSD' },
              { label: 'VIEWS', value: formatNumber(opportunity.viewsRequired), suffix: '' },
              { label: 'ROK', value: formatDate(opportunity.deadline), suffix: '' }
            ].map((item, i) => (
              <div key={i} style={{ 
                textAlign: 'center', padding: '20px',
                background: 'linear-gradient(145deg, #FFFCF5, #FFF5E1)'
              }}>
                <p style={{ fontSize: '10px', color: '#8B7355', fontWeight: '600', margin: '0 0 6px', letterSpacing: '1px' }}>
                  {item.label}
                </p>
                <p style={{ fontSize: '22px', fontWeight: '800', color: '#2D2D3A', margin: 0, letterSpacing: '-0.5px' }}>
                  {item.value}<span style={{ fontSize: '12px', fontWeight: '600' }}>{item.suffix}</span>
                </p>
              </div>
            ))}
          </div>
          
          <p style={{ fontSize: '14px', color: '#666', lineHeight: 1.7, marginBottom: '24px' }}>
            {opportunity.description}
          </p>
          
          <div style={{ marginBottom: '28px' }}>
            <label style={{ 
              fontSize: '12px', fontWeight: '600', color: '#2D2D3A', 
              display: 'block', marginBottom: '10px'
            }}>
              💬 Poruka brendu <span style={{ color: '#aaa', fontWeight: '500' }}>(opciono)</span>
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
              ✨ Pošalji prijavu
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
          completionRate: 92,
          thisWeekHours: 6.1
        },
        weeklyActivity: [
          { value: 20, highlight: false },
          { value: 65, highlight: false, label: '5h 23m' },
          { value: 40, highlight: false },
          { value: 85, highlight: true, label: '6h 45m' },
          { value: 55, highlight: true },
          { value: 15, highlight: false },
          { value: 8, highlight: false }
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
          <div className="glass-card-static" style={{ padding: '48px', textAlign: 'center' }}>
            <div style={{
              width: '48px', height: '48px', borderRadius: '50%',
              border: '3px solid rgba(0,0,0,0.06)', borderTopColor: '#F5C842',
              animation: 'spin 0.8s linear infinite', margin: '0 auto 20px'
            }} />
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
          <header className="glass-card-static" style={{
            padding: '14px 28px', marginBottom: '28px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
          }}>
            {/* VOICE Logo */}
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <img 
                src="/VOICE__3_.png" 
                alt="VOICE" 
                style={{ height: '32px', width: 'auto' }}
                onError={(e) => {
                  // Fallback to text if image fails
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              {/* Fallback text logo */}
              <div style={{ 
                display: 'none', alignItems: 'center', gap: '0',
                fontFamily: 'Plus Jakarta Sans', fontSize: '24px', 
                fontWeight: '800', color: '#3D3B73', letterSpacing: '-1px'
              }}>
                voice
              </div>
            </div>
            
            <div style={{ 
              display: 'flex', background: 'rgba(0,0,0,0.03)', 
              borderRadius: '100px', padding: '5px',
              border: '1px solid rgba(0,0,0,0.04)'
            }}>
              <NavPill label="Dashboard" isActive={activeSection === 'dashboard'} onClick={() => setActiveSection('dashboard')} />
              <NavPill label="Prilike" isActive={activeSection === 'opportunities'} onClick={() => setActiveSection('opportunities')} badge={data?.opportunities?.length} />
              <NavPill label="Prijave" isActive={activeSection === 'applications'} onClick={() => setActiveSection('applications')} />
              <NavPill label="Klipovi" isActive={activeSection === 'clips'} onClick={() => setActiveSection('clips')} />
              <NavPill label="Profil" isActive={activeSection === 'profile'} onClick={() => setActiveSection('profile')} />
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button style={{ 
                width: '42px', height: '42px', borderRadius: '14px', border: 'none',
                background: 'rgba(0,0,0,0.03)', cursor: 'pointer', fontSize: '18px',
                transition: 'all 0.2s'
              }}>🔔</button>
              <button style={{ 
                width: '42px', height: '42px', borderRadius: '14px', border: 'none',
                background: 'rgba(0,0,0,0.03)', cursor: 'pointer', fontSize: '18px',
                transition: 'all 0.2s'
              }}>⚙️</button>
            </div>
          </header>
          
          {activeSection === 'dashboard' && (
            <>
              {/* Welcome + Quick Stats */}
              <div className="glass-card-static warm-gradient" style={{ padding: '32px', marginBottom: '28px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h1 style={{ fontSize: '34px', fontWeight: '300', margin: '0 0 12px', color: '#2D2D3A', letterSpacing: '-0.5px' }}>
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
                    <StatMini icon="💰" value={`${formatNumber(data?.stats?.totalEarnings)}`} label="Zarada (RSD)" />
                  </div>
                </div>
              </div>
              
              {/* Main Grid - Bento Layout */}
              <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr 340px', gap: '28px' }}>
                
                {/* Left Column - Profile Card */}
                <div>
                  <div className="glass-card" style={{ padding: '0', overflow: 'hidden', marginBottom: '28px' }}>
                    {/* Profile Image with blur overlays */}
                    <div style={{ position: 'relative', height: '380px' }}>
                      <img 
                        src={data?.influencer?.photo}
                        alt={data?.influencer?.name}
                        style={{
                          width: '100%', height: '100%', objectFit: 'cover'
                        }}
                      />
                      
                      {/* Blurred stat overlays on image - top corners */}
                      <BlurredStatOverlay icon="🎬" value={data?.stats?.totalClips} label="klipova" position="top-left" />
                      <BlurredStatOverlay icon="👁️" value={formatNumber(data?.stats?.totalViews)} label="views" position="top-right" />
                      
                      {/* Glass bottom panel - like original */}
                      <div style={{
                        position: 'absolute', bottom: 0, left: 0, right: 0,
                        background: 'rgba(255, 255, 255, 0.2)',
                        backdropFilter: 'blur(20px)',
                        WebkitBackdropFilter: 'blur(20px)',
                        borderTop: '1px solid rgba(255, 255, 255, 0.3)',
                        padding: '24px', color: 'white'
                      }}>
                        <h2 style={{ 
                          fontSize: '28px', fontWeight: '700', margin: '0 0 4px', 
                          color: 'white',
                          textShadow: '0 2px 8px rgba(0,0,0,0.3)'
                        }}>
                          {data?.influencer?.name}
                        </h2>
                        <p style={{ 
                          fontSize: '14px', 
                          color: 'rgba(255,255,255,0.8)', 
                          margin: 0 
                        }}>
                          {data?.influencer?.tiktokHandle}
                        </p>
                      </div>
                    </div>
                    
                    {/* Categories - clean bottom section */}
                    <div style={{ padding: '20px 24px', background: 'rgba(255,255,255,0.5)' }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                        {data?.influencer?.categories?.map(cat => (
                          <span key={cat} style={{
                            padding: '10px 18px', borderRadius: '100px',
                            background: 'rgba(255,255,255,0.8)', 
                            fontSize: '13px',
                            fontWeight: '600', color: '#555',
                            border: '1px solid rgba(0,0,0,0.06)'
                          }}>{cat}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  {/* Moje prijave */}
                  <div className="glass-card" style={{ padding: '24px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '700', margin: '0 0 20px', color: '#2D2D3A' }}>
                      📋 Moje prijave
                    </h3>
                    {data?.applications?.map((app, i) => (
                      <ApplicationRow key={app.id} application={app} index={i} />
                    ))}
                  </div>
                </div>
                
                {/* Middle Column - Stats & Activity */}
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '28px', marginBottom: '28px' }}>
                    {/* Progress Card */}
                    <div className="glass-card" style={{ padding: '28px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                        <div>
                          <h3 style={{ fontSize: '16px', fontWeight: '700', margin: '0 0 6px', color: '#2D2D3A' }}>Aktivnost</h3>
                          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                            <span style={{ fontSize: '38px', fontWeight: '800', color: '#2D2D3A', letterSpacing: '-1px' }}>
                              {data?.stats?.thisWeekHours}
                            </span>
                            <div>
                              <span style={{ fontSize: '15px', color: '#888', fontWeight: '500' }}>h</span>
                              <p style={{ fontSize: '11px', color: '#aaa', margin: '2px 0 0' }}>ove nedelje</p>
                            </div>
                          </div>
                        </div>
                        <button style={{
                          width: '36px', height: '36px', borderRadius: '12px',
                          background: 'rgba(0,0,0,0.04)', border: 'none', cursor: 'pointer',
                          fontSize: '14px', color: '#888'
                        }}>↗</button>
                      </div>
                      <NotchedProgressBar data={data?.weeklyActivity || []} />
                    </div>
                    
                    {/* Circular Progress */}
                    <div className="glass-card" style={{ 
                      padding: '28px', display: 'flex', flexDirection: 'column', 
                      alignItems: 'center', justifyContent: 'center' 
                    }}>
                      <CircularProgress 
                        percent={data?.stats?.completionRate || 0} 
                        size={150} 
                        strokeWidth={14}
                        value={`${data?.stats?.completionRate}%`}
                        label="Completion"
                      />
                      <p style={{ fontSize: '13px', color: '#888', marginTop: '20px', textAlign: 'center' }}>
                        Uspešno završenih kampanja
                      </p>
                    </div>
                  </div>
                  
                  {/* Recent Clips */}
                  <div className="glass-card" style={{ padding: '28px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                      <h3 style={{ fontSize: '16px', fontWeight: '700', margin: 0, color: '#2D2D3A' }}>🎬 Poslednji klipovi</h3>
                      <button className="btn-secondary" onClick={() => setActiveSection('clips')} style={{ padding: '10px 20px' }}>
                        Vidi sve →
                      </button>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '18px' }}>
                      {data?.clips?.slice(0, 4).map((clip, i) => (
                        <ClipCard key={clip.id} clip={clip} index={i} />
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Right Column - Opportunities (Dark) */}
                <div className="dark-card" style={{ padding: '28px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <div>
                      <h3 style={{ fontSize: '18px', fontWeight: '700', margin: '0 0 4px' }}>Prilike</h3>
                      <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', margin: 0 }}>
                        {data?.opportunities?.length} dostupnih
                      </p>
                    </div>
                    <span style={{
                      background: 'linear-gradient(135deg, #F7CD4A, #E8B93A)', color: '#3D3520',
                      padding: '8px 14px', borderRadius: '12px',
                      fontSize: '14px', fontWeight: '700',
                      boxShadow: '0 2px 8px rgba(245, 200, 66, 0.3)'
                    }}>{data?.opportunities?.length}</span>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {data?.opportunities?.slice(0, 5).map((opp, i) => (
                      <OpportunityMini key={opp.id} opportunity={opp} index={i} onApply={setSelectedOpportunity} />
                    ))}
                  </div>
                  
                  <button className="btn-primary" onClick={() => setActiveSection('opportunities')} 
                          style={{ width: '100%', marginTop: '24px' }}>
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
                  <h3 style={{ fontSize: '24px', fontWeight: '700', margin: '0 0 10px', color: '#2D2D3A', letterSpacing: '-0.5px' }}>{opp.clientName}</h3>
                  <p style={{ fontSize: '14px', color: '#666', lineHeight: 1.6, marginBottom: '24px' }}>{opp.description}</p>
                  <div style={{
                    display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1px',
                    background: 'rgba(0,0,0,0.06)', borderRadius: '18px', overflow: 'hidden', marginBottom: '24px'
                  }}>
                    {[
                      { label: 'HONORAR', value: formatCurrency(opp.payment), suffix: ' RSD' },
                      { label: 'VIEWS', value: formatNumber(opp.viewsRequired), suffix: '' },
                      { label: 'ROK', value: formatDate(opp.deadline), suffix: '' }
                    ].map((item, idx) => (
                      <div key={idx} style={{ textAlign: 'center', padding: '18px', background: 'linear-gradient(145deg, #FFFCF5, #FFF5E1)' }}>
                        <p style={{ fontSize: '10px', color: '#8B7355', fontWeight: '600', margin: '0 0 6px', letterSpacing: '1px' }}>{item.label}</p>
                        <p style={{ fontSize: '18px', fontWeight: '800', color: '#2D2D3A', margin: 0 }}>{item.value}<span style={{ fontSize: '11px', fontWeight: '600' }}>{item.suffix}</span></p>
                      </div>
                    ))}
                  </div>
                  <button className="btn-primary" onClick={() => setSelectedOpportunity(opp)} style={{ width: '100%' }}>
                    ✨ Prijavi se
                  </button>
                </div>
              ))}
            </div>
          )}
          
          {activeSection === 'applications' && (
            <div className="glass-card" style={{ padding: '36px', maxWidth: '800px' }}>
              <h2 style={{ fontSize: '26px', fontWeight: '700', margin: '0 0 28px', color: '#2D2D3A', letterSpacing: '-0.5px' }}>📋 Moje prijave</h2>
              {data?.applications?.map((app, i) => (
                <ApplicationRow key={app.id} application={app} index={i} />
              ))}
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
                <img src={data?.influencer?.photo} alt="" style={{
                  width: '110px', height: '110px', borderRadius: '28px', objectFit: 'cover',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.1)'
                }} />
                <div>
                  <h2 style={{ fontSize: '30px', fontWeight: '700', margin: '0 0 6px', color: '#2D2D3A', letterSpacing: '-0.5px' }}>
                    {data?.influencer?.name}
                  </h2>
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
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#2D2D3A', display: 'block', marginBottom: '16px', letterSpacing: '0.5px' }}>
                  🏷️ KATEGORIJE
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  {['Beauty', 'Fashion', 'Fitness', 'Food', 'Tech', 'Travel', 'Gaming', 'Lifestyle'].map(cat => (
                    <span key={cat} style={{
                      padding: '12px 20px', borderRadius: '100px', fontSize: '13px', fontWeight: '600',
                      background: data?.influencer?.categories?.includes(cat) 
                        ? 'linear-gradient(135deg, #F7CD4A, #E8B93A)' 
                        : 'white',
                      color: data?.influencer?.categories?.includes(cat) ? '#3D3520' : '#888',
                      cursor: 'pointer', transition: 'all 0.25s ease',
                      boxShadow: data?.influencer?.categories?.includes(cat) 
                        ? '0 2px 8px rgba(245, 200, 66, 0.3)' 
                        : '0 1px 4px rgba(0,0,0,0.04)',
                      border: '1px solid rgba(0,0,0,0.04)'
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
