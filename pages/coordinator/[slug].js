// pages/coordinator/[slug].js - Fancy Coordinator Dashboard v3
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

const formatPercent = (num) => {
  if (!num || isNaN(num)) return '0%';
  const val = num > 1 ? num : num * 100;
  return Math.round(val) + '%';
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
    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.4; transform: scale(0.85); }
    }
    @keyframes glow {
      0%, 100% { box-shadow: 0 0 4px #22c55e, 0 0 8px #22c55e; }
      50% { box-shadow: 0 0 8px #22c55e, 0 0 20px #22c55e, 0 0 30px rgba(34, 197, 94, 0.4); }
    }
    @keyframes shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes slideDown {
      from { opacity: 0; max-height: 0; transform: translateY(-10px); }
      to { opacity: 1; max-height: 1000px; transform: translateY(0); }
    }
    @keyframes slideInRight {
      from { opacity: 0; transform: translateX(100%); }
      to { opacity: 1; transform: translateX(0); }
    }
    @keyframes slideOutRight {
      from { opacity: 1; transform: translateX(0); }
      to { opacity: 0; transform: translateX(100%); }
    }
    @keyframes scaleIn {
      from { opacity: 0; transform: scale(0.9); }
      to { opacity: 1; transform: scale(1); }
    }
    @keyframes gradientShift {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
    @keyframes confetti {
      0% { transform: translateY(0) rotate(0deg); opacity: 1; }
      100% { transform: translateY(-100px) rotate(720deg); opacity: 0; }
    }
    @keyframes borderGlow {
      0%, 100% { border-color: rgba(139, 92, 246, 0.3); }
      50% { border-color: rgba(139, 92, 246, 0.6); }
    }
    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-5px); }
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    
    /* Custom scrollbar */
    ::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }
    ::-webkit-scrollbar-track {
      background: rgba(255,255,255,0.05);
      border-radius: 4px;
    }
    ::-webkit-scrollbar-thumb {
      background: rgba(139, 92, 246, 0.4);
      border-radius: 4px;
    }
    ::-webkit-scrollbar-thumb:hover {
      background: rgba(139, 92, 246, 0.6);
    }

    /* Glassmorphism */
    .glass {
      background: rgba(255, 255, 255, 0.03);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.08);
    }
    
    .glass-strong {
      background: rgba(15, 15, 30, 0.8);
      backdrop-filter: blur(40px);
      -webkit-backdrop-filter: blur(40px);
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
  `}</style>
);

// ============ COMPONENTS ============

// Live Indicator
const LiveIndicator = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
    <div style={{
      width: '8px', height: '8px', borderRadius: '50%',
      background: '#22c55e',
      animation: 'pulse 2s ease-in-out infinite, glow 2s ease-in-out infinite'
    }} />
    <span style={{ fontSize: '11px', fontWeight: '600', color: '#22c55e', textTransform: 'uppercase', letterSpacing: '1px' }}>
      Live
    </span>
  </div>
);

// Gradient Border Card
const GlassCard = ({ children, gradient = false, hover = true, onClick, style = {}, className = '' }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`glass ${className}`}
      style={{
        borderRadius: '20px',
        padding: '24px',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: isHovered && hover && onClick ? 'translateY(-4px)' : 'none',
        boxShadow: isHovered && hover ? '0 25px 50px rgba(0,0,0,0.4)' : '0 4px 20px rgba(0,0,0,0.2)',
        border: gradient && isHovered 
          ? '1px solid rgba(139, 92, 246, 0.5)' 
          : '1px solid rgba(255,255,255,0.08)',
        ...style
      }}
    >
      {gradient && (
        <div style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '20px',
          padding: '1px',
          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(236, 72, 153, 0.3), rgba(59, 130, 246, 0.3))',
          backgroundSize: '200% 200%',
          animation: isHovered ? 'gradientShift 3s ease infinite' : 'none',
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
          pointerEvents: 'none',
          opacity: isHovered ? 1 : 0,
          transition: 'opacity 0.3s ease'
        }} />
      )}
      {children}
    </div>
  );
};

// Stat Card with animated counter
const StatCard = ({ icon, label, value, subValue, gradient = 'purple', size = 'normal', onClick }) => {
  const [displayValue, setDisplayValue] = useState(0);
  const isLarge = size === 'large';
  
  const gradients = {
    purple: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(99, 102, 241, 0.1))',
    green: 'linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(16, 185, 129, 0.1))',
    blue: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(99, 102, 241, 0.1))',
    orange: 'linear-gradient(135deg, rgba(249, 115, 22, 0.15), rgba(234, 179, 8, 0.1))',
    red: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(236, 72, 153, 0.1))',
    pink: 'linear-gradient(135deg, rgba(236, 72, 153, 0.15), rgba(139, 92, 246, 0.1))'
  };
  
  useEffect(() => {
    const numValue = parseInt(value) || 0;
    const duration = 1000;
    const steps = 30;
    const stepValue = numValue / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += stepValue;
      if (current >= numValue) {
        setDisplayValue(numValue);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, duration / steps);
    
    return () => clearInterval(timer);
  }, [value]);

  return (
    <GlassCard gradient hover onClick={onClick} style={{ background: gradients[gradient], position: 'relative', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
        <span style={{ fontSize: isLarge ? '28px' : '22px' }}>{icon}</span>
        <span style={{ 
          fontSize: '11px', 
          color: 'rgba(255,255,255,0.5)', 
          textTransform: 'uppercase', 
          letterSpacing: '0.5px',
          fontWeight: '600'
        }}>{label}</span>
      </div>
      <p style={{ 
        fontSize: isLarge ? '48px' : '36px', 
        fontWeight: '800', 
        margin: 0, 
        color: '#fff',
        lineHeight: 1,
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>{displayValue}</p>
      {subValue && (
        <p style={{ 
          fontSize: '13px', 
          color: 'rgba(255,255,255,0.5)', 
          margin: '8px 0 0', 
          fontWeight: '500' 
        }}>{subValue}</p>
      )}
    </GlassCard>
  );
};

// Progress Bar with gradient
const ProgressBar = ({ percent, showLabel = true, size = 'normal', animated = true }) => {
  const height = size === 'small' ? '6px' : size === 'large' ? '12px' : '8px';
  const actualPercent = Math.min(Math.max(percent || 0, 0), 100);
  
  const getGradient = () => {
    if (percent >= 100) return 'linear-gradient(90deg, #22c55e, #10b981, #34d399)';
    if (percent >= 70) return 'linear-gradient(90deg, #8b5cf6, #6366f1, #a78bfa)';
    if (percent >= 40) return 'linear-gradient(90deg, #f59e0b, #eab308, #fbbf24)';
    return 'linear-gradient(90deg, #ef4444, #f97316, #fb923c)';
  };
  
  return (
    <div style={{ width: '100%' }}>
      <div style={{ 
        height, 
        background: 'rgba(255,255,255,0.08)', 
        borderRadius: '100px', 
        overflow: 'hidden',
        position: 'relative'
      }}>
        <div style={{
          height: '100%',
          width: `${actualPercent}%`,
          background: getGradient(),
          backgroundSize: '200% 100%',
          borderRadius: '100px',
          transition: animated ? 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
          animation: animated ? 'shimmer 2s infinite' : 'none',
          boxShadow: percent >= 70 ? '0 0 20px rgba(139, 92, 246, 0.4)' : 'none'
        }} />
      </div>
      {showLabel && (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'flex-end', 
          marginTop: '6px' 
        }}>
          <span style={{ 
            fontSize: '13px', 
            fontWeight: '700',
            color: percent >= 100 ? '#22c55e' : percent >= 70 ? '#a78bfa' : '#fff'
          }}>
            {Math.round(percent)}%
            {percent >= 100 && ' ✨'}
          </span>
        </div>
      )}
    </div>
  );
};

// Status Badge with icon
const StatusBadge = ({ status }) => {
  const getStyle = () => {
    const s = status?.toLowerCase() || '';
    if (s.includes('overdelivery') || (s.includes('green') && s.includes('over'))) 
      return { bg: 'rgba(34, 197, 94, 0.25)', color: '#22c55e', icon: '💚', label: 'Super' };
    if (s.includes('green') || s.includes('on track')) 
      return { bg: 'rgba(34, 197, 94, 0.2)', color: '#4ade80', icon: '🟢', label: 'OK' };
    if (s.includes('yellow')) 
      return { bg: 'rgba(234, 179, 8, 0.2)', color: '#fbbf24', icon: '🟡', label: 'Prati' };
    if (s.includes('falling') || s.includes('hard red')) 
      return { bg: 'rgba(249, 115, 22, 0.2)', color: '#fb923c', icon: '🟠', label: 'Kasni' };
    if (s.includes('red') || s.includes('behind')) 
      return { bg: 'rgba(239, 68, 68, 0.2)', color: '#f87171', icon: '🔴', label: 'Kasni' };
    if (s.includes('dead') || s.includes('critical')) 
      return { bg: 'rgba(239, 68, 68, 0.3)', color: '#ef4444', icon: '🚨', label: 'Kritično' };
    return { bg: 'rgba(156, 163, 175, 0.2)', color: '#9ca3af', icon: '⚪', label: '-' };
  };
  
  const style = getStyle();
  
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      padding: '6px 12px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: '600',
      background: style.bg,
      color: style.color
    }}>
      <span>{style.icon}</span>
      <span>{style.label}</span>
    </span>
  );
};

// Campaign Card with expand animation
const CampaignCard = ({ campaign, isExpanded, onToggle, onInfluencerClick, clips }) => {
  const [isHovered, setIsHovered] = useState(false);
  const percent = (campaign.percentDelivered || 0) * 100;
  const campaignClips = clips?.filter(c => c.contractMonthId === campaign.id) || [];
  
  return (
    <div style={{ marginBottom: '12px' }}>
      <div
        onClick={onToggle}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="glass"
        style={{
          borderRadius: isExpanded ? '20px 20px 0 0' : '20px',
          padding: '20px 24px',
          cursor: 'pointer',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          transform: isHovered && !isExpanded ? 'translateX(8px)' : 'none',
          border: isExpanded 
            ? '1px solid rgba(139, 92, 246, 0.4)' 
            : isHovered 
              ? '1px solid rgba(139, 92, 246, 0.3)' 
              : '1px solid rgba(255,255,255,0.06)',
          borderBottom: isExpanded ? 'none' : undefined,
          background: isExpanded 
            ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(59, 130, 246, 0.05))'
            : isHovered 
              ? 'rgba(255,255,255,0.04)' 
              : 'rgba(255,255,255,0.02)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
            {/* Campaign Avatar */}
            <div style={{
              width: '52px',
              height: '52px',
              borderRadius: '14px',
              background: percent >= 100 
                ? 'linear-gradient(135deg, #22c55e, #10b981)' 
                : 'linear-gradient(135deg, #8b5cf6, #6366f1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '22px',
              fontWeight: '700',
              color: '#fff',
              flexShrink: 0,
              boxShadow: isHovered ? '0 8px 25px rgba(139, 92, 246, 0.3)' : 'none',
              transition: 'box-shadow 0.3s ease'
            }}>
              {percent >= 100 ? '✓' : campaign.month?.charAt(0) || '?'}
            </div>
            
            {/* Campaign Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <h3 style={{ 
                fontSize: '16px', 
                fontWeight: '700', 
                margin: 0, 
                color: '#fff',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {campaign.month}
              </h3>
              <p style={{ 
                fontSize: '13px', 
                color: 'rgba(255,255,255,0.5)', 
                margin: '4px 0 0',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <span>{formatNumber(campaign.totalViews)} / {formatNumber(campaign.campaignGoal)}</span>
                <span style={{ color: 'rgba(255,255,255,0.3)' }}>•</span>
                <span>{campaign.publishedClips || 0} klipova</span>
                {campaign.influencers?.length > 0 && (
                  <>
                    <span style={{ color: 'rgba(255,255,255,0.3)' }}>•</span>
                    <span>{campaign.influencers.length} influensera</span>
                  </>
                )}
              </p>
            </div>
          </div>
          
          {/* Right side */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ width: '120px' }}>
              <ProgressBar percent={percent} showLabel={false} size="small" />
            </div>
            <span style={{ 
              fontSize: '18px', 
              fontWeight: '800',
              color: percent >= 100 ? '#22c55e' : percent >= 70 ? '#a78bfa' : percent >= 40 ? '#fbbf24' : '#f87171',
              minWidth: '50px',
              textAlign: 'right'
            }}>
              {Math.round(percent)}%
            </span>
            <StatusBadge status={campaign.progressStatus} />
            <span style={{
              fontSize: '20px',
              color: 'rgba(255,255,255,0.4)',
              transition: 'transform 0.3s ease',
              transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)'
            }}>
              ▼
            </span>
          </div>
        </div>
      </div>
      
      {/* Expanded Content */}
      {isExpanded && (
        <div
          className="glass"
          style={{
            borderRadius: '0 0 20px 20px',
            padding: '24px',
            border: '1px solid rgba(139, 92, 246, 0.4)',
            borderTop: 'none',
            animation: 'fadeIn 0.3s ease',
            background: 'rgba(139, 92, 246, 0.03)'
          }}
        >
          {/* Campaign Stats Row */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(4, 1fr)', 
            gap: '16px',
            marginBottom: '24px'
          }}>
            <div style={{ textAlign: 'center', padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>
              <p style={{ fontSize: '24px', fontWeight: '800', margin: 0, color: '#fff' }}>
                {formatNumber(campaign.totalViews)}
              </p>
              <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', margin: '4px 0 0', textTransform: 'uppercase' }}>Views</p>
            </div>
            <div style={{ textAlign: 'center', padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>
              <p style={{ fontSize: '24px', fontWeight: '800', margin: 0, color: '#fff' }}>
                {campaign.publishedClips || 0}
              </p>
              <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', margin: '4px 0 0', textTransform: 'uppercase' }}>Klipova</p>
            </div>
            <div style={{ textAlign: 'center', padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>
              <p style={{ fontSize: '24px', fontWeight: '800', margin: 0, color: '#fff' }}>
                {campaign.influencers?.length || 0}
              </p>
              <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', margin: '4px 0 0', textTransform: 'uppercase' }}>Influensera</p>
            </div>
            <div style={{ textAlign: 'center', padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>
              <p style={{ fontSize: '24px', fontWeight: '800', margin: 0, color: campaign.daysLeft > 10 ? '#fff' : campaign.daysLeft > 5 ? '#fbbf24' : '#ef4444' }}>
                {campaign.daysLeft || 0}
              </p>
              <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', margin: '4px 0 0', textTransform: 'uppercase' }}>Dana ostalo</p>
            </div>
          </div>
          
          {/* Dates */}
          <div style={{ 
            display: 'flex', 
            gap: '24px', 
            marginBottom: '24px',
            padding: '12px 16px',
            background: 'rgba(255,255,255,0.02)',
            borderRadius: '10px'
          }}>
            <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>
              📅 Početak: <strong style={{ color: '#fff' }}>{formatDate(campaign.startDate)}</strong>
            </span>
            <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>
              🏁 Kraj: <strong style={{ color: '#fff' }}>{formatDate(campaign.endDate)}</strong>
            </span>
          </div>
          
          {/* Influencers Section */}
          <div>
            <h4 style={{ 
              fontSize: '14px', 
              fontWeight: '700', 
              margin: '0 0 16px',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span>👥</span> Influenseri na kampanji
              <span style={{
                fontSize: '11px',
                padding: '4px 10px',
                borderRadius: '20px',
                background: 'rgba(139, 92, 246, 0.2)',
                color: '#a78bfa'
              }}>
                {campaign.influencers?.length || 0}
              </span>
            </h4>
            
            {campaign.influencers?.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {/* Header */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 1fr 1fr 1fr',
                  gap: '16px',
                  padding: '10px 16px',
                  fontSize: '11px',
                  color: 'rgba(255,255,255,0.4)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  borderBottom: '1px solid rgba(255,255,255,0.06)'
                }}>
                  <span>Influenser</span>
                  <span>Klipovi</span>
                  <span>Views</span>
                  <span>Poslednji klip</span>
                </div>
                
                {/* Influencer rows */}
                {campaign.influencers.map((inf, i) => (
                  <InfluencerRow 
                    key={inf.id || i} 
                    influencer={inf} 
                    onClick={() => onInfluencerClick(inf, campaign)}
                    campaignId={campaign.id}
                  />
                ))}
              </div>
            ) : (
              <div style={{
                padding: '40px',
                textAlign: 'center',
                color: 'rgba(255,255,255,0.4)',
                background: 'rgba(255,255,255,0.02)',
                borderRadius: '12px'
              }}>
                <span style={{ fontSize: '32px', display: 'block', marginBottom: '12px', opacity: 0.5 }}>👥</span>
                <p style={{ margin: 0 }}>Još uvek nema influensera sa objavljenim klipovima</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Influencer Row
const InfluencerRow = ({ influencer, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        display: 'grid',
        gridTemplateColumns: '2fr 1fr 1fr 1fr',
        gap: '16px',
        alignItems: 'center',
        padding: '14px 16px',
        background: isHovered ? 'rgba(139, 92, 246, 0.15)' : 'rgba(255,255,255,0.02)',
        borderRadius: '12px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        transform: isHovered ? 'translateX(4px)' : 'none',
        border: isHovered ? '1px solid rgba(139, 92, 246, 0.3)' : '1px solid transparent'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          width: '42px',
          height: '42px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '16px',
          fontWeight: '700',
          color: '#fff',
          flexShrink: 0,
          boxShadow: isHovered ? '0 4px 15px rgba(236, 72, 153, 0.4)' : 'none',
          transition: 'box-shadow 0.2s ease'
        }}>
          {influencer.name?.charAt(0)?.toUpperCase() || '?'}
        </div>
        <div style={{ minWidth: 0 }}>
          <p style={{ 
            fontSize: '14px', 
            fontWeight: '600', 
            margin: 0, 
            color: '#fff',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {influencer.name || 'Unknown'}
          </p>
          {isHovered && (
            <span style={{ fontSize: '11px', color: '#a78bfa' }}>Klikni za klipove →</span>
          )}
        </div>
      </div>
      <div>
        <p style={{ fontSize: '18px', fontWeight: '700', margin: 0, color: '#fff' }}>
          {influencer.clips || 0}
        </p>
      </div>
      <div>
        <p style={{ 
          fontSize: '18px', 
          fontWeight: '700', 
          margin: 0, 
          color: influencer.views >= 100000 ? '#22c55e' : '#fff' 
        }}>
          {formatNumber(influencer.views || 0)}
        </p>
      </div>
      <div>
        <p style={{ 
          fontSize: '13px', 
          color: influencer.lastClipDate ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.3)', 
          margin: 0 
        }}>
          {getDaysAgo(influencer.lastClipDate) || 'Nema'}
        </p>
      </div>
    </div>
  );
};

// Clip Card
const ClipCard = ({ clip, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  const hasLink = clip.link && clip.link.length > 0;
  
  const getPlatformStyle = () => {
    switch(clip.platform) {
      case 'Tik Tok':
        return { bg: 'linear-gradient(135deg, #000, #25f4ee)', icon: '🎵' };
      case 'Instagram':
        return { bg: 'linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)', icon: '📸' };
      case 'Youtube':
        return { bg: 'linear-gradient(135deg, #ff0000, #cc0000)', icon: '▶️' };
      default:
        return { bg: 'linear-gradient(135deg, #6366f1, #8b5cf6)', icon: '🎬' };
    }
  };
  
  const platformStyle = getPlatformStyle();
  
  return (
    <div
      onClick={() => onClick ? onClick(clip) : (hasLink && window.open(clip.link, '_blank'))}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        padding: '14px 16px',
        background: isHovered ? 'rgba(139, 92, 246, 0.15)' : 'rgba(255,255,255,0.02)',
        borderRadius: '14px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        transform: isHovered ? 'scale(1.02)' : 'none',
        border: isHovered ? '1px solid rgba(139, 92, 246, 0.4)' : '1px solid rgba(255,255,255,0.06)',
        boxShadow: isHovered ? '0 10px 30px rgba(0,0,0,0.3)' : 'none'
      }}
    >
      <div style={{
        width: '48px',
        height: '48px',
        borderRadius: '12px',
        background: platformStyle.bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '22px',
        position: 'relative',
        flexShrink: 0
      }}>
        {platformStyle.icon}
        {hasLink && (
          <div style={{
            position: 'absolute',
            bottom: '-4px',
            right: '-4px',
            width: '18px',
            height: '18px',
            borderRadius: '50%',
            background: '#22c55e',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '10px',
            border: '2px solid #0f0f1a'
          }}>
            ↗
          </div>
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ 
          fontSize: '14px', 
          fontWeight: '600', 
          margin: 0, 
          color: '#fff',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}>
          {clip.influencerName || 'Unknown'}
        </p>
        <p style={{ 
          fontSize: '12px', 
          color: 'rgba(255,255,255,0.5)', 
          margin: '2px 0 0',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}>
          {clip.clientName || 'N/A'}
        </p>
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <p style={{ fontSize: '16px', fontWeight: '700', margin: 0, color: clip.views >= 50000 ? '#22c55e' : '#fff' }}>
          {formatNumber(clip.views || 0)}
        </p>
        <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', margin: '2px 0 0' }}>
          {getDaysAgo(clip.publishDate) || '-'}
        </p>
      </div>
    </div>
  );
};

// Side Drawer for Influencer Clips
const InfluencerDrawer = ({ influencer, campaign, clips, onClose }) => {
  const [selectedClip, setSelectedClip] = useState(null);
  
  if (!influencer) return null;
  
  // Use clips from influencer object (from API) or filter from all clips
  const influencerClips = influencer.clipsList || (clips || []).filter(c => {
    const nameMatch = c.influencerName?.toLowerCase() === influencer.name?.toLowerCase();
    const idMatch = c.influencerId === influencer.id;
    return nameMatch || idMatch;
  });
  
  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
          zIndex: 100,
          animation: 'fadeIn 0.2s ease'
        }}
      />
      
      {/* Drawer */}
      <div
        className="glass-strong"
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: '500px',
          maxWidth: '90vw',
          zIndex: 101,
          animation: 'slideInRight 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          display: 'flex',
          flexDirection: 'column',
          borderLeft: '1px solid rgba(139, 92, 246, 0.3)'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '24px',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            fontWeight: '700',
            color: '#fff'
          }}>
            {influencer.name?.charAt(0)?.toUpperCase() || '?'}
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: '20px', fontWeight: '700', margin: 0, color: '#fff' }}>
              {influencer.name || 'Unknown'}
            </h2>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', margin: '4px 0 0' }}>
              {campaign?.month || 'Kampanja'}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              color: '#fff',
              fontSize: '20px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.2s ease'
            }}
            onMouseEnter={(e) => e.target.style.background = 'rgba(239, 68, 68, 0.3)'}
            onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
          >
            ✕
          </button>
        </div>
        
        {/* Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '12px',
          padding: '20px 24px',
          borderBottom: '1px solid rgba(255,255,255,0.06)'
        }}>
          <div style={{ textAlign: 'center', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>
            <p style={{ fontSize: '24px', fontWeight: '800', margin: 0, color: '#fff' }}>{influencer.clips || 0}</p>
            <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', margin: '4px 0 0', textTransform: 'uppercase' }}>Klipova</p>
          </div>
          <div style={{ textAlign: 'center', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>
            <p style={{ fontSize: '24px', fontWeight: '800', margin: 0, color: '#22c55e' }}>{formatNumber(influencer.views || 0)}</p>
            <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', margin: '4px 0 0', textTransform: 'uppercase' }}>Views</p>
          </div>
          <div style={{ textAlign: 'center', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>
            <p style={{ fontSize: '14px', fontWeight: '600', margin: 0, color: '#fff' }}>{getDaysAgo(influencer.lastClipDate) || '-'}</p>
            <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', margin: '4px 0 0', textTransform: 'uppercase' }}>Poslednji</p>
          </div>
        </div>
        
        {/* Clips List */}
        <div style={{ flex: 1, overflow: 'auto', padding: '20px 24px' }}>
          <h3 style={{ 
            fontSize: '14px', 
            fontWeight: '600', 
            margin: '0 0 16px',
            color: 'rgba(255,255,255,0.7)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span>🎬</span> Klipovi
            <span style={{
              fontSize: '11px',
              padding: '3px 8px',
              borderRadius: '12px',
              background: 'rgba(139, 92, 246, 0.2)',
              color: '#a78bfa'
            }}>
              {influencerClips.length}
            </span>
          </h3>
          
          {influencerClips.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {influencerClips.map((clip, i) => (
                <ClipCard 
                  key={clip.id || i} 
                  clip={clip} 
                  onClick={() => setSelectedClip(clip)}
                />
              ))}
            </div>
          ) : (
            <div style={{
              padding: '40px',
              textAlign: 'center',
              color: 'rgba(255,255,255,0.4)'
            }}>
              <span style={{ fontSize: '32px', display: 'block', marginBottom: '12px' }}>🎬</span>
              <p style={{ margin: 0 }}>Nema klipova za ovog influensera</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Clip Modal */}
      {selectedClip && (
        <ClipModal clip={selectedClip} onClose={() => setSelectedClip(null)} />
      )}
    </>
  );
};

// Clip Modal with video embed
const ClipModal = ({ clip, onClose }) => {
  if (!clip) return null;
  
  const getTikTokEmbed = (url) => {
    // Extract video ID from TikTok URL
    const match = url?.match(/video\/(\d+)/) || url?.match(/\/v\/(\d+)/);
    if (match) {
      return `https://www.tiktok.com/embed/v2/${match[1]}`;
    }
    return null;
  };
  
  const embedUrl = clip.platform === 'Tik Tok' ? getTikTokEmbed(clip.link) : null;
  
  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.8)',
          backdropFilter: 'blur(8px)',
          zIndex: 200,
          animation: 'fadeIn 0.2s ease'
        }}
      />
      
      {/* Modal */}
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '500px',
          maxWidth: '95vw',
          maxHeight: '90vh',
          zIndex: 201,
          animation: 'scaleIn 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          borderRadius: '24px',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
          border: '1px solid rgba(139, 92, 246, 0.3)',
          boxShadow: '0 25px 80px rgba(0,0,0,0.6)'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: '700', margin: 0, color: '#fff' }}>
              {clip.influencerName || 'Clip'}
            </h3>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', margin: '4px 0 0' }}>
              {clip.clientName} • {clip.platform}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              color: '#fff',
              fontSize: '18px',
              cursor: 'pointer'
            }}
          >
            ✕
          </button>
        </div>
        
        {/* Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '1px',
          background: 'rgba(255,255,255,0.1)'
        }}>
          <div style={{ padding: '16px', textAlign: 'center', background: '#1a1a2e' }}>
            <p style={{ fontSize: '24px', fontWeight: '800', margin: 0, color: '#22c55e' }}>
              {formatNumber(clip.views || 0)}
            </p>
            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', margin: '4px 0 0' }}>Views</p>
          </div>
          <div style={{ padding: '16px', textAlign: 'center', background: '#1a1a2e' }}>
            <p style={{ fontSize: '24px', fontWeight: '800', margin: 0, color: '#ec4899' }}>
              {formatNumber(clip.likes || 0)}
            </p>
            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', margin: '4px 0 0' }}>Likes</p>
          </div>
          <div style={{ padding: '16px', textAlign: 'center', background: '#1a1a2e' }}>
            <p style={{ fontSize: '16px', fontWeight: '600', margin: 0, color: '#fff' }}>
              {formatDate(clip.publishDate)}
            </p>
            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', margin: '4px 0 0' }}>Objavljeno</p>
          </div>
        </div>
        
        {/* Video Embed or Link */}
        <div style={{ padding: '24px' }}>
          {embedUrl ? (
            <div style={{
              width: '100%',
              height: '500px',
              borderRadius: '16px',
              overflow: 'hidden',
              background: '#000'
            }}>
              <iframe
                src={embedUrl}
                style={{ width: '100%', height: '100%', border: 'none' }}
                allowFullScreen
                allow="autoplay; encrypted-media"
              />
            </div>
          ) : clip.link ? (
            <a
              href={clip.link}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                padding: '20px',
                background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                borderRadius: '16px',
                color: '#fff',
                textDecoration: 'none',
                fontSize: '16px',
                fontWeight: '600',
                transition: 'transform 0.2s ease'
              }}
              onMouseEnter={(e) => e.target.style.transform = 'scale(1.02)'}
              onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
            >
              <span style={{ fontSize: '24px' }}>🔗</span>
              Otvori {clip.platform} klip
            </a>
          ) : (
            <div style={{
              padding: '40px',
              textAlign: 'center',
              color: 'rgba(255,255,255,0.4)'
            }}>
              <p>Link nije dostupan</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

// Empty State
const EmptyState = ({ icon, message }) => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 20px',
    color: 'rgba(255,255,255,0.4)'
  }}>
    <span style={{ fontSize: '40px', marginBottom: '12px', opacity: 0.5 }}>{icon}</span>
    <p style={{ fontSize: '14px', margin: 0 }}>{message}</p>
  </div>
);

