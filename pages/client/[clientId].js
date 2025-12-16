// pages/client/[clientId].js - V8 PREMIUM
import { useState, useEffect, useMemo } from 'react';
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
  return date.toLocaleDateString('sr-RS', { day: 'numeric', month: 'short' });
};

// VOICE Logo
const VoiceLogo = () => (
  <svg width="100" height="32" viewBox="0 0 100 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <text x="0" y="24" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif" fontSize="24" fontWeight="700" fill="#ffffff">voice</text>
    <circle cx="88" cy="6" r="3" fill="#818cf8"/>
  </svg>
);

// Platform Icon
const PlatformIcon = ({ platform, size = 14 }) => {
  if (platform === 'Tik Tok' || platform === 'TikTok') {
    return (
      <svg viewBox="0 0 24 24" fill="#ffffff" style={{width: `${size}px`, height: `${size}px`, opacity: 0.7}}>
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
      </svg>
    );
  }
  if (platform === 'Instagram') {
    return (
      <svg viewBox="0 0 24 24" fill="#E4405F" style={{width: `${size}px`, height: `${size}px`}}>
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
      </svg>
    );
  }
  return null;
};

// Status Badge
const StatusBadge = ({ status }) => {
  const getStatusStyle = () => {
    switch(status) {
      case 'Published': return { bg: 'rgba(34, 197, 94, 0.15)', color: '#4ade80' };
      case 'Done': return { bg: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa' };
      case 'Draft': return { bg: 'rgba(251, 191, 36, 0.15)', color: '#fbbf24' };
      case 'Active': return { bg: 'rgba(34, 197, 94, 0.15)', color: '#4ade80' };
      case 'Closed': return { bg: 'rgba(156, 163, 175, 0.15)', color: '#9ca3af' };
      default: return { bg: 'rgba(156, 163, 175, 0.15)', color: '#9ca3af' };
    }
  };
  const style = getStatusStyle();
  return (
    <span style={{
      display: 'inline-block',
      padding: '4px 10px',
      borderRadius: '6px',
      fontSize: '10px',
      fontWeight: '600',
      background: style.bg,
      color: style.color,
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    }}>
      {status}
    </span>
  );
};

// Metric Detail Modal with Heat Map
const MetricModal = ({ isOpen, onClose, title, months, metricKey, color }) => {
  if (!isOpen || !months) return null;

  const values = months.map(m => ({
    month: m.month,
    value: m[metricKey] || 0
  })).sort((a, b) => b.value - a.value);

  const maxValue = Math.max(...values.map(v => v.value), 1);

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0, 0, 0, 0.85)',
      backdropFilter: 'blur(12px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: '20px'
    }} onClick={onClose}>
      <div style={{
        background: 'linear-gradient(180deg, #1e1e38 0%, #18182d 100%)',
        borderRadius: '24px',
        padding: '32px',
        maxWidth: '480px',
        width: '100%',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 30px 60px rgba(0,0,0,0.5)',
        position: 'relative'
      }} onClick={e => e.stopPropagation()}>
        
        <div style={{ marginBottom: '28px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '700', margin: '0 0 6px', color: '#fff' }}>
            {title} po mesecima
          </h2>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)', margin: 0 }}>
            Ukupno: <span style={{ color: '#fff', fontWeight: '600' }}>{formatNumber(values.reduce((sum, v) => sum + v.value, 0))}</span>
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {values.map((item, i) => {
            const intensity = item.value / maxValue;
            const bgOpacity = 0.08 + (intensity * 0.35);
            const textOpacity = 0.4 + (intensity * 0.6);
            
            return (
              <div key={i} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '16px 18px',
                background: `rgba(${color}, ${bgOpacity})`,
                borderRadius: '12px',
                borderLeft: `3px solid rgba(${color}, ${0.3 + intensity * 0.7})`
              }}>
                <span style={{ fontSize: '14px', fontWeight: '500', color: `rgba(255,255,255,${textOpacity})` }}>
                  {item.month}
                </span>
                <span style={{ fontSize: '18px', fontWeight: '700', color: `rgba(255,255,255,${textOpacity})` }}>
                  {formatNumber(item.value)}
                </span>
              </div>
            );
          })}
        </div>

        <button onClick={onClose} style={{
          position: 'absolute', top: '20px', right: '20px',
          background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '50%',
          width: '36px', height: '36px', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'rgba(255,255,255,0.5)', transition: 'all 0.2s ease'
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
      </div>
    </div>
  );
};

