// pages/client/[clientId].js - V10 PREMIUM
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

// Metric Detail Modal with Heat Map
const MetricModal = ({ isOpen, onClose, title, data, color, description }) => {
  if (!isOpen || !data || data.length === 0) return null;

  const sortedData = [...data].sort((a, b) => b.value - a.value);
  const maxValue = Math.max(...sortedData.map(v => v.value), 1);
  const total = sortedData.reduce((sum, v) => sum + v.value, 0);

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(12px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: '20px'
    }} onClick={onClose}>
      <div style={{
        background: 'linear-gradient(180deg, #1e1e38 0%, #18182d 100%)',
        borderRadius: '24px', padding: '32px', maxWidth: '480px', width: '100%',
        border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 30px 60px rgba(0,0,0,0.5)',
        position: 'relative'
      }} onClick={e => e.stopPropagation()}>
        
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '700', margin: '0 0 6px', color: '#fff' }}>{title}</h2>
          {description && <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', margin: 0 }}>{description}</p>}
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', margin: '8px 0 0' }}>
            Ukupno: <span style={{ color: '#fff', fontWeight: '700', fontSize: '18px' }}>{formatNumber(total)}</span>
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '350px', overflowY: 'auto' }}>
          {sortedData.map((item, i) => {
            const intensity = item.value / maxValue;
            const bgOpacity = 0.08 + (intensity * 0.35);
            const textOpacity = 0.4 + (intensity * 0.6);
            
            return (
              <div key={i} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '14px 16px', background: `rgba(${color}, ${bgOpacity})`,
                borderRadius: '12px', borderLeft: `3px solid rgba(${color}, ${0.3 + intensity * 0.7})`
              }}>
                <span style={{ fontSize: '14px', fontWeight: '500', color: `rgba(255,255,255,${textOpacity})` }}>{item.label}</span>
                <span style={{ fontSize: '18px', fontWeight: '700', color: `rgba(255,255,255,${textOpacity})` }}>{formatNumber(item.value)}</span>
              </div>
            );
          })}
        </div>

        <button onClick={onClose} style={{
          position: 'absolute', top: '20px', right: '20px',
          background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '50%',
          width: '36px', height: '36px', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.5)'
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
      </div>
    </div>
  );
};

// Interactive Metric Card with hover explanation
const MetricCard = ({ icon, label, value, onClick, colorRgb, description }) => {
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
        background: isHovered ? `rgba(${colorRgb}, 0.15)` : 'rgba(255,255,255,0.03)',
        border: isHovered ? `1px solid rgba(${colorRgb}, 0.3)` : '1px solid rgba(255,255,255,0.06)',
        transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: isHovered ? `0 12px 32px rgba(${colorRgb}, 0.2)` : 'none',
        transition: 'all 0.25s ease',
        position: 'relative'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
        <span style={{ fontSize: '20px' }}>{icon}</span>
        <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</span>
      </div>
      <p style={{ fontSize: '28px', fontWeight: '700', margin: 0, color: '#fff' }}>{value}</p>
      
      {isHovered && description && (
        <div style={{
          position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)',
          background: 'rgba(0,0,0,0.9)', padding: '8px 12px', borderRadius: '8px',
          fontSize: '11px', color: 'rgba(255,255,255,0.8)', whiteSpace: 'nowrap',
          marginBottom: '8px', zIndex: 10
        }}>
          {description}
          <div style={{
            position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)',
            border: '6px solid transparent', borderTopColor: 'rgba(0,0,0,0.9)'
          }} />
        </div>
      )}
      
      {isHovered && (
        <p style={{ fontSize: '10px', color: `rgba(${colorRgb}, 0.9)`, margin: '8px 0 0', fontWeight: '500' }}>
          Klikni za detalje →
        </p>
      )}
    </div>
  );
};

