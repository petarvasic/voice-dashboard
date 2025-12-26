// pages/coordinator/[slug].js - Enhanced Coordinator Dashboard
import { useState, useEffect, useMemo } from 'react';
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
  return Math.round(num * 100) + '%';
};

const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return date.toLocaleDateString('sr-RS', { day: '2-digit', month: '2-digit' });
};

const getDaysAgo = (dateStr) => {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now - date) / (1000 * 60 * 60 * 24));
  if (diff === 0) return 'Danas';
  if (diff === 1) return 'Juče';
  return `Pre ${diff} dana`;
};

// ============ COMPONENTS ============

// Live Indicator
const LiveIndicator = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
      @keyframes slideIn {
        from { opacity: 0; transform: translateX(-20px); }
        to { opacity: 1; transform: translateX(0); }
      }
    `}</style>
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

// Gradient Card
const GradientCard = ({ children, gradient = 'purple', hover = true, onClick, style = {} }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const gradients = {
    purple: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(59, 130, 246, 0.1))',
    green: 'linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(16, 185, 129, 0.1))',
    orange: 'linear-gradient(135deg, rgba(249, 115, 22, 0.15), rgba(234, 179, 8, 0.1))',
    red: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(236, 72, 153, 0.1))',
    blue: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(99, 102, 241, 0.1))',
    dark: 'rgba(255,255,255,0.02)'
  };
  
  const borders = {
    purple: 'rgba(139, 92, 246, 0.3)',
    green: 'rgba(34, 197, 94, 0.3)',
    orange: 'rgba(249, 115, 22, 0.3)',
    red: 'rgba(239, 68, 68, 0.3)',
    blue: 'rgba(59, 130, 246, 0.3)',
    dark: 'rgba(255,255,255,0.06)'
  };

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        background: gradients[gradient],
        border: `1px solid ${isHovered && hover ? borders[gradient] : 'rgba(255,255,255,0.06)'}`,
        borderRadius: '20px',
        padding: '24px',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.3s ease',
        transform: isHovered && hover && onClick ? 'translateY(-4px)' : 'none',
        boxShadow: isHovered && hover ? `0 20px 40px rgba(0,0,0,0.3)` : 'none',
        ...style
      }}
    >
      {children}
    </div>
  );
};

// Stat Card
const StatCard = ({ icon, label, value, subValue, gradient = 'purple', size = 'normal' }) => {
  const isLarge = size === 'large';
  
  return (
    <GradientCard gradient={gradient}>
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
        lineHeight: 1
      }}>{value}</p>
      {subValue && (
        <p style={{ 
          fontSize: '13px', 
          color: 'rgba(255,255,255,0.5)', 
          margin: '8px 0 0', 
          fontWeight: '500' 
        }}>{subValue}</p>
      )}
    </GradientCard>
  );
};

// Progress Bar with gradient
const ProgressBar = ({ percent, showLabel = true, size = 'normal' }) => {
  const height = size === 'small' ? '6px' : size === 'large' ? '12px' : '8px';
  const actualPercent = Math.min(Math.max(percent || 0, 0), 100);
  
  const getGradient = () => {
    if (percent >= 100) return 'linear-gradient(90deg, #22c55e, #10b981)';
    if (percent >= 70) return 'linear-gradient(90deg, #8b5cf6, #6366f1)';
    if (percent >= 40) return 'linear-gradient(90deg, #f59e0b, #eab308)';
    return 'linear-gradient(90deg, #ef4444, #f97316)';
  };
  
  return (
    <div style={{ width: '100%' }}>
      <div style={{ 
        height, 
        background: 'rgba(255,255,255,0.1)', 
        borderRadius: '100px', 
        overflow: 'hidden',
        position: 'relative'
      }}>
        <div style={{
          height: '100%',
          width: `${actualPercent}%`,
          background: getGradient(),
          borderRadius: '100px',
          transition: 'width 0.5s ease',
          boxShadow: percent >= 70 ? '0 0 20px rgba(139, 92, 246, 0.4)' : 'none'
        }} />
      </div>
      {showLabel && (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'flex-end', 
          marginTop: '4px' 
        }}>
          <span style={{ 
            fontSize: '12px', 
            fontWeight: '700',
            color: percent >= 100 ? '#22c55e' : '#fff'
          }}>
            {Math.round(percent)}%
          </span>
        </div>
      )}
    </div>
  );
};

// Status Badge
const StatusBadge = ({ status, size = 'normal' }) => {
  const getStyle = () => {
    const s = status?.toLowerCase() || '';
    if (s.includes('dead') || s.includes('critical')) return { bg: 'rgba(239, 68, 68, 0.2)', color: '#f87171', icon: '🚨' };
    if (s.includes('hard red') || s.includes('falling')) return { bg: 'rgba(249, 115, 22, 0.2)', color: '#fb923c', icon: '🔥' };
    if (s.includes('red') || s.includes('behind')) return { bg: 'rgba(239, 68, 68, 0.15)', color: '#f87171', icon: '🟥' };
    if (s.includes('yellow') || s.includes('track')) return { bg: 'rgba(234, 179, 8, 0.2)', color: '#fbbf24', icon: '🟨' };
    if (s.includes('green') && s.includes('over')) return { bg: 'rgba(34, 197, 94, 0.25)', color: '#22c55e', icon: '💚' };
    if (s.includes('green')) return { bg: 'rgba(34, 197, 94, 0.2)', color: '#4ade80', icon: '🟩' };
    return { bg: 'rgba(156, 163, 175, 0.2)', color: '#9ca3af', icon: '⬜' };
  };
  
  const style = getStyle();
  const isSmall = size === 'small';
  
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
      padding: isSmall ? '4px 8px' : '6px 12px',
      borderRadius: '8px',
      fontSize: isSmall ? '10px' : '11px',
      fontWeight: '600',
      background: style.bg,
      color: style.color
    }}>
      {style.icon}
    </span>
  );
};

// Campaign Card
const CampaignCard = ({ campaign, onClick, isExpanded }) => {
  const [isHovered, setIsHovered] = useState(false);
  const percent = (campaign.percentDelivered || 0) * 100;
  
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        background: isExpanded 
          ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(59, 130, 246, 0.05))'
          : isHovered ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.02)',
        border: `1px solid ${isExpanded ? 'rgba(139, 92, 246, 0.3)' : 'rgba(255,255,255,0.06)'}`,
        borderRadius: '16px',
        padding: '20px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        transform: isHovered ? 'translateX(4px)' : 'none'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
            fontWeight: '700',
            color: '#fff'
          }}>
            {campaign.month?.charAt(0) || '?'}
          </div>
          <div>
            <h3 style={{ 
              fontSize: '16px', 
              fontWeight: '700', 
              margin: 0, 
              color: '#fff',
              maxWidth: '300px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {campaign.month}
            </h3>
            <p style={{ 
              fontSize: '13px', 
              color: 'rgba(255,255,255,0.5)', 
              margin: '4px 0 0' 
            }}>
              {formatNumber(campaign.totalViews)} / {formatNumber(campaign.campaignGoal)} views
            </p>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <StatusBadge status={campaign.progressStatus} />
          <p style={{ 
            fontSize: '12px', 
            color: 'rgba(255,255,255,0.4)', 
            margin: '8px 0 0' 
          }}>
            {campaign.publishedClips || 0} klipova
          </p>
        </div>
      </div>
      
      <ProgressBar percent={percent} size="small" showLabel={false} />
      
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginTop: '12px'
      }}>
        <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>
          📅 {formatDate(campaign.startDate)} - {formatDate(campaign.endDate)}
        </span>
        <span style={{ 
          fontSize: '14px', 
          fontWeight: '700',
          color: percent >= 100 ? '#22c55e' : percent >= 70 ? '#8b5cf6' : percent >= 40 ? '#f59e0b' : '#ef4444'
        }}>
          {Math.round(percent)}%
        </span>
      </div>
    </div>
  );
};

// Influencer Row (for expanded campaign view)
const InfluencerRow = ({ influencer }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        display: 'grid',
        gridTemplateColumns: '2fr 1fr 1fr 1fr',
        gap: '16px',
        alignItems: 'center',
        padding: '14px 16px',
        background: isHovered ? 'rgba(255,255,255,0.03)' : 'transparent',
        borderRadius: '10px',
        transition: 'background 0.15s ease'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '14px',
          fontWeight: '600',
          color: '#fff'
        }}>
          {influencer.name?.charAt(0) || '?'}
        </div>
        <div>
          <p style={{ fontSize: '14px', fontWeight: '600', margin: 0, color: '#fff' }}>
            {influencer.name}
          </p>
          {influencer.tier && (
            <span style={{ 
              fontSize: '10px', 
              color: influencer.tier === 'Elite' ? '#fbbf24' : influencer.tier === 'Verified' ? '#8b5cf6' : 'rgba(255,255,255,0.4)',
              fontWeight: '600'
            }}>
              {influencer.tier === 'Elite' && '⭐ '}{influencer.tier}
            </span>
          )}
        </div>
      </div>
      <div>
        <p style={{ fontSize: '14px', fontWeight: '600', margin: 0, color: '#fff' }}>
          {influencer.clips || 0}
        </p>
        <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', margin: '2px 0 0' }}>klipova</p>
      </div>
      <div>
        <p style={{ fontSize: '14px', fontWeight: '600', margin: 0, color: '#fff' }}>
          {formatNumber(influencer.views)}
        </p>
        <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', margin: '2px 0 0' }}>views</p>
      </div>
      <div>
        <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', margin: 0 }}>
          {getDaysAgo(influencer.lastClipDate) || '-'}
        </p>
      </div>
    </div>
  );
};

// Clip Card
const ClipCard = ({ clip }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        padding: '14px 16px',
        background: isHovered ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.02)',
        borderRadius: '12px',
        transition: 'all 0.2s ease',
        cursor: clip.link ? 'pointer' : 'default'
      }}
      onClick={() => clip.link && window.open(clip.link, '_blank')}
    >
      <div style={{
        width: '44px',
        height: '44px',
        borderRadius: '10px',
        background: clip.platform === 'Tik Tok' 
          ? 'linear-gradient(135deg, #000, #25f4ee)' 
          : clip.platform === 'Instagram'
            ? 'linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)'
            : 'linear-gradient(135deg, #ff0000, #cc0000)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '20px'
      }}>
        {clip.platform === 'Tik Tok' ? '🎵' : clip.platform === 'Instagram' ? '📸' : '▶️'}
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: '14px', fontWeight: '600', margin: 0, color: '#fff' }}>
          {clip.influencerName}
        </p>
        <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', margin: '2px 0 0' }}>
          {clip.clientName}
        </p>
      </div>
      <div style={{ textAlign: 'right' }}>
        <p style={{ fontSize: '14px', fontWeight: '700', margin: 0, color: '#fff' }}>
          {formatNumber(clip.views)}
        </p>
        <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', margin: '2px 0 0' }}>
          {getDaysAgo(clip.publishDate)}
        </p>
      </div>
    </div>
  );
};

// Offer Card
const OfferCard = ({ offer, onAction }) => {
  const [isHovered, setIsHovered] = useState(false);
  const isPending = offer.status === 'Sent';
  const isApplication = offer.type === 'Application';
  
  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        padding: '16px',
        background: isHovered ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.02)',
        borderRadius: '12px',
        border: `1px solid ${isApplication ? 'rgba(34, 197, 94, 0.2)' : 'rgba(255,255,255,0.06)'}`,
        transition: 'all 0.2s ease'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: isApplication 
              ? 'linear-gradient(135deg, #22c55e, #10b981)' 
              : 'linear-gradient(135deg, #f59e0b, #eab308)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px'
          }}>
            {isApplication ? '🙋' : '📨'}
          </div>
          <div>
            <p style={{ fontSize: '14px', fontWeight: '600', margin: 0, color: '#fff' }}>
              {offer.influencerName}
            </p>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', margin: '2px 0 0' }}>
              {offer.contractMonthName || offer.clientName}
            </p>
          </div>
        </div>
        <span style={{
          fontSize: '10px',
          padding: '4px 8px',
          borderRadius: '6px',
          background: isApplication ? 'rgba(34, 197, 94, 0.2)' : 'rgba(249, 115, 22, 0.2)',
          color: isApplication ? '#4ade80' : '#fbbf24',
          fontWeight: '600'
        }}>
          {isApplication ? 'PRIJAVA' : 'PONUDA'}
        </span>
      </div>
      
      <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', margin: '0 0 12px' }}>
        Poslato: {formatDate(offer.sentDate)}
      </p>
      
      {isPending && (
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => onAction?.(offer.id, 'accept')}
            style={{
              flex: 1,
              padding: '8px',
              background: 'rgba(34, 197, 94, 0.2)',
              border: '1px solid rgba(34, 197, 94, 0.3)',
              borderRadius: '8px',
              color: '#4ade80',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            ✓ Prihvati
          </button>
          <button
            onClick={() => onAction?.(offer.id, 'decline')}
            style={{
              flex: 1,
              padding: '8px',
              background: 'rgba(239, 68, 68, 0.2)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '8px',
              color: '#f87171',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            ✕ Odbij
          </button>
        </div>
      )}
    </div>
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
          padding: '4px 10px',
          borderRadius: '20px',
          background: 'rgba(139, 92, 246, 0.2)',
          color: '#a78bfa'
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
  const [selectedCampaign, setSelectedCampaign] = useState(null);
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
    const interval = setInterval(fetchData, 60000); // Refresh every minute
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
        switch(statusFilter) {
          case 'critical': return status.includes('dead') || status.includes('critical');
          case 'behind': return status.includes('red') || status.includes('behind');
          case 'ontrack': return status.includes('yellow') || status.includes('track');
          case 'ahead': return status.includes('green');
          default: return true;
        }
      });
    }
    
    return filtered;
  }, [data?.months, searchQuery, statusFilter]);

  // Campaigns that need attention (behind pace)
  const urgentCampaigns = useMemo(() => {
    if (!data?.months) return [];
    return data.months.filter(c => {
      const status = c.progressStatus?.toLowerCase() || '';
      return status.includes('dead') || status.includes('hard red') || status.includes('critical');
    }).slice(0, 5);
  }, [data?.months]);

  // Handle offer actions
  const handleOfferAction = async (offerId, action) => {
    try {
      await fetch('/api/coordinator/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ offerId, action, userId: data?.user?.id })
      });
      // Refresh data
      const res = await fetch(`/api/coordinator/${slug}`);
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error('Action failed:', err);
    }
  };

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
            width: '50px',
            height: '50px',
            border: '3px solid rgba(139, 92, 246, 0.2)',
            borderTopColor: '#8b5cf6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <p style={{ color: 'rgba(255,255,255,0.5)' }}>Učitavanje...</p>
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
        <div style={{ textAlign: 'center' }}>
          <span style={{ fontSize: '48px', display: 'block', marginBottom: '16px' }}>😕</span>
          <h2>Greška pri učitavanju</h2>
          <p style={{ color: 'rgba(255,255,255,0.5)' }}>{error || 'Nepoznata greška'}</p>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: '20px',
              padding: '12px 24px',
              background: 'rgba(139, 92, 246, 0.2)',
              border: '1px solid rgba(139, 92, 246, 0.4)',
              borderRadius: '10px',
              color: '#a78bfa',
              fontWeight: '600',
              cursor: 'pointer'
            }}
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

      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%)',
        color: '#fff',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px' }}>
          
          {/* Header */}
          <header style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'flex-start',
            marginBottom: '32px'
          }}>
            <div>
              <h1 style={{ 
                fontSize: '32px', 
                fontWeight: '800', 
                margin: '0 0 8px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <span>👋</span> {data.user?.name}
              </h1>
              <p style={{ 
                fontSize: '14px', 
                color: 'rgba(255,255,255,0.5)', 
                margin: 0 
              }}>
                {data.user?.role === 'HOD' ? 'HOD • Vidiš sve kampanje' : 
                 data.user?.role === 'Admin' ? 'Admin • Pun pristup' : 
                 'Brend Coordinator • Tvoje kampanje'}
              </p>
            </div>
            <LiveIndicator />
          </header>

          {/* Stats Grid */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '16px',
            marginBottom: '32px'
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
              subValue={data.summary?.pendingOffers ? `+ ${data.summary.pendingOffers} ponuda čeka` : null}
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
              gradient="orange"
            />
          </div>

          {/* Urgent Campaigns Alert */}
          {urgentCampaigns.length > 0 && (
            <GradientCard gradient="red" style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <span style={{ fontSize: '24px' }}>🚨</span>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', margin: 0 }}>
                    Kampanje koje trebaju pažnju
                  </h3>
                  <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', margin: '4px 0 0' }}>
                    {urgentCampaigns.length} kampanja kasni ili je u kritičnom stanju
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {urgentCampaigns.map(c => (
                  <span 
                    key={c.id}
                    onClick={() => setSelectedCampaign(c.id === selectedCampaign ? null : c.id)}
                    style={{
                      padding: '8px 14px',
                      background: 'rgba(0,0,0,0.3)',
                      borderRadius: '8px',
                      fontSize: '13px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {c.month} • <strong>{Math.round((c.percentDelivered || 0) * 100)}%</strong>
                  </span>
                ))}
              </div>
            </GradientCard>
          )}

          {/* Main Content Grid */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 400px',
            gap: '24px'
          }}>
            
            {/* Left Column - Campaigns */}
            <div>
              <SectionHeader 
                icon="📈" 
                title="Aktivne kampanje" 
                count={filteredCampaigns.length}
                action={
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      placeholder="🔍 Pretraži..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      style={{
                        padding: '8px 14px',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '13px',
                        width: '150px'
                      }}
                    />
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      style={{
                        padding: '8px 14px',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '13px',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="all" style={{ background: '#1a1a2e' }}>Svi</option>
                      <option value="critical" style={{ background: '#1a1a2e' }}>🚨 Kritično</option>
                      <option value="behind" style={{ background: '#1a1a2e' }}>🔥 Kasni</option>
                      <option value="ontrack" style={{ background: '#1a1a2e' }}>🟨 Na putu</option>
                      <option value="ahead" style={{ background: '#1a1a2e' }}>🟩 Ispred</option>
                    </select>
                  </div>
                }
              />
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {filteredCampaigns.length === 0 ? (
                  <EmptyState icon="📭" message="Nema kampanja koje odgovaraju filteru" />
                ) : (
                  filteredCampaigns.slice(0, 20).map(campaign => (
                    <div key={campaign.id}>
                      <CampaignCard 
                        campaign={campaign}
                        onClick={() => setSelectedCampaign(campaign.id === selectedCampaign ? null : campaign.id)}
                        isExpanded={selectedCampaign === campaign.id}
                      />
                      
                      {/* Expanded Campaign Details */}
                      {selectedCampaign === campaign.id && (
                        <div style={{
                          marginTop: '-8px',
                          marginLeft: '24px',
                          padding: '20px',
                          background: 'rgba(139, 92, 246, 0.05)',
                          borderRadius: '0 0 16px 16px',
                          border: '1px solid rgba(139, 92, 246, 0.2)',
                          borderTop: 'none',
                          animation: 'fadeIn 0.3s ease'
                        }}>
                          <h4 style={{ 
                            fontSize: '14px', 
                            fontWeight: '600', 
                            margin: '0 0 16px',
                            color: 'rgba(255,255,255,0.7)'
                          }}>
                            Influenseri na kampanji
                          </h4>
                          
                          {campaign.influencers?.length > 0 ? (
                            <div>
                              <div style={{
                                display: 'grid',
                                gridTemplateColumns: '2fr 1fr 1fr 1fr',
                                gap: '16px',
                                padding: '8px 16px',
                                fontSize: '11px',
                                color: 'rgba(255,255,255,0.4)',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px'
                              }}>
                                <span>Influenser</span>
                                <span>Klipovi</span>
                                <span>Views</span>
                                <span>Poslednji</span>
                              </div>
                              {campaign.influencers.map((inf, i) => (
                                <InfluencerRow key={i} influencer={inf} />
                              ))}
                            </div>
                          ) : (
                            <p style={{ 
                              fontSize: '13px', 
                              color: 'rgba(255,255,255,0.4)',
                              textAlign: 'center',
                              padding: '20px'
                            }}>
                              Još uvek nema influensera na ovoj kampanji
                            </p>
                          )}
                          
                          <button
                            onClick={() => router.push(`/client/${campaign.clientId}`)}
                            style={{
                              marginTop: '16px',
                              padding: '10px 20px',
                              background: 'rgba(139, 92, 246, 0.2)',
                              border: '1px solid rgba(139, 92, 246, 0.3)',
                              borderRadius: '8px',
                              color: '#a78bfa',
                              fontSize: '13px',
                              fontWeight: '600',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease'
                            }}
                          >
                            Otvori detalje kampanje →
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
                
                {filteredCampaigns.length > 20 && (
                  <p style={{ 
                    textAlign: 'center', 
                    fontSize: '13px', 
                    color: 'rgba(255,255,255,0.4)',
                    padding: '16px'
                  }}>
                    Prikazano prvih 20 od {filteredCampaigns.length} kampanja
                  </p>
                )}
              </div>
            </div>

            {/* Right Column - Sidebar */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* Pending Offers/Applications */}
              <GradientCard gradient="dark" hover={false}>
                <SectionHeader 
                  icon="✋" 
                  title="Nove prijave" 
                  count={(data.offers?.applications?.length || 0) + (data.offers?.pending?.length || 0)}
                />
                
                {(data.offers?.applications?.length > 0 || data.offers?.pending?.length > 0) ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {data.offers?.applications?.map(offer => (
                      <OfferCard key={offer.id} offer={offer} onAction={handleOfferAction} />
                    ))}
                    {data.offers?.pending?.map(offer => (
                      <OfferCard key={offer.id} offer={offer} onAction={handleOfferAction} />
                    ))}
                  </div>
                ) : (
                  <EmptyState icon="🎉" message="Nema novih prijava" />
                )}
              </GradientCard>

              {/* Today's Responses */}
              <GradientCard gradient="dark" hover={false}>
                <SectionHeader 
                  icon="📬" 
                  title="Odgovori danas" 
                  count={(data.offers?.acceptedToday?.length || 0) + (data.offers?.declinedToday?.length || 0)}
                />
                
                {(data.offers?.acceptedToday?.length > 0 || data.offers?.declinedToday?.length > 0) ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {data.offers?.acceptedToday?.map(offer => (
                      <div key={offer.id} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '10px 12px',
                        background: 'rgba(34, 197, 94, 0.1)',
                        borderRadius: '8px'
                      }}>
                        <span>✅</span>
                        <span style={{ fontSize: '13px' }}>{offer.influencerName}</span>
                        <span style={{ fontSize: '11px', color: '#4ade80', marginLeft: 'auto' }}>Prihvatio</span>
                      </div>
                    ))}
                    {data.offers?.declinedToday?.map(offer => (
                      <div key={offer.id} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '10px 12px',
                        background: 'rgba(239, 68, 68, 0.1)',
                        borderRadius: '8px'
                      }}>
                        <span>❌</span>
                        <span style={{ fontSize: '13px' }}>{offer.influencerName}</span>
                        <span style={{ fontSize: '11px', color: '#f87171', marginLeft: 'auto' }}>Odbio</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState icon="📭" message="Nema odgovora danas" />
                )}
              </GradientCard>

              {/* Recent Clips */}
              <GradientCard gradient="dark" hover={false}>
                <SectionHeader 
                  icon="🎬" 
                  title="Nedavno objavljeno" 
                  count={data.clips?.publishedRecent?.length || 0}
                />
                
                {data.clips?.publishedRecent?.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {data.clips.publishedRecent.slice(0, 5).map(clip => (
                      <ClipCard key={clip.id} clip={clip} />
                    ))}
                  </div>
                ) : (
                  <EmptyState icon="🎥" message="Nema nedavno objavljenih klipova" />
                )}
              </GradientCard>

              {/* Waiting Content */}
              <GradientCard gradient="dark" hover={false}>
                <SectionHeader 
                  icon="⏳" 
                  title="Čeka se content" 
                  count={data.clips?.waitingContent?.length || 0}
                />
                
                {data.clips?.waitingContent?.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {data.clips.waitingContent.slice(0, 5).map(clip => (
                      <ClipCard key={clip.id} clip={clip} />
                    ))}
                  </div>
                ) : (
                  <EmptyState icon="✨" message="Svi klipovi su završeni" />
                )}
              </GradientCard>
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
    </>
  );
}
