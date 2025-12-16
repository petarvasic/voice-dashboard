// pages/client/[clientId].js - V11 STRIPE STYLE
import { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

const formatNumber = (num) => {
  if (!num || isNaN(num)) return '0';
  const n = parseInt(num);
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return n.toLocaleString();
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('sr-RS', { day: 'numeric', month: 'short', year: 'numeric' });
};

const formatPercent = (num) => {
  if (!num || isNaN(num)) return '0%';
  return num.toFixed(2) + '%';
};

// Stripe-style colors
const colors = {
  primary: '#635bff',
  primaryLight: '#7a73ff',
  primaryDark: '#4b45c6',
  success: '#00d4aa',
  warning: '#ffbb00',
  danger: '#ff5567',
  text: '#0a2540',
  textSecondary: '#425466',
  textMuted: '#8898aa',
  background: '#f6f9fc',
  white: '#ffffff',
  border: '#e6ebf1',
  gradientStart: '#80e9ff',
  gradientMiddle: '#a960ee',
  gradientEnd: '#ff6b6b'
};

// Platform Icon
const PlatformIcon = ({ platform, size = 16 }) => {
  if (platform === 'Tik Tok' || platform === 'TikTok') {
    return (
      <svg viewBox="0 0 24 24" fill="#000000" style={{width: size, height: size}}>
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
      </svg>
    );
  }
  if (platform === 'Instagram') {
    return (
      <svg viewBox="0 0 24 24" fill="#E4405F" style={{width: size, height: size}}>
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
      </svg>
    );
  }
  return null;
};

// Animated gradient background
const GradientOrb = ({ style }) => (
  <div style={{
    position: 'absolute',
    borderRadius: '50%',
    filter: 'blur(80px)',
    opacity: 0.4,
    pointerEvents: 'none',
    ...style
  }} />
);

// Stripe-style Card
const Card = ({ children, className, style, hover = true }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div
      onMouseEnter={() => hover && setIsHovered(true)}
      onMouseLeave={() => hover && setIsHovered(false)}
      style={{
        background: colors.white,
        borderRadius: '16px',
        border: `1px solid ${colors.border}`,
        padding: '24px',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: isHovered 
          ? '0 30px 60px -12px rgba(50,50,93,0.15), 0 18px 36px -18px rgba(0,0,0,0.15)'
          : '0 2px 4px rgba(0,0,0,0.02)',
        transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
        ...style
      }}
    >
      {children}
    </div>
  );
};