// Interactive Metric Card
const MetricCard = ({ icon, label, value, onClick, colorRgb, subtext }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div 
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        padding: '20px',
        borderRadius: '16px',
        cursor: 'pointer',
        background: isHovered ? `rgba(${colorRgb}, 0.12)` : 'rgba(255,255,255,0.03)',
        border: isHovered ? `1px solid rgba(${colorRgb}, 0.3)` : '1px solid rgba(255,255,255,0.06)',
        transform: isHovered ? 'translateY(-3px)' : 'translateY(0)',
        boxShadow: isHovered ? `0 12px 32px rgba(${colorRgb}, 0.15)` : 'none',
        transition: 'all 0.25s ease'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
        <span style={{ fontSize: '22px' }}>{icon}</span>
        <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {label}
        </span>
      </div>
      <p style={{ fontSize: '28px', fontWeight: '700', margin: '0 0 4px', color: isHovered ? '#fff' : 'rgba(255,255,255,0.95)' }}>
        {value}
      </p>
      {subtext && (
        <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', margin: 0 }}>{subtext}</p>
      )}
      {isHovered && (
        <p style={{ fontSize: '10px', color: `rgba(${colorRgb}, 0.9)`, margin: '10px 0 0', fontWeight: '500' }}>
          Klikni za detalje →
        </p>
      )}
    </div>
  );
};

