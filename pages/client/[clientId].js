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
  return date.toLocaleDateString('sr-RS', { day: 'numeric', month: 'short' });
};

// VOICE Logo - Light version for dark bg
const VoiceLogo = () => (
  <svg width="100" height="32" viewBox="0 0 100 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <text x="0" y="24" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif" fontSize="24" fontWeight="700" fill="#ffffff">voice</text>
    <circle cx="88" cy="6" r="3" fill="#818cf8"/>
  </svg>
);

// Platform Icon
const PlatformIcon = ({ platform }) => {
  if (platform === 'Tik Tok' || platform === 'TikTok') {
    return (
      <svg viewBox="0 0 24 24" fill="#ffffff" style={{width: '14px', height: '14px', opacity: 0.6}}>
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
      </svg>
    );
  }
  if (platform === 'Instagram') {
    return (
      <svg viewBox="0 0 24 24" fill="#E4405F" style={{width: '14px', height: '14px'}}>
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
      </svg>
    );
  }
  return null;
};

// Status Badge - Dark version
const StatusBadge = ({ status }) => {
  const getStatusStyle = () => {
    switch(status) {
      case 'Published': return { bg: 'rgba(34, 197, 94, 0.2)', color: '#4ade80' };
      case 'Done': return { bg: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa' };
      case 'Draft': return { bg: 'rgba(251, 191, 36, 0.2)', color: '#fbbf24' };
      case 'Active': return { bg: 'rgba(34, 197, 94, 0.2)', color: '#4ade80' };
      case 'Closed': return { bg: 'rgba(156, 163, 175, 0.2)', color: '#9ca3af' };
      default: return { bg: 'rgba(156, 163, 175, 0.2)', color: '#9ca3af' };
    }
  };
  const style = getStatusStyle();
  return (
    <span style={{
      display: 'inline-block',
      padding: '3px 8px',
      borderRadius: '4px',
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
        background: '#0f0f1a'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '32px',
            height: '32px',
            border: '2px solid rgba(255,255,255,0.1)',
            borderTopColor: '#818cf8',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
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
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0f0f1a'
      }}>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p style={{ color: '#f87171', fontSize: '16px', marginBottom: '8px' }}>Greška</p>
          <p style={{ color: 'rgba(255,255,255,0.5)' }}>{error}</p>
        </div>
      </div>
    );
  }

  const selectedMonth = clientData?.months?.[selectedMonthIndex];
  const cumulative = clientData?.cumulative;
  const progressPercent = selectedMonth?.percentDelivered || 0;
  const cumulativePercent = cumulative?.percentDelivered || 0;

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
        background: '#0f0f1a',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        color: '#ffffff'
      }}>
        {/* Header */}
        <header style={{
          background: 'rgba(15, 15, 26, 0.8)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          position: 'sticky',
          top: 0,
          zIndex: 100
        }}>
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '14px 24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <VoiceLogo />
              <div style={{ height: '24px', width: '1px', background: 'rgba(255,255,255,0.1)' }} />
              <div>
                <h1 style={{ fontSize: '16px', fontWeight: '600', color: '#fff', margin: 0 }}>
                  {clientData?.client?.name}
                </h1>
                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', margin: 0 }}>Campaign Dashboard</p>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
          
          {/* Cumulative Progress - TOP */}
          {cumulative && cumulative.monthsCount > 1 && (
            <section style={{
              background: 'linear-gradient(135deg, rgba(129, 140, 248, 0.1) 0%, rgba(167, 139, 250, 0.1) 100%)',
              border: '1px solid rgba(129, 140, 248, 0.2)',
              borderRadius: '16px',
              padding: '20px 24px',
              marginBottom: '16px'
            }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '14px'
              }}>
                <div>
                  <p style={{ 
                    fontSize: '11px', 
                    color: 'rgba(255,255,255,0.5)',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    marginBottom: '6px',
                    fontWeight: '500'
                  }}>
                    Ukupan napredak paketa ({cumulative.monthsCount} meseci)
                  </p>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
                    <span style={{ fontSize: '32px', fontWeight: '700' }}>
                      {formatNumber(cumulative.totalViews)}
                    </span>
                    <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)' }}>
                      / {formatNumber(cumulative.totalGoal)} pregleda
                    </span>
                  </div>
                </div>
                <div style={{ 
                  textAlign: 'center',
                  background: cumulativePercent >= 1 ? 'rgba(34, 197, 94, 0.2)' : 'rgba(129, 140, 248, 0.2)',
                  padding: '10px 20px',
                  borderRadius: '10px'
                }}>
                  <p style={{ 
                    fontSize: '28px', 
                    fontWeight: '700',
                    color: cumulativePercent >= 1 ? '#4ade80' : '#818cf8',
                    margin: 0
                  }}>
                    {(cumulativePercent * 100).toFixed(0)}%
                  </p>
                </div>
              </div>
              
              <div style={{
                height: '6px',
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '100px',
                overflow: 'hidden'
              }}>
                <div style={{
                  height: '100%',
                  width: `${Math.min(cumulativePercent * 100, 100)}%`,
                  background: cumulativePercent >= 1 
                    ? 'linear-gradient(90deg, #22c55e 0%, #4ade80 100%)'
                    : 'linear-gradient(90deg, #818cf8 0%, #a78bfa 100%)',
                  borderRadius: '100px',
                  transition: 'width 1s ease-out'
                }} />
              </div>
            </section>
          )}

          {/* Metrics Grid */}
          <section style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '12px',
            marginBottom: '16px'
          }}>
            {[
              { label: 'Ukupno pregleda', value: formatNumber(selectedMonth?.totalViews) },
              { label: 'Lajkovi', value: formatNumber(selectedMonth?.totalLikes) },
              { label: 'Komentari', value: formatNumber(selectedMonth?.totalComments) },
              { label: 'Deljenja', value: formatNumber(selectedMonth?.totalShares) }
            ].map((metric, i) => (
              <div key={i} style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '12px',
                padding: '14px 18px'
              }}>
                <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '500' }}>
                  {metric.label}
                </p>
                <p style={{ fontSize: '22px', fontWeight: '700', color: '#fff', margin: 0 }}>
                  {metric.value}
                </p>
              </div>
            ))}
          </section>

          {/* Monthly Progress - Compact */}
          <section style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '12px',
            padding: '16px 20px',
            marginBottom: '16px'
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div>
                  <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Mesečni napredak
                  </p>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                    <span style={{ fontSize: '24px', fontWeight: '700' }}>{formatNumber(selectedMonth?.totalViews)}</span>
                    <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>/ {formatNumber(selectedMonth?.campaignGoal)}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '16px', marginLeft: '24px' }}>
                  <div>
                    <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', marginBottom: '2px' }}>KLIPOVA</p>
                    <p style={{ fontSize: '16px', fontWeight: '600', margin: 0 }}>{selectedMonth?.publishedClips || 0}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', marginBottom: '2px' }}>STATUS</p>
                    <StatusBadge status={selectedMonth?.contractStatus || 'Active'} />
                  </div>
                </div>
              </div>
              
              <select
                value={selectedMonthIndex}
                onChange={(e) => setSelectedMonthIndex(Number(e.target.value))}
                style={{
                  padding: '8px 32px 8px 12px',
                  fontSize: '13px',
                  fontWeight: '600',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  background: 'rgba(255,255,255,0.05)',
                  color: '#fff',
                  cursor: 'pointer',
                  appearance: 'none',
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.5)' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 10px center'
                }}
              >
                {clientData?.months?.map((month, index) => (
                  <option key={month.id} value={index} style={{ background: '#1a1a2e', color: '#fff' }}>
                    {month.month}
                  </option>
                ))}
              </select>
            </div>
            
            <div style={{
              height: '8px',
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '100px',
              overflow: 'hidden'
            }}>
              <div style={{
                height: '100%',
                width: `${Math.min(progressPercent * 100, 100)}%`,
                background: progressPercent >= 1 
                  ? 'linear-gradient(90deg, #22c55e 0%, #4ade80 100%)'
                  : 'linear-gradient(90deg, #818cf8 0%, #a78bfa 100%)',
                borderRadius: '100px',
                transition: 'width 0.8s ease-out'
              }} />
            </div>
            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '6px', textAlign: 'right' }}>
              {(progressPercent * 100).toFixed(0)}% isporučeno
            </p>
          </section>

          {/* Two Column Layout */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '16px' }}>
            
            {/* Clips Table with fade effect */}
            <section style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '12px',
              overflow: 'hidden',
              position: 'relative'
            }}>
              <div style={{
                padding: '14px 20px',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <h2 style={{ fontSize: '14px', fontWeight: '600', margin: 0 }}>Objavljeni klipovi</h2>
                <span style={{ 
                  fontSize: '11px', 
                  color: 'rgba(255,255,255,0.4)',
                  background: 'rgba(255,255,255,0.05)',
                  padding: '3px 10px',
                  borderRadius: '100px'
                }}>
                  {clips.length} klipova
                </span>
              </div>
              
              {clipsLoading ? (
                <div style={{ padding: '40px', textAlign: 'center' }}>
                  <p style={{ color: 'rgba(255,255,255,0.4)' }}>Učitavanje...</p>
                </div>
              ) : clips.length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center' }}>
                  <p style={{ color: 'rgba(255,255,255,0.4)' }}>Nema klipova za ovaj mesec</p>
                </div>
              ) : (
                <div style={{ position: 'relative' }}>
                  <div style={{ maxHeight: '380px', overflowY: 'auto' }}>
                    {clips.map((clip, i) => (
                      <div 
                        key={clip.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          padding: '10px 20px',
                          borderBottom: '1px solid rgba(255,255,255,0.04)',
                          gap: '12px'
                        }}
                      >
                        <div style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          overflow: 'hidden',
                          background: clip.influencerImage ? 'transparent' : `linear-gradient(135deg, hsl(${(i * 47) % 360}, 50%, 50%) 0%, hsl(${(i * 47 + 30) % 360}, 50%, 40%) 100%)`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          {clip.influencerImage ? (
                            <img src={clip.influencerImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <span style={{ color: '#fff', fontWeight: '600', fontSize: '13px' }}>{clip.influencer?.charAt(0) || '?'}</span>
                          )}
                        </div>
                        
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontWeight: '500', fontSize: '13px', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {clip.influencer}
                          </p>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '2px' }}>
                            <PlatformIcon platform={clip.platform} />
                            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>{formatDate(clip.publishDate)}</span>
                          </div>
                        </div>
                        
                        <div style={{ textAlign: 'right', minWidth: '60px' }}>
                          <p style={{ fontSize: '13px', fontWeight: '600', margin: 0 }}>{formatNumber(clip.views)}</p>
                          <p style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)', margin: 0 }}>pregleda</p>
                        </div>
                        
                        <StatusBadge status={clip.status} />
                        
                        {clip.link ? (
                          <a href={clip.link} target="_blank" rel="noopener noreferrer" style={{
                            padding: '5px 10px',
                            background: 'rgba(129, 140, 248, 0.2)',
                            borderRadius: '6px',
                            color: '#818cf8',
                            textDecoration: 'none',
                            fontSize: '11px',
                            fontWeight: '600'
                          }}>
                            Link
                          </a>
                        ) : <span style={{ width: '40px' }} />}
                      </div>
                    ))}
                  </div>
                  {/* Fade effect at bottom */}
                  {clips.length > 6 && (
                    <div style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: '60px',
                      background: 'linear-gradient(to top, rgba(15, 15, 26, 1) 0%, rgba(15, 15, 26, 0) 100%)',
                      pointerEvents: 'none'
                    }} />
                  )}
                </div>
              )}
            </section>

            {/* Influencers Sidebar */}
            <section style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '12px',
              padding: '14px 16px',
              height: 'fit-content'
            }}>
              <h3 style={{ fontSize: '12px', fontWeight: '600', marginBottom: '12px', color: 'rgba(255,255,255,0.7)' }}>
                Influenseri ({uniqueInfluencers.length})
              </h3>
              
              {uniqueInfluencers.length === 0 ? (
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>Nema podataka</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {uniqueInfluencers.slice(0, 8).map((inf, i) => (
                    <div key={i} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '8px 10px',
                      background: 'rgba(255,255,255,0.03)',
                      borderRadius: '8px'
                    }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        overflow: 'hidden',
                        background: inf.image ? 'transparent' : `linear-gradient(135deg, hsl(${(i * 67) % 360}, 50%, 50%) 0%, hsl(${(i * 67 + 40) % 360}, 50%, 40%) 100%)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        {inf.image ? (
                          <img src={inf.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <span style={{ color: '#fff', fontWeight: '600', fontSize: '12px' }}>{inf.name?.charAt(0) || '?'}</span>
                        )}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: '12px', fontWeight: '500', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {inf.name}
                        </p>
                        <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', margin: 0 }}>
                          {inf.clips} klip{inf.clips !== 1 ? 'a' : ''} • {formatNumber(inf.views)}
                        </p>
                      </div>
                    </div>
                  ))}
                  {uniqueInfluencers.length > 8 && (
                    <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', textAlign: 'center', marginTop: '4px' }}>
                      +{uniqueInfluencers.length - 8} više
                    </p>
                  )}
                </div>
              )}
            </section>
          </div>

          {/* Footer */}
          <footer style={{
            marginTop: '32px',
            paddingTop: '16px',
            borderTop: '1px solid rgba(255,255,255,0.06)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)' }}>Powered by</span>
              <span style={{ fontSize: '13px', fontWeight: '600', color: 'rgba(255,255,255,0.6)' }}>VOICE</span>
            </div>
            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)' }}>
              {new Date().toLocaleString('sr-RS')}
            </p>
          </footer>
        </main>
      </div>
    </>
  );
}
