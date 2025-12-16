// pages/client/[clientId].js - V9 PREMIUM with Charts
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

const formatPercent = (num) => {
  if (!num || isNaN(num)) return '0%';
  return num.toFixed(2) + '%';
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
      display: 'inline-block', padding: '4px 10px', borderRadius: '6px',
      fontSize: '10px', fontWeight: '600', background: style.bg, color: style.color,
      textTransform: 'uppercase', letterSpacing: '0.5px'
    }}>
      {status}
    </span>
  );
};

// Simple Donut Chart Component
const DonutChart = ({ data, size = 160, strokeWidth = 24 }) => {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  if (total === 0) return null;
  
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  let currentAngle = 0;

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        {data.map((segment, i) => {
          const percent = segment.value / total;
          const dashLength = circumference * percent;
          const dashOffset = circumference * currentAngle;
          currentAngle += percent;
          
          return (
            <circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={segment.color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${dashLength} ${circumference - dashLength}`}
              strokeDashoffset={-dashOffset}
              style={{ transition: 'all 0.5s ease' }}
            />
          );
        })}
      </svg>
      <div style={{
        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        textAlign: 'center'
      }}>
        <p style={{ fontSize: '20px', fontWeight: '700', margin: 0, color: '#fff' }}>{formatNumber(total)}</p>
        <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', margin: 0 }}>ukupno</p>
      </div>
    </div>
  );
};

// Horizontal Bar Chart
const HorizontalBarChart = ({ data, maxValue, color = '#818cf8' }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {data.map((item, i) => {
        const percent = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
        return (
          <div key={i}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)', fontWeight: '500' }}>{item.label}</span>
              <span style={{ fontSize: '12px', color: '#fff', fontWeight: '600' }}>{formatNumber(item.value)}</span>
            </div>
            <div style={{ height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{
                height: '100%', width: `${percent}%`,
                background: `linear-gradient(90deg, ${color} 0%, ${color}88 100%)`,
                borderRadius: '4px', transition: 'width 0.5s ease'
              }} />
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Mini Line Chart (sparkline)
const SparklineChart = ({ data, color = '#818cf8', height = 60 }) => {
  if (!data || data.length < 2) return null;
  
  const max = Math.max(...data.map(d => d.value));
  const min = Math.min(...data.map(d => d.value));
  const range = max - min || 1;
  
  const width = 200;
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((d.value - min) / range) * (height - 10) - 5;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={width} height={height} style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id="sparklineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {data.map((d, i) => {
        const x = (i / (data.length - 1)) * width;
        const y = height - ((d.value - min) / range) * (height - 10) - 5;
        return (
          <circle key={i} cx={x} cy={y} r="3" fill={color} />
        );
      })}
    </svg>
  );
};

// Stat Card with trend
const StatCard = ({ icon, label, value, subtext, trend, colorRgb }) => (
  <div style={{
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '16px',
    padding: '20px'
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
      <span style={{ fontSize: '18px' }}>{icon}</span>
      <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        {label}
      </span>
    </div>
    <p style={{ fontSize: '28px', fontWeight: '700', margin: '0 0 4px', color: '#fff' }}>{value}</p>
    {subtext && <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', margin: 0 }}>{subtext}</p>}
    {trend !== undefined && (
      <div style={{ 
        marginTop: '8px', display: 'inline-flex', alignItems: 'center', gap: '4px',
        background: trend >= 0 ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
        padding: '4px 8px', borderRadius: '6px'
      }}>
        <span style={{ color: trend >= 0 ? '#4ade80' : '#f87171', fontSize: '11px', fontWeight: '600' }}>
          {trend >= 0 ? '↑' : '↓'} {Math.abs(trend).toFixed(1)}%
        </span>
      </div>
    )}
  </div>
);

// Highlight Card
const HighlightCard = ({ icon, title, name, value, subtext, image, colorRgb }) => (
  <div style={{
    background: `linear-gradient(135deg, rgba(${colorRgb}, 0.12) 0%, rgba(${colorRgb}, 0.05) 100%)`,
    border: `1px solid rgba(${colorRgb}, 0.2)`,
    borderRadius: '16px',
    padding: '18px',
    flex: 1, minWidth: '200px'
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
      <span style={{ fontSize: '14px' }}>{icon}</span>
      <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        {title}
      </span>
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      {image !== undefined && (
        <div style={{
          width: '42px', height: '42px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0,
          background: image ? 'transparent' : `linear-gradient(135deg, rgba(${colorRgb}, 0.6) 0%, rgba(${colorRgb}, 0.3) 100%)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: `2px solid rgba(${colorRgb}, 0.3)`
        }}>
          {image ? (
            <img src={image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <span style={{ color: '#fff', fontWeight: '700', fontSize: '16px' }}>{name?.charAt(0) || '?'}</span>
          )}
        </div>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: '13px', fontWeight: '600', margin: '0 0 2px', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</p>
        <p style={{ fontSize: '16px', fontWeight: '700', margin: 0, color: `rgb(${colorRgb})` }}>
          {value} {subtext && <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontWeight: '400' }}>{subtext}</span>}
        </p>
      </div>
    </div>
  </div>
);

// Section Header
const SectionHeader = ({ icon, title, subtitle }) => (
  <div style={{ marginBottom: '16px' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <span style={{ fontSize: '18px' }}>{icon}</span>
      <h2 style={{ fontSize: '16px', fontWeight: '700', margin: 0, color: '#fff' }}>{title}</h2>
    </div>
    {subtitle && <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', margin: '4px 0 0 26px' }}>{subtitle}</p>}
  </div>
);

// WhatsApp Boost Modal
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
      background: 'rgba(0, 0, 0, 0.9)', backdropFilter: 'blur(16px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: '20px'
    }} onClick={onClose}>
      <div style={{
        background: 'linear-gradient(180deg, #1a1a2e 0%, #141428 100%)',
        borderRadius: '28px', padding: '40px', maxWidth: '520px', width: '100%',
        border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 40px 80px rgba(0,0,0,0.6)',
        position: 'relative'
      }} onClick={e => e.stopPropagation()}>
        
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div style={{
            width: '90px', height: '90px', borderRadius: '50%', overflow: 'hidden',
            margin: '0 auto 20px', border: '3px solid rgba(37, 211, 102, 0.4)',
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

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginBottom: '28px' }}>
          {packages.map((pkg, i) => (
            <div key={i} onClick={() => handleSelect(pkg)} style={{
              background: pkg.popular ? 'linear-gradient(135deg, rgba(129, 140, 248, 0.2) 0%, rgba(167, 139, 250, 0.15) 100%)' : 'rgba(255,255,255,0.03)',
              border: pkg.popular ? '2px solid rgba(129, 140, 248, 0.5)' : '1px solid rgba(255,255,255,0.08)',
              borderRadius: '16px', padding: '24px 16px', textAlign: 'center', cursor: 'pointer',
              transition: 'all 0.25s ease', position: 'relative'
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 16px 40px rgba(129, 140, 248, 0.2)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              {pkg.popular && (
                <div style={{
                  position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)',
                  background: 'linear-gradient(135deg, #818cf8 0%, #a78bfa 100%)',
                  padding: '4px 14px', borderRadius: '100px',
                  fontSize: '10px', fontWeight: '700', color: '#fff', textTransform: 'uppercase'
                }}>Popularno</div>
              )}
              <p style={{ fontSize: '36px', fontWeight: '800', margin: '0 0 4px', color: '#fff' }}>{pkg.views}</p>
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', margin: '0 0 16px' }}>pregleda</p>
              <p style={{ fontSize: '22px', fontWeight: '700', margin: 0, color: pkg.popular ? '#a78bfa' : '#818cf8' }}>€{pkg.price}</p>
            </div>
          ))}
        </div>

        <button onClick={onClose} style={{
          position: 'absolute', top: '20px', right: '20px',
          background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '50%',
          width: '40px', height: '40px', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.5)'
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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

  // Calculate all analytics
  const analytics = useMemo(() => {
    const months = clientData?.months || [];
    const cumulative = clientData?.cumulative || {};
    
    // Basic stats
    const totalViews = cumulative.totalViews || 0;
    const totalLikes = cumulative.totalLikes || 0;
    const totalComments = cumulative.totalComments || 0;
    const totalShares = cumulative.totalShares || 0;
    const totalSaves = cumulative.totalSaves || 0;
    const totalClips = cumulative.totalClips || clips.length;
    
    // Engagement Rate
    const engagementRate = totalViews > 0 
      ? ((totalLikes + totalComments + totalShares) / totalViews * 100)
      : 0;
    
    // Viral Score (shares per 1000 views)
    const viralScore = totalViews > 0 ? (totalShares / totalViews * 1000) : 0;
    
    // Save Rate
    const saveRate = totalViews > 0 ? (totalSaves / totalViews * 100) : 0;
    
    // Avg views per clip
    const avgViewsPerClip = totalClips > 0 ? Math.round(totalViews / totalClips) : 0;
    
    // Influencer stats from clips
    const influencerStats = {};
    clips.forEach(clip => {
      const name = clip.influencer || 'Unknown';
      if (!influencerStats[name]) {
        influencerStats[name] = { name, views: 0, likes: 0, comments: 0, shares: 0, saves: 0, clips: 0, image: clip.influencerImage };
      }
      influencerStats[name].views += clip.views || 0;
      influencerStats[name].likes += clip.likes || 0;
      influencerStats[name].comments += clip.comments || 0;
      influencerStats[name].shares += clip.shares || 0;
      influencerStats[name].saves += clip.saves || 0;
      influencerStats[name].clips += 1;
    });
    const influencerList = Object.values(influencerStats).sort((a, b) => b.views - a.views);
    const avgViewsPerInfluencer = influencerList.length > 0 
      ? Math.round(clips.reduce((sum, c) => sum + (c.views || 0), 0) / influencerList.length)
      : 0;
    
    // Top clips
    const topClips = [...clips].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 5);
    const topClip = topClips[0] || null;
    
    // Most viral clip (highest share rate)
    const clipsWithViralScore = clips.filter(c => c.views > 0).map(c => ({
      ...c,
      viralScore: (c.shares || 0) / c.views * 1000
    }));
    const mostViralClip = clipsWithViralScore.sort((a, b) => b.viralScore - a.viralScore)[0] || null;
    
    // Most saved clip
    const mostSavedClip = [...clips].sort((a, b) => (b.saves || 0) - (a.saves || 0))[0] || null;
    
    // Platform split
    const tiktokClips = clips.filter(c => c.platform === 'Tik Tok' || c.platform === 'TikTok');
    const instaClips = clips.filter(c => c.platform === 'Instagram');
    const tiktokViews = tiktokClips.reduce((sum, c) => sum + (c.views || 0), 0);
    const instaViews = instaClips.reduce((sum, c) => sum + (c.views || 0), 0);
    
    // Best day of week
    const dayStats = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
    const dayNames = ['Nedelja', 'Ponedeljak', 'Utorak', 'Sreda', 'Četvrtak', 'Petak', 'Subota'];
    clips.forEach(c => {
      if (c.publishDate) {
        const day = new Date(c.publishDate).getDay();
        dayStats[day] += c.views || 0;
      }
    });
    const bestDayIndex = Object.entries(dayStats).sort((a, b) => b[1] - a[1])[0]?.[0] || 0;
    const bestDay = dayNames[bestDayIndex];
    
    // Best month
    const bestMonth = months.length > 0 
      ? months.reduce((best, m) => (m.totalViews > (best?.totalViews || 0)) ? m : best, months[0])
      : null;
    
    // Fastest growing month
    let fastestGrowingMonth = null;
    let maxGrowth = -Infinity;
    for (let i = 1; i < months.length; i++) {
      const prev = months[i].totalViews || 0; // months are sorted desc, so i is older
      const curr = months[i-1].totalViews || 0;
      if (prev > 0) {
        const growth = ((curr - prev) / prev) * 100;
        if (growth > maxGrowth) {
          maxGrowth = growth;
          fastestGrowingMonth = { month: months[i-1], growth };
        }
      }
    }
    
    // Views trend data for sparkline
    const viewsTrend = [...months].reverse().map(m => ({ month: m.month, value: m.totalViews || 0 }));
    
    // Engagement breakdown for donut
    const engagementBreakdown = [
      { name: 'Lajkovi', value: totalLikes, color: '#f472b6' },
      { name: 'Komentari', value: totalComments, color: '#fbbf24' },
      { name: 'Deljenja', value: totalShares, color: '#34d399' },
      { name: 'Sačuvano', value: totalSaves, color: '#60a5fa' }
    ].filter(d => d.value > 0);
    
    return {
      engagementRate,
      viralScore,
      saveRate,
      avgViewsPerClip,
      avgViewsPerInfluencer,
      influencerList,
      topClips,
      topClip,
      mostViralClip,
      mostSavedClip,
      tiktokViews,
      instaViews,
      tiktokClips: tiktokClips.length,
      instaClips: instaClips.length,
      bestDay,
      bestMonth,
      fastestGrowingMonth,
      viewsTrend,
      engagementBreakdown,
      totalEngagement: totalLikes + totalComments + totalShares + totalSaves
    };
  }, [clientData, clips]);

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 100%)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '50px', height: '50px', border: '3px solid rgba(129, 140, 248, 0.2)',
            borderTopColor: '#818cf8', borderRadius: '50%', animation: 'spin 1s linear infinite',
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
  const months = clientData?.months || [];

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
          background: 'rgba(15, 15, 26, 0.95)', backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          position: 'sticky', top: 0, zIndex: 100
        }}>
          <div style={{
            maxWidth: '1400px', margin: '0 auto', padding: '16px 28px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <VoiceLogo />
              <div style={{ height: '28px', width: '1px', background: 'rgba(255,255,255,0.1)' }} />
              <div>
                <h1 style={{ fontSize: '20px', fontWeight: '700', margin: 0 }}>{clientData?.client?.name}</h1>
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', margin: '2px 0 0' }}>Campaign Dashboard</p>
              </div>
            </div>
            
            <button onClick={() => setBoostModalOpen(true)} style={{
              display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px',
              background: 'linear-gradient(135deg, #818cf8 0%, #a78bfa 100%)',
              border: 'none', borderRadius: '10px', color: '#fff', fontSize: '13px', fontWeight: '600',
              cursor: 'pointer', boxShadow: '0 4px 16px rgba(129, 140, 248, 0.25)'
            }}>
              <span>⚡</span> Boost kampanju
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '32px 28px' }}>
          
          {/* Hero Section - Cumulative Progress */}
          {months.length > 0 && (
            <section style={{
              background: 'linear-gradient(135deg, rgba(129, 140, 248, 0.1) 0%, rgba(167, 139, 250, 0.05) 100%)',
              border: '1px solid rgba(129, 140, 248, 0.15)',
              borderRadius: '24px', padding: '32px', marginBottom: '24px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '20px' }}>
                <div>
                  <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    🎯 Celokupna kampanja ({months.length} {months.length === 1 ? 'mesec' : 'meseci'})
                  </p>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '48px', fontWeight: '800', letterSpacing: '-2px' }}>{formatNumber(cumulative.totalViews)}</span>
                    <span style={{ fontSize: '18px', color: 'rgba(255,255,255,0.4)' }}>/ {formatNumber(cumulative.totalGoal)} pregleda</span>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '38px', fontWeight: '800', margin: 0, color: cumulative.percentDelivered >= 1 ? '#4ade80' : '#818cf8' }}>
                    {(cumulative.percentDelivered * 100).toFixed(0)}%
                  </p>
                  <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', margin: '4px 0 0' }}>isporučeno</p>
                </div>
              </div>
              
              <div style={{ height: '12px', background: 'rgba(255,255,255,0.08)', borderRadius: '100px', overflow: 'hidden', marginBottom: '20px' }}>
                <div style={{
                  height: '100%', width: `${Math.min(cumulative.percentDelivered * 100, 100)}%`,
                  background: cumulative.percentDelivered >= 1 
                    ? 'linear-gradient(90deg, #22c55e 0%, #4ade80 100%)' 
                    : 'linear-gradient(90deg, #818cf8 0%, #a78bfa 50%, #c4b5fd 100%)',
                  borderRadius: '100px', boxShadow: '0 0 20px rgba(129, 140, 248, 0.4)'
                }} />
              </div>

              <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap', alignItems: 'center' }}>
                <div>
                  <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', margin: '0 0 4px', textTransform: 'uppercase' }}>Klipovi</p>
                  <p style={{ fontSize: '18px', fontWeight: '700', margin: 0 }}>{cumulative.totalClips}</p>
                </div>
                <div>
                  <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', margin: '0 0 4px', textTransform: 'uppercase' }}>Lajkovi</p>
                  <p style={{ fontSize: '18px', fontWeight: '700', margin: 0 }}>{formatNumber(cumulative.totalLikes)}</p>
                </div>
                <div>
                  <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', margin: '0 0 4px', textTransform: 'uppercase' }}>Komentari</p>
                  <p style={{ fontSize: '18px', fontWeight: '700', margin: 0 }}>{formatNumber(cumulative.totalComments)}</p>
                </div>
                <div>
                  <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', margin: '0 0 4px', textTransform: 'uppercase' }}>Deljenja</p>
                  <p style={{ fontSize: '18px', fontWeight: '700', margin: 0 }}>{formatNumber(cumulative.totalShares)}</p>
                </div>
                {analytics.viewsTrend.length > 1 && (
                  <div style={{ marginLeft: 'auto' }}>
                    <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', margin: '0 0 4px', textTransform: 'uppercase' }}>Trend pregleda</p>
                    <SparklineChart data={analytics.viewsTrend} color="#818cf8" height={40} />
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Month Selector */}
          <section style={{
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '16px', padding: '18px 24px', marginBottom: '24px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '20px', flexWrap: 'wrap'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>📅 Mesec:</span>
              <select value={selectedMonthIndex} onChange={(e) => setSelectedMonthIndex(Number(e.target.value))} style={{
                padding: '10px 36px 10px 14px', fontSize: '14px', fontWeight: '600',
                border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px',
                background: 'rgba(255,255,255,0.05)', color: '#fff', cursor: 'pointer',
                appearance: 'none',
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23ffffff' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center'
              }}>
                {months.map((month, index) => (
                  <option key={month.id} value={index} style={{ background: '#1a1a2e' }}>{month.month}</option>
                ))}
              </select>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', margin: '0 0 2px' }}>Ovaj mesec</p>
                <p style={{ fontSize: '16px', fontWeight: '700', margin: 0 }}>
                  {formatNumber(selectedMonth?.totalViews)} <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>/ {formatNumber(selectedMonth?.campaignGoal)}</span>
                </p>
              </div>
              <div style={{ width: '100px', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '100px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${Math.min(progressPercent * 100, 100)}%`, background: progressPercent >= 1 ? '#4ade80' : '#818cf8', borderRadius: '100px' }} />
              </div>
              <span style={{ fontSize: '14px', fontWeight: '700', color: progressPercent >= 1 ? '#4ade80' : '#818cf8' }}>
                {(progressPercent * 100).toFixed(0)}%
              </span>
              <StatusBadge status={selectedMonth?.contractStatus || 'Active'} />
            </div>
          </section>

          {/* Key Metrics Grid */}
          <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            <StatCard icon="📊" label="Engagement Rate" value={formatPercent(analytics.engagementRate)} subtext="interakcija / pregledi" />
            <StatCard icon="🚀" label="Viral Score" value={analytics.viralScore.toFixed(1)} subtext="deljenja na 1K views" />
            <StatCard icon="💾" label="Save Rate" value={formatPercent(analytics.saveRate)} subtext="sačuvano / pregledi" />
            <StatCard icon="📹" label="Prosek po klipu" value={formatNumber(analytics.avgViewsPerClip)} subtext="pregleda" />
            <StatCard icon="👤" label="Prosek po influenceru" value={formatNumber(analytics.avgViewsPerInfluencer)} subtext="pregleda" />
            <StatCard icon="📆" label="Najbolji dan" value={analytics.bestDay} subtext="za objavljivanje" />
          </section>

          {/* Charts Row */}
          <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '24px' }}>
            
            {/* Engagement Breakdown Donut */}
            <div style={{
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '20px', padding: '24px'
            }}>
              <SectionHeader icon="🎯" title="Engagement Breakdown" subtitle="Raspodela interakcija" />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', flexWrap: 'wrap', gap: '20px' }}>
                <DonutChart data={analytics.engagementBreakdown} size={150} strokeWidth={22} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {analytics.engagementBreakdown.map((item, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: item.color }} />
                      <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>{item.name}</span>
                      <span style={{ fontSize: '13px', fontWeight: '600', color: '#fff', marginLeft: 'auto' }}>{formatNumber(item.value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Platform Split */}
            <div style={{
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '20px', padding: '24px'
            }}>
              <SectionHeader icon="📱" title="Platform Split" subtitle="TikTok vs Instagram" />
              <div style={{ marginTop: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <PlatformIcon platform="TikTok" size={20} />
                    <span style={{ fontSize: '14px', fontWeight: '600' }}>TikTok</span>
                  </div>
                  <span style={{ fontSize: '14px', fontWeight: '700' }}>{formatNumber(analytics.tiktokViews)}</span>
                </div>
                <div style={{ height: '24px', background: 'rgba(255,255,255,0.1)', borderRadius: '12px', overflow: 'hidden', marginBottom: '20px' }}>
                  {(analytics.tiktokViews + analytics.instaViews) > 0 && (
                    <>
                      <div style={{
                        height: '100%', width: `${(analytics.tiktokViews / (analytics.tiktokViews + analytics.instaViews)) * 100}%`,
                        background: 'linear-gradient(90deg, #ff0050 0%, #00f2ea 100%)',
                        borderRadius: '12px', float: 'left'
                      }} />
                    </>
                  )}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <PlatformIcon platform="Instagram" size={20} />
                    <span style={{ fontSize: '14px', fontWeight: '600' }}>Instagram</span>
                  </div>
                  <span style={{ fontSize: '14px', fontWeight: '700' }}>{formatNumber(analytics.instaViews)}</span>
                </div>
                <div style={{ display: 'flex', gap: '20px', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <div>
                    <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', margin: '0 0 2px' }}>TikTok klipovi</p>
                    <p style={{ fontSize: '16px', fontWeight: '700', margin: 0 }}>{analytics.tiktokClips}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', margin: '0 0 2px' }}>Instagram klipovi</p>
                    <p style={{ fontSize: '16px', fontWeight: '700', margin: 0 }}>{analytics.instaClips}</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Top 5 Clips & Influencer Leaderboard */}
          <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '20px', marginBottom: '24px' }}>
            
            {/* Top 5 Clips */}
            <div style={{
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '20px', padding: '24px'
            }}>
              <SectionHeader icon="🏆" title="Top 5 Klipova" subtitle="Najviše pregleda" />
              {analytics.topClips.length > 0 ? (
                <HorizontalBarChart 
                  data={analytics.topClips.map(c => ({ label: c.influencer, value: c.views || 0 }))}
                  maxValue={analytics.topClips[0]?.views || 0}
                  color="#f472b6"
                />
              ) : (
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', textAlign: 'center', padding: '20px' }}>Nema podataka</p>
              )}
            </div>

            {/* Influencer Leaderboard */}
            <div style={{
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '20px', padding: '24px'
            }}>
              <SectionHeader icon="👑" title="Influencer Leaderboard" subtitle="Ranking po pregledima" />
              {analytics.influencerList.length > 0 ? (
                <HorizontalBarChart 
                  data={analytics.influencerList.slice(0, 5).map(inf => ({ label: inf.name, value: inf.views }))}
                  maxValue={analytics.influencerList[0]?.views || 0}
                  color="#818cf8"
                />
              ) : (
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', textAlign: 'center', padding: '20px' }}>Nema podataka</p>
              )}
            </div>
          </section>

          {/* Highlights Row */}
          <section style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '24px' }}>
            {analytics.topClip && (
              <HighlightCard 
                icon="🔥" title="Top Klip" 
                name={analytics.topClip.influencer}
                value={formatNumber(analytics.topClip.views)} subtext="pregleda"
                image={analytics.topClip.influencerImage}
                colorRgb="244, 114, 182"
              />
            )}
            {analytics.influencerList[0] && (
              <HighlightCard 
                icon="⭐" title="MVP Influencer" 
                name={analytics.influencerList[0].name}
                value={formatNumber(analytics.influencerList[0].views)} subtext={`(${analytics.influencerList[0].clips} klipova)`}
                image={analytics.influencerList[0].image}
                colorRgb="129, 140, 248"
              />
            )}
            {analytics.mostViralClip && (
              <HighlightCard 
                icon="🚀" title="Most Viral" 
                name={analytics.mostViralClip.influencer}
                value={analytics.mostViralClip.viralScore.toFixed(1)} subtext="viral score"
                image={analytics.mostViralClip.influencerImage}
                colorRgb="52, 211, 153"
              />
            )}
            {analytics.mostSavedClip && analytics.mostSavedClip.saves > 0 && (
              <HighlightCard 
                icon="💾" title="Most Saved" 
                name={analytics.mostSavedClip.influencer}
                value={formatNumber(analytics.mostSavedClip.saves)} subtext="sačuvano"
                image={analytics.mostSavedClip.influencerImage}
                colorRgb="96, 165, 250"
              />
            )}
            {analytics.bestMonth && (
              <HighlightCard 
                icon="📈" title="Best Month" 
                name={analytics.bestMonth.month}
                value={formatNumber(analytics.bestMonth.totalViews)} subtext="pregleda"
                colorRgb="167, 139, 250"
              />
            )}
            {analytics.fastestGrowingMonth && (
              <HighlightCard 
                icon="📊" title="Fastest Growth" 
                name={analytics.fastestGrowingMonth.month.month}
                value={`+${analytics.fastestGrowingMonth.growth.toFixed(0)}%`} subtext="rast"
                colorRgb="251, 191, 36"
              />
            )}
          </section>

          {/* Clips & Influencers Tables */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '20px', marginBottom: '24px' }}>
            
            {/* All Clips */}
            <section style={{
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '20px', overflow: 'hidden', position: 'relative'
            }}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontSize: '15px', fontWeight: '600', margin: 0 }}>📹 Svi klipovi</h2>
                <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.05)', padding: '4px 12px', borderRadius: '100px' }}>
                  {clips.length} klipova
                </span>
              </div>
              
              {clipsLoading ? (
                <div style={{ padding: '50px', textAlign: 'center' }}><p style={{ color: 'rgba(255,255,255,0.4)' }}>Učitavanje...</p></div>
              ) : clips.length === 0 ? (
                <div style={{ padding: '50px', textAlign: 'center' }}><p style={{ color: 'rgba(255,255,255,0.4)' }}>Nema klipova</p></div>
              ) : (
                <div style={{ position: 'relative' }}>
                  <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                    {clips.map((clip, i) => (
                      <div key={clip.id} style={{
                        display: 'flex', alignItems: 'center', padding: '14px 24px',
                        borderBottom: '1px solid rgba(255,255,255,0.04)', gap: '14px'
                      }}>
                        <div style={{
                          width: '42px', height: '42px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0,
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
                        <div style={{ textAlign: 'right', minWidth: '65px' }}>
                          <p style={{ fontSize: '14px', fontWeight: '700', margin: 0 }}>{formatNumber(clip.views)}</p>
                          <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', margin: '2px 0 0' }}>pregleda</p>
                        </div>
                        <StatusBadge status={clip.status} />
                        {clip.link ? (
                          <a href={clip.link} target="_blank" rel="noopener noreferrer" style={{
                            padding: '6px 12px', background: 'rgba(129, 140, 248, 0.15)', borderRadius: '8px',
                            color: '#818cf8', textDecoration: 'none', fontSize: '11px', fontWeight: '600'
                          }}>Link ↗</a>
                        ) : <span style={{ width: '55px' }} />}
                      </div>
                    ))}
                  </div>
                  {clips.length > 5 && (
                    <div style={{
                      position: 'absolute', bottom: 0, left: 0, right: 0, height: '60px',
                      background: 'linear-gradient(to top, rgba(10, 10, 20, 1) 0%, rgba(10, 10, 20, 0) 100%)',
                      pointerEvents: 'none'
                    }} />
                  )}
                </div>
              )}
            </section>

            {/* Influencers */}
            <section style={{
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '20px', overflow: 'hidden', position: 'relative'
            }}>
              <div style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '600', margin: 0 }}>👥 Influenseri ({analytics.influencerList.length})</h3>
              </div>
              
              {analytics.influencerList.length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center' }}><p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>Nema podataka</p></div>
              ) : (
                <div style={{ position: 'relative' }}>
                  <div style={{ maxHeight: '360px', overflowY: 'auto', padding: '10px' }}>
                    {analytics.influencerList.map((inf, i) => (
                      <div key={i} style={{
                        display: 'flex', alignItems: 'center', gap: '12px',
                        padding: '12px 14px', marginBottom: '6px',
                        background: i === 0 ? 'rgba(129, 140, 248, 0.1)' : 'rgba(255,255,255,0.02)',
                        borderRadius: '12px', border: i === 0 ? '1px solid rgba(129, 140, 248, 0.2)' : '1px solid transparent'
                      }}>
                        <span style={{ fontSize: '12px', fontWeight: '700', color: 'rgba(255,255,255,0.3)', width: '20px' }}>#{i + 1}</span>
                        <div style={{
                          width: '36px', height: '36px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0,
                          background: inf.image ? 'transparent' : `linear-gradient(135deg, hsl(${(i * 67) % 360}, 50%, 50%), hsl(${(i * 67 + 40) % 360}, 50%, 40%))`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                          {inf.image ? (
                            <img src={inf.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <span style={{ color: '#fff', fontWeight: '600', fontSize: '13px' }}>{inf.name?.charAt(0) || '?'}</span>
                          )}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: '13px', fontWeight: '500', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{inf.name}</p>
                          <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', margin: '2px 0 0' }}>
                            {inf.clips} klip{inf.clips !== 1 ? 'a' : ''} • {formatNumber(inf.views)}
                          </p>
                        </div>
                        {i === 0 && <span style={{ fontSize: '16px' }}>👑</span>}
                      </div>
                    ))}
                  </div>
                  {analytics.influencerList.length > 5 && (
                    <div style={{
                      position: 'absolute', bottom: 0, left: 0, right: 0, height: '50px',
                      background: 'linear-gradient(to top, rgba(10, 10, 20, 1) 0%, rgba(10, 10, 20, 0) 100%)',
                      pointerEvents: 'none'
                    }} />
                  )}
                </div>
              )}
            </section>
          </div>

          {/* Footer */}
          <footer style={{ marginTop: '40px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)' }}>Powered by</span>
              <span style={{ fontSize: '14px', fontWeight: '700', color: 'rgba(255,255,255,0.6)' }}>VOICE</span>
            </div>
            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)' }}>{new Date().toLocaleString('sr-RS')}</p>
          </footer>
        </main>

        <BoostModal isOpen={boostModalOpen} onClose={() => setBoostModalOpen(false)} clientName={clientData?.client?.name} />
      </div>
    </>
  );
}