// Pie Chart for Platform Split
const PieChart = ({ data, size = 140 }) => {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  if (total === 0) return null;
  
  let currentAngle = -90; // Start from top
  
  const segments = data.map((d, i) => {
    const percent = d.value / total;
    const angle = percent * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    currentAngle = endAngle;
    
    // Calculate arc path
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;
    const radius = size / 2 - 5;
    const cx = size / 2;
    const cy = size / 2;
    
    const x1 = cx + radius * Math.cos(startRad);
    const y1 = cy + radius * Math.sin(startRad);
    const x2 = cx + radius * Math.cos(endRad);
    const y2 = cy + radius * Math.sin(endRad);
    
    const largeArc = angle > 180 ? 1 : 0;
    
    return {
      ...d,
      percent,
      path: `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`
    };
  });

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
      <svg width={size} height={size}>
        {segments.map((seg, i) => (
          <path key={i} d={seg.path} fill={seg.color} style={{ transition: 'all 0.3s ease' }} />
        ))}
        {/* Center circle for donut effect */}
        <circle cx={size/2} cy={size/2} r={size/4} fill="#18182d" />
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {segments.map((seg, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '14px', height: '14px', borderRadius: '4px', background: seg.color }} />
            <div>
              <p style={{ fontSize: '13px', fontWeight: '600', margin: 0, color: '#fff' }}>{seg.name}</p>
              <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', margin: 0 }}>
                {formatNumber(seg.value)} ({(seg.percent * 100).toFixed(0)}%)
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Donut Chart
const DonutChart = ({ data, size = 140, strokeWidth = 20 }) => {
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
            <circle key={i} cx={size / 2} cy={size / 2} r={radius}
              fill="none" stroke={segment.color} strokeWidth={strokeWidth}
              strokeDasharray={`${dashLength} ${circumference - dashLength}`}
              strokeDashoffset={-dashOffset} style={{ transition: 'all 0.5s ease' }}
            />
          );
        })}
      </svg>
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
        <p style={{ fontSize: '18px', fontWeight: '700', margin: 0, color: '#fff' }}>{formatNumber(total)}</p>
        <p style={{ fontSize: '9px', color: 'rgba(255,255,255,0.5)', margin: 0 }}>ukupno</p>
      </div>
    </div>
  );
};