// Section Header
const SectionHeader = ({ icon, title, count, action }) => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    marginBottom: '16px'
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <span style={{ fontSize: '20px' }}>{icon}</span>
      <h2 style={{ fontSize: '18px', fontWeight: '700', margin: 0, color: '#fff' }}>{title}</h2>
      {count !== undefined && (
        <span style={{
          fontSize: '12px',
          fontWeight: '700',
          padding: '4px 12px',
          borderRadius: '20px',
          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(99, 102, 241, 0.2))',
          color: '#a78bfa',
          border: '1px solid rgba(139, 92, 246, 0.3)'
        }}>
          {count}
        </span>
      )}
    </div>
    {action}
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
  const [selectedCampaignForDrawer, setSelectedCampaignForDrawer] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [lastUpdate, setLastUpdate] = useState(null);

  // Fetch data
  useEffect(() => {
    if (!slug) return;
    
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/coordinator/${slug}`);
        if (!res.ok) throw new Error('Failed to fetch');
        const json = await res.json();
        setData(json);
        setLastUpdate(new Date());
        setError(null);
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

  // Filter campaigns
  const filteredCampaigns = useMemo(() => {
    if (!data?.months) return [];
    
    let filtered = [...data.months];
    
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(c => 
        c.month?.toLowerCase().includes(q) ||
        c.clientName?.toLowerCase().includes(q)
      );
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(c => {
        const status = c.progressStatus?.toLowerCase() || '';
        const percent = (c.percentDelivered || 0) * 100;
        switch(statusFilter) {
          case 'critical': return status.includes('dead') || status.includes('critical');
          case 'behind': return status.includes('red') || status.includes('behind') || status.includes('falling');
          case 'ontrack': return status.includes('yellow') || status.includes('track');
          case 'ahead': return status.includes('green') || percent >= 100;
          default: return true;
        }
      });
    }
    
    return filtered;
  }, [data?.months, searchQuery, statusFilter]);

  // All clips for drawer - get from API response
  const allClips = useMemo(() => {
    return data?.clips?.publishedRecent || [];
  }, [data?.clips]);

  // All clips with contract month IDs for proper filtering
  const allClipsWithMonths = useMemo(() => {
    if (!data?.months) return [];
    
    // Collect all clips from all campaigns
    const clipsMap = new Map();
    data.months.forEach(month => {
      if (month.influencers) {
        month.influencers.forEach(inf => {
          // We need to get clips from the API response
        });
      }
    });
    
    return data?.clips?.publishedRecent || [];
  }, [data]);

  // Handle influencer click
  const handleInfluencerClick = useCallback((influencer, campaign) => {
    setSelectedInfluencer(influencer);
    setSelectedCampaignForDrawer(campaign);
  }, []);

  // Close drawer
  const handleCloseDrawer = useCallback(() => {
    setSelectedInfluencer(null);
    setSelectedCampaignForDrawer(null);
  }, []);

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '60px',
            height: '60px',
            border: '3px solid rgba(139, 92, 246, 0.2)',
            borderTopColor: '#8b5cf6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 24px'
          }} />
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>Učitavanje dashboarda...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff'
      }}>
        <div style={{ textAlign: 'center', maxWidth: '400px' }}>
          <span style={{ fontSize: '64px', display: 'block', marginBottom: '24px' }}>😕</span>
          <h2 style={{ fontSize: '24px', marginBottom: '12px' }}>Greška pri učitavanju</h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '24px' }}>{error || 'Nepoznata greška'}</p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '14px 28px',
              background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
              border: 'none',
              borderRadius: '12px',
              color: '#fff',
              fontWeight: '600',
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'transform 0.2s ease'
            }}
            onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
            onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
          >
            Pokušaj ponovo
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{data.user?.name || 'Coordinator'} | VOICE Dashboard</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      
      <GlobalStyles />

      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%)',
        color: '#fff',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        <main style={{ maxWidth: '1600px', margin: '0 auto', padding: '32px' }}>
          
          {/* Header */}
          <header style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'flex-start',
            marginBottom: '40px'
          }}>
            <div>
              <h1 style={{ 
                fontSize: '36px', 
                fontWeight: '800', 
                margin: '0 0 8px',
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                background: 'linear-gradient(135deg, #fff, #a78bfa)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                <span style={{ WebkitTextFillColor: 'initial' }}>👋</span> 
                {data.user?.name}
              </h1>
              <p style={{ 
                fontSize: '14px', 
                color: 'rgba(255,255,255,0.5)', 
                margin: 0 
              }}>
                {data.user?.role === 'HOD' ? '🎯 HOD • Vidiš sve kampanje' : 
                 data.user?.role === 'Admin' ? '⚡ Admin • Pun pristup' : 
                 '📊 Brend Coordinator • Tvoje kampanje'}
              </p>
            </div>
            <LiveIndicator />
          </header>

          {/* Stats Grid */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: '20px',
            marginBottom: '40px'
          }}>
            <StatCard 
              icon="📊" 
              label="Aktivne kampanje" 
              value={data.summary?.activeMonths || 0}
              gradient="purple"
              size="large"
            />
            <StatCard 
              icon="✋" 
              label="Nove prijave" 
              value={data.summary?.pendingApplications || 0}
              subValue={data.summary?.pendingOffers ? `+ ${data.summary.pendingOffers} ponuda` : null}
              gradient="green"
            />
            <StatCard 
              icon="✅" 
              label="Prihvatili danas" 
              value={data.summary?.acceptedToday || 0}
              gradient="blue"
            />
            <StatCard 
              icon="❌" 
              label="Odbili danas" 
              value={data.summary?.declinedToday || 0}
              gradient="red"
            />
            <StatCard 
              icon="🎬" 
              label="Objavljeno danas" 
              value={data.summary?.publishedToday || 0}
              subValue={data.summary?.viewsToday ? `${formatNumber(data.summary.viewsToday)} views` : null}
              gradient="pink"
            />
          </div>

          {/* Main Content */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 380px',
            gap: '32px'
          }}>
            
            {/* Left - Campaigns */}
            <div>
              <SectionHeader 
                icon="📈" 
                title="Aktivne kampanje" 
                count={filteredCampaigns.length}
                action={
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <input
                      type="text"
                      placeholder="🔍 Pretraži..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      style={{
                        padding: '10px 16px',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '10px',
                        color: '#fff',
                        fontSize: '13px',
                        width: '180px',
                        outline: 'none',
                        transition: 'border-color 0.2s ease'
                      }}
                      onFocus={(e) => e.target.style.borderColor = 'rgba(139, 92, 246, 0.5)'}
                      onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                    />
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      style={{
                        padding: '10px 16px',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '10px',
                        color: '#fff',
                        fontSize: '13px',
                        cursor: 'pointer',
                        outline: 'none'
                      }}
                    >
                      <option value="all" style={{ background: '#1a1a2e' }}>Svi statusi</option>
                      <option value="critical" style={{ background: '#1a1a2e' }}>🚨 Kritično</option>
                      <option value="behind" style={{ background: '#1a1a2e' }}>🔴 Kasni</option>
                      <option value="ontrack" style={{ background: '#1a1a2e' }}>🟡 Na putu</option>
                      <option value="ahead" style={{ background: '#1a1a2e' }}>🟢 OK / Done</option>
                    </select>
                  </div>
                }
              />
              
              <div>
                {filteredCampaigns.length === 0 ? (
                  <GlassCard>
                    <EmptyState icon="📭" message="Nema kampanja koje odgovaraju filteru" />
                  </GlassCard>
                ) : (
                  filteredCampaigns.slice(0, 30).map(campaign => (
                    <CampaignCard 
                      key={campaign.id}
                      campaign={campaign}
                      isExpanded={expandedCampaign === campaign.id}
                      onToggle={() => setExpandedCampaign(
                        expandedCampaign === campaign.id ? null : campaign.id
                      )}
                      onInfluencerClick={handleInfluencerClick}
                      clips={allClips}
                    />
                  ))
                )}
              </div>
            </div>

            {/* Right - Sidebar */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* Recent Clips */}
              <GlassCard hover={false}>
                <SectionHeader 
                  icon="🎬" 
                  title="Nedavno objavljeno" 
                  count={data.clips?.publishedRecent?.length || 0}
                />
                
                {data.clips?.publishedRecent?.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {data.clips.publishedRecent.slice(0, 8).map((clip, i) => (
                      <ClipCard key={clip.id || i} clip={clip} />
                    ))}
                  </div>
                ) : (
                  <EmptyState icon="🎥" message="Nema nedavno objavljenih klipova" />
                )}
              </GlassCard>

              {/* Waiting Content */}
              <GlassCard hover={false}>
                <SectionHeader 
                  icon="⏳" 
                  title="Čeka se content" 
                  count={data.clips?.waitingContent?.length || 0}
                />
                
                {data.clips?.waitingContent?.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {data.clips.waitingContent.slice(0, 5).map((clip, i) => (
                      <ClipCard key={clip.id || i} clip={clip} />
                    ))}
                  </div>
                ) : (
                  <EmptyState icon="✨" message="Svi klipovi su završeni" />
                )}
              </GlassCard>
            </div>
          </div>

          {/* Footer */}
          <footer style={{ 
            marginTop: '48px', 
            paddingTop: '24px', 
            borderTop: '1px solid rgba(255,255,255,0.06)',
            textAlign: 'center',
            color: 'rgba(255,255,255,0.3)',
            fontSize: '12px'
          }}>
            Powered by <strong style={{ color: 'rgba(255,255,255,0.5)' }}>VOICE</strong>
            {lastUpdate && (
              <span> • Poslednje ažuriranje: {lastUpdate.toLocaleTimeString('sr-RS')}</span>
            )}
          </footer>
        </main>
      </div>
      
      {/* Influencer Drawer */}
      {selectedInfluencer && (
        <InfluencerDrawer 
          influencer={selectedInfluencer}
          campaign={selectedCampaignForDrawer}
          clips={allClips}
          onClose={handleCloseDrawer}
        />
      )}
    </>
  );
}