// Metric Card Stripe Style
const MetricCard = ({ icon, label, value, trend, onClick, description }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        background: colors.white,
        borderRadius: '12px',
        border: `1px solid ${colors.border}`,
        padding: '20px 24px',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: isHovered 
          ? '0 20px 40px -12px rgba(50,50,93,0.12)'
          : '0 1px 3px rgba(0,0,0,0.04)',
        transform: isHovered ? 'translateY(-1px)' : 'translateY(0)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {isHovered && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
          background: `linear-gradient(90deg, ${colors.gradientStart}, ${colors.gradientMiddle}, ${colors.gradientEnd})`
        }} />
      )}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <p style={{ 
            fontSize: '13px', fontWeight: '500', color: colors.textMuted, 
            margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.5px'
          }}>
            {label}
          </p>
          <p style={{ fontSize: '32px', fontWeight: '600', color: colors.text, margin: 0, letterSpacing: '-1px' }}>
            {value}
          </p>
        </div>
        <div style={{
          width: '48px', height: '48px', borderRadius: '12px',
          background: `linear-gradient(135deg, ${colors.background} 0%, ${colors.white} 100%)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '24px'
        }}>
          {icon}
        </div>
      </div>
      {onClick && isHovered && (
        <p style={{ fontSize: '12px', color: colors.primary, margin: '12px 0 0', fontWeight: '500' }}>
          Klikni za detalje →
        </p>
      )}
    </div>
  );
};

// Progress Ring
const ProgressRing = ({ progress, size = 120, strokeWidth = 8, color = colors.primary }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (Math.min(progress, 100) / 100) * circumference;

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke={colors.border} strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke={color} strokeWidth={strokeWidth}
          strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)' }}
        />
      </svg>
      <div style={{
        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        textAlign: 'center'
      }}>
        <p style={{ fontSize: '28px', fontWeight: '600', color: colors.text, margin: 0 }}>
          {Math.round(progress)}%
        </p>
      </div>
    </div>
  );
};

// Donut Chart Stripe Style
const DonutChart = ({ data, size = 160 }) => {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  if (total === 0) return null;
  
  const strokeWidth = 24;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  let currentOffset = 0;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          {data.map((segment, i) => {
            const percent = segment.value / total;
            const dashLength = circumference * percent;
            const offset = currentOffset;
            currentOffset += dashLength;
            
            return (
              <circle key={i} cx={size / 2} cy={size / 2} r={radius}
                fill="none" stroke={segment.color} strokeWidth={strokeWidth}
                strokeDasharray={`${dashLength} ${circumference}`}
                strokeDashoffset={-offset}
                style={{ transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)' }}
              />
            );
          })}
        </svg>
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          textAlign: 'center'
        }}>
          <p style={{ fontSize: '24px', fontWeight: '600', color: colors.text, margin: 0 }}>{formatNumber(total)}</p>
          <p style={{ fontSize: '12px', color: colors.textMuted, margin: '2px 0 0' }}>ukupno</p>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {data.map((item, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '4px', background: item.color }} />
            <div>
              <p style={{ fontSize: '14px', fontWeight: '500', color: colors.text, margin: 0 }}>{item.name}</p>
              <p style={{ fontSize: '13px', color: colors.textMuted, margin: 0 }}>{formatNumber(item.value)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Platform Split Bars
const PlatformBars = ({ tiktok, instagram }) => {
  const total = tiktok + instagram;
  const tiktokPercent = total > 0 ? (tiktok / total) * 100 : 0;
  const instaPercent = total > 0 ? (instagram / total) * 100 : 0;

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <PlatformIcon platform="TikTok" size={18} />
            <span style={{ fontSize: '14px', fontWeight: '500', color: colors.text }}>TikTok</span>
          </div>
          <span style={{ fontSize: '14px', fontWeight: '600', color: colors.text }}>{formatNumber(tiktok)}</span>
        </div>
        <div style={{ height: '8px', background: colors.background, borderRadius: '4px', overflow: 'hidden' }}>
          <div style={{
            height: '100%', width: `${tiktokPercent}%`,
            background: 'linear-gradient(90deg, #00f2ea, #ff0050)',
            borderRadius: '4px',
            transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
          }} />
        </div>
      </div>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <PlatformIcon platform="Instagram" size={18} />
            <span style={{ fontSize: '14px', fontWeight: '500', color: colors.text }}>Instagram</span>
          </div>
          <span style={{ fontSize: '14px', fontWeight: '600', color: colors.text }}>{formatNumber(instagram)}</span>
        </div>
        <div style={{ height: '8px', background: colors.background, borderRadius: '4px', overflow: 'hidden' }}>
          <div style={{
            height: '100%', width: `${instaPercent}%`,
            background: 'linear-gradient(90deg, #833ab4, #fd1d1d, #fcb045)',
            borderRadius: '4px',
            transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
          }} />
        </div>
      </div>
    </div>
  );
};

// Highlight Card
const HighlightCard = ({ icon, title, name, value, subtext, image, color, link, description, extraInfo, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <div
        onClick={() => setModalOpen(true)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          background: colors.white,
          borderRadius: '12px',
          border: `1px solid ${colors.border}`,
          padding: '20px',
          cursor: 'pointer',
          transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: isHovered ? '0 20px 40px -12px rgba(50,50,93,0.12)' : '0 1px 3px rgba(0,0,0,0.04)',
          transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
          flex: '1 1 200px', minWidth: '200px', position: 'relative', overflow: 'hidden'
        }}
      >
        {isHovered && (
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
            background: color || colors.primary
          }} />
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '16px' }}>
          <span style={{ fontSize: '16px' }}>{icon}</span>
          <span style={{ fontSize: '11px', fontWeight: '600', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{title}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {image !== undefined && (
            <div style={{
              width: '44px', height: '44px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0,
              background: image ? 'transparent' : `linear-gradient(135deg, ${color || colors.primary}, ${colors.primaryLight})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: `2px solid ${colors.background}`
            }}>
              {image ? <img src={image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <span style={{ color: '#fff', fontWeight: '600', fontSize: '16px' }}>{name?.charAt(0) || '?'}</span>}
            </div>
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: '14px', fontWeight: '500', margin: '0 0 4px', color: colors.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</p>
            <p style={{ fontSize: '20px', fontWeight: '600', margin: 0, color: color || colors.primary }}>
              {value} <span style={{ fontSize: '12px', color: colors.textMuted, fontWeight: '400' }}>{subtext}</span>
            </p>
          </div>
        </div>
      </div>
      
      {modalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(10, 37, 64, 0.6)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '20px'
        }} onClick={() => setModalOpen(false)}>
          <div style={{
            background: colors.white, borderRadius: '20px', padding: '32px',
            maxWidth: '420px', width: '100%', boxShadow: '0 40px 80px -20px rgba(0,0,0,0.25)',
            position: 'relative'
          }} onClick={e => e.stopPropagation()}>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <span style={{ fontSize: '48px', display: 'block', marginBottom: '16px' }}>{icon}</span>
              <p style={{ fontSize: '12px', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 8px' }}>{title}</p>
              <h2 style={{ fontSize: '22px', fontWeight: '600', margin: '0 0 4px', color: colors.text }}>{name}</h2>
              <p style={{ fontSize: '28px', fontWeight: '700', margin: 0, color: color || colors.primary }}>
                {value} <span style={{ fontSize: '14px', color: colors.textMuted, fontWeight: '400' }}>{subtext}</span>
              </p>
            </div>
            <div style={{ background: colors.background, borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
              <p style={{ fontSize: '14px', color: colors.textSecondary, margin: 0, lineHeight: '1.6' }}>{description}</p>
              {extraInfo && (
                <p style={{ fontSize: '13px', color: colors.textMuted, margin: '12px 0 0', paddingTop: '12px', borderTop: `1px solid ${colors.border}` }}>{extraInfo}</p>
              )}
            </div>
            {link && (
              <a href={link} target="_blank" rel="noopener noreferrer" style={{
                display: 'block', textAlign: 'center', padding: '14px 20px',
                background: colors.primary, borderRadius: '10px',
                color: '#fff', textDecoration: 'none', fontSize: '14px', fontWeight: '600',
                transition: 'background 0.2s'
              }}>
                Pogledaj klip ↗
              </a>
            )}
            <button onClick={() => setModalOpen(false)} style={{
              position: 'absolute', top: '16px', right: '16px',
              background: colors.background, border: 'none', borderRadius: '50%',
              width: '36px', height: '36px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.textMuted
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
};

// Clips Modal
const ClipsModal = ({ isOpen, onClose, clips, monthName }) => {
  if (!isOpen) return null;
  
  const sortedClips = [...clips].sort((a, b) => (b.views || 0) - (a.views || 0));
  const totalViews = clips.reduce((sum, c) => sum + (c.views || 0), 0);
  const avgViews = clips.length > 0 ? Math.round(totalViews / clips.length) : 0;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(10, 37, 64, 0.6)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: '20px'
    }} onClick={onClose}>
      <div style={{
        background: colors.white, borderRadius: '20px', padding: '28px',
        maxWidth: '560px', width: '100%', boxShadow: '0 40px 80px -20px rgba(0,0,0,0.25)',
        position: 'relative', maxHeight: '80vh', display: 'flex', flexDirection: 'column'
      }} onClick={e => e.stopPropagation()}>
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '600', color: colors.text, margin: '0 0 4px' }}>Svi klipovi</h2>
          <p style={{ fontSize: '14px', color: colors.textMuted, margin: 0 }}>{monthName}</p>
          <div style={{ display: 'flex', gap: '16px', marginTop: '20px' }}>
            <div style={{ background: colors.background, padding: '16px 20px', borderRadius: '12px', flex: 1 }}>
              <p style={{ fontSize: '12px', color: colors.textMuted, margin: '0 0 4px', textTransform: 'uppercase' }}>Ukupno</p>
              <p style={{ fontSize: '24px', fontWeight: '600', margin: 0, color: colors.primary }}>{clips.length}</p>
            </div>
            <div style={{ background: colors.background, padding: '16px 20px', borderRadius: '12px', flex: 1 }}>
              <p style={{ fontSize: '12px', color: colors.textMuted, margin: '0 0 4px', textTransform: 'uppercase' }}>Prosek</p>
              <p style={{ fontSize: '24px', fontWeight: '600', margin: 0, color: colors.success }}>{formatNumber(avgViews)}</p>
            </div>
          </div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {sortedClips.map((clip, i) => (
            <div key={clip.id || i} style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '14px 16px', marginBottom: '8px',
              background: i === 0 ? 'linear-gradient(135deg, rgba(99, 91, 255, 0.08), rgba(99, 91, 255, 0.02))' : colors.background,
              borderRadius: '12px', border: i === 0 ? `1px solid rgba(99, 91, 255, 0.2)` : 'none'
            }}>
              <span style={{ fontSize: '13px', fontWeight: '600', color: i === 0 ? colors.primary : colors.textMuted, width: '24px' }}>#{i + 1}</span>
              <div style={{
                width: '40px', height: '40px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0,
                background: clip.influencerImage ? 'transparent' : `linear-gradient(135deg, ${colors.primary}, ${colors.primaryLight})`,
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                {clip.influencerImage ? <img src={clip.influencerImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <span style={{ color: '#fff', fontWeight: '600', fontSize: '14px' }}>{clip.influencer?.charAt(0)}</span>}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: '14px', fontWeight: '500', margin: 0, color: colors.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{clip.influencer}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                  <PlatformIcon platform={clip.platform} size={12} />
                  <span style={{ fontSize: '12px', color: colors.textMuted }}>{formatDate(clip.publishDate)}</span>
                </div>
              </div>
              <span style={{ fontSize: '16px', fontWeight: '600', color: i === 0 ? colors.primary : colors.text }}>{formatNumber(clip.views)}</span>
              {clip.link && (
                <a href={clip.link} target="_blank" rel="noopener noreferrer" style={{
                  padding: '8px 14px', background: colors.primary, borderRadius: '8px',
                  color: '#fff', textDecoration: 'none', fontSize: '12px', fontWeight: '600'
                }}>↗</a>
              )}
            </div>
          ))}
        </div>
        <button onClick={onClose} style={{
          position: 'absolute', top: '16px', right: '16px',
          background: colors.background, border: 'none', borderRadius: '50%',
          width: '36px', height: '36px', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.textMuted
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
      </div>
    </div>
  );
};

// Metric Modal
const MetricModal = ({ isOpen, onClose, title, data, description }) => {
  if (!isOpen || !data || data.length === 0) return null;

  const sortedData = [...data].sort((a, b) => b.value - a.value);
  const maxValue = Math.max(...sortedData.map(v => v.value), 1);
  const total = sortedData.reduce((sum, v) => sum + v.value, 0);

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(10, 37, 64, 0.6)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: '20px'
    }} onClick={onClose}>
      <div style={{
        background: colors.white, borderRadius: '20px', padding: '32px',
        maxWidth: '480px', width: '100%', boxShadow: '0 40px 80px -20px rgba(0,0,0,0.25)',
        position: 'relative'
      }} onClick={e => e.stopPropagation()}>
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '600', margin: '0 0 8px', color: colors.text }}>{title}</h2>
          {description && <p style={{ fontSize: '14px', color: colors.textMuted, margin: 0 }}>{description}</p>}
          <p style={{ fontSize: '14px', color: colors.textSecondary, margin: '12px 0 0' }}>
            Ukupno: <span style={{ fontWeight: '600', color: colors.text }}>{formatNumber(total)}</span>
          </p>
        </div>
        <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
          {sortedData.map((item, i) => {
            const percent = (item.value / maxValue) * 100;
            return (
              <div key={i} style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '14px', fontWeight: '500', color: colors.text }}>{item.label}</span>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: colors.text }}>{formatNumber(item.value)}</span>
                </div>
                <div style={{ height: '8px', background: colors.background, borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', width: `${percent}%`,
                    background: `linear-gradient(90deg, ${colors.primary}, ${colors.primaryLight})`,
                    borderRadius: '4px', transition: 'width 0.4s ease'
                  }} />
                </div>
              </div>
            );
          })}
        </div>
        <button onClick={onClose} style={{
          position: 'absolute', top: '16px', right: '16px',
          background: colors.background, border: 'none', borderRadius: '50%',
          width: '36px', height: '36px', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.textMuted
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
      </div>
    </div>
  );
};

