// pages/influencer/[slug].js - Influencer Dashboard v2
// POP ART / NEO-BRUTALIST Design with VOICE Logo
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
  if (!num || isNaN(num)) return '0 RSD';
  return parseInt(num).toLocaleString('sr-RS') + ' RSD';
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
  if (days === 0) return 'DANAS';
  if (days === 1) return 'JUČE';
  if (days < 7) return `PRE ${days} DANA`;
  return formatDate(dateStr);
};

// ============ GLOBAL STYLES - POP ART ============
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Bebas+Neue&display=swap');
    
    * { box-sizing: border-box; margin: 0; padding: 0; }
    
    body {
      font-family: 'Space Grotesk', sans-serif;
      background: #FFFBF5;
      min-height: 100vh;
      overflow-x: hidden;
    }
    
    @keyframes float { 0%, 100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-15px) rotate(2deg); } }
    @keyframes bounce { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
    @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } }
    @keyframes rainbow { 0% { filter: hue-rotate(0deg); } 100% { filter: hue-rotate(360deg); } }
    @keyframes popIn { 0% { transform: scale(0) rotate(-10deg); opacity: 0; } 50% { transform: scale(1.1) rotate(2deg); } 100% { transform: scale(1) rotate(0deg); opacity: 1; } }
    @keyframes slideUp { from { transform: translateY(50px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
    @keyframes pulse { 0%, 100% { box-shadow: 0 0 0 0 rgba(255, 107, 107, 0.7); } 50% { box-shadow: 0 0 0 15px rgba(255, 107, 107, 0); } }
    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
    @keyframes blink { 0%, 50%, 100% { opacity: 1; } 25%, 75% { opacity: 0.5; } }
    
    ::-webkit-scrollbar { width: 12px; }
    ::-webkit-scrollbar-track { background: #FFE66D; }
    ::-webkit-scrollbar-thumb { background: #FF6B6B; border: 3px solid #FFE66D; border-radius: 0; }
    
    .brutalist-card {
      background: white;
      border: 4px solid #2D3142;
      box-shadow: 8px 8px 0 #2D3142;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .brutalist-card:hover {
      transform: translate(-4px, -4px);
      box-shadow: 12px 12px 0 #2D3142;
    }
    
    .pop-button {
      background: #FF6B6B;
      color: white;
      border: 4px solid #2D3142;
      padding: 14px 28px;
      font-family: 'Bebas Neue', sans-serif;
      font-size: 18px;
      letter-spacing: 2px;
      cursor: pointer;
      box-shadow: 4px 4px 0 #2D3142;
      transition: all 0.15s ease;
    }
    
    .pop-button:hover {
      transform: translate(-2px, -2px);
      box-shadow: 6px 6px 0 #2D3142;
    }
    
    .pop-button:active {
      transform: translate(2px, 2px);
      box-shadow: 2px 2px 0 #2D3142;
    }
    
    .yellow-button {
      background: #FFE66D;
      color: #2D3142;
    }
    
    .green-button {
      background: #4ECDC4;
    }
    
    .tag {
      display: inline-block;
      padding: 6px 14px;
      font-family: 'Bebas Neue', sans-serif;
      font-size: 14px;
      letter-spacing: 1px;
      border: 3px solid #2D3142;
    }
    
    .tag-hot { background: #FF6B6B; color: white; }
    .tag-new { background: #4ECDC4; color: white; }
    .tag-pending { background: #FFE66D; color: #2D3142; }
    .tag-accepted { background: #95E881; color: #2D3142; }
    .tag-declined { background: #2D3142; color: white; }
    
    input, textarea, select {
      font-family: 'Space Grotesk', sans-serif;
      border: 3px solid #2D3142;
      padding: 12px 16px;
      font-size: 14px;
      background: white;
      outline: none;
      transition: all 0.2s;
    }
    
    input:focus, textarea:focus, select:focus {
      box-shadow: 4px 4px 0 #FFE66D;
    }
  `}</style>
);

// ============ COMPONENTS ============

// VOICE Logo Component
const VoiceLogo = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
    <img 
      src="/uploads/VOICE__3_.png" 
      alt="VOICE" 
      style={{ height: '40px', width: 'auto' }}
      onError={(e) => {
        e.target.style.display = 'none';
        e.target.nextSibling.style.display = 'flex';
      }}
    />
    <div style={{ 
      display: 'none', alignItems: 'center', gap: '8px',
      fontFamily: 'Bebas Neue, sans-serif', fontSize: '32px', color: '#3D3B73', letterSpacing: '2px'
    }}>
      VOICE
    </div>
  </div>
);

// Text Logo Fallback
const TextLogo = () => (
  <div style={{ 
    fontFamily: 'Bebas Neue, sans-serif', 
    fontSize: '36px', 
    color: '#3D3B73', 
    letterSpacing: '3px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  }}>
    <span>VOICE</span>
    <span style={{ 
      fontSize: '12px', 
      background: '#FF6B6B', 
      color: 'white', 
      padding: '4px 8px',
      border: '2px solid #2D3142',
      transform: 'rotate(-3deg)'
    }}>CREATOR</span>
  </div>
);

// Decorative Background
const PopArtBackground = () => (
  <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
    {/* Halftone dots pattern */}
    <div style={{
      position: 'absolute', inset: 0, opacity: 0.03,
      backgroundImage: `radial-gradient(#2D3142 2px, transparent 2px)`,
      backgroundSize: '20px 20px'
    }} />
    
    {/* Floating shapes */}
    <div style={{
      position: 'absolute', top: '10%', right: '5%', width: '150px', height: '150px',
      background: '#FFE66D', border: '4px solid #2D3142', borderRadius: '50%',
      animation: 'float 8s ease-in-out infinite', opacity: 0.6
    }} />
    <div style={{
      position: 'absolute', bottom: '20%', left: '3%', width: '100px', height: '100px',
      background: '#FF6B6B', border: '4px solid #2D3142',
      animation: 'float 6s ease-in-out infinite reverse', opacity: 0.5,
      transform: 'rotate(45deg)'
    }} />
    <div style={{
      position: 'absolute', top: '60%', right: '10%', width: '80px', height: '80px',
      background: '#4ECDC4', border: '4px solid #2D3142',
      animation: 'float 10s ease-in-out infinite', opacity: 0.4
    }} />
    
    {/* Comic-style stars */}
    {[...Array(5)].map((_, i) => (
      <div key={i} style={{
        position: 'absolute',
        top: `${20 + i * 15}%`,
        left: `${10 + i * 20}%`,
        fontSize: '24px',
        animation: `float ${5 + i}s ease-in-out infinite`,
        opacity: 0.3
      }}>✦</div>
    ))}
  </div>
);

// Marquee Banner
const MarqueeBanner = () => (
  <div style={{
    background: '#2D3142', color: 'white', padding: '10px 0',
    overflow: 'hidden', whiteSpace: 'nowrap',
    fontFamily: 'Bebas Neue, sans-serif', fontSize: '14px', letterSpacing: '3px'
  }}>
    <div style={{ display: 'inline-block', animation: 'marquee 20s linear infinite' }}>
      {[...Array(10)].map((_, i) => (
        <span key={i} style={{ marginRight: '60px' }}>
          🔥 NOVI POSLOVI • 💰 ZARADI VIŠE • ⭐ TOP KREATORI • 🚀 RASTI SA NAMA • 
        </span>
      ))}
    </div>
  </div>
);

// Flip Stat Card - POP ART Style
const FlipStatCard = ({ icon, label, value, subValue, color = 'yellow', items = [], delay = 0 }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);
  
  const colors = {
    yellow: { bg: '#FFE66D', accent: '#2D3142' },
    red: { bg: '#FF6B6B', accent: 'white' },
    teal: { bg: '#4ECDC4', accent: 'white' },
    purple: { bg: '#9B89B3', accent: 'white' },
    green: { bg: '#95E881', accent: '#2D3142' }
  };
  
  const c = colors[color];
  const hasItems = items && items.length > 0;
  
  return (
    <div style={{ 
      perspective: '1000px', 
      height: '180px',
      opacity: isVisible ? 1 : 0,
      transform: isVisible ? 'scale(1) rotate(0deg)' : 'scale(0.8) rotate(-5deg)',
      transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
      transitionDelay: `${delay}ms`
    }}>
      <div
        onClick={() => hasItems && setIsFlipped(!isFlipped)}
        style={{
          position: 'relative', width: '100%', height: '100%',
          transformStyle: 'preserve-3d',
          transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          cursor: hasItems ? 'pointer' : 'default'
        }}
      >
        {/* Front */}
        <div className="brutalist-card" style={{
          position: 'absolute', width: '100%', height: '100%',
          backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden',
          padding: '20px', background: c.bg, display: 'flex', flexDirection: 'column'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <span style={{ fontSize: '40px' }}>{icon}</span>
            {hasItems && (
              <span style={{ 
                fontFamily: 'Bebas Neue', fontSize: '20px', color: c.accent,
                animation: 'bounce 2s ease infinite'
              }}>↻</span>
            )}
          </div>
          <p style={{ 
            fontFamily: 'Bebas Neue', fontSize: '14px', letterSpacing: '2px',
            color: c.accent, opacity: 0.8, marginBottom: '8px'
          }}>{label}</p>
          <p style={{ 
            fontFamily: 'Bebas Neue', fontSize: '42px', color: c.accent, margin: 0, lineHeight: 1
          }}>{value}</p>
          {subValue && (
            <p style={{ fontSize: '12px', color: c.accent, opacity: 0.7, marginTop: '8px', fontWeight: '600' }}>{subValue}</p>
          )}
          {hasItems && (
            <p style={{ 
              fontSize: '11px', color: c.accent, opacity: 0.6, marginTop: 'auto',
              fontFamily: 'Bebas Neue', letterSpacing: '1px'
            }}>KLIKNI ZA VIŠE →</p>
          )}
        </div>
        
        {/* Back */}
        <div className="brutalist-card" style={{
          position: 'absolute', width: '100%', height: '100%',
          backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden',
          transform: 'rotateY(180deg)', padding: '16px',
          background: 'white', overflow: 'hidden', display: 'flex', flexDirection: 'column'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontFamily: 'Bebas Neue', fontSize: '14px', letterSpacing: '1px' }}>{icon} {label}</span>
            <span style={{ fontSize: '16px', cursor: 'pointer' }}>✕</span>
          </div>
          <div style={{ flex: 1, overflow: 'auto' }}>
            {items.slice(0, 4).map((item, i) => (
              <a key={i} href={item.link} target="_blank" rel="noopener noreferrer"
                 onClick={(e) => e.stopPropagation()}
                 style={{
                   display: 'flex', alignItems: 'center', gap: '10px',
                   padding: '8px', marginBottom: '6px', textDecoration: 'none',
                   background: i % 2 === 0 ? '#FFFBF5' : 'white',
                   border: '2px solid #2D3142', transition: 'all 0.2s'
                 }}>
                <span style={{ fontSize: '16px' }}>{item.platform === 'Tik Tok' ? '📱' : '📸'}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '12px', fontWeight: '600', margin: 0, color: '#2D3142', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.influencerName || item.clientName || 'Clip'}
                  </p>
                  <p style={{ fontSize: '10px', color: '#666', margin: 0 }}>{formatNumber(item.views)} views</p>
                </div>
                <span style={{ fontSize: '12px' }}>→</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Opportunity Card - POP ART
const OpportunityCard = ({ opportunity, onApply, index }) => {
  const [showNote, setShowNote] = useState(false);
  const [note, setNote] = useState('');
  const [isHovered, setIsHovered] = useState(false);
  
  const bgColors = ['#FFE66D', '#FF6B6B', '#4ECDC4', '#95E881', '#9B89B3'];
  const bgColor = bgColors[index % bgColors.length];
  
  return (
    <div 
      className="brutalist-card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        padding: '0', overflow: 'hidden',
        animation: `popIn 0.5s ease ${index * 0.1}s both`,
        transform: isHovered ? 'translate(-6px, -6px) rotate(-1deg)' : 'none',
        boxShadow: isHovered ? '14px 14px 0 #2D3142' : '8px 8px 0 #2D3142'
      }}
    >
      {/* Header */}
      <div style={{ background: bgColor, padding: '20px', borderBottom: '4px solid #2D3142' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <span className="tag tag-hot" style={{ marginBottom: '10px', display: 'inline-block' }}>🔥 HOT</span>
            <h3 style={{ 
              fontFamily: 'Bebas Neue', fontSize: '28px', margin: '8px 0 0',
              color: '#2D3142', letterSpacing: '1px'
            }}>{opportunity.clientName}</h3>
          </div>
          <div style={{
            width: '60px', height: '60px', background: 'white',
            border: '3px solid #2D3142', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            fontSize: '28px', fontWeight: '700', transform: 'rotate(5deg)'
          }}>
            {opportunity.clientName?.charAt(0)}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px', marginTop: '12px', flexWrap: 'wrap' }}>
          <span className="tag" style={{ background: 'white' }}>{opportunity.niche || 'Lifestyle'}</span>
          <span className="tag" style={{ background: 'white' }}>{opportunity.platform || 'TikTok'}</span>
        </div>
      </div>
      
      {/* Body */}
      <div style={{ padding: '20px', background: 'white' }}>
        <p style={{ fontSize: '14px', color: '#444', lineHeight: 1.6, marginBottom: '16px' }}>
          {opportunity.description || 'Tražimo kreativne influensere! Prijavi se i pokaži svoj stil.'}
        </p>
        
        <div style={{ 
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', 
          marginBottom: '20px', padding: '16px', background: '#FFFBF5',
          border: '3px solid #2D3142'
        }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontFamily: 'Bebas Neue', fontSize: '11px', color: '#666', letterSpacing: '1px' }}>HONORAR</p>
            <p style={{ fontFamily: 'Bebas Neue', fontSize: '22px', color: '#2D3142', margin: '4px 0 0' }}>
              {(opportunity.payment / 1000).toFixed(0)}K
            </p>
          </div>
          <div style={{ textAlign: 'center', borderLeft: '2px solid #2D3142', borderRight: '2px solid #2D3142' }}>
            <p style={{ fontFamily: 'Bebas Neue', fontSize: '11px', color: '#666', letterSpacing: '1px' }}>VIEWS</p>
            <p style={{ fontFamily: 'Bebas Neue', fontSize: '22px', color: '#2D3142', margin: '4px 0 0' }}>
              {formatNumber(opportunity.viewsRequired)}
            </p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontFamily: 'Bebas Neue', fontSize: '11px', color: '#666', letterSpacing: '1px' }}>ROK</p>
            <p style={{ fontFamily: 'Bebas Neue', fontSize: '22px', color: '#2D3142', margin: '4px 0 0' }}>
              {formatDate(opportunity.deadline)}
            </p>
          </div>
        </div>
        
        {showNote && (
          <div style={{ marginBottom: '16px', animation: 'slideUp 0.3s ease' }}>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Zašto si TI pravi/a za ovaj posao? 💪"
              style={{ width: '100%', height: '80px', resize: 'none' }}
            />
          </div>
        )}
        
        <div style={{ display: 'flex', gap: '10px' }}>
          {!showNote ? (
            <>
              <button className="pop-button" onClick={() => setShowNote(true)} style={{ flex: 1 }}>
                PRIJAVI SE ✨
              </button>
              <button className="pop-button yellow-button">INFO</button>
            </>
          ) : (
            <>
              <button className="pop-button green-button" onClick={() => onApply(opportunity, note)} style={{ flex: 1 }}>
                POŠALJI 🚀
              </button>
              <button className="pop-button yellow-button" onClick={() => setShowNote(false)}>✕</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// Application Card - POP ART
const ApplicationCard = ({ application, index }) => {
  const statusConfig = {
    'Sent': { class: 'tag-pending', icon: '⏳', text: 'ČEKA SE' },
    'Pending': { class: 'tag-pending', icon: '⏳', text: 'ČEKA SE' },
    'Accepted': { class: 'tag-accepted', icon: '✅', text: 'PRIHVAĆENO' },
    'Declined': { class: 'tag-declined', icon: '❌', text: 'ODBIJENO' }
  };
  const status = statusConfig[application.status] || statusConfig['Pending'];
  
  return (
    <div className="brutalist-card" style={{ 
      padding: '16px', display: 'flex', alignItems: 'center', gap: '14px',
      animation: `slideUp 0.4s ease ${index * 0.1}s both`
    }}>
      <div style={{
        width: '50px', height: '50px', background: '#FFE66D',
        border: '3px solid #2D3142', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        fontSize: '22px', fontWeight: '700'
      }}>
        {application.clientName?.charAt(0)}
      </div>
      <div style={{ flex: 1 }}>
        <h4 style={{ fontFamily: 'Bebas Neue', fontSize: '18px', margin: 0, letterSpacing: '1px' }}>
          {application.clientName}
        </h4>
        <p style={{ fontSize: '12px', color: '#666', margin: '2px 0 0' }}>
          {getTimeAgo(application.dateApplied)}
        </p>
      </div>
      <span className={`tag ${status.class}`}>{status.icon} {status.text}</span>
    </div>
  );
};

// Clip Card - POP ART
const ClipCard = ({ clip, index }) => {
  const [isHovered, setIsHovered] = useState(false);
  const bgColors = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E881', '#9B89B3'];
  
  return (
    <a href={clip.link} target="_blank" rel="noopener noreferrer"
       onMouseEnter={() => setIsHovered(true)}
       onMouseLeave={() => setIsHovered(false)}
       style={{
         display: 'block', textDecoration: 'none',
         animation: `popIn 0.5s ease ${index * 0.1}s both`
       }}>
      <div className="brutalist-card" style={{
        overflow: 'hidden',
        transform: isHovered ? 'translate(-4px, -4px) rotate(-2deg)' : 'none',
        boxShadow: isHovered ? '12px 12px 0 #2D3142' : '8px 8px 0 #2D3142'
      }}>
        {/* Thumbnail */}
        <div style={{
          height: '120px', background: bgColors[index % bgColors.length],
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          borderBottom: '4px solid #2D3142', position: 'relative'
        }}>
          <span style={{ fontSize: '50px', animation: isHovered ? 'bounce 0.5s ease' : 'none' }}>
            {clip.platform === 'Tik Tok' ? '🎵' : '📸'}
          </span>
          <div style={{
            position: 'absolute', bottom: '8px', right: '8px',
            background: '#2D3142', color: 'white', padding: '4px 10px',
            fontFamily: 'Bebas Neue', fontSize: '12px', letterSpacing: '1px'
          }}>
            {clip.platform === 'Tik Tok' ? 'TIKTOK' : 'INSTAGRAM'}
          </div>
        </div>
        
        {/* Info */}
        <div style={{ padding: '14px', background: 'white' }}>
          <p style={{ 
            fontFamily: 'Bebas Neue', fontSize: '14px', margin: '0 0 8px',
            color: '#2D3142', letterSpacing: '0.5px',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
          }}>
            {clip.clientName || 'CLIP'}
          </p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontFamily: 'Bebas Neue', fontSize: '24px', color: '#FF6B6B' }}>
              {formatNumber(clip.views)}
            </span>
            <span style={{ fontSize: '11px', color: '#999', fontWeight: '600' }}>{getTimeAgo(clip.publishDate)}</span>
          </div>
        </div>
      </div>
    </a>
  );
};

// Earnings Section - POP ART
const EarningsSection = ({ earnings = [], stats }) => {
  const maxValue = Math.max(...earnings.map(e => e.amount), 1);
  const barColors = ['#FF6B6B', '#FFE66D', '#4ECDC4', '#95E881', '#9B89B3', '#FF6B6B'];
  
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
      {/* Chart */}
      <div className="brutalist-card" style={{ padding: '24px' }}>
        <h3 style={{ fontFamily: 'Bebas Neue', fontSize: '24px', letterSpacing: '2px', marginBottom: '24px' }}>
          📊 ZARADA PO MESECIMA
        </h3>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', height: '160px' }}>
          {earnings.slice(-6).map((item, i) => (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '100%', background: barColors[i],
                height: `${(item.amount / maxValue) * 100}%`, minHeight: '20px',
                border: '3px solid #2D3142',
                transition: 'height 0.5s ease',
                animation: `slideUp 0.5s ease ${i * 0.1}s both`
              }} />
              <span style={{ fontFamily: 'Bebas Neue', fontSize: '12px', color: '#666' }}>{item.month}</span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Summary */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div className="brutalist-card" style={{ padding: '20px', background: '#95E881' }}>
          <p style={{ fontFamily: 'Bebas Neue', fontSize: '12px', letterSpacing: '2px', color: '#2D3142', opacity: 0.8 }}>
            UKUPNO ZARAĐENO
          </p>
          <p style={{ fontFamily: 'Bebas Neue', fontSize: '36px', color: '#2D3142', margin: '8px 0 0' }}>
            {formatCurrency(stats?.totalEarnings)}
          </p>
        </div>
        <div className="brutalist-card" style={{ padding: '20px', background: '#FFE66D' }}>
          <p style={{ fontFamily: 'Bebas Neue', fontSize: '12px', letterSpacing: '2px', color: '#2D3142', opacity: 0.8 }}>
            ČEKA ISPLATU
          </p>
          <p style={{ fontFamily: 'Bebas Neue', fontSize: '36px', color: '#2D3142', margin: '8px 0 0' }}>
            {formatCurrency(stats?.pendingPayment)}
          </p>
        </div>
      </div>
    </div>
  );
};

// Profile Section - POP ART
const ProfileSection = ({ profile, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(profile || {});
  
  const fields = [
    { key: 'phone', label: 'TELEFON', icon: '📱' },
    { key: 'city', label: 'GRAD', icon: '📍' },
    { key: 'tiktokHandle', label: 'TIKTOK', icon: '🎵', placeholder: '@username' },
    { key: 'instagramHandle', label: 'INSTAGRAM', icon: '📸', placeholder: '@username' },
    { key: 'shirtSize', label: 'MAJICA', icon: '👕', type: 'select', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL'] },
    { key: 'pantsSize', label: 'PANTALONE', icon: '👖' },
    { key: 'shoeSize', label: 'CIPELE', icon: '👟' }
  ];
  
  const categories = ['Beauty', 'Fashion', 'Fitness', 'Food', 'Tech', 'Travel', 'Gaming', 'Lifestyle', 'Parenting', 'Comedy'];
  
  return (
    <div className="brutalist-card" style={{ padding: '28px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontFamily: 'Bebas Neue', fontSize: '28px', letterSpacing: '2px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          👤 MOJ PROFIL
        </h2>
        <button 
          className={`pop-button ${isEditing ? 'green-button' : 'yellow-button'}`}
          onClick={() => {
            if (isEditing) onUpdate(formData);
            setIsEditing(!isEditing);
          }}
          style={{ padding: '10px 20px', fontSize: '14px' }}
        >
          {isEditing ? '💾 SAČUVAJ' : '✏️ IZMENI'}
        </button>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {fields.map(field => (
          <div key={field.key} style={{ 
            display: 'flex', alignItems: 'center', gap: '12px',
            padding: '14px', background: '#FFFBF5', border: '3px solid #2D3142'
          }}>
            <span style={{ fontSize: '24px' }}>{field.icon}</span>
            <div style={{ flex: 1 }}>
              <label style={{ fontFamily: 'Bebas Neue', fontSize: '11px', color: '#666', letterSpacing: '1px' }}>
                {field.label}
              </label>
              {isEditing ? (
                field.type === 'select' ? (
                  <select value={formData[field.key] || ''} onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                          style={{ width: '100%', padding: '6px', marginTop: '4px' }}>
                    <option value="">Izaberi...</option>
                    {field.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                ) : (
                  <input type="text" value={formData[field.key] || ''} placeholder={field.placeholder}
                         onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                         style={{ width: '100%', padding: '6px', marginTop: '4px' }} />
                )
              ) : (
                <p style={{ fontFamily: 'Bebas Neue', fontSize: '18px', color: '#2D3142', margin: '4px 0 0' }}>
                  {formData[field.key] || '—'}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {/* Categories */}
      <div style={{ padding: '16px', background: '#FFFBF5', border: '3px solid #2D3142' }}>
        <label style={{ fontFamily: 'Bebas Neue', fontSize: '14px', letterSpacing: '2px', color: '#666', display: 'block', marginBottom: '12px' }}>
          🏷️ KATEGORIJE
        </label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {categories.map(cat => {
            const selected = (formData.categories || []).includes(cat);
            return (
              <button key={cat} onClick={() => {
                if (!isEditing) return;
                const current = formData.categories || [];
                setFormData({
                  ...formData,
                  categories: selected ? current.filter(x => x !== cat) : [...current, cat]
                });
              }} style={{
                padding: '8px 16px', fontFamily: 'Bebas Neue', fontSize: '14px', letterSpacing: '1px',
                background: selected ? '#FF6B6B' : 'white', color: selected ? 'white' : '#2D3142',
                border: '3px solid #2D3142', cursor: isEditing ? 'pointer' : 'default',
                boxShadow: selected ? '3px 3px 0 #2D3142' : 'none',
                transition: 'all 0.2s'
              }}>
                {cat.toUpperCase()}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Navigation Tab - POP ART
const NavTab = ({ icon, label, isActive, onClick, badge }) => (
  <button onClick={onClick} style={{
    display: 'flex', alignItems: 'center', gap: '10px',
    padding: '14px 24px', border: '4px solid #2D3142',
    background: isActive ? '#FF6B6B' : 'white',
    color: isActive ? 'white' : '#2D3142',
    fontFamily: 'Bebas Neue', fontSize: '16px', letterSpacing: '2px',
    cursor: 'pointer', position: 'relative',
    boxShadow: isActive ? '4px 4px 0 #2D3142' : 'none',
    transform: isActive ? 'translate(-2px, -2px)' : 'none',
    transition: 'all 0.2s'
  }}>
    <span style={{ fontSize: '20px' }}>{icon}</span>
    <span>{label}</span>
    {badge > 0 && (
      <span style={{
        position: 'absolute', top: '-10px', right: '-10px',
        width: '28px', height: '28px', background: '#FFE66D',
        border: '3px solid #2D3142', fontFamily: 'Bebas Neue',
        fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center',
        animation: 'bounce 1s ease infinite'
      }}>
        {badge}
      </span>
    )}
  </button>
);

// ============ MAIN COMPONENT ============
export default function InfluencerDashboard() {
  const router = useRouter();
  const { slug } = router.query;
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('opportunities');
  
  useEffect(() => {
    if (!slug) return;
    setTimeout(() => {
      setData({
        influencer: {
          name: 'Marija Petrović',
          tiktokHandle: '@marija_p',
          instagramHandle: '@marija.petrovic',
          city: 'Beograd',
          shirtSize: 'M',
          shoeSize: '39',
          categories: ['Beauty', 'Fashion', 'Lifestyle']
        },
        stats: {
          totalEarnings: 125000,
          totalViews: 2450000,
          totalClips: 24,
          avgViewsPerClip: 102000,
          pendingPayment: 15000
        },
        opportunities: [
          { id: 1, clientName: 'Nivea Serbia', niche: 'Beauty', platform: 'TikTok', payment: 8000, viewsRequired: 100000, deadline: '2025-01-15', description: 'Tražimo kreativce za zimsku kampanju hidratacije!' },
          { id: 2, clientName: 'Fashion Nova', niche: 'Fashion', platform: 'Instagram', payment: 12000, viewsRequired: 150000, deadline: '2025-01-20', description: 'Nova kolekcija - OOTD content wanted!' },
          { id: 3, clientName: 'Protein World', niche: 'Fitness', platform: 'TikTok', payment: 6000, viewsRequired: 80000, deadline: '2025-01-10', description: 'Fitness influenseri za protein šejk promociju.' }
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
  
  if (loading) {
    return (
      <>
        <GlobalStyles />
        <PopArtBackground />
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="brutalist-card" style={{ padding: '40px', textAlign: 'center', animation: 'bounce 1s ease infinite' }}>
            <span style={{ fontSize: '60px', display: 'block', marginBottom: '16px' }}>🎬</span>
            <p style={{ fontFamily: 'Bebas Neue', fontSize: '24px', letterSpacing: '3px' }}>LOADING...</p>
          </div>
        </div>
      </>
    );
  }
  
  return (
    <>
      <Head>
        <title>{data?.influencer?.name} | VOICE Creator Hub</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <GlobalStyles />
      <PopArtBackground />
      
      <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh' }}>
        <MarqueeBanner />
        
        {/* Header */}
        <header style={{
          padding: '20px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          background: 'white', borderBottom: '4px solid #2D3142'
        }}>
          <TextLogo />
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontFamily: 'Bebas Neue', fontSize: '18px', margin: 0, letterSpacing: '1px' }}>{data?.influencer?.name}</p>
              <p style={{ fontSize: '12px', color: '#666', margin: 0 }}>{data?.influencer?.tiktokHandle}</p>
            </div>
            <div style={{
              width: '50px', height: '50px', background: '#FF6B6B',
              border: '4px solid #2D3142', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              fontSize: '22px', fontWeight: '700', color: 'white'
            }}>
              {data?.influencer?.name?.charAt(0)}
            </div>
          </div>
        </header>
        
        <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '32px 40px' }}>
          
          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '40px' }}>
            <FlipStatCard icon="💰" label="UKUPNA ZARADA" value={formatCurrency(data?.stats?.totalEarnings)} color="green" delay={0} />
            <FlipStatCard icon="👁️" label="UKUPNI VIEWS" value={formatNumber(data?.stats?.totalViews)} color="yellow" delay={100} items={data?.clips} />
            <FlipStatCard icon="🎬" label="KLIPOVA" value={data?.stats?.totalClips} color="red" delay={200} items={data?.clips} />
            <FlipStatCard icon="📈" label="PROSEK/KLIP" value={formatNumber(data?.stats?.avgViewsPerClip)} subValue="views" color="teal" delay={300} />
          </div>
          
          {/* Navigation */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '32px', flexWrap: 'wrap' }}>
            <NavTab icon="🔥" label="PRILIKE" isActive={activeTab === 'opportunities'} onClick={() => setActiveTab('opportunities')} badge={data?.opportunities?.length} />
            <NavTab icon="📋" label="PRIJAVE" isActive={activeTab === 'applications'} onClick={() => setActiveTab('applications')} />
            <NavTab icon="🎬" label="KLIPOVI" isActive={activeTab === 'clips'} onClick={() => setActiveTab('clips')} />
            <NavTab icon="💳" label="ZARADA" isActive={activeTab === 'earnings'} onClick={() => setActiveTab('earnings')} />
            <NavTab icon="👤" label="PROFIL" isActive={activeTab === 'profile'} onClick={() => setActiveTab('profile')} />
          </div>
          
          {/* Content */}
          {activeTab === 'opportunities' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '24px' }}>
              {data?.opportunities?.map((opp, i) => (
                <OpportunityCard key={opp.id} opportunity={opp} index={i} onApply={(o, n) => alert(`Prijava poslata za ${o.clientName}!`)} />
              ))}
            </div>
          )}
          
          {activeTab === 'applications' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '700px' }}>
              {data?.applications?.map((app, i) => <ApplicationCard key={app.id} application={app} index={i} />)}
            </div>
          )}
          
          {activeTab === 'clips' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '24px' }}>
              {data?.clips?.map((clip, i) => <ClipCard key={clip.id} clip={clip} index={i} />)}
            </div>
          )}
          
          {activeTab === 'earnings' && <EarningsSection earnings={data?.earnings} stats={data?.stats} />}
          
          {activeTab === 'profile' && <ProfileSection profile={data?.influencer} onUpdate={(p) => setData({ ...data, influencer: { ...data.influencer, ...p } })} />}
          
        </main>
        
        {/* Footer */}
        <footer style={{
          padding: '20px 40px', textAlign: 'center',
          background: '#2D3142', color: 'white',
          fontFamily: 'Bebas Neue', letterSpacing: '3px', fontSize: '14px'
        }}>
          POWERED BY VOICE • © 2025
        </footer>
      </div>
    </>
  );
}
