// pages/client/[clientId].js
import { useState, useEffect } from 'react';
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

// VOICE Logo Component - Navy blue
const VoiceLogo = () => (
  <svg width="120" height="40" viewBox="0 0 120 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <text x="0" y="30" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif" fontSize="28" fontWeight="700" fill="#363d6e">voice</text>
    <circle cx="107" cy="8" r="4" fill="#363d6e"/>
  </svg>
);

// Platform Icon
const PlatformIcon = ({ platform }) => {
  if (platform === 'Tik Tok' || platform === 'TikTok') {
    return (
      <svg viewBox="0 0 24 24" fill="#000000" style={{width: '16px', height: '16px'}}>
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
      </svg>
    );
  }
  if (platform === 'Instagram') {
    return (
      <svg viewBox="0 0 24 24" fill="#E4405F" style={{width: '16px', height: '16px'}}>
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
      case 'Published': return { bg: '#e8f5e9', color: '#2e7d32' };
      case 'Done': return { bg: '#e3f2fd', color: '#1565c0' };
      case 'Draft': return { bg: '#fff3e0', color: '#ef6c00' };
      case 'Active': return { bg: '#e8f5e9', color: '#2e7d32' };
      case 'Paid': return { bg: '#f3e5f5', color: '#7b1fa2' };
      default: return { bg: '#f5f5f5', color: '#616161' };
    }
  };
  const style = getStatusStyle();
  return (
    <span style={{
      display: 'inline-block',
      padding: '4px 10px',
      borderRadius: '6px',
      fontSize: '11px',
      fontWeight: '600',
      background: style.bg,
      color: style.color,
      textTransform: 'uppercase',
      letterSpacing: '0.3px'
    }}>
      {status}
    </span>
  );
};

// Metric Card Component
const MetricCard = ({ label, value, icon }) => (
  <div style={{
    background: '#ffffff',
    borderRadius: '16px',
    padding: '20px 24px',
    boxShadow: '0 2px 8px rgba(54, 61, 110, 0.06)',
    border: '1px solid #e8eaef'
  }}>
    <p style={{ 
      fontSize: '12px', 
      color: '#6b7194',
      marginBottom: '8px',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      fontWeight: '500'
    }}>
      {label}
    </p>
    <p style={{ 
      fontSize: '28px', 
      fontWeight: '700', 
      color: '#363d6e',
      margin: 0,
      letterSpacing: '-0.5px'
    }}>
      {value}
    </p>
  </div>
);