// Boost Modal
const BoostModal = ({ isOpen, onClose, clientName }) => {
  if (!isOpen) return null;
  
  const packages = [
    { views: '1M', price: '1.900' },
    { views: '2M', price: '3.500', popular: true },
    { views: '3M', price: '4.900' }
  ];
  const TEODORA_PHONE = '381692765209';

  const handleSelect = (pkg) => {
    const message = encodeURIComponent(`Zdravo Teodora! 👋\n\nZainteresovan/a sam za Boost paket.\n\n📊 Detalji:\n• Klijent: ${clientName}\n• Paket: ${pkg.views} pregleda\n• Cena: €${pkg.price}\n\nHvala! 🙏`);
    window.open(`https://wa.me/${TEODORA_PHONE}?text=${message}`, '_blank');
    onClose();
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(10, 37, 64, 0.6)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: '20px'
    }} onClick={onClose}>
      <div style={{
        background: colors.white, borderRadius: '24px', padding: '40px',
        maxWidth: '520px', width: '100%', boxShadow: '0 40px 80px -20px rgba(0,0,0,0.25)',
        position: 'relative'
      }} onClick={e => e.stopPropagation()}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '80px', height: '80px', borderRadius: '50%', margin: '0 auto 20px',
            background: 'linear-gradient(135deg, #25D366, #128C7E)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 12px 24px -8px rgba(37, 211, 102, 0.4)'
          }}>
            <span style={{ color: '#fff', fontSize: '32px', fontWeight: '700' }}>T</span>
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: '600', margin: '0 0 8px', color: colors.text }}>Boost kampanju ⚡</h2>
          <p style={{ fontSize: '14px', color: colors.textMuted, margin: 0 }}>Kontaktirajte Teodoru putem WhatsApp-a</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          {packages.map((pkg, i) => (
            <div key={i} onClick={() => handleSelect(pkg)} style={{
              background: pkg.popular ? `linear-gradient(135deg, ${colors.primary}10, ${colors.primary}05)` : colors.background,
              border: pkg.popular ? `2px solid ${colors.primary}` : `1px solid ${colors.border}`,
              borderRadius: '16px', padding: '24px 16px', textAlign: 'center', cursor: 'pointer',
              position: 'relative', transition: 'transform 0.2s, box-shadow 0.2s'
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 24px rgba(99, 91, 255, 0.15)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              {pkg.popular && (
                <div style={{
                  position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)',
                  background: colors.primary, padding: '4px 12px', borderRadius: '100px',
                  fontSize: '10px', fontWeight: '600', color: '#fff', textTransform: 'uppercase'
                }}>Popular</div>
              )}
              <p style={{ fontSize: '36px', fontWeight: '700', margin: '0 0 4px', color: colors.text }}>{pkg.views}</p>
              <p style={{ fontSize: '12px', color: colors.textMuted, margin: '0 0 16px' }}>pregleda</p>
              <p style={{ fontSize: '22px', fontWeight: '600', margin: 0, color: colors.primary }}>€{pkg.price}</p>
            </div>
          ))}
        </div>
        <button onClick={onClose} style={{
          position: 'absolute', top: '20px', right: '20px',
          background: colors.background, border: 'none', borderRadius: '50%',
          width: '40px', height: '40px', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.textMuted
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
      </div>
    </div>
  );
};


export default function ClientDashboard() {
  const router = useRouter();
  const { clientId } = router.query;
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [clientData, setClientData] = useState(null);
  const [selectedMonthIndex, setSelectedMonthIndex] = useState(0);
  const [clips, setClips] = useState([]);
  const [clipsLoading, setClipsLoading] = useState(false);
  const [boostModalOpen, setBoostModalOpen] = useState(false);
  const [clipsModalOpen, setClipsModalOpen] = useState(false);
  const [metricModal, setMetricModal] = useState({ isOpen: false, title: '', data: [], description: '' });
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!clientId) return;
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/client/${clientId}`);
        if (!res.ok) throw new Error('Failed to fetch client data');
        const data = await res.json();
        setClientData(data);
        setSelectedMonthIndex(0);
      } catch (err) { setError(err.message); } 
      finally { setLoading(false); }
    };
    fetchData();
  }, [clientId]);

  useEffect(() => {
    if (!clientData?.months?.[selectedMonthIndex]) return;
    const fetchClips = async () => {
      try {
        setClipsLoading(true);
        const monthId = clientData.months[selectedMonthIndex].id;
        const res = await fetch(`/api/clips/${monthId}`);
        if (!res.ok) throw new Error('Failed to fetch clips');
        const data = await res.json();
        setClips(data.clips);
      } catch (err) { setClips([]); } 
      finally { setClipsLoading(false); }
    };
    fetchClips();
  }, [clientData, selectedMonthIndex]);

  // Analytics
  const analytics = useMemo(() => {
    const months = clientData?.months || [];
    const cumulative = clientData?.cumulative || {};
    const selectedMonth = months[selectedMonthIndex];
    
    const monthViews = selectedMonth?.totalViews || 0;
    const monthLikes = selectedMonth?.totalLikes || 0;
    const monthComments = selectedMonth?.totalComments || 0;
    const monthShares = selectedMonth?.totalShares || 0;
    const monthSaves = selectedMonth?.totalSaves || 0;
    const monthClips = selectedMonth?.publishedClips || clips.length;
    
    const engagementRate = monthViews > 0 ? ((monthLikes + monthComments + monthShares) / monthViews * 100) : 0;
    const saveRate = monthViews > 0 ? (monthSaves / monthViews * 100) : 0;
    const avgViewsPerClip = monthClips > 0 ? Math.round(monthViews / monthClips) : 0;
    
    // Influencer stats
    const influencerStats = {};
    clips.forEach(clip => {
      const name = clip.influencer || 'Unknown';
      if (!influencerStats[name]) {
        influencerStats[name] = { name, views: 0, likes: 0, comments: 0, shares: 0, saves: 0, clips: 0, image: clip.influencerImage };
      }
      influencerStats[name].views += clip.views || 0;
      influencerStats[name].likes += clip.likes || 0;
      influencerStats[name].clips += 1;
    });
    const influencerList = Object.values(influencerStats).sort((a, b) => b.views - a.views);
    
    // Top clips & fast rising
    const topClips = [...clips].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 5);
    const topClip = topClips[0] || null;
    
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentClips = clips.filter(c => c.publishDate && new Date(c.publishDate) >= sevenDaysAgo);
    const fastRisingClip = recentClips.sort((a, b) => (b.views || 0) - (a.views || 0))[0] || null;
    
    const mostSavedClip = [...clips].sort((a, b) => (b.saves || 0) - (a.saves || 0))[0] || null;
    
    // Platform split
    const tiktokClips = clips.filter(c => c.platform === 'Tik Tok' || c.platform === 'TikTok');
    const instaClips = clips.filter(c => c.platform === 'Instagram');
    const tiktokViews = tiktokClips.reduce((sum, c) => sum + (c.views || 0), 0);
    const instaViews = instaClips.reduce((sum, c) => sum + (c.views || 0), 0);
    
    // Best month
    const bestMonth = months.length > 0 ? months.reduce((best, m) => (m.totalViews > (best?.totalViews || 0)) ? m : best, months[0]) : null;
    
    // Engagement breakdown
    const engagementBreakdown = [
      { name: 'Lajkovi', value: monthLikes, color: '#ff6b6b' },
      { name: 'Komentari', value: monthComments, color: '#ffd93d' },
      { name: 'Deljenja', value: monthShares, color: '#6bcb77' },
      { name: 'Sačuvano', value: monthSaves, color: '#4d96ff' }
    ].filter(d => d.value > 0);
    
    // Data for modals
    const likesByInfluencer = influencerList.map(inf => ({ label: inf.name, value: inf.likes }));
    const commentsByMonth = months.map(m => ({ label: m.month, value: m.totalComments || 0 }));
    const sharesByMonth = months.map(m => ({ label: m.month, value: m.totalShares || 0 }));
    
    return {
      monthViews, monthLikes, monthComments, monthShares, monthSaves, monthClips,
      engagementRate, saveRate, avgViewsPerClip, influencerList, topClips, topClip,
      fastRisingClip, mostSavedClip, tiktokViews, instaViews, bestMonth, engagementBreakdown,
      likesByInfluencer, commentsByMonth, sharesByMonth
    };
  }, [clientData, clips, selectedMonthIndex]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: colors.background }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '48px', height: '48px', border: `3px solid ${colors.border}`,
            borderTopColor: colors.primary, borderRadius: '50%',
            animation: 'spin 0.8s linear infinite', margin: '0 auto 16px'
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <p style={{ color: colors.textMuted, fontSize: '14px' }}>Učitavanje...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: colors.background }}>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p style={{ color: colors.danger, fontSize: '16px' }}>Greška: {error}</p>
        </div>
      </div>
    );
  }

  const selectedMonth = clientData?.months?.[selectedMonthIndex];
  const progressPercent = (selectedMonth?.percentDelivered || 0) * 100;
  const cumulative = clientData?.cumulative || {};
  const months = clientData?.months || [];

  return (
    <>
      <Head>
        <title>{clientData?.client?.name || 'Dashboard'} | VOICE</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div style={{ minHeight: '100vh', background: colors.background, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
        
        {/* Header */}
        <header style={{
          background: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(20px)',
          borderBottom: `1px solid ${colors.border}`,
          position: 'sticky', top: 0, zIndex: 100
        }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '16px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <span style={{ fontSize: '24px', fontWeight: '700', color: colors.text }}>voice</span>
              <div style={{ height: '24px', width: '1px', background: colors.border }} />
              <div>
                <h1 style={{ fontSize: '16px', fontWeight: '600', margin: 0, color: colors.text }}>{clientData?.client?.name}</h1>
                <p style={{ fontSize: '12px', color: colors.textMuted, margin: 0 }}>Campaign Dashboard</p>
              </div>
            </div>
            <button onClick={() => setBoostModalOpen(true)} style={{
              display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px',
              background: colors.primary, border: 'none', borderRadius: '8px',
              color: '#fff', fontSize: '14px', fontWeight: '600', cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(99, 91, 255, 0.25)',
              transition: 'transform 0.2s, box-shadow 0.2s'
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(99, 91, 255, 0.35)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(99, 91, 255, 0.25)'; }}
            >
              ⚡ Boost
            </button>
          </div>
        </header>

        <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '48px 32px' }}>
          
          {/* Hero Section with Parallax */}
          <section style={{
            position: 'relative', overflow: 'hidden',
            background: colors.white, borderRadius: '24px',
            padding: '48px', marginBottom: '48px',
            border: `1px solid ${colors.border}`,
            boxShadow: '0 4px 6px rgba(0,0,0,0.02)'
          }}>
            {/* Animated gradient orbs */}
            <GradientOrb style={{
              width: '400px', height: '400px', top: '-200px', right: '-100px',
              background: `linear-gradient(135deg, ${colors.gradientStart}, ${colors.gradientMiddle})`,
              transform: `translateY(${scrollY * 0.1}px)`
            }} />
            <GradientOrb style={{
              width: '300px', height: '300px', bottom: '-150px', left: '-50px',
              background: `linear-gradient(135deg, ${colors.gradientMiddle}, ${colors.gradientEnd})`,
              transform: `translateY(${scrollY * -0.05}px)`
            }} />
            
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '32px' }}>
                <div>
                  <p style={{ fontSize: '13px', fontWeight: '600', color: colors.textMuted, margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    Celokupna kampanja • {months.length} {months.length === 1 ? 'mesec' : 'meseci'}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '56px', fontWeight: '700', color: colors.text, letterSpacing: '-2px' }}>
                      {formatNumber(cumulative.totalViews)}
                    </span>
                    <span style={{ fontSize: '20px', color: colors.textMuted }}>/ {formatNumber(cumulative.totalGoal)}</span>
                  </div>
                  <p style={{ fontSize: '14px', color: colors.textSecondary, margin: 0 }}>ukupnih pregleda</p>
                </div>
                <ProgressRing 
                  progress={cumulative.percentDelivered * 100} 
                  size={140} 
                  color={cumulative.percentDelivered >= 1 ? colors.success : colors.primary}
                />
              </div>
            </div>
          </section>

          {/* Month Selector */}
          <section style={{
            background: colors.white, borderRadius: '16px', padding: '20px 28px',
            marginBottom: '32px', border: `1px solid ${colors.border}`,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            flexWrap: 'wrap', gap: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <span style={{ fontSize: '14px', color: colors.textMuted }}>Izaberi mesec:</span>
              <select value={selectedMonthIndex} onChange={(e) => setSelectedMonthIndex(Number(e.target.value))} style={{
                padding: '10px 40px 10px 16px', fontSize: '14px', fontWeight: '500',
                border: `1px solid ${colors.border}`, borderRadius: '8px',
                background: colors.white, color: colors.text, cursor: 'pointer',
                appearance: 'none',
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23425466' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat', backgroundPosition: 'right 14px center'
              }}>
                {months.map((month, index) => (<option key={month.id} value={index}>{month.month}</option>))}
              </select>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '13px', color: colors.textMuted, margin: '0 0 2px' }}>Progress</p>
                <p style={{ fontSize: '18px', fontWeight: '600', color: colors.text, margin: 0 }}>
                  {formatNumber(selectedMonth?.totalViews)} / {formatNumber(selectedMonth?.campaignGoal)}
                </p>
              </div>
              <div style={{ width: '120px', height: '8px', background: colors.background, borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{
                  height: '100%', width: `${Math.min(progressPercent, 100)}%`,
                  background: progressPercent >= 100 ? colors.success : `linear-gradient(90deg, ${colors.primary}, ${colors.primaryLight})`,
                  borderRadius: '4px', transition: 'width 0.4s ease'
                }} />
              </div>
              <span style={{
                fontSize: '14px', fontWeight: '600',
                color: progressPercent >= 100 ? colors.success : colors.primary
              }}>{progressPercent.toFixed(0)}%</span>
            </div>
          </section>

          {/* Metrics Grid */}
          <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '32px' }}>
            <MetricCard icon="📹" label="Klipovi" value={analytics.monthClips} onClick={() => setClipsModalOpen(true)} />
            <MetricCard icon="❤️" label="Lajkovi" value={formatNumber(analytics.monthLikes)} onClick={() => setMetricModal({ isOpen: true, title: 'Lajkovi po influenceru', data: analytics.likesByInfluencer, description: 'Raspodela lajkova' })} />
            <MetricCard icon="💬" label="Komentari" value={formatNumber(analytics.monthComments)} onClick={() => setMetricModal({ isOpen: true, title: 'Komentari po mesecu', data: analytics.commentsByMonth, description: 'Trend komentara' })} />
            <MetricCard icon="🔄" label="Deljenja" value={formatNumber(analytics.monthShares)} onClick={() => setMetricModal({ isOpen: true, title: 'Deljenja po mesecu', data: analytics.sharesByMonth, description: 'Trend deljenja' })} />
          </section>

          {/* Charts Row */}
          <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '24px', marginBottom: '32px' }}>
            <Card>
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: colors.text, margin: '0 0 24px' }}>Engagement Breakdown</h3>
              {analytics.engagementBreakdown.length > 0 ? (
                <DonutChart data={analytics.engagementBreakdown} />
              ) : <p style={{ color: colors.textMuted }}>Nema podataka</p>}
            </Card>
            
            <Card>
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: colors.text, margin: '0 0 24px' }}>Platform Split</h3>
              <PlatformBars tiktok={analytics.tiktokViews} instagram={analytics.instaViews} />
            </Card>
          </section>

          {/* Stats Row */}
          <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px', marginBottom: '32px' }}>
            <Card style={{ padding: '20px', textAlign: 'center' }}>
              <p style={{ fontSize: '12px', color: colors.textMuted, margin: '0 0 8px', textTransform: 'uppercase' }}>Engagement Rate</p>
              <p style={{ fontSize: '28px', fontWeight: '600', color: colors.primary, margin: 0 }}>{formatPercent(analytics.engagementRate)}</p>
            </Card>
            <Card style={{ padding: '20px', textAlign: 'center' }}>
              <p style={{ fontSize: '12px', color: colors.textMuted, margin: '0 0 8px', textTransform: 'uppercase' }}>Save Rate</p>
              <p style={{ fontSize: '28px', fontWeight: '600', color: colors.success, margin: 0 }}>{formatPercent(analytics.saveRate)}</p>
            </Card>
            <Card style={{ padding: '20px', textAlign: 'center' }}>
              <p style={{ fontSize: '12px', color: colors.textMuted, margin: '0 0 8px', textTransform: 'uppercase' }}>Prosek po klipu</p>
              <p style={{ fontSize: '28px', fontWeight: '600', color: colors.text, margin: 0 }}>{formatNumber(analytics.avgViewsPerClip)}</p>
            </Card>
          </section>

          {/* Highlights */}
          <section style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '32px' }}>
            {analytics.topClip && (
              <HighlightCard icon="🔥" title="Top Klip" name={analytics.topClip.influencer}
                value={formatNumber(analytics.topClip.views)} subtext="pregleda"
                image={analytics.topClip.influencerImage} color={colors.danger}
                link={analytics.topClip.link}
                description="Klip sa najviše pregleda u izabranom mesecu."
                extraInfo={`${analytics.topClip.platform} • ${formatDate(analytics.topClip.publishDate)}`}
              />
            )}
            {analytics.influencerList[0] && (
              <HighlightCard icon="⭐" title="MVP Influencer" name={analytics.influencerList[0].name}
                value={formatNumber(analytics.influencerList[0].views)} subtext={`(${analytics.influencerList[0].clips} klipova)`}
                image={analytics.influencerList[0].image} color={colors.primary}
                description="Influencer sa najviše ukupnih pregleda ovog meseca."
              />
            )}
            {analytics.fastRisingClip && (
              <HighlightCard icon="⚡" title="Brzi Rast" name={analytics.fastRisingClip.influencer}
                value={formatNumber(analytics.fastRisingClip.views)} subtext="pregleda"
                image={analytics.fastRisingClip.influencerImage} color={colors.success}
                link={analytics.fastRisingClip.link}
                description="Klip sa najviše pregleda objavljen u poslednjih 7 dana."
                extraInfo={`Objavljeno: ${formatDate(analytics.fastRisingClip.publishDate)}`}
              />
            )}
            {analytics.mostSavedClip && analytics.mostSavedClip.saves > 0 && (
              <HighlightCard icon="💾" title="Most Saved" name={analytics.mostSavedClip.influencer}
                value={formatNumber(analytics.mostSavedClip.saves)} subtext="sačuvano"
                image={analytics.mostSavedClip.influencerImage} color="#4d96ff"
                link={analytics.mostSavedClip.link}
                description="Klip koji su korisnici najviše puta sačuvali."
              />
            )}
            {analytics.bestMonth && (
              <HighlightCard icon="📈" title="Best Month" name={analytics.bestMonth.month}
                value={formatNumber(analytics.bestMonth.totalViews)} subtext="pregleda"
                color={colors.primaryLight}
                description="Mesec sa najviše pregleda u celoj kampanji."
              />
            )}
          </section>

          {/* Clips & Influencers */}
          <section className="tables-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '24px', marginBottom: '48px' }}>
            <style>{`@media (max-width: 900px) { .tables-grid { grid-template-columns: 1fr !important; } }`}</style>
            
            <Card hover={false} style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '20px 24px', borderBottom: `1px solid ${colors.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: colors.text, margin: 0 }}>Svi klipovi</h3>
                <span style={{ fontSize: '13px', color: colors.textMuted, background: colors.background, padding: '4px 12px', borderRadius: '100px' }}>{clips.length}</span>
              </div>
              <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {clips.length === 0 ? (
                  <p style={{ padding: '40px', textAlign: 'center', color: colors.textMuted }}>Nema klipova</p>
                ) : (
                  clips.map((clip, i) => (
                    <div key={clip.id} style={{
                      display: 'flex', alignItems: 'center', padding: '14px 24px', gap: '14px',
                      borderBottom: `1px solid ${colors.border}`,
                      transition: 'background 0.15s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = colors.background}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <div style={{
                        width: '44px', height: '44px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0,
                        background: clip.influencerImage ? 'transparent' : `linear-gradient(135deg, ${colors.primary}, ${colors.primaryLight})`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}>
                        {clip.influencerImage ? <img src={clip.influencerImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          : <span style={{ color: '#fff', fontWeight: '600', fontSize: '16px' }}>{clip.influencer?.charAt(0)}</span>}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: '14px', fontWeight: '500', margin: 0, color: colors.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{clip.influencer}</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                          <PlatformIcon platform={clip.platform} size={12} />
                          <span style={{ fontSize: '12px', color: colors.textMuted }}>{formatDate(clip.publishDate)}</span>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontSize: '16px', fontWeight: '600', margin: 0, color: colors.text }}>{formatNumber(clip.views)}</p>
                      </div>
                      {clip.link && (
                        <a href={clip.link} target="_blank" rel="noopener noreferrer" style={{
                          padding: '8px 14px', background: colors.primary, borderRadius: '8px',
                          color: '#fff', textDecoration: 'none', fontSize: '12px', fontWeight: '600'
                        }}>↗</a>
                      )}
                    </div>
                  ))
                )}
              </div>
            </Card>

            <Card hover={false} style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '20px 24px', borderBottom: `1px solid ${colors.border}` }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: colors.text, margin: 0 }}>Top Influenceri</h3>
              </div>
              <div style={{ maxHeight: '400px', overflowY: 'auto', padding: '12px' }}>
                {analytics.influencerList.slice(0, 10).map((inf, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '12px 16px', marginBottom: '8px',
                    background: i === 0 ? `linear-gradient(135deg, ${colors.primary}08, ${colors.primary}02)` : colors.background,
                    borderRadius: '12px', border: i === 0 ? `1px solid ${colors.primary}20` : 'none'
                  }}>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: i === 0 ? colors.primary : colors.textMuted, width: '24px' }}>#{i + 1}</span>
                    <div style={{
                      width: '36px', height: '36px', borderRadius: '50%', overflow: 'hidden',
                      background: inf.image ? 'transparent' : `linear-gradient(135deg, ${colors.primary}, ${colors.primaryLight})`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      {inf.image ? <img src={inf.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <span style={{ color: '#fff', fontWeight: '600', fontSize: '13px' }}>{inf.name?.charAt(0)}</span>}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: '14px', fontWeight: '500', margin: 0, color: colors.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{inf.name}</p>
                      <p style={{ fontSize: '12px', color: colors.textMuted, margin: '2px 0 0' }}>{inf.clips} klip{inf.clips !== 1 ? 'a' : ''}</p>
                    </div>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: i === 0 ? colors.primary : colors.text }}>{formatNumber(inf.views)}</span>
                    {i === 0 && <span style={{ fontSize: '16px' }}>👑</span>}
                  </div>
                ))}
              </div>
            </Card>
          </section>

          {/* Footer */}
          <footer style={{ textAlign: 'center', paddingTop: '24px', borderTop: `1px solid ${colors.border}` }}>
            <p style={{ fontSize: '13px', color: colors.textMuted }}>
              Powered by <span style={{ fontWeight: '600', color: colors.textSecondary }}>VOICE</span>
            </p>
          </footer>
        </main>

        <BoostModal isOpen={boostModalOpen} onClose={() => setBoostModalOpen(false)} clientName={clientData?.client?.name} />
        <ClipsModal isOpen={clipsModalOpen} onClose={() => setClipsModalOpen(false)} clips={clips} monthName={selectedMonth?.month} />
        <MetricModal isOpen={metricModal.isOpen} onClose={() => setMetricModal({ ...metricModal, isOpen: false })} title={metricModal.title} data={metricModal.data} description={metricModal.description} />
      </div>
    </>
  );
}
