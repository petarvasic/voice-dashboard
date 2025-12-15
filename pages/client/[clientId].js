// pages/client/[clientId].js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

const formatNumber = (num) => {
  if (!num) return '0';
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toLocaleString();
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('sr-RS', { day: 'numeric', month: 'short', year: 'numeric' });
};

// Platform Icon
const PlatformIcon = ({ platform }) => {
  if (platform === 'Tik Tok' || platform === 'TikTok') {
    return (
      <svg viewBox="0 0 24 24" fill="#000000" style={{width: '18px', height: '18px'}}>
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
      </svg>
    );
  }
  if (platform === 'Instagram') {
    return (
      <svg viewBox="0 0 24 24" fill="#E4405F" style={{width: '18px', height: '18px'}}>
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="#FF0000" style={{width: '18px', height: '18px'}}>
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  );
};

// Status Badge
const StatusBadge = ({ status }) => {
  const getStatusStyle = () => {
    switch(status) {
      case 'Published': return { bg: '#e8f5e9', color: '#2e7d32', border: '#a5d6a7' };
      case 'Done': return { bg: '#e3f2fd', color: '#1565c0', border: '#90caf9' };
      case 'Draft': return { bg: '#fff3e0', color: '#ef6c00', border: '#ffcc80' };
      case 'Paid': return { bg: '#f3e5f5', color: '#7b1fa2', border: '#ce93d8' };
      default: return { bg: '#f5f5f5', color: '#616161', border: '#e0e0e0' };
    }
  };
  const style = getStatusStyle();
  return (
    <span style={{
      display: 'inline-block',
      padding: '4px 10px',
      borderRadius: '100px',
      fontSize: '11px',
      fontWeight: '500',
      background: style.bg,
      color: style.color,
      border: `1px solid ${style.border}`
    }}>
      {status}
    </span>
  );
};

// Progress Bar Component
const ProgressBar = ({ percent, height = 12, showLabel = true, color = 'blue' }) => {
  const colors = {
    blue: 'linear-gradient(90deg, #0071e3 0%, #40a9ff 100%)',
    green: 'linear-gradient(90deg, #34c759 0%, #30d158 100%)',
    purple: 'linear-gradient(90deg, #5856d6 0%, #af52de 100%)'
  };
  
  return (
    <div style={{
      height: `${height}px`,
      background: '#f0f0f5',
      borderRadius: '100px',
      overflow: 'hidden',
      position: 'relative'
    }}>
      <div style={{
        height: '100%',
        width: `${Math.min(percent * 100, 100)}%`,
        background: percent >= 1 ? colors.green : colors[color],
        borderRadius: '100px',
        transition: 'width 1s ease-out',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        paddingRight: showLabel && percent > 0.1 ? '8px' : '0'
      }}>
        {showLabel && percent > 0.1 && (
          <span style={{ 
            fontSize: '11px', 
            fontWeight: '600',
            color: '#fff'
          }}>
            {(percent * 100).toFixed(0)}%
          </span>
        )}
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

  // Fetch client data
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

  // Fetch clips when month changes
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
        background: '#fbfbfd'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid #e8e8ed',
            borderTopColor: '#0071e3',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <p style={{ color: '#86868b' }}>Učitavanje...</p>
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
        background: '#fbfbfd'
      }}>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p style={{ color: '#ff3b30', fontSize: '18px', marginBottom: '8px' }}>Greška</p>
          <p style={{ color: '#86868b' }}>{error}</p>
        </div>
      </div>
    );
  }

  const selectedMonth = clientData?.months?.[selectedMonthIndex];
  const cumulative = clientData?.cumulative;
  const progressPercent = selectedMonth?.percentDelivered || 0;
  const cumulativePercent = cumulative?.percentDelivered || 0;

  // Get unique influencers from clips
  const uniqueInfluencers = [...new Set(clips.map(c => c.influencer))].filter(Boolean);

  return (
    <>
      <Head>
        <title>{clientData?.client?.name || 'Dashboard'} | VOICE</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div style={{ minHeight: '100vh', background: '#fbfbfd' }}>
        {/* Header */}
        <header style={{
          background: 'rgba(251, 251, 253, 0.8)',
          backdropFilter: 'saturate(180%) blur(20px)',
          borderBottom: '1px solid #d2d2d7',
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <span style={{ 
                fontSize: '24px', 
                fontWeight: '700',
                color: '#1d1d1f',
                letterSpacing: '-0.5px'
              }}>
                VOICE
              </span>
              <div style={{ height: '24px', width: '1px', background: '#d2d2d7' }} />
              <div>
                <h1 style={{ 
                  fontSize: '20px', 
                  fontWeight: '600',
                  color: '#1d1d1f',
                  margin: 0
                }}>
                  {clientData?.client?.name}
                </h1>
                <p style={{ fontSize: '12px', color: '#86868b', margin: 0 }}>Campaign Dashboard</p>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>
          
          {/* Cumulative Progress - Big Card */}
          {cumulative && cumulative.monthsCount > 1 && (
            <section style={{
              background: 'linear-gradient(135deg, #1d1d1f 0%, #2d2d30 100%)',
              borderRadius: '24px',
              padding: '32px',
              marginBottom: '24px',
              color: '#fff'
            }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'flex-start',
                marginBottom: '24px'
              }}>
                <div>
                  <p style={{ 
                    fontSize: '13px', 
                    color: 'rgba(255,255,255,0.6)',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    marginBottom: '8px'
                  }}>
                    Ukupan napredak paketa ({cumulative.monthsCount} meseci)
                  </p>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
                    <span style={{ 
                      fontSize: '48px', 
                      fontWeight: '600',
                      letterSpacing: '-2px'
                    }}>
                      {formatNumber(cumulative.totalViews)}
                    </span>
                    <span style={{ fontSize: '18px', color: 'rgba(255,255,255,0.6)' }}>
                      / {formatNumber(cumulative.totalGoal)} pregleda
                    </span>
                  </div>
                </div>
                <div style={{ 
                  textAlign: 'right',
                  background: 'rgba(255,255,255,0.1)',
                  padding: '16px 24px',
                  borderRadius: '16px'
                }}>
                  <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '4px' }}>
                    Ukupno isporučeno
                  </p>
                  <p style={{ 
                    fontSize: '32px', 
                    fontWeight: '600',
                    color: cumulativePercent >= 1 ? '#30d158' : '#fff',
                    margin: 0
                  }}>
                    {(cumulativePercent * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
              
              {/* Cumulative Progress Bar */}
              <div style={{
                height: '16px',
                background: 'rgba(255,255,255,0.2)',
                borderRadius: '100px',
                overflow: 'hidden'
              }}>
                <div style={{
                  height: '100%',
                  width: `${Math.min(cumulativePercent * 100, 100)}%`,
                  background: cumulativePercent >= 1 
                    ? 'linear-gradient(90deg, #30d158 0%, #34c759 100%)'
                    : 'linear-gradient(90deg, #5e5ce6 0%, #bf5af2 100%)',
                  borderRadius: '100px',
                  transition: 'width 1s ease-out'
                }} />
              </div>
              
              {/* Cumulative Stats */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '24px',
                marginTop: '24px',
                paddingTop: '24px',
                borderTop: '1px solid rgba(255,255,255,0.1)'
              }}>
                {[
                  { label: 'Ukupno klipova', value: cumulative.totalClips },
                  { label: 'Ukupno lajkova', value: formatNumber(cumulative.totalLikes) },
                  { label: 'Ukupno komentara', value: formatNumber(cumulative.totalComments) },
                  { label: 'Ukupno deljenja', value: formatNumber(cumulative.totalShares) }
                ].map((stat, i) => (
                  <div key={i}>
                    <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      {stat.label}
                    </p>
                    <p style={{ fontSize: '20px', fontWeight: '600', margin: 0 }}>
                      {stat.value}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Monthly Progress Card */}
          <section style={{
            background: '#ffffff',
            borderRadius: '20px',
            padding: '28px',
            marginBottom: '24px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
            border: '1px solid #e8e8ed'
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
                  color: '#86868b',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  marginBottom: '4px'
                }}>
                  Mesečni napredak
                </p>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                  <span style={{ fontSize: '28px', fontWeight: '600', color: '#1d1d1f' }}>
                    {formatNumber(selectedMonth?.totalViews)}
                  </span>
                  <span style={{ fontSize: '14px', color: '#86868b' }}>
                    / {formatNumber(selectedMonth?.campaignGoal)} pregleda
                  </span>
                </div>
              </div>
              
              {/* Month Selector */}
              <select
                value={selectedMonthIndex}
                onChange={(e) => setSelectedMonthIndex(Number(e.target.value))}
                style={{
                  padding: '10px 36px 10px 16px',
                  fontSize: '14px',
                  fontWeight: '500',
                  border: '1px solid #d2d2d7',
                  borderRadius: '10px',
                  background: '#ffffff',
                  color: '#1d1d1f',
                  cursor: 'pointer',
                  appearance: 'none',
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2386868b' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 12px center'
                }}
              >
                {clientData?.months?.map((month, index) => (
                  <option key={month.id} value={index}>
                    {month.month}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Monthly Progress Bar */}
            <ProgressBar percent={progressPercent} height={10} color="blue" />
            
            {/* Monthly Stats */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              gap: '16px',
              marginTop: '20px',
              paddingTop: '20px',
              borderTop: '1px solid #f0f0f5'
            }}>
              {[
                { label: 'Isporučeno', value: `${(progressPercent * 100).toFixed(0)}%` },
                { label: 'Klipova', value: selectedMonth?.publishedClips || 0 },
                { label: 'Lajkova', value: formatNumber(selectedMonth?.totalLikes) },
                { label: 'Komentara', value: formatNumber(selectedMonth?.totalComments) },
                { label: 'Status', value: selectedMonth?.contractStatus || 'Active' }
              ].map((stat, i) => (
                <div key={i}>
                  <p style={{ fontSize: '11px', color: '#86868b', marginBottom: '2px', textTransform: 'uppercase' }}>
                    {stat.label}
                  </p>
                  <p style={{ fontSize: '16px', fontWeight: '600', color: '#1d1d1f', margin: 0 }}>
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Two Column Layout */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '24px' }}>
            
            {/* Clips Table */}
            <section style={{
              background: '#ffffff',
              borderRadius: '20px',
              overflow: 'hidden',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
              border: '1px solid #e8e8ed'
            }}>
              <div style={{
                padding: '20px 24px',
                borderBottom: '1px solid #f0f0f5',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#1d1d1f', margin: 0 }}>
                  Objavljeni klipovi
                </h2>
                <span style={{ 
                  fontSize: '13px', 
                  color: '#86868b',
                  background: '#f5f5f7',
                  padding: '4px 10px',
                  borderRadius: '100px'
                }}>
                  {clips.length} klipova
                </span>
              </div>
              
              {clipsLoading ? (
                <div style={{ padding: '40px', textAlign: 'center' }}>
                  <p style={{ color: '#86868b' }}>Učitavanje klipova...</p>
                </div>
              ) : clips.length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center' }}>
                  <p style={{ color: '#86868b' }}>Nema klipova za ovaj mesec</p>
                </div>
              ) : (
                <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                  {clips.map((clip, i) => (
                    <div 
                      key={clip.id}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 80px 80px 80px',
                        padding: '14px 24px',
                        borderBottom: '1px solid #f5f5f7',
                        alignItems: 'center',
                        gap: '12px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '10px',
                          background: `linear-gradient(135deg, hsl(${(i * 47) % 360}, 60%, 92%) 0%, hsl(${(i * 47 + 30) % 360}, 60%, 88%) 100%)`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: '600',
                          fontSize: '14px',
                          color: `hsl(${(i * 47) % 360}, 60%, 35%)`
                        }}>
                          {clip.influencer?.charAt(0) || '?'}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <p style={{ 
                            fontWeight: '500', 
                            color: '#1d1d1f',
                            fontSize: '13px',
                            margin: 0,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}>
                            {clip.influencer}
                          </p>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                            <PlatformIcon platform={clip.platform} />
                            <span style={{ fontSize: '11px', color: '#86868b' }}>
                              {formatDate(clip.publishDate)}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontSize: '13px', fontWeight: '600', color: '#1d1d1f', margin: 0 }}>
                          {formatNumber(clip.views)}
                        </p>
                        <p style={{ fontSize: '10px', color: '#86868b', margin: 0 }}>pregleda</p>
                      </div>
                      
                      <div style={{ textAlign: 'center' }}>
                        <StatusBadge status={clip.status} />
                      </div>
                      
                      <div style={{ textAlign: 'right' }}>
                        {clip.link ? (
                          <a 
                            href={clip.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '6px 12px',
                              background: '#f5f5f7',
                              borderRadius: '8px',
                              color: '#0071e3',
                              textDecoration: 'none',
                              fontSize: '12px',
                              fontWeight: '500'
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
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
              border: '1px solid #e8e8ed',
              height: 'fit-content'
            }}>
              <h3 style={{ 
                fontSize: '14px', 
                fontWeight: '600', 
                color: '#1d1d1f', 
                marginBottom: '16px' 
              }}>
                Influenseri ovog meseca
              </h3>
              
              {uniqueInfluencers.length === 0 ? (
                <p style={{ color: '#86868b', fontSize: '13px' }}>Nema podataka</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {uniqueInfluencers.map((name, i) => {
                    const influencerClips = clips.filter(c => c.influencer === name);
                    const totalViews = influencerClips.reduce((sum, c) => sum + (c.views || 0), 0);
                    
                    return (
                      <div 
                        key={i}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '10px 12px',
                          background: '#f9f9fb',
                          borderRadius: '12px'
                        }}
                      >
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          background: `linear-gradient(135deg, hsl(${(i * 67) % 360}, 65%, 55%) 0%, hsl(${(i * 67 + 40) % 360}, 65%, 45%) 100%)`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#fff',
                          fontWeight: '600',
                          fontSize: '13px'
                        }}>
                          {name.charAt(0)}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ 
                            fontSize: '13px', 
                            fontWeight: '500', 
                            color: '#1d1d1f',
                            margin: 0,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}>
                            {name}
                          </p>
                          <p style={{ fontSize: '11px', color: '#86868b', margin: 0 }}>
                            {influencerClips.length} klip{influencerClips.length !== 1 ? 'a' : ''} • {formatNumber(totalViews)} pregleda
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </div>

          {/* Footer */}
          <footer style={{
            marginTop: '48px',
            paddingTop: '24px',
            borderTop: '1px solid #e8e8ed',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '14px', color: '#86868b' }}>Powered by</span>
              <span style={{ fontSize: '14px', fontWeight: '600', color: '#1d1d1f' }}>VOICE</span>
            </div>
            <p style={{ fontSize: '12px', color: '#d2d2d7' }}>
              Poslednje ažuriranje: {new Date().toLocaleString('sr-RS')}
            </p>
          </footer>
        </main>
      </div>
    </>
  );
}