export default function ClientDashboard() {
  const router = useRouter();
  const { clientId } = router.query;
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [clientData, setClientData] = useState(null);
  const [selectedMonthIndex, setSelectedMonthIndex] = useState(0);
  const [clips, setClips] = useState([]);
  const [clipsLoading, setClipsLoading] = useState(false);

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
        setClips(data.clips || []);
      } catch (err) {
        console.error(err);
        setClips([]);
      } finally {
        setClipsLoading(false);
      }
    };
    
    fetchClips();
  }, [clientData, selectedMonthIndex]);

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(180deg, #f8f9fc 0%, #eef0f5 100%)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid #e8eaef',
            borderTopColor: '#363d6e',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <p style={{ color: '#6b7194', fontWeight: '500' }}>Učitavanje...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(180deg, #f8f9fc 0%, #eef0f5 100%)'
      }}>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p style={{ color: '#e74c3c', fontSize: '18px', marginBottom: '8px' }}>Greška</p>
          <p style={{ color: '#6b7194' }}>{error}</p>
        </div>
      </div>
    );
  }

  const selectedMonth = clientData?.months?.[selectedMonthIndex];
  const cumulative = clientData?.cumulative;
  const progressPercent = selectedMonth?.percentDelivered || 0;
  const cumulativePercent = cumulative?.percentDelivered || 0;

  // Get unique influencers from clips
  const uniqueInfluencers = clips.reduce((acc, clip) => {
    if (!acc.find(i => i.name === clip.influencer)) {
      acc.push({ 
        name: clip.influencer, 
        image: clip.influencerImage,
        clips: clips.filter(c => c.influencer === clip.influencer).length,
        views: clips.filter(c => c.influencer === clip.influencer).reduce((sum, c) => sum + (c.views || 0), 0)
      });
    }
    return acc;
  }, []);

  return (
    <>
      <Head>
        <title>{clientData?.client?.name || 'Dashboard'} | VOICE</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </Head>

      <div style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(180deg, #f8f9fc 0%, #eef0f5 100%)',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
      }}>
        {/* Header */}
        <header style={{
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid #e8eaef',
          position: 'sticky',
          top: 0,
          zIndex: 100
        }}>
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '16px 24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
              <VoiceLogo />
              <div style={{ height: '32px', width: '1px', background: '#e8eaef' }} />
              <div>
                <h1 style={{ 
                  fontSize: '20px', 
                  fontWeight: '700',
                  color: '#363d6e',
                  margin: 0
                }}>
                  {clientData?.client?.name}
                </h1>
                <p style={{ fontSize: '13px', color: '#6b7194', margin: 0 }}>Campaign Dashboard</p>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>
          
          {/* Metrics Grid */}
          <section style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '16px',
            marginBottom: '24px'
          }}>
            <MetricCard label="Ukupno pregleda" value={formatNumber(selectedMonth?.totalViews)} />
            <MetricCard label="Lajkovi" value={formatNumber(selectedMonth?.totalLikes)} />
            <MetricCard label="Komentari" value={formatNumber(selectedMonth?.totalComments)} />
            <MetricCard label="Deljenja" value={formatNumber(selectedMonth?.totalShares)} />
          </section>

          {/* Cumulative Progress - Only show if more than 1 month */}
          {cumulative && cumulative.monthsCount > 1 && (
            <section style={{
              background: 'linear-gradient(135deg, #363d6e 0%, #4a5296 100%)',
              borderRadius: '20px',
              padding: '28px 32px',
              marginBottom: '24px',
              color: '#fff'
            }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '20px'
              }}>
                <div>
                  <p style={{ 
                    fontSize: '12px', 
                    color: 'rgba(255,255,255,0.7)',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    marginBottom: '8px',
                    fontWeight: '500'
                  }}>
                    Ukupan napredak paketa ({cumulative.monthsCount} meseci)
                  </p>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
                    <span style={{ 
                      fontSize: '42px', 
                      fontWeight: '700',
                      letterSpacing: '-1px'
                    }}>
                      {formatNumber(cumulative.totalViews)}
                    </span>
                    <span style={{ fontSize: '16px', color: 'rgba(255,255,255,0.7)' }}>
                      / {formatNumber(cumulative.totalGoal)} pregleda
                    </span>
                  </div>
                </div>
                <div style={{ 
                  textAlign: 'center',
                  background: 'rgba(255,255,255,0.15)',
                  padding: '16px 28px',
                  borderRadius: '14px'
                }}>
                  <p style={{ 
                    fontSize: '36px', 
                    fontWeight: '700',
                    color: cumulativePercent >= 1 ? '#4ade80' : '#fff',
                    margin: 0
                  }}>
                    {(cumulativePercent * 100).toFixed(0)}%
                  </p>
                  <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', marginTop: '4px' }}>
                    isporučeno
                  </p>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div style={{
                height: '10px',
                background: 'rgba(255,255,255,0.2)',
                borderRadius: '100px',
                overflow: 'hidden'
              }}>
                <div style={{
                  height: '100%',
                  width: `${Math.min(cumulativePercent * 100, 100)}%`,
                  background: cumulativePercent >= 1 
                    ? 'linear-gradient(90deg, #4ade80 0%, #22c55e 100%)'
                    : 'linear-gradient(90deg, #fff 0%, rgba(255,255,255,0.8) 100%)',
                  borderRadius: '100px',
                  transition: 'width 1s ease-out'
                }} />
              </div>
            </section>
          )}

          {/* Monthly Progress Card */}
          <section style={{
            background: '#ffffff',
            borderRadius: '20px',
            padding: '24px 28px',
            marginBottom: '24px',
            boxShadow: '0 2px 8px rgba(54, 61, 110, 0.06)',
            border: '1px solid #e8eaef'
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <div>
                <p style={{ 
                  fontSize: '12px', 
                  color: '#6b7194',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  marginBottom: '4px',
                  fontWeight: '500'
                }}>
                  Mesečni napredak
                </p>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                  <span style={{ fontSize: '32px', fontWeight: '700', color: '#363d6e' }}>
                    {formatNumber(selectedMonth?.totalViews)}
                  </span>
                  <span style={{ fontSize: '14px', color: '#6b7194' }}>
                    / {formatNumber(selectedMonth?.campaignGoal)} pregleda
                  </span>
                </div>
              </div>
              
              {/* Month Selector */}
              <select
                value={selectedMonthIndex}
                onChange={(e) => setSelectedMonthIndex(Number(e.target.value))}
                style={{
                  padding: '10px 40px 10px 16px',
                  fontSize: '14px',
                  fontWeight: '600',
                  border: '2px solid #e8eaef',
                  borderRadius: '10px',
                  background: '#ffffff',
                  color: '#363d6e',
                  cursor: 'pointer',
                  appearance: 'none',
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7194' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 14px center'
                }}
              >
                {clientData?.months?.map((month, index) => (
                  <option key={month.id} value={index}>
                    {month.month}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Progress Bar */}
            <div style={{
              height: '12px',
              background: '#e8eaef',
              borderRadius: '100px',
              overflow: 'hidden'
            }}>
              <div style={{
                height: '100%',
                width: `${Math.min(progressPercent * 100, 100)}%`,
                background: progressPercent >= 1 
                  ? 'linear-gradient(90deg, #22c55e 0%, #4ade80 100%)'
                  : 'linear-gradient(90deg, #363d6e 0%, #5a64a8 100%)',
                borderRadius: '100px',
                transition: 'width 0.8s ease-out',
                position: 'relative'
              }}>
                <span style={{
                  position: 'absolute',
                  right: progressPercent > 0.15 ? '8px' : '-30px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontSize: '10px',
                  fontWeight: '700',
                  color: progressPercent > 0.15 ? '#fff' : '#363d6e'
                }}>
                  {(progressPercent * 100).toFixed(0)}%
                </span>
              </div>
            </div>
            
            {/* Status Row */}
            <div style={{
              display: 'flex',
              gap: '32px',
              marginTop: '16px',
              paddingTop: '16px',
              borderTop: '1px solid #f0f1f5'
            }}>
              <div>
                <p style={{ fontSize: '11px', color: '#6b7194', marginBottom: '2px', textTransform: 'uppercase', fontWeight: '500' }}>Klipova</p>
                <p style={{ fontSize: '18px', fontWeight: '700', color: '#363d6e', margin: 0 }}>{selectedMonth?.publishedClips || 0}</p>
              </div>
              <div>
                <p style={{ fontSize: '11px', color: '#6b7194', marginBottom: '2px', textTransform: 'uppercase', fontWeight: '500' }}>Status</p>
                <StatusBadge status={selectedMonth?.contractStatus || 'Active'} />
              </div>
            </div>
          </section>

          {/* Two Column Layout */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '24px' }}>
            
            {/* Clips Table */}
            <section style={{
              background: '#ffffff',
              borderRadius: '20px',
              overflow: 'hidden',
              boxShadow: '0 2px 8px rgba(54, 61, 110, 0.06)',
              border: '1px solid #e8eaef'
            }}>
              <div style={{
                padding: '18px 24px',
                borderBottom: '1px solid #f0f1f5',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#363d6e', margin: 0 }}>
                  Objavljeni klipovi
                </h2>
                <span style={{ 
                  fontSize: '12px', 
                  color: '#6b7194',
                  background: '#f0f1f5',
                  padding: '4px 12px',
                  borderRadius: '100px',
                  fontWeight: '600'
                }}>
                  {clips.length} klipova
                </span>
              </div>
              
              {clipsLoading ? (
                <div style={{ padding: '40px', textAlign: 'center' }}>
                  <p style={{ color: '#6b7194' }}>Učitavanje klipova...</p>
                </div>
              ) : clips.length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center' }}>
                  <p style={{ color: '#6b7194' }}>Nema klipova za ovaj mesec</p>
                </div>
              ) : (
                <div style={{ maxHeight: '480px', overflowY: 'auto' }}>
                  {clips.map((clip, i) => (
                    <div 
                      key={clip.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '12px 24px',
                        borderBottom: '1px solid #f5f6f8',
                        gap: '16px'
                      }}
                    >
                      {/* Influencer Avatar */}
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        overflow: 'hidden',
                        background: clip.influencerImage ? 'transparent' : `linear-gradient(135deg, hsl(${(i * 47) % 360}, 50%, 60%) 0%, hsl(${(i * 47 + 30) % 360}, 50%, 50%) 100%)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        {clip.influencerImage ? (
                          <img 
                            src={clip.influencerImage} 
                            alt={clip.influencer}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        ) : (
                          <span style={{ color: '#fff', fontWeight: '600', fontSize: '14px' }}>
                            {clip.influencer?.charAt(0) || '?'}
                          </span>
                        )}
                      </div>
                      
                      {/* Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ 
                          fontWeight: '600', 
                          color: '#363d6e',
                          fontSize: '14px',
                          margin: 0,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>
                          {clip.influencer}
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px' }}>
                          <PlatformIcon platform={clip.platform} />
                          <span style={{ fontSize: '12px', color: '#6b7194' }}>
                            {formatDate(clip.publishDate)}
                          </span>
                        </div>
                      </div>
                      
                      {/* Views */}
                      <div style={{ textAlign: 'right', minWidth: '70px' }}>
                        <p style={{ fontSize: '14px', fontWeight: '700', color: '#363d6e', margin: 0 }}>
                          {formatNumber(clip.views)}
                        </p>
                        <p style={{ fontSize: '10px', color: '#6b7194', margin: 0 }}>pregleda</p>
                      </div>
                      
                      {/* Status */}
                      <div style={{ minWidth: '70px', textAlign: 'center' }}>
                        <StatusBadge status={clip.status} />
                      </div>
                      
                      {/* Link */}
                      <div style={{ minWidth: '80px', textAlign: 'right' }}>
                        {clip.link ? (
                          <a 
                            href={clip.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              padding: '6px 14px',
                              background: '#363d6e',
                              borderRadius: '8px',
                              color: '#fff',
                              textDecoration: 'none',
                              fontSize: '12px',
                              fontWeight: '600'
                            }}
                          >
                            Pogledaj
                          </a>
                        ) : (
                          <span style={{ color: '#d2d2d7', fontSize: '12px' }}>—</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Influencers Sidebar */}
            <section style={{
              background: '#ffffff',
              borderRadius: '20px',
              padding: '20px',
              boxShadow: '0 2px 8px rgba(54, 61, 110, 0.06)',
              border: '1px solid #e8eaef',
              height: 'fit-content'
            }}>
              <h3 style={{ 
                fontSize: '14px', 
                fontWeight: '700', 
                color: '#363d6e', 
                marginBottom: '16px' 
              }}>
                Influenseri ovog meseca
              </h3>
              
              {uniqueInfluencers.length === 0 ? (
                <p style={{ color: '#6b7194', fontSize: '13px' }}>Nema podataka</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {uniqueInfluencers.map((inf, i) => (
                    <div 
                      key={i}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '10px 12px',
                        background: '#f8f9fc',
                        borderRadius: '12px'
                      }}
                    >
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        overflow: 'hidden',
                        background: inf.image ? 'transparent' : `linear-gradient(135deg, hsl(${(i * 67) % 360}, 55%, 55%) 0%, hsl(${(i * 67 + 40) % 360}, 55%, 45%) 100%)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        {inf.image ? (
                          <img 
                            src={inf.image} 
                            alt={inf.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        ) : (
                          <span style={{ color: '#fff', fontWeight: '600', fontSize: '14px' }}>
                            {inf.name?.charAt(0) || '?'}
                          </span>
                        )}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ 
                          fontSize: '13px', 
                          fontWeight: '600', 
                          color: '#363d6e',
                          margin: 0,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>
                          {inf.name}
                        </p>
                        <p style={{ fontSize: '11px', color: '#6b7194', margin: 0 }}>
                          {inf.clips} klip{inf.clips !== 1 ? 'a' : ''} • {formatNumber(inf.views)} pregleda
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* Footer */}
          <footer style={{
            marginTop: '48px',
            paddingTop: '24px',
            borderTop: '1px solid #e8eaef',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '13px', color: '#6b7194' }}>Powered by</span>
              <span style={{ fontSize: '14px', fontWeight: '700', color: '#363d6e' }}>VOICE</span>
            </div>
            <p style={{ fontSize: '12px', color: '#9ca3c1' }}>
              Poslednje ažuriranje: {new Date().toLocaleString('sr-RS')}
            </p>
          </footer>
        </main>
      </div>
    </>
  );
}
