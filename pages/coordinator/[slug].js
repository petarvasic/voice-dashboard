// pages/coordinator/[slug].js - Coordinator Dashboard v10
// Features: Flip cards, Package tracking with Airtable, Fixed clips display
import { useState, useEffect, useMemo, useCallback } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

// ============ UTILITIES ============
const formatNumber = (num) => {
  if (!num || isNaN(num)) return '0';
  const n = parseInt(num);
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return n.toLocaleString();
};

const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '-';
    return date.toLocaleDateString('sr-RS', { day: '2-digit', month: '2-digit', year: 'numeric' });
  } catch {
    return '-';
  }
};

const formatShortDate = (dateStr) => {
  if (!dateStr) return '-';
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '-';
    return date.toLocaleDateString('sr-RS', { day: '2-digit', month: '2-digit' });
  } catch {
    return '-';
  }
};

const getDaysAgo = (dateStr) => {
  if (!dateStr) return null;
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return null;
    const now = new Date();
    const diff = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    if (diff === 0) return 'Danas';
    if (diff === 1) return 'Juče';
    if (diff < 7) return `Pre ${diff} dana`;
    if (diff < 30) return `Pre ${Math.floor(diff / 7)} ned.`;
    return formatShortDate(dateStr);
  } catch {
    return null;
  }
};

// ============ GLOBAL STYLES ============
const GlobalStyles = () => (
  <style>{`
    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
    @keyframes glow { 0%, 100% { box-shadow: 0 0 4px #22c55e; } 50% { box-shadow: 0 0 20px #22c55e; } }
    @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }
    @keyframes scaleIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
    @keyframes spin { to { transform: rotate(360deg); } }
    ::-webkit-scrollbar { width: 8px; height: 8px; }
    ::-webkit-scrollbar-track { background: rgba(255,255,255,0.05); border-radius: 4px; }
    ::-webkit-scrollbar-thumb { background: rgba(139, 92, 246, 0.4); border-radius: 4px; }
    ::-webkit-scrollbar-thumb:hover { background: rgba(139, 92, 246, 0.6); }
    .glass { background: rgba(255, 255, 255, 0.03); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.08); }
    .glass-strong { background: rgba(15, 15, 30, 0.9); backdrop-filter: blur(40px); border: 1px solid rgba(255, 255, 255, 0.1); }
  `}</style>
);

// ============ COMPONENTS ============

// Platform Icon SVG
const PlatformIcon = ({ platform, size = 24 }) => {
  if (platform === 'Tik Tok') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" fill="#fff"/>
      </svg>
    );
  }
  if (platform === 'Instagram') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" fill="#fff"/>
      </svg>
    );
  }
  return <span style={{ fontSize: size * 0.8 }}>🎬</span>;
};

// Live Indicator
const LiveIndicator = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', animation: 'pulse 2s infinite, glow 2s infinite' }} />
    <span style={{ fontSize: '11px', fontWeight: '600', color: '#22c55e', textTransform: 'uppercase', letterSpacing: '1px' }}>Live</span>
  </div>
);

// Glass Card
const GlassCard = ({ children, style = {}, className = '' }) => (
  <div className={`glass ${className}`} style={{ borderRadius: '20px', padding: '20px', ...style }}>
    {children}
  </div>
);