// Horizontal Bar with influencer name and link
const TopClipsChart = ({ clips, maxValue }) => {
  if (!clips || clips.length === 0) return <p style={{ color: 'rgba(255,255,255,0.4)', textAlign: 'center', padding: '20px' }}>Nema podataka</p>;
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {clips.map((clip, i) => {
        const percent = maxValue > 0 ? (clip.views / maxValue) * 100 : 0;
        return (
          <div key={i}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: '700', color: i === 0 ? '#fbbf24' : 'rgba(255,255,255,0.4)' }}>#{i + 1}</span>
                <span style={{ fontSize: '13px', color: '#fff', fontWeight: '500' }}>{clip.influencer}</span>
                <PlatformIcon platform={clip.platform} size={12} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '14px', fontWeight: '700', color: '#fff' }}>{formatNumber(clip.views)}</span>
                {clip.link && (
                  <a href={clip.link} target="_blank" rel="noopener noreferrer" style={{
                    fontSize: '10px', color: '#818cf8', textDecoration: 'none', fontWeight: '600'
                  }}>↗</a>
                )}
              </div>
            </div>
            <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{
                height: '100%', width: `${percent}%`,
                background: i === 0 ? 'linear-gradient(90deg, #fbbf24 0%, #f59e0b 100%)' : 'linear-gradient(90deg, #f472b6 0%, #f472b688 100%)',
                borderRadius: '3px'
              }} />
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Clickable Highlight Card with tooltip
const HighlightCard = ({ icon, title, name, value, subtext, image, colorRgb, link, tooltip }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const content = (
    <div 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        background: `linear-gradient(135deg, rgba(${colorRgb}, 0.12) 0%, rgba(${colorRgb}, 0.05) 100%)`,
        border: `1px solid rgba(${colorRgb}, ${isHovered ? 0.4 : 0.2})`,
        borderRadius: '16px', padding: '18px', flex: 1, minWidth: '180px',
        cursor: link ? 'pointer' : 'default',
        transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
        transition: 'all 0.2s ease',
        position: 'relative'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
        <span style={{ fontSize: '14px' }}>{icon}</span>
        <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{title}</span>
        {link && <span style={{ fontSize: '10px', color: `rgba(${colorRgb}, 0.8)`, marginLeft: 'auto' }}>↗</span>}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {image !== undefined && (
          <div style={{
            width: '40px', height: '40px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0,
            background: image ? 'transparent' : `linear-gradient(135deg, rgba(${colorRgb}, 0.6) 0%, rgba(${colorRgb}, 0.3) 100%)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', border: `2px solid rgba(${colorRgb}, 0.3)`
          }}>
            {image ? <img src={image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <span style={{ color: '#fff', fontWeight: '700', fontSize: '15px' }}>{name?.charAt(0) || '?'}</span>}
          </div>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: '12px', fontWeight: '600', margin: '0 0 2px', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</p>
          <p style={{ fontSize: '15px', fontWeight: '700', margin: 0, color: `rgb(${colorRgb})` }}>
            {value} {subtext && <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', fontWeight: '400' }}>{subtext}</span>}
          </p>
        </div>
      </div>
      
      {isHovered && tooltip && (
        <div style={{
          position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)',
          background: 'rgba(0,0,0,0.95)', padding: '8px 12px', borderRadius: '8px',
          fontSize: '11px', color: 'rgba(255,255,255,0.9)', whiteSpace: 'nowrap',
          marginBottom: '8px', zIndex: 10
        }}>
          {tooltip}
        </div>
      )}
    </div>
  );
  
  if (link) {
    return <a href={link} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', flex: 1, minWidth: '180px' }}>{content}</a>;
  }
  return content;
};

// Stat Card for analytics
const StatCard = ({ icon, label, value, description }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '14px', padding: '16px', position: 'relative'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
        <span style={{ fontSize: '16px' }}>{icon}</span>
        <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>{label}</span>
      </div>
      <p style={{ fontSize: '22px', fontWeight: '700', margin: 0, color: '#fff' }}>{value}</p>
      
      {isHovered && description && (
        <div style={{
          position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)',
          background: 'rgba(0,0,0,0.95)', padding: '8px 12px', borderRadius: '8px',
          fontSize: '11px', color: 'rgba(255,255,255,0.9)', whiteSpace: 'nowrap',
          marginBottom: '8px', zIndex: 10
        }}>
          {description}
        </div>
      )}
    </div>
  );
};

// WhatsApp Boost Modal
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
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(16px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }} onClick={onClose}>
      <div style={{ background: 'linear-gradient(180deg, #1a1a2e 0%, #141428 100%)', borderRadius: '24px', padding: '36px', maxWidth: '500px', width: '100%', border: '1px solid rgba(255,255,255,0.1)', position: 'relative' }} onClick={e => e.stopPropagation()}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', margin: '0 auto 16px', border: '3px solid rgba(37, 211, 102, 0.4)', background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#fff', fontSize: '32px', fontWeight: '700' }}>T</span>
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: '700', margin: '0 0 8px', color: '#fff' }}>Boost kampanju ⚡</h2>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', margin: 0 }}>Kontaktirajte Teodoru putem WhatsApp-a</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
          {packages.map((pkg, i) => (
            <div key={i} onClick={() => handleSelect(pkg)} style={{
              background: pkg.popular ? 'linear-gradient(135deg, rgba(129, 140, 248, 0.2) 0%, rgba(167, 139, 250, 0.15) 100%)' : 'rgba(255,255,255,0.03)',
              border: pkg.popular ? '2px solid rgba(129, 140, 248, 0.5)' : '1px solid rgba(255,255,255,0.08)',
              borderRadius: '14px', padding: '20px 14px', textAlign: 'center', cursor: 'pointer', position: 'relative'
            }}>
              {pkg.popular && <div style={{ position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)', background: '#818cf8', padding: '3px 10px', borderRadius: '100px', fontSize: '9px', fontWeight: '700', color: '#fff' }}>POPULARNO</div>}
              <p style={{ fontSize: '32px', fontWeight: '800', margin: '0 0 2px', color: '#fff' }}>{pkg.views}</p>
              <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', margin: '0 0 12px' }}>pregleda</p>
              <p style={{ fontSize: '20px', fontWeight: '700', margin: 0, color: '#818cf8' }}>€{pkg.price}</p>
            </div>
          ))}
        </div>
        <button onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px', background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.5)' }}>
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
  const [metricModal, setMetricModal] = useState({ isOpen: false, title: '', data: [], color: '', description: '' });

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

  // Analytics calculations
  const analytics = useMemo(() => {
    const months = clientData?.months || [];
    const cumulative = clientData?.cumulative || {};
    const selectedMonth = months[selectedMonthIndex];
    
    // Monthly stats for selected month
    const monthViews = selectedMonth?.totalViews || 0;
    const monthLikes = selectedMonth?.totalLikes || 0;
    const monthComments = selectedMonth?.totalComments || 0;
    const monthShares = selectedMonth?.totalShares || 0;
    const monthSaves = selectedMonth?.totalSaves || 0;
    const monthClips = selectedMonth?.publishedClips || clips.length;
    
    // Cumulative
    const totalViews = cumulative.totalViews || 0;
    const totalLikes = cumulative.totalLikes || 0;
    const totalComments = cumulative.totalComments || 0;
    const totalShares = cumulative.totalShares || 0;
    const totalSaves = cumulative.totalSaves || 0;
    
    // Rates (using monthly data for current month display)
    const engagementRate = monthViews > 0 ? ((monthLikes + monthComments + monthShares) / monthViews * 100) : 0;
    const viralScore = monthViews > 0 ? (monthShares / monthViews * 1000) : 0;
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
      influencerStats[name].shares += clip.shares || 0;
      influencerStats[name].clips += 1;
    });
    const influencerList = Object.values(influencerStats).sort((a, b) => b.views - a.views);
    const avgViewsPerInfluencer = influencerList.length > 0 ? Math.round(clips.reduce((sum, c) => sum + (c.views || 0), 0) / influencerList.length) : 0;
    
    // Top clips
    const topClips = [...clips].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 5);
    const topClip = topClips[0] || null;
    
    // Most viral (highest share rate)
    const clipsWithViralScore = clips.filter(c => c.views > 100).map(c => ({ ...c, viralScore: (c.shares || 0) / c.views * 1000 }));
    const mostViralClip = clipsWithViralScore.sort((a, b) => b.viralScore - a.viralScore)[0] || null;
    
    // Most saved
    const mostSavedClip = [...clips].sort((a, b) => (b.saves || 0) - (a.saves || 0))[0] || null;
    
    // Platform split
    const tiktokClips = clips.filter(c => c.platform === 'Tik Tok' || c.platform === 'TikTok');
    const instaClips = clips.filter(c => c.platform === 'Instagram');
    const tiktokViews = tiktokClips.reduce((sum, c) => sum + (c.views || 0), 0);
    const instaViews = instaClips.reduce((sum, c) => sum + (c.views || 0), 0);
    
    // Best day
    const dayStats = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
    const dayNames = ['Ned', 'Pon', 'Uto', 'Sre', 'Čet', 'Pet', 'Sub'];
    clips.forEach(c => { if (c.publishDate) { const day = new Date(c.publishDate).getDay(); dayStats[day] += c.views || 0; }});
    const bestDayIndex = Object.entries(dayStats).sort((a, b) => b[1] - a[1])[0]?.[0] || 0;
    const bestDay = dayNames[bestDayIndex];
    
    // Best month & fastest growth
    const bestMonth = months.length > 0 ? months.reduce((best, m) => (m.totalViews > (best?.totalViews || 0)) ? m : best, months[0]) : null;
    let fastestGrowingMonth = null;
    let maxGrowth = -Infinity;
    for (let i = 1; i < months.length; i++) {
      const prev = months[i].totalViews || 0;
      const curr = months[i-1].totalViews || 0;
      if (prev > 0) {
        const growth = ((curr - prev) / prev) * 100;
        if (growth > maxGrowth) { maxGrowth = growth; fastestGrowingMonth = { month: months[i-1], growth }; }
      }
    }
    
    // Engagement breakdown
    const engagementBreakdown = [
      { name: 'Lajkovi', value: monthLikes, color: '#f472b6' },
      { name: 'Komentari', value: monthComments, color: '#fbbf24' },
      { name: 'Deljenja', value: monthShares, color: '#34d399' },
      { name: 'Sačuvano', value: monthSaves, color: '#60a5fa' }
    ].filter(d => d.value > 0);
    
    // Platform data for pie
    const platformData = [
      { name: 'TikTok', value: tiktokViews, color: '#ff0050' },
      { name: 'Instagram', value: instaViews, color: '#E4405F' }
    ].filter(d => d.value > 0);
    
    // Data for modals (by month)
    const viewsByMonth = months.map(m => ({ label: m.month, value: m.totalViews || 0 }));
    const likesByMonth = months.map(m => ({ label: m.month, value: m.totalLikes || 0 }));
    const commentsByMonth = months.map(m => ({ label: m.month, value: m.totalComments || 0 }));
    const sharesByMonth = months.map(m => ({ label: m.month, value: m.totalShares || 0 }));
    
    // Data for modals (by influencer for current month)
    const viewsByInfluencer = influencerList.map(inf => ({ label: inf.name, value: inf.views }));
    const likesByInfluencer = influencerList.map(inf => ({ label: inf.name, value: inf.likes }));
    
    return {
      monthViews, monthLikes, monthComments, monthShares, monthSaves, monthClips,
      engagementRate, viralScore, saveRate, avgViewsPerClip, avgViewsPerInfluencer,
      influencerList, topClips, topClip, mostViralClip, mostSavedClip,
      tiktokViews, instaViews, tiktokClips: tiktokClips.length, instaClips: instaClips.length,
      bestDay, bestMonth, fastestGrowingMonth, engagementBreakdown, platformData,
      viewsByMonth, likesByMonth, commentsByMonth, sharesByMonth, viewsByInfluencer, likesByInfluencer
    };
  }, [clientData, clips, selectedMonthIndex]);

  const openMetricModal = (title, data, colorRgb, description) => {
    setMetricModal({ isOpen: true, title, data, color: colorRgb, description });
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 100%)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '50px', height: '50px', border: '3px solid rgba(129, 140, 248, 0.2)', borderTopColor: '#818cf8', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 20px' }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <p style={{ color: 'rgba(255,255,255,0.5)' }}>Učitavanje...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 100%)' }}>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p style={{ color: '#f87171', fontSize: '18px' }}>Greška: {error}</p>
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

      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0a0a14 0%, #12121f 50%, #0f0f1a 100%)', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', color: '#ffffff' }}>
        
        {/* Header */}
        <header style={{ background: 'rgba(15, 15, 26, 0.95)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)', position: 'sticky', top: 0, zIndex: 100 }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '14px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <VoiceLogo />
              <div style={{ height: '24px', width: '1px', background: 'rgba(255,255,255,0.1)' }} />
              <div>
                <h1 style={{ fontSize: '18px', fontWeight: '700', margin: 0 }}>{clientData?.client?.name}</h1>
                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', margin: '2px 0 0' }}>Campaign Dashboard</p>
              </div>
            </div>
            <button onClick={() => setBoostModalOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: 'linear-gradient(135deg, #818cf8 0%, #a78bfa 100%)', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
              ⚡ Boost kampanju
            </button>
          </div>
        </header>

        <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '28px' }}>
          
          {/* Compact Hero - Cumulative Progress */}
          {months.length > 1 && (
            <section style={{ background: 'linear-gradient(135deg, rgba(129, 140, 248, 0.08) 0%, rgba(167, 139, 250, 0.04) 100%)', border: '1px solid rgba(129, 140, 248, 0.12)', borderRadius: '20px', padding: '24px 28px', marginBottom: '28px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>🎯 Celokupna kampanja ({months.length} meseci)</p>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                    <span style={{ fontSize: '36px', fontWeight: '800' }}>{formatNumber(cumulative.totalViews)}</span>
                    <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)' }}>/ {formatNumber(cumulative.totalGoal)}</span>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '32px', fontWeight: '800', margin: 0, color: cumulative.percentDelivered >= 1 ? '#4ade80' : '#818cf8' }}>{(cumulative.percentDelivered * 100).toFixed(0)}%</p>
                </div>
              </div>
              <div style={{ height: '10px', background: 'rgba(255,255,255,0.06)', borderRadius: '100px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${Math.min(cumulative.percentDelivered * 100, 100)}%`, background: cumulative.percentDelivered >= 1 ? 'linear-gradient(90deg, #22c55e 0%, #4ade80 100%)' : 'linear-gradient(90deg, #818cf8 0%, #a78bfa 100%)', borderRadius: '100px' }} />
              </div>
            </section>
          )}

          {/* Month Selector */}
          <section style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '16px 24px', marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>📅 Mesec:</span>
              <select value={selectedMonthIndex} onChange={(e) => setSelectedMonthIndex(Number(e.target.value))} style={{
                padding: '10px 32px 10px 12px', fontSize: '13px', fontWeight: '600',
                border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px',
                background: 'rgba(255,255,255,0.05)', color: '#fff', cursor: 'pointer', appearance: 'none',
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%23ffffff' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center'
              }}>
                {months.map((month, index) => (<option key={month.id} value={index} style={{ background: '#1a1a2e' }}>{month.month}</option>))}
              </select>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '14px', fontWeight: '600' }}>{formatNumber(selectedMonth?.totalViews)} <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>/ {formatNumber(selectedMonth?.campaignGoal)}</span></span>
              <div style={{ width: '80px', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '100px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${Math.min(progressPercent * 100, 100)}%`, background: progressPercent >= 1 ? '#4ade80' : '#818cf8', borderRadius: '100px' }} />
              </div>
              <span style={{ fontSize: '13px', fontWeight: '700', color: progressPercent >= 1 ? '#4ade80' : '#818cf8' }}>{(progressPercent * 100).toFixed(0)}%</span>
              <StatusBadge status={selectedMonth?.contractStatus || 'Active'} />
            </div>
          </section>

          {/* Monthly Metric Cards - Clickable with Modals */}
          <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px', marginBottom: '28px' }}>
            <MetricCard icon="📹" label="Klipovi" value={analytics.monthClips} colorRgb="129, 140, 248" description="Broj objavljenih klipova" onClick={() => {}} />
            <MetricCard icon="❤️" label="Lajkovi" value={formatNumber(analytics.monthLikes)} colorRgb="244, 114, 182" description="Klikni za breakdown po influenceru" onClick={() => openMetricModal('Lajkovi po influenceru', analytics.likesByInfluencer, '244, 114, 182', 'Ko je dobio najviše lajkova')} />
            <MetricCard icon="💬" label="Komentari" value={formatNumber(analytics.monthComments)} colorRgb="251, 191, 36" description="Klikni za breakdown po mesecu" onClick={() => openMetricModal('Komentari po mesecu', analytics.commentsByMonth, '251, 191, 36', 'Komentari kroz vreme')} />
            <MetricCard icon="🔄" label="Deljenja" value={formatNumber(analytics.monthShares)} colorRgb="52, 211, 153" description="Klikni za breakdown po mesecu" onClick={() => openMetricModal('Deljenja po mesecu', analytics.sharesByMonth, '52, 211, 153', 'Koliko se sadržaj deli')} />
          </section>

          {/* Analytics Stats Row */}
          <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '14px', marginBottom: '28px' }}>
            <StatCard icon="📊" label="Engagement Rate" value={formatPercent(analytics.engagementRate)} description="(lajkovi + komentari + deljenja) / pregledi × 100" />
            <StatCard icon="🚀" label="Viral Score" value={analytics.viralScore.toFixed(1)} description="Broj deljenja na 1000 pregleda" />
            <StatCard icon="💾" label="Save Rate" value={formatPercent(analytics.saveRate)} description="Procenat ljudi koji sačuvaju sadržaj" />
            <StatCard icon="👁️" label="Prosek/klip" value={formatNumber(analytics.avgViewsPerClip)} description="Prosečan broj pregleda po klipu" />
            <StatCard icon="👤" label="Prosek/influencer" value={formatNumber(analytics.avgViewsPerInfluencer)} description="Prosečna vrednost po influenceru" />
            <StatCard icon="📆" label="Najbolji dan" value={analytics.bestDay} description="Dan kada klipovi najbolje performiraju" />
          </section>

          {/* Charts Row */}
          <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginBottom: '28px' }}>
            
            {/* Engagement Breakdown */}
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '18px', padding: '24px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '600', margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>🎯</span> Engagement Breakdown
              </h3>
              {analytics.engagementBreakdown.length > 0 ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '24px', flexWrap: 'wrap' }}>
                  <DonutChart data={analytics.engagementBreakdown} size={130} strokeWidth={18} />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {analytics.engagementBreakdown.map((item, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: item.color }} />
                        <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>{item.name}</span>
                        <span style={{ fontSize: '12px', fontWeight: '600', color: '#fff', marginLeft: 'auto' }}>{formatNumber(item.value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : <p style={{ color: 'rgba(255,255,255,0.4)', textAlign: 'center' }}>Nema podataka</p>}
            </div>

            {/* Platform Split - Pie Chart */}
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '18px', padding: '24px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '600', margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>📱</span> Platform Split
              </h3>
              {analytics.platformData.length > 0 ? (
                <PieChart data={analytics.platformData} size={130} />
              ) : <p style={{ color: 'rgba(255,255,255,0.4)', textAlign: 'center' }}>Nema podataka</p>}
            </div>
          </section>

          {/* Top 5 Clips & Influencer Leaderboard */}
          <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px', marginBottom: '28px' }}>
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '18px', padding: '24px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '600', margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>🏆</span> Top 5 Klipova
              </h3>
              <TopClipsChart clips={analytics.topClips} maxValue={analytics.topClips[0]?.views || 0} />
            </div>

            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '18px', padding: '24px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '600', margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>👑</span> Influencer Leaderboard
              </h3>
              {analytics.influencerList.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {analytics.influencerList.slice(0, 5).map((inf, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '12px', fontWeight: '700', color: i === 0 ? '#fbbf24' : 'rgba(255,255,255,0.4)', width: '20px' }}>#{i + 1}</span>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', overflow: 'hidden', background: inf.image ? 'transparent' : `linear-gradient(135deg, hsl(${(i * 67) % 360}, 50%, 50%), hsl(${(i * 67 + 40) % 360}, 50%, 40%))`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {inf.image ? <img src={inf.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ color: '#fff', fontWeight: '600', fontSize: '12px' }}>{inf.name?.charAt(0)}</span>}
                      </div>
                      <span style={{ flex: 1, fontSize: '13px', fontWeight: '500' }}>{inf.name}</span>
                      <span style={{ fontSize: '13px', fontWeight: '700', color: '#fff' }}>{formatNumber(inf.views)}</span>
                    </div>
                  ))}
                </div>
              ) : <p style={{ color: 'rgba(255,255,255,0.4)', textAlign: 'center' }}>Nema podataka</p>}
            </div>
          </section>

          {/* Highlights - Clickable */}
          <section style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '28px' }}>
            {analytics.topClip && (
              <HighlightCard icon="🔥" title="Top Klip" name={analytics.topClip.influencer}
                value={formatNumber(analytics.topClip.views)} subtext="pregleda"
                image={analytics.topClip.influencerImage} colorRgb="244, 114, 182"
                link={analytics.topClip.link} tooltip="Klip sa najviše pregleda ovog meseca"
              />
            )}
            {analytics.influencerList[0] && (
              <HighlightCard icon="⭐" title="MVP Influencer" name={analytics.influencerList[0].name}
                value={formatNumber(analytics.influencerList[0].views)} subtext={`(${analytics.influencerList[0].clips} klipova)`}
                image={analytics.influencerList[0].image} colorRgb="129, 140, 248"
                tooltip="Influencer sa najviše ukupnih pregleda"
              />
            )}
            {analytics.mostViralClip && (
              <HighlightCard icon="🚀" title="Most Viral" name={analytics.mostViralClip.influencer}
                value={analytics.mostViralClip.viralScore.toFixed(1)} subtext="viral score"
                image={analytics.mostViralClip.influencerImage} colorRgb="52, 211, 153"
                link={analytics.mostViralClip.link} tooltip="Najviši odnos deljenja prema pregledima"
              />
            )}
            {analytics.mostSavedClip && analytics.mostSavedClip.saves > 0 && (
              <HighlightCard icon="💾" title="Most Saved" name={analytics.mostSavedClip.influencer}
                value={formatNumber(analytics.mostSavedClip.saves)} subtext="sačuvano"
                image={analytics.mostSavedClip.influencerImage} colorRgb="96, 165, 250"
                link={analytics.mostSavedClip.link} tooltip="Najviše puta sačuvan klip"
              />
            )}
            {analytics.bestMonth && (
              <HighlightCard icon="📈" title="Best Month" name={analytics.bestMonth.month}
                value={formatNumber(analytics.bestMonth.totalViews)} subtext="pregleda"
                colorRgb="167, 139, 250" tooltip="Mesec sa najviše pregleda u kampanji"
              />
            )}
            {analytics.fastestGrowingMonth && (
              <HighlightCard icon="📊" title="Fastest Growth" name={analytics.fastestGrowingMonth.month.month}
                value={`+${analytics.fastestGrowingMonth.growth.toFixed(0)}%`} subtext="rast"
                colorRgb="251, 191, 36" tooltip="Mesec sa najvećim rastom u odnosu na prethodni"
              />
            )}
          </section>

          {/* Clips & Influencers Tables */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '24px', marginBottom: '28px' }}>
            
            {/* All Clips */}
            <section style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '18px', overflow: 'hidden' }}>
              <div style={{ padding: '18px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontSize: '14px', fontWeight: '600', margin: 0 }}>📹 Svi klipovi</h2>
                <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.05)', padding: '4px 10px', borderRadius: '100px' }}>{clips.length}</span>
              </div>
              {clipsLoading ? (
                <div style={{ padding: '40px', textAlign: 'center' }}><p style={{ color: 'rgba(255,255,255,0.4)' }}>Učitavanje...</p></div>
              ) : clips.length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center' }}><p style={{ color: 'rgba(255,255,255,0.4)' }}>Nema klipova</p></div>
              ) : (
                <div style={{ maxHeight: '380px', overflowY: 'auto' }}>
                  {clips.map((clip, i) => (
                    <div key={clip.id} style={{ display: 'flex', alignItems: 'center', padding: '12px 24px', borderBottom: '1px solid rgba(255,255,255,0.04)', gap: '12px' }}>
                      <div style={{ width: '38px', height: '38px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0, background: clip.influencerImage ? 'transparent' : `linear-gradient(135deg, hsl(${(i * 47) % 360}, 50%, 50%), hsl(${(i * 47 + 30) % 360}, 50%, 40%))`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {clip.influencerImage ? <img src={clip.influencerImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ color: '#fff', fontWeight: '600', fontSize: '14px' }}>{clip.influencer?.charAt(0)}</span>}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontWeight: '500', fontSize: '13px', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{clip.influencer}</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '2px' }}>
                          <PlatformIcon platform={clip.platform} size={11} />
                          <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)' }}>{formatDate(clip.publishDate)}</span>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontSize: '13px', fontWeight: '700', margin: 0 }}>{formatNumber(clip.views)}</p>
                      </div>
                      <StatusBadge status={clip.status} />
                      {clip.link && <a href={clip.link} target="_blank" rel="noopener noreferrer" style={{ padding: '5px 10px', background: 'rgba(129, 140, 248, 0.15)', borderRadius: '6px', color: '#818cf8', textDecoration: 'none', fontSize: '10px', fontWeight: '600' }}>↗</a>}
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Influencers */}
            <section style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '18px', overflow: 'hidden' }}>
              <div style={{ padding: '18px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <h3 style={{ fontSize: '13px', fontWeight: '600', margin: 0 }}>👥 Influenseri ({analytics.influencerList.length})</h3>
              </div>
              {analytics.influencerList.length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center' }}><p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>Nema podataka</p></div>
              ) : (
                <div style={{ maxHeight: '340px', overflowY: 'auto', padding: '8px' }}>
                  {analytics.influencerList.map((inf, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', marginBottom: '4px', background: i === 0 ? 'rgba(129, 140, 248, 0.1)' : 'rgba(255,255,255,0.02)', borderRadius: '10px' }}>
                      <span style={{ fontSize: '11px', fontWeight: '700', color: 'rgba(255,255,255,0.3)', width: '18px' }}>#{i + 1}</span>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0, background: inf.image ? 'transparent' : `linear-gradient(135deg, hsl(${(i * 67) % 360}, 50%, 50%), hsl(${(i * 67 + 40) % 360}, 50%, 40%))`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {inf.image ? <img src={inf.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ color: '#fff', fontWeight: '600', fontSize: '11px' }}>{inf.name?.charAt(0)}</span>}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: '12px', fontWeight: '500', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{inf.name}</p>
                        <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', margin: '1px 0 0' }}>{inf.clips} klip{inf.clips !== 1 ? 'a' : ''} • {formatNumber(inf.views)}</p>
                      </div>
                      {i === 0 && <span style={{ fontSize: '14px' }}>👑</span>}
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* Footer */}
          <footer style={{ marginTop: '32px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>Powered by</span>
              <span style={{ fontSize: '12px', fontWeight: '700', color: 'rgba(255,255,255,0.5)' }}>VOICE</span>
            </div>
            <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.2)' }}>{new Date().toLocaleString('sr-RS')}</p>
          </footer>
        </main>

        <BoostModal isOpen={boostModalOpen} onClose={() => setBoostModalOpen(false)} clientName={clientData?.client?.name} />
        <MetricModal isOpen={metricModal.isOpen} onClose={() => setMetricModal({ ...metricModal, isOpen: false })} title={metricModal.title} data={metricModal.data} color={metricModal.color} description={metricModal.description} />
      </div>
    </>
  );
}