// WhatsApp Boost Modal - FANCY
const BoostModal = ({ isOpen, onClose, clientName }) => {
  if (!isOpen) return null;

  const packages = [
    { views: '1M', price: '1.900', priceNum: 1900 },
    { views: '2M', price: '3.500', priceNum: 3500, popular: true },
    { views: '3M', price: '4.900', priceNum: 4900 }
  ];

  const TEODORA_PHONE = '381692765209';

  const handleSelect = (pkg) => {
    const message = encodeURIComponent(
`Zdravo Teodora! 👋

Zainteresovan/a sam za Boost paket za našu kampanju.

📊 *Detalji narudžbine:*
• Klijent: ${clientName}
• Paket: ${pkg.views} pregleda
• Cena: €${pkg.price}

Molim vas za potvrdu i dalje korake. Hvala! 🙏`
    );
    window.open(`https://wa.me/${TEODORA_PHONE}?text=${message}`, '_blank');
    onClose();
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0, 0, 0, 0.9)',
      backdropFilter: 'blur(16px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: '20px'
    }} onClick={onClose}>
      <div style={{
        background: 'linear-gradient(180deg, #1a1a2e 0%, #141428 100%)',
        borderRadius: '28px',
        padding: '40px',
        maxWidth: '520px',
        width: '100%',
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 40px 80px rgba(0,0,0,0.6)',
        position: 'relative'
      }} onClick={e => e.stopPropagation()}>
        
        {/* Header with Teodora */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div style={{
            width: '90px', height: '90px', borderRadius: '50%', overflow: 'hidden',
            margin: '0 auto 20px',
            border: '3px solid rgba(37, 211, 102, 0.4)',
            boxShadow: '0 0 30px rgba(37, 211, 102, 0.25)',
            background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <span style={{ color: '#fff', fontSize: '36px', fontWeight: '700' }}>T</span>
          </div>
          
          <h2 style={{ fontSize: '26px', fontWeight: '700', margin: '0 0 8px', color: '#fff' }}>
            Boost vaše kampanje ⚡
          </h2>
          <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.5)', margin: '0 0 12px' }}>
            Povećajte doseg sa dodatnim organskim pregledima
          </p>
          <div style={{ 
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: 'rgba(37, 211, 102, 0.1)', padding: '8px 16px', borderRadius: '100px'
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#25D366">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            <span style={{ fontSize: '14px', color: '#25D366', fontWeight: '600' }}>Kontaktirajte Teodoru</span>
          </div>
        </div>

        {/* Packages */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginBottom: '28px' }}>
          {packages.map((pkg, i) => (
            <div
              key={i}
              onClick={() => handleSelect(pkg)}
              style={{
                background: pkg.popular 
                  ? 'linear-gradient(135deg, rgba(129, 140, 248, 0.2) 0%, rgba(167, 139, 250, 0.15) 100%)'
                  : 'rgba(255,255,255,0.03)',
                border: pkg.popular ? '2px solid rgba(129, 140, 248, 0.5)' : '1px solid rgba(255,255,255,0.08)',
                borderRadius: '16px',
                padding: '24px 16px',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.25s ease',
                position: 'relative'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 16px 40px rgba(129, 140, 248, 0.2)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {pkg.popular && (
                <div style={{
                  position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)',
                  background: 'linear-gradient(135deg, #818cf8 0%, #a78bfa 100%)',
                  padding: '4px 14px', borderRadius: '100px',
                  fontSize: '10px', fontWeight: '700', color: '#fff',
                  textTransform: 'uppercase', letterSpacing: '0.5px'
                }}>
                  Popularno
                </div>
              )}
              <p style={{ fontSize: '36px', fontWeight: '800', margin: '0 0 4px', color: '#fff' }}>
                {pkg.views}
              </p>
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', margin: '0 0 16px' }}>
                pregleda
              </p>
              <p style={{ fontSize: '22px', fontWeight: '700', margin: 0, color: pkg.popular ? '#a78bfa' : '#818cf8' }}>
                €{pkg.price}
              </p>
            </div>
          ))}
        </div>

        <p style={{ textAlign: 'center', fontSize: '12px', color: 'rgba(255,255,255,0.3)' }}>
          Klikom na paket otvara se WhatsApp sa pripremljenom porukom
        </p>

        <button onClick={onClose} style={{
          position: 'absolute', top: '20px', right: '20px',
          background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '50%',
          width: '40px', height: '40px', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'rgba(255,255,255,0.5)'
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
      </div>
    </div>
  );
};

// Top Performer Card
const TopPerformerCard = ({ title, icon, name, value, label, image, colorRgb }) => (
  <div style={{
    background: `linear-gradient(135deg, rgba(${colorRgb}, 0.1) 0%, rgba(${colorRgb}, 0.05) 100%)`,
    border: `1px solid rgba(${colorRgb}, 0.15)`,
    borderRadius: '16px',
    padding: '20px',
    flex: 1
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '14px' }}>
      <span style={{ fontSize: '16px' }}>{icon}</span>
      <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        {title}
      </span>
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
      <div style={{
        width: '48px', height: '48px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0,
        background: image ? 'transparent' : `linear-gradient(135deg, rgba(${colorRgb}, 0.5) 0%, rgba(${colorRgb}, 0.3) 100%)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: `2px solid rgba(${colorRgb}, 0.3)`
      }}>
        {image ? (
          <img src={image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <span style={{ color: '#fff', fontWeight: '700', fontSize: '18px' }}>{name?.charAt(0) || '?'}</span>
        )}
      </div>
      <div>
        <p style={{ fontSize: '14px', fontWeight: '600', margin: '0 0 4px', color: '#fff' }}>{name}</p>
        <p style={{ fontSize: '18px', fontWeight: '700', margin: 0, color: `rgb(${colorRgb})` }}>
          {value} <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontWeight: '400' }}>{label}</span>
        </p>
      </div>
    </div>
  </div>
);

// Insights Modal
const InsightsModal = ({ isOpen, onClose, clips, months, cumulative }) => {
  if (!isOpen) return null;

  // Calculate insights
  const insights = useMemo(() => {
    // Engagement rate
    const engagementRate = cumulative.totalViews > 0 
      ? ((cumulative.totalLikes + cumulative.totalShares) / cumulative.totalViews * 100).toFixed(2)
      : 0;

    // Platform split
    const tiktokClips = clips.filter(c => c.platform === 'Tik Tok' || c.platform === 'TikTok');
    const instaClips = clips.filter(c => c.platform === 'Instagram');
    const tiktokViews = tiktokClips.reduce((sum, c) => sum + (c.views || 0), 0);
    const instaViews = instaClips.reduce((sum, c) => sum + (c.views || 0), 0);
    const totalPlatformViews = tiktokViews + instaViews;

    // Avg views per clip
    const avgViewsPerClip = clips.length > 0 
      ? Math.round(cumulative.totalViews / clips.length) 
      : 0;

    // Avg views per month
    const avgViewsPerMonth = months.length > 0 
      ? Math.round(cumulative.totalViews / months.length) 
      : 0;

    // Best month
    const bestMonth = months.length > 0 
      ? months.reduce((best, m) => m.totalViews > best.totalViews ? m : best, months[0])
      : null;

    return {
      engagementRate,
      tiktokPercent: totalPlatformViews > 0 ? Math.round(tiktokViews / totalPlatformViews * 100) : 0,
      instaPercent: totalPlatformViews > 0 ? Math.round(instaViews / totalPlatformViews * 100) : 0,
      avgViewsPerClip,
      avgViewsPerMonth,
      bestMonth
    };
  }, [clips, months, cumulative]);

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0, 0, 0, 0.85)',
      backdropFilter: 'blur(12px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: '20px'
    }} onClick={onClose}>
      <div style={{
        background: 'linear-gradient(180deg, #1e1e38 0%, #18182d 100%)',
        borderRadius: '24px',
        padding: '36px',
        maxWidth: '550px',
        width: '100%',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 30px 60px rgba(0,0,0,0.5)',
        position: 'relative'
      }} onClick={e => e.stopPropagation()}>
        
        <h2 style={{ fontSize: '22px', fontWeight: '700', margin: '0 0 28px', color: '#fff' }}>
          📊 Detaljni uvidi
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
          <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '14px', padding: '18px' }}>
            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', margin: '0 0 6px', textTransform: 'uppercase' }}>Engagement Rate</p>
            <p style={{ fontSize: '28px', fontWeight: '700', margin: 0, color: '#4ade80' }}>{insights.engagementRate}%</p>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '14px', padding: '18px' }}>
            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', margin: '0 0 6px', textTransform: 'uppercase' }}>Prosek po klipu</p>
            <p style={{ fontSize: '28px', fontWeight: '700', margin: 0, color: '#818cf8' }}>{formatNumber(insights.avgViewsPerClip)}</p>
          </div>
        </div>

        {/* Platform Split */}
        <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '14px', padding: '18px', marginBottom: '24px' }}>
          <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', margin: '0 0 14px', textTransform: 'uppercase' }}>Platforme</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <PlatformIcon platform="TikTok" size={20} />
              <span style={{ fontSize: '22px', fontWeight: '700', color: '#fff' }}>{insights.tiktokPercent}%</span>
            </div>
            <div style={{ flex: 1, height: '10px', background: 'rgba(255,255,255,0.1)', borderRadius: '100px', overflow: 'hidden' }}>
              <div style={{ 
                width: `${insights.tiktokPercent}%`, 
                height: '100%', 
                background: 'linear-gradient(90deg, #ff0050 0%, #00f2ea 100%)',
                borderRadius: '100px'
              }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '22px', fontWeight: '700', color: '#fff' }}>{insights.instaPercent}%</span>
              <PlatformIcon platform="Instagram" size={20} />
            </div>
          </div>
        </div>

        {/* Best Month */}
        {insights.bestMonth && (
          <div style={{ background: 'linear-gradient(135deg, rgba(167, 139, 250, 0.15) 0%, rgba(129, 140, 248, 0.1) 100%)', borderRadius: '14px', padding: '18px', border: '1px solid rgba(167, 139, 250, 0.2)' }}>
            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', margin: '0 0 6px', textTransform: 'uppercase' }}>🏆 Najbolji mesec</p>
            <p style={{ fontSize: '18px', fontWeight: '700', margin: 0, color: '#fff' }}>
              {insights.bestMonth.month} <span style={{ color: '#a78bfa' }}>• {formatNumber(insights.bestMonth.totalViews)} pregleda</span>
            </p>
          </div>
        )}

        <button onClick={onClose} style={{
          position: 'absolute', top: '20px', right: '20px',
          background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '50%',
          width: '36px', height: '36px', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'rgba(255,255,255,0.5)'
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
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
  const [metricModal, setMetricModal] = useState({ isOpen: false, title: '', metricKey: '', color: '' });
  const [insightsModalOpen, setInsightsModalOpen] = useState(false);

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
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
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
      } catch (err) {
        console.error(err);
        setClips([]);
      } finally {
        setClipsLoading(false);
      }
    };
    fetchClips();
  }, [clientData, selectedMonthIndex]);

  // Calculate analytics
  const analytics = useMemo(() => {
    if (!clips.length) return { topClip: null, topInfluencer: null, uniqueInfluencers: [] };

    // Top clip by views
    const topClip = clips.reduce((best, c) => (c.views > (best?.views || 0)) ? c : best, null);

    // Aggregate by influencer
    const influencerStats = {};
    clips.forEach(clip => {
      const name = clip.influencer || 'Unknown';
      if (!influencerStats[name]) {
        influencerStats[name] = { name, views: 0, likes: 0, clips: 0, image: clip.influencerImage };
      }
      influencerStats[name].views += clip.views || 0;
      influencerStats[name].likes += clip.likes || 0;
      influencerStats[name].clips += 1;
    });

    const influencerList = Object.values(influencerStats).sort((a, b) => b.views - a.views);
    const topInfluencer = influencerList[0] || null;

    return { topClip, topInfluencer, uniqueInfluencers: influencerList };
  }, [clips]);

  const openMetricModal = (title, metricKey, colorRgb) => {
    setMetricModal({ isOpen: true, title, metricKey, color: colorRgb });
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 100%)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '50px', height: '50px',
            border: '3px solid rgba(129, 140, 248, 0.2)',
            borderTopColor: '#818cf8',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>Učitavanje...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 100%)'
      }}>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p style={{ color: '#f87171', fontSize: '18px', marginBottom: '8px' }}>Greška</p>
          <p style={{ color: 'rgba(255,255,255,0.5)' }}>{error}</p>
        </div>
      </div>
    );
  }

  const selectedMonth = clientData?.months?.[selectedMonthIndex];
  const progressPercent = selectedMonth?.percentDelivered || 0;
  const cumulative = clientData?.cumulative || {};
  const monthsCount = cumulative.monthsCount || 1;

  return (
    <>
      <Head>
        <title>{clientData?.client?.name || 'Dashboard'} | VOICE</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0a0a14 0%, #12121f 50%, #0f0f1a 100%)',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        color: '#ffffff'
      }}>
        
        {/* Header */}
        <header style={{
          background: 'rgba(15, 15, 26, 0.95)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          position: 'sticky', top: 0, zIndex: 100
        }}>
          <div style={{
            maxWidth: '1300px', margin: '0 auto', padding: '16px 28px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <VoiceLogo />
              <div style={{ height: '28px', width: '1px', background: 'rgba(255,255,255,0.1)' }} />
              <div>
                <h1 style={{ fontSize: '20px', fontWeight: '700', margin: 0, letterSpacing: '-0.3px' }}>
                  {clientData?.client?.name}
                </h1>
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', margin: '2px 0 0' }}>Campaign Dashboard</p>
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {/* Boost Button */}
              <button
                onClick={() => setBoostModalOpen(true)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '10px 18px',
                  background: 'linear-gradient(135deg, #818cf8 0%, #a78bfa 100%)',
                  border: 'none', borderRadius: '10px',
                  color: '#fff', fontSize: '13px', fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 4px 16px rgba(129, 140, 248, 0.25)'
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <span>⚡</span>
                Boost kampanju
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main style={{ maxWidth: '1300px', margin: '0 auto', padding: '32px 28px' }}>
          
          {/* Hero Progress Section - Cumulative */}
          {monthsCount > 1 && (
            <section style={{
              background: 'linear-gradient(135deg, rgba(129, 140, 248, 0.08) 0%, rgba(167, 139, 250, 0.05) 100%)',
              border: '1px solid rgba(129, 140, 248, 0.15)',
              borderRadius: '24px',
              padding: '32px',
              marginBottom: '28px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                <div>
                  <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    🎯 Celokupna kampanja ({monthsCount} meseci)
                  </p>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
                    <span style={{ fontSize: '52px', fontWeight: '800', letterSpacing: '-2px' }}>
                      {formatNumber(cumulative.totalViews)}
                    </span>
                    <span style={{ fontSize: '18px', color: 'rgba(255,255,255,0.4)' }}>
                      / {formatNumber(cumulative.totalGoal)} pregleda
                    </span>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '40px', fontWeight: '800', margin: 0, color: cumulative.percentDelivered >= 1 ? '#4ade80' : '#818cf8' }}>
                    {(cumulative.percentDelivered * 100).toFixed(0)}%
                  </p>
                  <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', margin: '4px 0 0' }}>isporučeno</p>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div style={{
                height: '14px', background: 'rgba(255,255,255,0.08)',
                borderRadius: '100px', overflow: 'hidden', marginBottom: '20px'
              }}>
                <div style={{
                  height: '100%',
                  width: `${Math.min(cumulative.percentDelivered * 100, 100)}%`,
                  background: cumulative.percentDelivered >= 1 
                    ? 'linear-gradient(90deg, #22c55e 0%, #4ade80 100%)' 
                    : 'linear-gradient(90deg, #818cf8 0%, #a78bfa 50%, #c4b5fd 100%)',
                  borderRadius: '100px',
                  transition: 'width 1s ease-out',
                  boxShadow: '0 0 20px rgba(129, 140, 248, 0.4)'
                }} />
              </div>

              {/* Quick Stats */}
              <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
                <div>
                  <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', margin: '0 0 4px', textTransform: 'uppercase' }}>Ukupno klipova</p>
                  <p style={{ fontSize: '20px', fontWeight: '700', margin: 0 }}>{cumulative.totalClips}</p>
                </div>
                <div>
                  <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', margin: '0 0 4px', textTransform: 'uppercase' }}>Ukupno lajkova</p>
                  <p style={{ fontSize: '20px', fontWeight: '700', margin: 0 }}>{formatNumber(cumulative.totalLikes)}</p>
                </div>
                <div>
                  <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', margin: '0 0 4px', textTransform: 'uppercase' }}>Ukupno deljenja</p>
                  <p style={{ fontSize: '20px', fontWeight: '700', margin: 0 }}>{formatNumber(cumulative.totalShares)}</p>
                </div>
                <div style={{ marginLeft: 'auto' }}>
                  <button
                    onClick={() => setInsightsModalOpen(true)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '6px',
                      background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px', padding: '8px 14px',
                      color: 'rgba(255,255,255,0.7)', fontSize: '12px', fontWeight: '500',
                      cursor: 'pointer', transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                  >
                    📊 Detaljni uvidi
                  </button>
                </div>
              </div>
            </section>
          )}

          {/* Month Selector Bar */}
          <section style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '16px',
            padding: '20px 24px',
            marginBottom: '24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '20px',
            flexWrap: 'wrap'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>Izaberi mesec:</span>
              <select
                value={selectedMonthIndex}
                onChange={(e) => setSelectedMonthIndex(Number(e.target.value))}
                style={{
                  padding: '12px 40px 12px 16px',
                  fontSize: '14px', fontWeight: '600',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '10px',
                  background: 'rgba(255,255,255,0.05)',
                  color: '#fff',
                  cursor: 'pointer',
                  appearance: 'none',
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23ffffff' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 14px center',
                  minWidth: '200px'
                }}
              >
                {clientData?.months?.map((month, index) => (
                  <option key={month.id} value={index} style={{ background: '#1a1a2e' }}>
                    {month.month}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Monthly Progress Mini */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', margin: '0 0 2px' }}>Ovaj mesec</p>
                <p style={{ fontSize: '18px', fontWeight: '700', margin: 0 }}>
                  {formatNumber(selectedMonth?.totalViews)} <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', fontWeight: '400' }}>/ {formatNumber(selectedMonth?.campaignGoal)}</span>
                </p>
              </div>
              <div style={{
                width: '120px', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '100px', overflow: 'hidden'
              }}>
                <div style={{
                  height: '100%',
                  width: `${Math.min(progressPercent * 100, 100)}%`,
                  background: progressPercent >= 1 ? '#4ade80' : '#818cf8',
                  borderRadius: '100px'
                }} />
              </div>
              <span style={{ 
                fontSize: '14px', fontWeight: '700', 
                color: progressPercent >= 1 ? '#4ade80' : '#818cf8' 
              }}>
                {(progressPercent * 100).toFixed(0)}%
              </span>
              <StatusBadge status={selectedMonth?.contractStatus || 'Active'} />
            </div>
          </section>

          {/* Top Performers Row */}
          {analytics.topClip && (
            <section style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
              <TopPerformerCard 
                title="🔥 Top klip"
                icon="📹"
                name={analytics.topClip.influencer}
                value={formatNumber(analytics.topClip.views)}
                label="pregleda"
                image={analytics.topClip.influencerImage}
                colorRgb="244, 114, 182"
              />
              {analytics.topInfluencer && (
                <TopPerformerCard 
                  title="⭐ Best performer"
                  icon="👑"
                  name={analytics.topInfluencer.name}
                  value={formatNumber(analytics.topInfluencer.views)}
                  label={`(${analytics.topInfluencer.clips} klipova)`}
                  image={analytics.topInfluencer.image}
                  colorRgb="129, 140, 248"
                />
              )}
            </section>
          )}

          {/* Metrics Grid */}
          <section style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '16px',
            marginBottom: '24px'
          }}>
            <MetricCard 
              icon="👁️"
              label="Pregledi"
              value={formatNumber(selectedMonth?.totalViews)}
              subtext="ovaj mesec"
              colorRgb="129, 140, 248"
              onClick={() => openMetricModal('Pregledi', 'totalViews', '129, 140, 248')}
            />
            <MetricCard 
              icon="❤️"
              label="Lajkovi"
              value={formatNumber(selectedMonth?.totalLikes)}
              subtext="ovaj mesec"
              colorRgb="244, 114, 182"
              onClick={() => openMetricModal('Lajkovi', 'totalLikes', '244, 114, 182')}
            />
            <MetricCard 
              icon="💬"
              label="Komentari"
              value={formatNumber(selectedMonth?.totalComments)}
              subtext="ovaj mesec"
              colorRgb="251, 191, 36"
              onClick={() => openMetricModal('Komentari', 'totalComments', '251, 191, 36')}
            />
            <MetricCard 
              icon="🔄"
              label="Deljenja"
              value={formatNumber(selectedMonth?.totalShares)}
              subtext="ovaj mesec"
              colorRgb="52, 211, 153"
              onClick={() => openMetricModal('Deljenja', 'totalShares', '52, 211, 153')}
            />
          </section>

          {/* Two Column: Clips + Influencers */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '20px' }}>
            
            {/* Clips */}
            <section style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '16px',
              overflow: 'hidden',
              position: 'relative'
            }}>
              <div style={{ 
                padding: '18px 24px', 
                borderBottom: '1px solid rgba(255,255,255,0.06)', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center' 
              }}>
                <h2 style={{ fontSize: '15px', fontWeight: '600', margin: 0 }}>📹 Objavljeni klipovi</h2>
                <span style={{ 
                  fontSize: '12px', color: 'rgba(255,255,255,0.4)', 
                  background: 'rgba(255,255,255,0.05)', 
                  padding: '4px 12px', borderRadius: '100px' 
                }}>
                  {clips.length} klipova
                </span>
              </div>
              
              {clipsLoading ? (
                <div style={{ padding: '50px', textAlign: 'center' }}>
                  <p style={{ color: 'rgba(255,255,255,0.4)' }}>Učitavanje...</p>
                </div>
              ) : clips.length === 0 ? (
                <div style={{ padding: '50px', textAlign: 'center' }}>
                  <p style={{ color: 'rgba(255,255,255,0.4)' }}>Nema klipova za ovaj mesec</p>
                </div>
              ) : (
                <div style={{ position: 'relative' }}>
                  <div style={{ maxHeight: '420px', overflowY: 'auto' }}>
                    {clips.map((clip, i) => (
                      <div key={clip.id} style={{ 
                        display: 'flex', alignItems: 'center', 
                        padding: '14px 24px', 
                        borderBottom: '1px solid rgba(255,255,255,0.04)', 
                        gap: '14px',
                        transition: 'background 0.2s ease'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <div style={{
                          width: '44px', height: '44px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0,
                          background: clip.influencerImage ? 'transparent' : `linear-gradient(135deg, hsl(${(i * 47) % 360}, 50%, 50%), hsl(${(i * 47 + 30) % 360}, 50%, 40%))`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                          {clip.influencerImage ? (
                            <img src={clip.influencerImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <span style={{ color: '#fff', fontWeight: '600', fontSize: '15px' }}>{clip.influencer?.charAt(0) || '?'}</span>
                          )}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontWeight: '500', fontSize: '14px', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{clip.influencer}</p>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                            <PlatformIcon platform={clip.platform} />
                            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>{formatDate(clip.publishDate)}</span>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right', minWidth: '70px' }}>
                          <p style={{ fontSize: '15px', fontWeight: '700', margin: 0 }}>{formatNumber(clip.views)}</p>
                          <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', margin: '2px 0 0' }}>pregleda</p>
                        </div>
                        <StatusBadge status={clip.status} />
                        {clip.link ? (
                          <a href={clip.link} target="_blank" rel="noopener noreferrer" style={{
                            padding: '6px 12px', 
                            background: 'rgba(129, 140, 248, 0.15)', 
                            borderRadius: '8px',
                            color: '#818cf8', textDecoration: 'none', 
                            fontSize: '11px', fontWeight: '600',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(129, 140, 248, 0.25)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'rgba(129, 140, 248, 0.15)'}
                          >
                            Link ↗
                          </a>
                        ) : <span style={{ width: '50px' }} />}
                      </div>
                    ))}
                  </div>
                  {clips.length > 6 && (
                    <div style={{
                      position: 'absolute', bottom: 0, left: 0, right: 0, height: '70px',
                      background: 'linear-gradient(to top, rgba(10, 10, 20, 1) 0%, rgba(10, 10, 20, 0) 100%)',
                      pointerEvents: 'none'
                    }} />
                  )}
                </div>
              )}
            </section>

            {/* Influencers */}
            <section style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '16px',
              overflow: 'hidden',
              position: 'relative'
            }}>
              <div style={{ padding: '18px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '600', margin: 0 }}>
                  👥 Influenseri ({analytics.uniqueInfluencers.length})
                </h3>
              </div>
              
              {analytics.uniqueInfluencers.length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center' }}>
                  <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>Nema podataka</p>
                </div>
              ) : (
                <div style={{ position: 'relative' }}>
                  <div style={{ maxHeight: '380px', overflowY: 'auto', padding: '10px' }}>
                    {analytics.uniqueInfluencers.map((inf, i) => (
                      <div key={i} style={{
                        display: 'flex', alignItems: 'center', gap: '12px',
                        padding: '12px 14px', marginBottom: '6px',
                        background: 'rgba(255,255,255,0.02)', borderRadius: '12px',
                        transition: 'background 0.2s ease'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                      >
                        <div style={{
                          width: '38px', height: '38px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0,
                          background: inf.image ? 'transparent' : `linear-gradient(135deg, hsl(${(i * 67) % 360}, 50%, 50%), hsl(${(i * 67 + 40) % 360}, 50%, 40%))`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                          {inf.image ? (
                            <img src={inf.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <span style={{ color: '#fff', fontWeight: '600', fontSize: '14px' }}>{inf.name?.charAt(0) || '?'}</span>
                          )}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: '13px', fontWeight: '500', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{inf.name}</p>
                          <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', margin: '2px 0 0' }}>
                            {inf.clips} klip{inf.clips !== 1 ? 'a' : ''} • {formatNumber(inf.views)} pregleda
                          </p>
                        </div>
                        {i === 0 && (
                          <span style={{ fontSize: '16px' }}>👑</span>
                        )}
                      </div>
                    ))}
                  </div>
                  {analytics.uniqueInfluencers.length > 6 && (
                    <div style={{
                      position: 'absolute', bottom: 0, left: 0, right: 0, height: '60px',
                      background: 'linear-gradient(to top, rgba(10, 10, 20, 1) 0%, rgba(10, 10, 20, 0) 100%)',
                      pointerEvents: 'none'
                    }} />
                  )}
                </div>
              )}
            </section>
          </div>

          {/* Footer */}
          <footer style={{ 
            marginTop: '40px', paddingTop: '20px', 
            borderTop: '1px solid rgba(255,255,255,0.06)', 
            display: 'flex', justifyContent: 'space-between', alignItems: 'center' 
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)' }}>Powered by</span>
              <span style={{ fontSize: '14px', fontWeight: '700', color: 'rgba(255,255,255,0.6)' }}>VOICE</span>
            </div>
            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)' }}>{new Date().toLocaleString('sr-RS')}</p>
          </footer>
        </main>

        {/* Modals */}
        <BoostModal 
          isOpen={boostModalOpen} 
          onClose={() => setBoostModalOpen(false)} 
          clientName={clientData?.client?.name}
        />
        
        <MetricModal 
          isOpen={metricModal.isOpen}
          onClose={() => setMetricModal({ ...metricModal, isOpen: false })}
          title={metricModal.title}
          months={clientData?.months}
          metricKey={metricModal.metricKey}
          color={metricModal.color}
        />

        <InsightsModal
          isOpen={insightsModalOpen}
          onClose={() => setInsightsModalOpen(false)}
          clips={clips}
          months={clientData?.months || []}
          cumulative={cumulative}
        />
      </div>
    </>
  );
}