// Flip Stat Card - ALL stats can flip!
const FlipStatCard = ({ icon, label, value, subValue, gradient = 'purple', items = [], itemType = 'clip', size = 'normal' }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const isLarge = size === 'large';
  
  const gradients = {
    purple: { bg: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(99, 102, 241, 0.1))', border: 'rgba(139, 92, 246, 0.4)' },
    green: { bg: 'linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(16, 185, 129, 0.1))', border: 'rgba(34, 197, 94, 0.4)' },
    blue: { bg: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(99, 102, 241, 0.1))', border: 'rgba(59, 130, 246, 0.4)' },
    orange: { bg: 'linear-gradient(135deg, rgba(249, 115, 22, 0.15), rgba(234, 179, 8, 0.1))', border: 'rgba(249, 115, 22, 0.4)' },
    red: { bg: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(236, 72, 153, 0.1))', border: 'rgba(239, 68, 68, 0.4)' },
    pink: { bg: 'linear-gradient(135deg, rgba(236, 72, 153, 0.15), rgba(139, 92, 246, 0.1))', border: 'rgba(236, 72, 153, 0.4)' }
  };
  
  const g = gradients[gradient];
  const hasItems = items && items.length > 0;
  const canFlip = hasItems || parseInt(value) > 0;

  return (
    <div style={{ perspective: '1000px', height: isLarge ? '160px' : '140px' }}
         onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
      <div onClick={() => canFlip && setIsFlipped(!isFlipped)}
           style={{
             position: 'relative', width: '100%', height: '100%',
             transformStyle: 'preserve-3d',
             transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
             transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
             cursor: canFlip ? 'pointer' : 'default'
           }}>
        {/* Front */}
        <div className="glass" style={{
          position: 'absolute', width: '100%', height: '100%',
          backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden',
          borderRadius: '20px', padding: '16px', background: g.bg,
          border: isHovered ? `1px solid ${g.border}` : '1px solid rgba(255,255,255,0.08)',
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          transition: 'all 0.3s ease',
          transform: isHovered && !isFlipped ? 'scale(1.02)' : 'scale(1)',
          boxShadow: isHovered ? `0 10px 40px ${g.border}40` : 'none'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: isLarge ? '22px' : '18px' }}>{icon}</span>
              <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>{label}</span>
            </div>
            {canFlip && (
              <span style={{ fontSize: '14px', color: isHovered ? g.border : 'rgba(255,255,255,0.3)', transition: 'all 0.3s', transform: isHovered ? 'rotate(180deg)' : 'none' }}>↻</span>
            )}
          </div>
          <div>
            <p style={{ fontSize: isLarge ? '38px' : '28px', fontWeight: '800', margin: 0, color: '#fff', lineHeight: 1 }}>{value}</p>
            {subValue && <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', margin: '4px 0 0' }}>{subValue}</p>}
          </div>
          {canFlip && (
            <p style={{ fontSize: '9px', color: isHovered ? g.border : 'rgba(255,255,255,0.3)', margin: 0, textAlign: 'center' }}>
              Klikni za detalje →
            </p>
          )}
        </div>
        
        {/* Back */}
        <div className="glass" style={{
          position: 'absolute', width: '100%', height: '100%',
          backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden',
          transform: 'rotateY(180deg)', borderRadius: '20px', padding: '12px',
          background: 'rgba(15, 15, 30, 0.95)', border: `1px solid ${g.border}`,
          overflow: 'hidden', display: 'flex', flexDirection: 'column'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', fontWeight: '600', color: '#fff' }}>{icon} {label}</span>
            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)' }}>✕</span>
          </div>
          <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {items.slice(0, 5).map((item, i) => (
              <a key={item.id || i} href={item.link} target="_blank" rel="noopener noreferrer"
                 onClick={(e) => e.stopPropagation()}
                 style={{
                   display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 8px',
                   background: 'rgba(255,255,255,0.05)', borderRadius: '8px', textDecoration: 'none',
                   transition: 'background 0.2s'
                 }}
                 onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(139, 92, 246, 0.2)'}
                 onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}>
                <div style={{
                  width: '24px', height: '24px', borderRadius: '6px', flexShrink: 0,
                  background: item.platform === 'Tik Tok' ? 'linear-gradient(135deg, #010101, #69C9D0)' : 'linear-gradient(45deg, #f09433, #dc2743)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <PlatformIcon platform={item.platform} size={12} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '10px', fontWeight: '600', margin: 0, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.influencerName || item.name || 'Unknown'}
                  </p>
                  <p style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)', margin: 0 }}>
                    {formatNumber(item.views)} views
                  </p>
                </div>
                <span style={{ fontSize: '10px', color: '#a78bfa' }}>↗</span>
              </a>
            ))}
            {items.length === 0 && (
              <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', textAlign: 'center', padding: '16px' }}>
                Nema podataka
              </p>
            )}
            {items.length > 5 && (
              <p style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)', textAlign: 'center', margin: '4px 0 0' }}>
                +{items.length - 5} više
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Progress Bar
const ProgressBar = ({ percent, showLabel = true, size = 'normal' }) => {
  const height = size === 'small' ? '6px' : '8px';
  const actualPercent = Math.min(Math.max(percent || 0, 0), 100);
  const getGradient = () => {
    if (percent >= 100) return 'linear-gradient(90deg, #22c55e, #10b981)';
    if (percent >= 70) return 'linear-gradient(90deg, #8b5cf6, #6366f1)';
    if (percent >= 40) return 'linear-gradient(90deg, #f59e0b, #eab308)';
    return 'linear-gradient(90deg, #ef4444, #f97316)';
  };
  
  return (
    <div style={{ width: '100%' }}>
      <div style={{ height, background: 'rgba(255,255,255,0.08)', borderRadius: '100px', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${actualPercent}%`, background: getGradient(), borderRadius: '100px', transition: 'width 0.8s ease' }} />
      </div>
      {showLabel && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
          <span style={{ fontSize: '12px', fontWeight: '700', color: percent >= 100 ? '#22c55e' : '#fff' }}>
            {Math.round(percent)}%{percent >= 100 && ' ✨'}
          </span>
        </div>
      )}
    </div>
  );
};

// Status Badge
const StatusBadge = ({ status }) => {
  const getStyle = () => {
    const s = status?.toLowerCase() || '';
    if (s.includes('overgreen') || s.includes('dominating')) return { bg: 'rgba(34, 197, 94, 0.25)', color: '#22c55e', icon: '💚' };
    if (s.includes('green') || s.includes('ahead')) return { bg: 'rgba(34, 197, 94, 0.2)', color: '#4ade80', icon: '🟢' };
    if (s.includes('yellow')) return { bg: 'rgba(234, 179, 8, 0.2)', color: '#fbbf24', icon: '🟡' };
    if (s.includes('hard red') || s.includes('falling')) return { bg: 'rgba(249, 115, 22, 0.2)', color: '#fb923c', icon: '🟠' };
    if (s.includes('red') || s.includes('behind')) return { bg: 'rgba(239, 68, 68, 0.2)', color: '#f87171', icon: '🔴' };
    if (s.includes('dead') || s.includes('critical')) return { bg: 'rgba(239, 68, 68, 0.3)', color: '#ef4444', icon: '💀' };
    return { bg: 'rgba(156, 163, 175, 0.2)', color: '#9ca3af', icon: '⚪' };
  };
  const style = getStyle();
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600', background: style.bg, color: style.color }}>
      <span>{style.icon}</span>
    </span>
  );
};

// Campaign Card
const CampaignCard = ({ campaign, isExpanded, onToggle, onInfluencerClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  // percentDelivered from Airtable '%Delivered 2' field:
  // - Returns decimal: 0.54 means 54%
  // - Returns null/0 when campaign has 0 views (BLANK in Airtable)
  const rawPercent = campaign.percentDelivered || 0;
  // Convert decimal to percentage (0.54 -> 54)
  const percent = rawPercent * 100;
  
  return (
    <div style={{ marginBottom: '8px' }}>
      <div onClick={onToggle} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}
           className="glass" style={{
             borderRadius: isExpanded ? '16px 16px 0 0' : '16px', padding: '16px 20px', cursor: 'pointer',
             transition: 'all 0.3s ease', transform: isHovered && !isExpanded ? 'translateX(4px)' : 'none',
             border: isExpanded ? '1px solid rgba(139, 92, 246, 0.4)' : isHovered ? '1px solid rgba(139, 92, 246, 0.3)' : '1px solid rgba(255,255,255,0.06)',
             borderBottom: isExpanded ? 'none' : undefined,
             background: isExpanded ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(59, 130, 246, 0.05))' : 'rgba(255,255,255,0.02)'
           }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1 }}>
            <div style={{
              width: '44px', height: '44px', borderRadius: '12px',
              background: percent >= 100 ? 'linear-gradient(135deg, #22c55e, #10b981)' : 'linear-gradient(135deg, #8b5cf6, #6366f1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: '700', color: '#fff', flexShrink: 0
            }}>
              {percent >= 100 ? '✓' : campaign.month?.charAt(0) || '?'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h3 style={{ fontSize: '14px', fontWeight: '700', margin: 0, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {campaign.month}
              </h3>
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', margin: '2px 0 0' }}>
                {formatNumber(campaign.totalViews)} / {formatNumber(campaign.campaignGoal)} • {campaign.publishedClips || 0} klipova
                {campaign.totalInfluencers > 0 && ` • ${campaign.totalInfluencers} inf.`}
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '100px' }}><ProgressBar percent={percent} showLabel={false} size="small" /></div>
            <span style={{ fontSize: '16px', fontWeight: '800', color: percent >= 100 ? '#22c55e' : percent >= 70 ? '#a78bfa' : '#fff', minWidth: '45px', textAlign: 'right' }}>
              {Math.round(percent)}%
            </span>
            <StatusBadge status={campaign.progressStatus} />
            <span style={{ fontSize: '16px', color: 'rgba(255,255,255,0.4)', transition: 'transform 0.3s', transform: isExpanded ? 'rotate(180deg)' : 'none' }}>▼</span>
          </div>
        </div>
      </div>
      
      {/* Expanded */}
      {isExpanded && (
        <div className="glass" style={{
          borderRadius: '0 0 16px 16px', padding: '20px',
          border: '1px solid rgba(139, 92, 246, 0.4)', borderTop: 'none',
          animation: 'fadeIn 0.3s ease', background: 'rgba(139, 92, 246, 0.03)'
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }}>
            <div style={{ textAlign: 'center', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px' }}>
              <p style={{ fontSize: '20px', fontWeight: '800', margin: 0, color: '#fff' }}>{formatNumber(campaign.totalViews)}</p>
              <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', margin: '2px 0 0' }}>VIEWS</p>
            </div>
            <div style={{ textAlign: 'center', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px' }}>
              <p style={{ fontSize: '20px', fontWeight: '800', margin: 0, color: '#fff' }}>{campaign.publishedClips || 0}</p>
              <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', margin: '2px 0 0' }}>KLIPOVA</p>
            </div>
            <div style={{ textAlign: 'center', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px' }}>
              <p style={{ fontSize: '20px', fontWeight: '800', margin: 0, color: '#fff' }}>{campaign.totalInfluencers || 0}</p>
              <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', margin: '2px 0 0' }}>INFLUENSERA</p>
            </div>
            <div style={{ textAlign: 'center', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px' }}>
              <p style={{ fontSize: '20px', fontWeight: '800', margin: 0, color: campaign.daysLeft > 10 ? '#fff' : '#ef4444' }}>{campaign.daysLeft || 0}</p>
              <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', margin: '2px 0 0' }}>DANA</p>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '20px', marginBottom: '16px', fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>
            <span>📅 {formatDate(campaign.startDate)}</span>
            <span>🏁 {formatDate(campaign.endDate)}</span>
          </div>
          
          <h4 style={{ fontSize: '13px', fontWeight: '700', margin: '0 0 12px', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
            👥 Influenseri
            <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '10px', background: 'rgba(139, 92, 246, 0.2)', color: '#a78bfa' }}>
              {campaign.influencers?.length || 0}
            </span>
          </h4>
          
          {campaign.influencers?.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {campaign.influencers.map((inf, i) => (
                <div key={inf.id || i} onClick={() => onInfluencerClick(inf, campaign)}
                     style={{
                       display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '12px', alignItems: 'center',
                       padding: '10px 14px', background: 'rgba(255,255,255,0.02)', borderRadius: '10px',
                       cursor: 'pointer', transition: 'all 0.2s'
                     }}
                     onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(139, 92, 246, 0.15)'; e.currentTarget.style.transform = 'translateX(4px)'; }}
                     onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; e.currentTarget.style.transform = 'none'; }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #ec4899, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '700', color: '#fff' }}>
                      {inf.name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: '#fff' }}>{inf.name}</span>
                  </div>
                  <span style={{ fontSize: '14px', fontWeight: '700', color: '#fff' }}>{inf.clips}</span>
                  <span style={{ fontSize: '14px', fontWeight: '700', color: inf.views >= 100000 ? '#22c55e' : '#fff' }}>{formatNumber(inf.views)}</span>
                  <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>{getDaysAgo(inf.lastClipDate) || '-'}</span>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', padding: '20px', fontSize: '13px' }}>
              Još nema influensera sa klipovima
            </p>
          )}
        </div>
      )}
    </div>
  );
};

// Clip Card
const ClipCard = ({ clip, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  const hasLink = clip.link && clip.link.length > 0;
  
  return (
    <div onClick={() => onClick ? onClick(clip) : (hasLink && window.open(clip.link, '_blank'))}
         onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}
         style={{
           display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px',
           background: isHovered ? 'rgba(139, 92, 246, 0.15)' : 'rgba(255,255,255,0.02)',
           borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s',
           border: isHovered ? '1px solid rgba(139, 92, 246, 0.4)' : '1px solid rgba(255,255,255,0.06)'
         }}>
      <div style={{
        width: '42px', height: '42px', borderRadius: '10px', flexShrink: 0,
        background: clip.platform === 'Tik Tok' ? 'linear-gradient(135deg, #010101, #69C9D0)' : 'linear-gradient(45deg, #f09433, #dc2743, #bc1888)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative'
      }}>
        <PlatformIcon platform={clip.platform} size={20} />
        {hasLink && (
          <div style={{ position: 'absolute', bottom: '-3px', right: '-3px', width: '16px', height: '16px', borderRadius: '50%', background: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', border: '2px solid #0f0f1a' }}>↗</div>
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: '13px', fontWeight: '600', margin: 0, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {clip.influencerName || 'Unknown'}
        </p>
        <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', margin: '2px 0 0' }}>
          {clip.clientName || 'N/A'}
        </p>
      </div>
      <div style={{ textAlign: 'right' }}>
        <p style={{ fontSize: '14px', fontWeight: '700', margin: 0, color: clip.views >= 50000 ? '#22c55e' : '#fff' }}>{formatNumber(clip.views)}</p>
        <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', margin: '2px 0 0' }}>{getDaysAgo(clip.publishDate) || '-'}</p>
      </div>
    </div>
  );
};

// Influencer Drawer
const InfluencerDrawer = ({ influencer, campaign, onClose }) => {
  const [selectedClip, setSelectedClip] = useState(null);
  if (!influencer) return null;
  
  const clips = influencer.clipsList || [];
  
  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 100, animation: 'fadeIn 0.2s' }} />
      <div className="glass-strong" style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: '460px', maxWidth: '90vw', zIndex: 101, animation: 'slideInRight 0.3s', display: 'flex', flexDirection: 'column', borderLeft: '1px solid rgba(139, 92, 246, 0.3)' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'linear-gradient(135deg, #ec4899, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: '700', color: '#fff' }}>
            {influencer.name?.charAt(0)?.toUpperCase() || '?'}
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: '18px', fontWeight: '700', margin: 0, color: '#fff' }}>{influencer.name}</h2>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', margin: '2px 0 0' }}>{campaign?.month}</p>
          </div>
          <button onClick={onClose} style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', fontSize: '18px', cursor: 'pointer' }}>✕</button>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ textAlign: 'center', padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px' }}>
            <p style={{ fontSize: '20px', fontWeight: '800', margin: 0, color: '#fff' }}>{influencer.clips || 0}</p>
            <p style={{ fontSize: '9px', color: 'rgba(255,255,255,0.5)', margin: '2px 0 0' }}>KLIPOVA</p>
          </div>
          <div style={{ textAlign: 'center', padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px' }}>
            <p style={{ fontSize: '20px', fontWeight: '800', margin: 0, color: '#22c55e' }}>{formatNumber(influencer.views)}</p>
            <p style={{ fontSize: '9px', color: 'rgba(255,255,255,0.5)', margin: '2px 0 0' }}>VIEWS</p>
          </div>
          <div style={{ textAlign: 'center', padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px' }}>
            <p style={{ fontSize: '12px', fontWeight: '600', margin: 0, color: '#fff' }}>{getDaysAgo(influencer.lastClipDate) || '-'}</p>
            <p style={{ fontSize: '9px', color: 'rgba(255,255,255,0.5)', margin: '2px 0 0' }}>POSLEDNJI</p>
          </div>
        </div>
        
        <div style={{ flex: 1, overflow: 'auto', padding: '16px 20px' }}>
          <h3 style={{ fontSize: '13px', fontWeight: '600', margin: '0 0 12px', color: 'rgba(255,255,255,0.7)' }}>
            🎬 Klipovi <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '10px', background: 'rgba(139, 92, 246, 0.2)', color: '#a78bfa' }}>{clips.length}</span>
          </h3>
          {clips.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {clips.map((clip, i) => <ClipCard key={clip.id || i} clip={clip} onClick={() => setSelectedClip(clip)} />)}
            </div>
          ) : (
            <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', padding: '30px' }}>Nema klipova</p>
          )}
        </div>
      </div>
      
      {selectedClip && <ClipModal clip={selectedClip} onClose={() => setSelectedClip(null)} />}
    </>
  );
};

// Clip Modal
const ClipModal = ({ clip, onClose }) => {
  if (!clip) return null;
  
  const getTikTokEmbed = (url) => { const m = url?.match(/video\/(\d+)/); return m ? `https://www.tiktok.com/embed/v2/${m[1]}` : null; };
  const getInstagramEmbed = (url) => { const m = url?.match(/\/(p|reel|reels)\/([A-Za-z0-9_-]+)/); return m ? `https://www.instagram.com/p/${m[2]}/embed` : null; };
  const embedUrl = clip.platform === 'Tik Tok' ? getTikTokEmbed(clip.link) : clip.platform === 'Instagram' ? getInstagramEmbed(clip.link) : null;
  
  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 200, animation: 'fadeIn 0.2s' }} />
      <div style={{
        position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)',
        width: '420px', maxWidth: '95vw', height: 'calc(100vh - 40px)', maxHeight: '850px',
        zIndex: 201, animation: 'scaleIn 0.3s', borderRadius: '20px', overflow: 'hidden',
        background: 'linear-gradient(180deg, #1a1a2e, #0f0f1a)', border: '1px solid rgba(139, 92, 246, 0.4)',
        display: 'flex', flexDirection: 'column'
      }}>
        <div style={{ padding: '14px 18px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(0,0,0,0.3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '10px',
              background: clip.platform === 'Tik Tok' ? 'linear-gradient(135deg, #010101, #69C9D0)' : 'linear-gradient(45deg, #f09433, #dc2743)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <PlatformIcon platform={clip.platform} size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '14px', fontWeight: '700', margin: 0, color: '#fff' }}>{clip.influencerName}</h3>
              <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', margin: '2px 0 0' }}>{clip.clientName}</p>
            </div>
          </div>
          <button onClick={onClose} style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', fontSize: '16px', cursor: 'pointer' }}>✕</button>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-around', padding: '10px 16px', background: 'rgba(0,0,0,0.2)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '16px', fontWeight: '800', margin: 0, color: '#22c55e' }}>{formatNumber(clip.views)}</p>
            <p style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)' }}>Views</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '16px', fontWeight: '800', margin: 0, color: '#ec4899' }}>{formatNumber(clip.likes)}</p>
            <p style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)' }}>Likes</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '12px', fontWeight: '600', margin: 0, color: '#fff' }}>{formatShortDate(clip.publishDate)}</p>
            <p style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)' }}>Objavljeno</p>
          </div>
        </div>
        
        <div style={{ flex: 1, padding: '12px', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          {embedUrl ? (
            <div style={{ width: '100%', flex: 1, borderRadius: '14px', overflow: 'hidden', background: '#000' }}>
              <iframe src={embedUrl} style={{ width: '100%', height: '100%', border: 'none' }} allowFullScreen allow="autoplay; clipboard-write; encrypted-media; picture-in-picture" />
            </div>
          ) : clip.link ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <a href={clip.link} target="_blank" rel="noopener noreferrer" style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', padding: '30px 50px',
                background: clip.platform === 'Tik Tok' ? 'linear-gradient(135deg, #010101, #69C9D0)' : 'linear-gradient(45deg, #f09433, #dc2743)',
                borderRadius: '16px', color: '#fff', textDecoration: 'none', fontWeight: '600'
              }}>
                <PlatformIcon platform={clip.platform} size={40} />
                <span>Otvori na {clip.platform}</span>
              </a>
            </div>
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.4)' }}>
              Link nije dostupan
            </div>
          )}
        </div>
      </div>
    </>
  );
};

// Package Tracking Section - COLLAPSIBLE with Airtable integration
const PackageSection = ({ shipments = [], summary = {}, onAddPackage, onUpdateStatus, onDeleteShipment, isExpanded, onToggle, loading, campaigns = [] }) => {
  const waiting = summary.waiting || 0;
  const inTransit = summary.inTransit || 0;
  const delivered = summary.delivered || 0;
  const total = summary.total || 0;
  
  // Group shipments by campaign
  const shipmentsByCampaign = shipments.reduce((acc, shipment) => {
    const campaignKey = shipment.contractMonthId || 'unknown';
    const campaignName = shipment.contractMonthName || 'Bez kampanje';
    if (!acc[campaignKey]) {
      acc[campaignKey] = { name: campaignName, shipments: [] };
    }
    acc[campaignKey].shipments.push(shipment);
    return acc;
  }, {});
  
  return (
    <div style={{ marginBottom: '20px' }}>
      {/* Toggle Button */}
      <button onClick={onToggle} style={{
        width: '100%', padding: '16px 24px',
        background: isExpanded ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(59, 130, 246, 0.1))' : 'rgba(255,255,255,0.03)',
        border: isExpanded ? '1px solid rgba(139, 92, 246, 0.4)' : '1px solid rgba(255,255,255,0.08)',
        borderRadius: isExpanded ? '16px 16px 0 0' : '16px',
        color: '#fff', cursor: 'pointer', transition: 'all 0.3s ease',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '24px' }}>📦</span>
          <span style={{ fontSize: '17px', fontWeight: '700' }}>Praćenje paketa</span>
          {total > 0 && (
            <span style={{ fontSize: '13px', padding: '4px 12px', borderRadius: '20px', background: 'rgba(139, 92, 246, 0.3)', color: '#a78bfa', fontWeight: '700' }}>
              {total}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {!isExpanded && total > 0 && (
            <div style={{ display: 'flex', gap: '16px', fontSize: '14px', fontWeight: '600' }}>
              <span style={{ color: '#f97316' }}>⏳ {waiting}</span>
              <span style={{ color: '#3b82f6' }}>🚚 {inTransit}</span>
              <span style={{ color: '#22c55e' }}>✅ {delivered}</span>
            </div>
          )}
          {loading && <span style={{ fontSize: '14px', color: '#8b5cf6' }}>⟳</span>}
          <span style={{ fontSize: '16px', color: 'rgba(255,255,255,0.4)', transition: 'transform 0.3s', transform: isExpanded ? 'rotate(180deg)' : 'none' }}>▼</span>
        </div>
      </button>
      
      {/* Expanded Content */}
      {isExpanded && (
        <div className="glass" style={{
          borderRadius: '0 0 16px 16px', padding: '24px',
          border: '1px solid rgba(139, 92, 246, 0.4)', borderTop: 'none',
          animation: 'fadeIn 0.3s ease'
        }}>
          {/* Summary Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
            <div style={{ padding: '18px', background: 'rgba(249, 115, 22, 0.1)', borderRadius: '14px', border: '1px solid rgba(249, 115, 22, 0.3)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <span style={{ fontSize: '20px' }}>⏳</span>
                <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', fontWeight: '700', letterSpacing: '0.5px' }}>ČEKA SLANJE</span>
              </div>
              <p style={{ fontSize: '36px', fontWeight: '800', margin: 0, color: '#f97316' }}>{waiting}</p>
            </div>
            
            <div style={{ padding: '18px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '14px', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <span style={{ fontSize: '20px' }}>🚚</span>
                <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', fontWeight: '700', letterSpacing: '0.5px' }}>U DOSTAVI</span>
              </div>
              <p style={{ fontSize: '36px', fontWeight: '800', margin: 0, color: '#3b82f6' }}>{inTransit}</p>
            </div>
            
            <div style={{ padding: '18px', background: 'rgba(34, 197, 94, 0.1)', borderRadius: '14px', border: '1px solid rgba(34, 197, 94, 0.3)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <span style={{ fontSize: '20px' }}>✅</span>
                <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', fontWeight: '700', letterSpacing: '0.5px' }}>DOSTAVLJENO</span>
              </div>
              <p style={{ fontSize: '36px', fontWeight: '800', margin: 0, color: '#22c55e' }}>{delivered}</p>
            </div>
          </div>
          
          {/* Shipments grouped by campaign */}
          {Object.keys(shipmentsByCampaign).length > 0 ? (
            <div style={{ marginBottom: '20px' }}>
              {Object.entries(shipmentsByCampaign).map(([campaignId, { name, shipments: campaignShipments }]) => (
                <div key={campaignId} style={{ marginBottom: '20px' }}>
                  {/* Campaign Header */}
                  <div style={{ 
                    padding: '12px 16px', 
                    background: 'rgba(139, 92, 246, 0.1)', 
                    borderRadius: '10px', 
                    marginBottom: '12px',
                    border: '1px solid rgba(139, 92, 246, 0.2)'
                  }}>
                    <span style={{ fontSize: '14px', fontWeight: '700', color: '#a78bfa' }}>
                      📋 {name}
                    </span>
                    <span style={{ 
                      fontSize: '12px', 
                      color: 'rgba(255,255,255,0.5)', 
                      marginLeft: '12px' 
                    }}>
                      ({campaignShipments.length} {campaignShipments.length === 1 ? 'paket' : 'paketa'})
                    </span>
                  </div>
                  
                  {/* Shipments for this campaign */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {campaignShipments.map((shipment) => (
                      <ShipmentCard 
                        key={shipment.id} 
                        shipment={shipment} 
                        onUpdateStatus={onUpdateStatus}
                        onDelete={onDeleteShipment}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ 
              padding: '40px', 
              textAlign: 'center', 
              color: 'rgba(255,255,255,0.4)',
              background: 'rgba(255,255,255,0.02)',
              borderRadius: '12px',
              marginBottom: '20px'
            }}>
              <span style={{ fontSize: '40px', display: 'block', marginBottom: '12px' }}>📭</span>
              <p style={{ margin: 0, fontSize: '15px' }}>Nema paketa za prikaz</p>
            </div>
          )}
          
          <button onClick={onAddPackage} style={{
            width: '100%', padding: '16px',
            background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
            border: 'none', borderRadius: '12px', color: '#fff',
            fontSize: '15px', fontWeight: '700', cursor: 'pointer',
            transition: 'transform 0.2s, box-shadow 0.2s'
          }}
          onMouseEnter={(e) => { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 10px 30px rgba(139, 92, 246, 0.4)'; }}
          onMouseLeave={(e) => { e.target.style.transform = 'none'; e.target.style.boxShadow = 'none'; }}>
            + Dodaj novi paket
          </button>
        </div>
      )}
    </div>
  );
};

// Shipment Card Component - redesigned with better info display
const ShipmentCard = ({ shipment, onUpdateStatus, onDelete }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  
  const statusColors = {
    'Čeka slanje': { bg: 'rgba(249, 115, 22, 0.15)', color: '#f97316', icon: '⏳', border: 'rgba(249, 115, 22, 0.3)' },
    'U dostavi': { bg: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', icon: '🚚', border: 'rgba(59, 130, 246, 0.3)' },
    'Dostavljeno': { bg: 'rgba(34, 197, 94, 0.15)', color: '#22c55e', icon: '✅', border: 'rgba(34, 197, 94, 0.3)' }
  };
  
  const statusFlow = ['Čeka slanje', 'U dostavi', 'Dostavljeno'];
  const currentIndex = statusFlow.indexOf(shipment.status);
  const canGoBack = currentIndex > 0;
  const canGoForward = currentIndex < statusFlow.length - 1;
  const prevStatus = canGoBack ? statusFlow[currentIndex - 1] : null;
  const nextStatus = canGoForward ? statusFlow[currentIndex + 1] : null;
  
  const statusStyle = statusColors[shipment.status] || statusColors['Čeka slanje'];
  
  // Extract client name from contractMonthName (format: "ClientName – Month Year")
  const clientName = shipment.contractMonthName?.split(' – ')[0] || 'Nepoznat klijent';
  
  return (
    <div 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => { setIsHovered(false); setShowConfirmDelete(false); }}
      style={{
        padding: '16px 20px',
        background: isHovered ? 'rgba(139, 92, 246, 0.08)' : 'rgba(255,255,255,0.03)',
        borderRadius: '14px', 
        border: `1px solid ${isHovered ? 'rgba(139, 92, 246, 0.3)' : 'rgba(255,255,255,0.08)'}`,
        transition: 'all 0.2s'
      }}
    >
      {/* Top Row: Status icon, Info, Status badge */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '14px' }}>
        {/* Status Icon */}
        <div style={{
          width: '50px', height: '50px', borderRadius: '12px',
          background: statusStyle.bg, 
          border: `1px solid ${statusStyle.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', 
          fontSize: '24px',
          flexShrink: 0
        }}>
          {statusStyle.icon}
        </div>
        
        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Influencer Name - Main */}
          <p style={{ 
            fontSize: '16px', 
            fontWeight: '700', 
            margin: 0, 
            color: '#fff',
            marginBottom: '4px'
          }}>
            {shipment.influencerName || 'Nepoznat influencer'}
          </p>
          
          {/* Client */}
          <p style={{ 
            fontSize: '13px', 
            color: 'rgba(255,255,255,0.6)', 
            margin: '0 0 6px 0',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <span style={{ color: '#a78bfa' }}>🏢</span> {clientName}
          </p>
          
          {/* Package contents */}
          {(shipment.items || shipment.notes) && (
            <p style={{ 
              fontSize: '12px', 
              color: 'rgba(255,255,255,0.5)', 
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <span>📦</span> 
              {Array.isArray(shipment.items) ? shipment.items.join(', ') : shipment.items || shipment.notes || ''}
            </p>
          )}
          
          {/* Tracking number if exists */}
          {shipment.trackingNumber && (
            <p style={{ 
              fontSize: '11px', 
              color: 'rgba(255,255,255,0.4)', 
              margin: '6px 0 0',
              fontFamily: 'monospace',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <span>🔢</span> {shipment.trackingNumber}
            </p>
          )}
        </div>
        
        {/* Status Badge */}
        <div style={{
          padding: '8px 14px',
          borderRadius: '10px',
          background: statusStyle.bg,
          border: `1px solid ${statusStyle.border}`,
          color: statusStyle.color,
          fontSize: '13px',
          fontWeight: '700',
          whiteSpace: 'nowrap'
        }}>
          {shipment.status}
        </div>
      </div>
      
      {/* Bottom Row: Action Buttons */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '10px',
        paddingTop: '14px',
        borderTop: '1px solid rgba(255,255,255,0.06)'
      }}>
        {/* Back Button */}
        {canGoBack && (
          <button
            onClick={() => onUpdateStatus(shipment.id, prevStatus)}
            style={{
              padding: '10px 16px',
              borderRadius: '10px',
              background: 'rgba(249, 115, 22, 0.15)',
              border: '1px solid rgba(249, 115, 22, 0.3)',
              color: '#f97316',
              fontSize: '13px',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            ← Nazad na "{prevStatus}"
          </button>
        )}
        
        {/* Forward Button */}
        {canGoForward && (
          <button
            onClick={() => onUpdateStatus(shipment.id, nextStatus)}
            style={{
              padding: '10px 16px',
              borderRadius: '10px',
              background: 'rgba(34, 197, 94, 0.15)',
              border: '1px solid rgba(34, 197, 94, 0.3)',
              color: '#22c55e',
              fontSize: '13px',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              marginLeft: canGoBack ? '0' : 'auto'
            }}
          >
            Dalje → "{nextStatus}"
          </button>
        )}
        
        {/* Delete Button - only show for delivered */}
        {shipment.status === 'Dostavljeno' && (
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
            {showConfirmDelete ? (
              <>
                <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>Obrisati?</span>
                <button
                  onClick={() => onDelete && onDelete(shipment.id)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '8px',
                    background: 'rgba(239, 68, 68, 0.2)',
                    border: '1px solid rgba(239, 68, 68, 0.4)',
                    color: '#ef4444',
                    fontSize: '12px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  ✓ Da
                </button>
                <button
                  onClick={() => setShowConfirmDelete(false)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '8px',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: 'rgba(255,255,255,0.6)',
                    fontSize: '12px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  ✗ Ne
                </button>
              </>
            ) : (
              <button
                onClick={() => setShowConfirmDelete(true)}
                style={{
                  padding: '8px 14px',
                  borderRadius: '8px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: 'rgba(255,255,255,0.4)',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                🗑️ Ukloni
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Old ShipmentRow kept for compatibility but not used
const ShipmentRow = ({ shipment, onUpdateStatus }) => {
  return <ShipmentCard shipment={shipment} onUpdateStatus={onUpdateStatus} />;
};

// Add Package Modal
const AddPackageModal = ({ isOpen, onClose, onSubmit, campaigns = [] }) => {
  const [selectedCampaign, setSelectedCampaign] = useState('');
  const [selectedInfluencer, setSelectedInfluencer] = useState('');
  const [items, setItems] = useState('');
  const [courier, setCourier] = useState('Pošta');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  if (!isOpen) return null;
  
  const handleSubmit = async () => {
    if (!selectedCampaign || !selectedInfluencer) {
      alert('Molimo izaberite kampanju i influensera');
      return;
    }
    
    setSubmitting(true);
    await onSubmit({
      contractMonthId: selectedCampaign,
      influencerId: selectedInfluencer,
      items,
      courier,
      notes
    });
    setSubmitting(false);
    
    setSelectedCampaign('');
    setSelectedInfluencer('');
    setItems('');
    setNotes('');
  };
  
  const campaignInfluencers = selectedCampaign 
    ? (campaigns.find(c => c.id === selectedCampaign)?.influencers || [])
    : [];
  
  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', zIndex: 200 }} />
      <div className="glass-strong" style={{
        position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        width: '480px', maxWidth: '92vw', padding: '28px', borderRadius: '20px',
        zIndex: 201, animation: 'scaleIn 0.3s ease'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '700', margin: 0, color: '#fff' }}>📦 Novi paket</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', fontSize: '24px', cursor: 'pointer' }}>×</button>
        </div>
        
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginBottom: '6px', fontWeight: '600' }}>KAMPANJA *</label>
          <select value={selectedCampaign} onChange={(e) => { setSelectedCampaign(e.target.value); setSelectedInfluencer(''); }}
            style={{ width: '100%', padding: '12px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '14px', outline: 'none' }}>
            <option value="">Izaberi kampanju...</option>
            {campaigns.map(c => <option key={c.id} value={c.id}>{c.month}</option>)}
          </select>
        </div>
        
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginBottom: '6px', fontWeight: '600' }}>INFLUENSER *</label>
          <select value={selectedInfluencer} onChange={(e) => setSelectedInfluencer(e.target.value)} disabled={!selectedCampaign}
            style={{ width: '100%', padding: '12px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '14px', outline: 'none', opacity: selectedCampaign ? 1 : 0.5 }}>
            <option value="">Izaberi influensera...</option>
            {campaignInfluencers.map(inf => <option key={inf.id} value={inf.id}>{inf.name}</option>)}
          </select>
        </div>
        
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginBottom: '6px', fontWeight: '600' }}>SADRŽAJ PAKETA</label>
          <textarea value={items} onChange={(e) => setItems(e.target.value)} placeholder="Npr: 2x majica M, 1x parfem"
            style={{ width: '100%', padding: '12px', borderRadius: '10px', minHeight: '80px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '14px', outline: 'none', resize: 'vertical' }} />
        </div>
        
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginBottom: '6px', fontWeight: '600' }}>KURIR</label>
          <select value={courier} onChange={(e) => setCourier(e.target.value)}
            style={{ width: '100%', padding: '12px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '14px', outline: 'none' }}>
            <option value="Pošta">Pošta</option>
            <option value="Peuzimanje u knacelariji">Preuzimanje u kancelariji</option>
            <option value="Glovo/Wolt">Glovo/Wolt</option>
            <option value="Kurir">Kurir</option>
          </select>
        </div>
        
        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginBottom: '6px', fontWeight: '600' }}>NAPOMENA</label>
          <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Opciono..."
            style={{ width: '100%', padding: '12px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '14px', outline: 'none' }} />
        </div>
        
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={handleSubmit} disabled={submitting || !selectedCampaign || !selectedInfluencer}
            style={{ flex: 1, padding: '14px', background: submitting ? 'rgba(139, 92, 246, 0.3)' : 'linear-gradient(135deg, #8b5cf6, #6366f1)', border: 'none', borderRadius: '10px', color: '#fff', fontSize: '14px', fontWeight: '600', cursor: submitting ? 'wait' : 'pointer' }}>
            {submitting ? 'Kreiranje...' : '✓ Kreiraj paket'}
          </button>
          <button onClick={onClose}
            style={{ padding: '14px 24px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff', fontSize: '14px', cursor: 'pointer' }}>
            Otkaži
          </button>
        </div>
      </div>
    </>
  );
};

// Section Header
const SectionHeader = ({ icon, title, count }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
    <span style={{ fontSize: '18px' }}>{icon}</span>
    <h2 style={{ fontSize: '16px', fontWeight: '700', margin: 0, color: '#fff' }}>{title}</h2>
    {count !== undefined && (
      <span style={{ fontSize: '11px', fontWeight: '700', padding: '3px 10px', borderRadius: '20px', background: 'rgba(139, 92, 246, 0.3)', color: '#a78bfa' }}>{count}</span>
    )}
  </div>
);

// ============ MAIN COMPONENT ============
export default function CoordinatorDashboard() {
  const router = useRouter();
  const { slug } = router.query;
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedCampaign, setExpandedCampaign] = useState(null);
  const [selectedInfluencer, setSelectedInfluencer] = useState(null);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [packages, setPackages] = useState([]);
  const [packagesExpanded, setPackagesExpanded] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [dateFilter, setDateFilter] = useState('active');
  const [sortBy, setSortBy] = useState('progress');
  
  // Shipments state
  const [shipments, setShipments] = useState([]);
  const [shipmentsSummary, setShipmentsSummary] = useState({});
  const [shipmentsLoading, setShipmentsLoading] = useState(false);
  const [showAddPackageModal, setShowAddPackageModal] = useState(false);

  useEffect(() => {
    if (!slug) return;
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/coordinator/${slug}`);
        if (!res.ok) throw new Error('Failed to fetch');
        const json = await res.json();
        setData(json);
        setLastUpdate(new Date());
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, [slug]);

  // Fetch shipments from Airtable
  const fetchShipments = useCallback(async () => {
    setShipmentsLoading(true);
    try {
      const res = await fetch('/api/shipments');
      if (res.ok) {
        const json = await res.json();
        setShipments(json.shipments || []);
        setShipmentsSummary(json.summary || {});
      }
    } catch (err) {
      console.error('Shipments fetch error:', err);
    } finally {
      setShipmentsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchShipments();
  }, [fetchShipments]);

  // Add package handler
  const handleAddPackage = async (packageData) => {
    try {
      const res = await fetch('/api/shipments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...packageData,
          coordinatorId: data?.user?.id
        })
      });
      
      if (res.ok) {
        alert('✅ Paket je uspešno kreiran!');
        setShowAddPackageModal(false);
        fetchShipments();
      } else {
        const err = await res.json();
        alert(`❌ Greška: ${err.error || 'Neuspešno kreiranje paketa'}`);
      }
    } catch (err) {
      console.error('Add package error:', err);
      alert('❌ Greška pri kreiranju paketa');
    }
  }};

  // Update shipment status
  const handleUpdateStatus = async (shipmentId, newStatus) => {
    try {
      const res = await fetch('/api/shipments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shipmentId, status: newStatus })
      });
      
      if (res.ok) {
        fetchShipments();
      } else {
        alert('❌ Greška pri ažuriranju statusa');
      }
    } catch (err) {
      console.error('Update status error:', err);
    }
  };

  // Delete shipment
  const handleDeleteShipment = async (shipmentId) => {
    try {
      const res = await fetch('/api/shipments', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shipmentId })
      });
      
      if (res.ok) {
        fetchShipments();
      } else {
        alert('❌ Greška pri brisanju paketa');
      }
    } catch (err) {
      console.error('Delete shipment error:', err);
    }
  };

  const filteredCampaigns = useMemo(() => {
    if (!data?.months) return [];
    let filtered = [...data.months];
    
    // Date-based filtering
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();
    
    if (dateFilter === 'active') {
      // Active = started and not ended, or ending this month
      filtered = filtered.filter(c => {
        if (!c.startDate) return false;
        const start = new Date(c.startDate);
        const end = c.endDate ? new Date(c.endDate.split('/').reverse().join('-')) : null;
        // Started and (no end date OR end date is in future or this month)
        return start <= now && (!end || end >= new Date(thisYear, thisMonth, 1));
      });
    } else if (dateFilter === 'thisMonth') {
      filtered = filtered.filter(c => {
        if (!c.startDate) return false;
        const start = new Date(c.startDate);
        return start.getMonth() === thisMonth && start.getFullYear() === thisYear;
      });
    } else if (dateFilter === 'lastMonth') {
      const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;
      const lastMonthYear = thisMonth === 0 ? thisYear - 1 : thisYear;
      filtered = filtered.filter(c => {
        if (!c.startDate) return false;
        const start = new Date(c.startDate);
        return start.getMonth() === lastMonth && start.getFullYear() === lastMonthYear;
      });
    } else if (dateFilter === 'future') {
      filtered = filtered.filter(c => {
        if (!c.startDate) return true;
        const start = new Date(c.startDate);
        return start > now;
      });
    }
    // 'all' shows everything
    
    // Search query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(c => c.month?.toLowerCase().includes(q));
    }
    
    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(c => {
        const s = c.progressStatus?.toLowerCase() || '';
        const rawP = c.percentDelivered || 0;
        const p = rawP > 10 ? rawP : rawP * 100;
        if (statusFilter === 'critical') return s.includes('dead') || s.includes('critical');
        if (statusFilter === 'behind') return s.includes('red') || s.includes('behind');
        if (statusFilter === 'ontrack') return s.includes('yellow');
        if (statusFilter === 'ahead') return s.includes('green') || p >= 100;
        return true;
      });
    }
    
    // Sorting
    filtered.sort((a, b) => {
      if (sortBy === 'progress') {
        return (a.percentDelivered || 0) - (b.percentDelivered || 0); // Lowest first (need attention)
      } else if (sortBy === 'progressDesc') {
        return (b.percentDelivered || 0) - (a.percentDelivered || 0); // Highest first
      } else if (sortBy === 'views') {
        return (b.totalViews || 0) - (a.totalViews || 0);
      } else if (sortBy === 'date') {
        return new Date(b.startDate || 0) - new Date(a.startDate || 0); // Newest first
      } else if (sortBy === 'name') {
        return (a.month || '').localeCompare(b.month || '');
      }
      return 0;
    });
    
    return filtered;
  }, [data?.months, searchQuery, statusFilter, dateFilter, sortBy]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f0f1a, #1a1a2e, #16213e)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '50px', height: '50px', border: '3px solid rgba(139, 92, 246, 0.2)', borderTopColor: '#8b5cf6', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 20px' }} />
          <p style={{ color: 'rgba(255,255,255,0.5)' }}>Učitavanje...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f0f1a, #1a1a2e, #16213e)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
        <div style={{ textAlign: 'center' }}>
          <span style={{ fontSize: '48px' }}>😕</span>
          <h2 style={{ margin: '16px 0 8px' }}>Greška</h2>
          <p style={{ color: 'rgba(255,255,255,0.5)' }}>{error}</p>
          <button onClick={() => window.location.reload()} style={{ marginTop: '16px', padding: '12px 24px', background: '#8b5cf6', border: 'none', borderRadius: '10px', color: '#fff', cursor: 'pointer' }}>
            Pokušaj ponovo
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{data.user?.name} | VOICE Dashboard</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <GlobalStyles />

      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f0f1a, #1a1a2e, #16213e)', color: '#fff', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
        <main style={{ maxWidth: '1600px', margin: '0 auto', padding: '28px' }}>
          
          {/* Header */}
          <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
            <div>
              <h1 style={{ fontSize: '32px', fontWeight: '800', margin: '0 0 6px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                👋 {data.user?.name}
              </h1>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', margin: 0 }}>
                {data.user?.role === 'HOD' ? '🎯 HOD • Vidiš sve kampanje' : '📊 Coordinator'}
              </p>
            </div>
            <LiveIndicator />
          </header>

          {/* Stats Grid - ALL FLIP! */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px', marginBottom: '28px' }}>
            <FlipStatCard icon="📊" label="Aktivne kampanje" value={data.summary?.activeMonths || 0} gradient="purple" size="large"
                          items={filteredCampaigns.slice(0, 10).map(c => ({ ...c, name: c.month, views: c.totalViews, link: '#' }))} />
            <FlipStatCard icon="✋" label="Nove prijave" value={data.summary?.pendingApplications || 0}
                          subValue={data.summary?.pendingOffers ? `+ ${data.summary.pendingOffers} ponuda` : null} gradient="green"
                          items={data.offers?.applications || []} />
            <FlipStatCard icon="✅" label="Prihvatili danas" value={data.summary?.acceptedToday || 0} gradient="blue"
                          items={data.offers?.acceptedToday || []} />
            <FlipStatCard icon="❌" label="Odbili danas" value={data.summary?.declinedToday || 0} gradient="red"
                          items={data.offers?.declinedToday || []} />
            <FlipStatCard icon="🎬" label="Objavljeno danas" value={data.summary?.publishedToday || 0}
                          subValue={data.summary?.viewsToday ? `${formatNumber(data.summary.viewsToday)} views` : null} gradient="pink"
                          items={data.clips?.publishedToday || []} />
          </div>

          {/* Package Section - Collapsible */}
          <PackageSection shipments={shipments} summary={shipmentsSummary} 
                          onAddPackage={() => setShowAddPackageModal(true)} 
                          onUpdateStatus={handleUpdateStatus}
                          onDeleteShipment={handleDeleteShipment}
                          isExpanded={packagesExpanded} onToggle={() => setPackagesExpanded(!packagesExpanded)}
                          loading={shipmentsLoading} />

          {/* Main Content */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '28px' }}>
            
            {/* Left - Campaigns */}
            <div>
              {/* Filters Row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                <SectionHeader icon="📈" title="Kampanje" count={filteredCampaigns.length} />
                
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {/* Date Filter Tabs */}
                  <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '3px' }}>
                    {[
                      { value: 'active', label: '🔥 Aktivne' },
                      { value: 'thisMonth', label: 'Ovaj mesec' },
                      { value: 'lastMonth', label: 'Prošli' },
                      { value: 'future', label: 'Buduće' },
                      { value: 'all', label: 'Sve' }
                    ].map(tab => (
                      <button key={tab.value} onClick={() => setDateFilter(tab.value)}
                              style={{
                                padding: '6px 10px', border: 'none', borderRadius: '6px', cursor: 'pointer',
                                fontSize: '11px', fontWeight: '600', transition: 'all 0.2s',
                                background: dateFilter === tab.value ? 'rgba(139, 92, 246, 0.4)' : 'transparent',
                                color: dateFilter === tab.value ? '#fff' : 'rgba(255,255,255,0.5)'
                              }}>
                        {tab.label}
                      </button>
                    ))}
                  </div>
                  
                  {/* Search */}
                  <input type="text" placeholder="🔍 Pretraži..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                         style={{ padding: '6px 12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', fontSize: '11px', width: '130px', outline: 'none' }} />
                  
                  {/* Status Filter */}
                  <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
                          style={{ padding: '6px 10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', fontSize: '11px', cursor: 'pointer', outline: 'none' }}>
                    <option value="all" style={{ background: '#1a1a2e' }}>Status: Svi</option>
                    <option value="critical" style={{ background: '#1a1a2e' }}>💀 Kritično</option>
                    <option value="behind" style={{ background: '#1a1a2e' }}>🔴 Kasni</option>
                    <option value="ontrack" style={{ background: '#1a1a2e' }}>🟡 Na putu</option>
                    <option value="ahead" style={{ background: '#1a1a2e' }}>🟢 OK</option>
                  </select>
                  
                  {/* Sort */}
                  <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
                          style={{ padding: '6px 10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', fontSize: '11px', cursor: 'pointer', outline: 'none' }}>
                    <option value="progress" style={{ background: '#1a1a2e' }}>⚠️ Treba pažnju</option>
                    <option value="progressDesc" style={{ background: '#1a1a2e' }}>✅ Najbolje prvo</option>
                    <option value="views" style={{ background: '#1a1a2e' }}>👁️ Najviše views</option>
                    <option value="date" style={{ background: '#1a1a2e' }}>📅 Najnovije</option>
                    <option value="name" style={{ background: '#1a1a2e' }}>🔤 Po imenu</option>
                  </select>
                </div>
              </div>
              
              {filteredCampaigns.slice(0, 30).map(campaign => (
                <CampaignCard key={campaign.id} campaign={campaign}
                              isExpanded={expandedCampaign === campaign.id}
                              onToggle={() => setExpandedCampaign(expandedCampaign === campaign.id ? null : campaign.id)}
                              onInfluencerClick={(inf, camp) => { setSelectedInfluencer(inf); setSelectedCampaign(camp); }} />
              ))}
            </div>

            {/* Right Sidebar */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Recently Published */}
              <GlassCard>
                <SectionHeader icon="🎬" title="Nedavno objavljeno" count={data.clips?.publishedRecent?.length || 0} />
                {data.clips?.publishedRecent?.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '400px', overflow: 'auto' }}>
                    {data.clips.publishedRecent.slice(0, 10).map((clip, i) => (
                      <ClipCard key={clip.id || i} clip={clip} />
                    ))}
                  </div>
                ) : (
                  <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', padding: '30px' }}>Nema nedavnih klipova</p>
                )}
              </GlassCard>

              {/* Waiting Content */}
              <GlassCard>
                <SectionHeader icon="⏳" title="Čeka se content" count={data.summary?.waitingContent || 0} />
                {data.clips?.waitingContent?.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '300px', overflow: 'auto' }}>
                    {data.clips.waitingContent.slice(0, 8).map((clip, i) => (
                      <ClipCard key={clip.id || i} clip={clip} />
                    ))}
                  </div>
                ) : (
                  <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', padding: '30px' }}>✨ Svi klipovi završeni</p>
                )}
              </GlassCard>
            </div>
          </div>

          {/* Footer */}
          <footer style={{ marginTop: '40px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.06)', textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '11px' }}>
            Powered by <strong>VOICE</strong>
            {lastUpdate && <span> • Ažurirano: {lastUpdate.toLocaleTimeString('sr-RS')}</span>}
          </footer>
        </main>
      </div>
      
      {selectedInfluencer && (
        <InfluencerDrawer influencer={selectedInfluencer} campaign={selectedCampaign} onClose={() => { setSelectedInfluencer(null); setSelectedCampaign(null); }} />
      )}
      
      {/* Add Package Modal */}
      <AddPackageModal
        isOpen={showAddPackageModal}
        onClose={() => setShowAddPackageModal(false)}
        onSubmit={handleAddPackage}
        campaigns={(data?.months || []).filter(c => {
          // Only show active campaigns (started and not ended)
          if (!c.startDate) return false;
          const now = new Date();
          const start = new Date(c.startDate);
          if (start > now) return false; // Not started yet
          if (c.endDate) {
            const end = new Date(c.endDate.split('/').reverse().join('-'));
            if (end < new Date(now.getFullYear(), now.getMonth(), 1)) return false; // Ended
          }
          return true;
        })}
      />
    </>
  );
}
