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

// VOICE Logo Component
const VoiceLogo = () => (
  <svg width="120" height="32" viewBox="0 0 120 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <text x="0" y="24" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif" fontSize="24" fontWeight="700" fill="#1d1d1f">
      VOICE
    </text>
  </svg>
);

// Platform Icon
const PlatformIcon = ({ platform }) => {
  if (platform === 'Tik Tok' || platform === 'TikTok') {
    return (
      <svg viewBox="0 0 24 24" fill="#000000" style={{width: '20px', height: '20px'}}>
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
      </svg>
    );
  }
  if (platform === 'Instagram') {
    return (
      <svg viewBox="0 0 24 24" fill="#E4405F" style={{width: '20px', height: '20px'}}>
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="#FF0000" style={{width: '20px', height: '20px'}}>
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  );
};

// Status Badge
const StatusBadge = ({ status }) => {
  const getStatusStyle = () => {
    switch(status) {
      case 'Published':
        return { bg: '#e8f5e9', color: '#2e7d32', border: '#a5d6a7' };
      case 'Done':
        return { bg: '#e3f2fd', color: '#1565c0', border: '#90caf9' };
      case 'Draft':
        return { bg: '#fff3e0', color: '#ef6c00', border: '#ffcc80' };
      case 'Paid':
        return { bg: '#f3e5f5', color: '#7b1fa2', border: '#ce93d8' };
      default:
        return { bg: '#f5f5f5', color: '#616161', border: '#e0e0e0' };
    }
  };
  
  const style = getStatusStyle();
  
  return (
    <span style={{
      display: 'inline-block',
      padding: '4px 12px',
      borderRadius: '100px',
      fontSize: '12px',
      fontWeight: '500',
      background: style.bg,
      color: style.color,
      border: `1px solid ${style.border}`
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
  const progressPercent = selectedMonth?.percentDelivered || 0;
  const timePercent = selectedMonth?.timePercent || 0;
  const isOnTrack = progressPercent >= (timePercent - 10);

  return (
    <>
      <Head>
        <title>{clientData?.client?.name || 'Dashboard'} | VOICE</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
              <VoiceLogo />
              <div style={{ height: '24px', width: '1px', background: '#d2d2d7' }} />
              <div>
                <h1 style={{ 
                  fontSize: '21px', 
                  fontWeight: '600',
                  color: '#1d1d1f',
                  letterSpacing: '-0.3px'
                }}>
                  {clientData?.client?.name}
                </h1>
                <p style={{ fontSize: '13px', color: '#86868b' }}>Campaign Dashboard</p>
              </div>
            </div>
            
            {/* Month Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
                  backgroundPosition: 'right 12px center',
                  minWidth: '180px'
                }}
              >
                {clientData?.months?.map((month, index) => (
                  <option key={month.id} value={index}>
                    {month.month}
                  </option>
                ))}
              </select>
              
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                background: isOnTrack ? '#e8f5e9' : '#fff3e0',
                borderRadius: '10px',
                border: `1px solid ${isOnTrack ? '#a5d6a7' : '#ffcc80'}`
              }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: isOnTrack ? '#34c759' : '#ff9500',
                  animation: 'pulse 2s infinite'
                }} />
                <span style={{ 
                  fontSize: '13px', 
                  fontWeight: '500',
                  color: isOnTrack ? '#2e7d32' : '#ef6c00'
                }}>
                  {isOnTrack ? 'On Track' : 'U toku'}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>
          
          {/* Progress Card */}
          <section style={{
            background: '#ffffff',
            borderRadius: '20px',
            padding: '32px',
            marginBottom: '24px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
            border: '1px solid #e8e8ed'
          }} className="animate-slide-up">
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'flex-start',
              marginBottom: '32px'
            }}>
              <div>
                <p style={{ 
                  fontSize: '13px', 
                  color: '#86868b',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  marginBottom: '8px'
                }}>
                  Napredak kampanje
                </p>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
                  <span style={{ 
                    fontSize: '56px', 
                    fontWeight: '600',
                    color: '#1d1d1f',
                    letterSpacing: '-2px',
                    lineHeight: 1
                  }}>
                    {formatNumber(selectedMonth?.totalViews)}
                  </span>
                  <span style={{ fontSize: '20px', color: '#86868b' }}>
                    / {formatNumber(selectedMonth?.campaignGoal)} pregleda
                  </span>
                </div>
              </div>
              
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '13px', color: '#86868b', marginBottom: '4px' }}>
                  Isporučeno
                </p>
                <p style={{ 
                  fontSize: '32px', 
                  fontWeight: '600',
                  color: progressPercent >= 100 ? '#34c759' : '#0071e3',
                  letterSpacing: '-1px'
                }}>
                  {(progressPercent * 100).toFixed(1)}%
                </p>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div style={{
              height: '12px',
              background: '#f5f5f7',
              borderRadius: '100px',
              overflow: 'hidden',
              position: 'relative',
              marginBottom: '24px'
            }}>
              {/* Time marker */}
              <div style={{
                position: 'absolute',
                left: `${Math.min(timePercent * 100, 100)}%`,
                top: '-4px',
                bottom: '-4px',
                width: '2px',
                background: '#86868b',
                borderRadius: '1px',
                zIndex: 2
              }} />
              
              {/* Progress fill */}
              <div style={{
                height: '100%',
                width: `${Math.min(progressPercent * 100, 100)}%`,
                background: progressPercent >= 1 
                  ? 'linear-gradient(90deg, #34c759 0%, #30d158 100%)'
                  : 'linear-gradient(90deg, #0071e3 0%, #40a9ff 100%)',
                borderRadius: '100px',
                transition: 'width 1s ease-out'
              }} />
            </div>
            
            {/* Stats Row */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              gap: '24px',
              paddingTop: '24px',
              borderTop: '1px solid #f5f5f7'
            }}>
              {[
                { label: 'Preostalo', value: formatNumber(Math.max(0, (selectedMonth?.campaignGoal || 0) - (selectedMonth?.totalViews || 0))) },
                { label: 'Dnevni prosek', value: formatNumber(Math.round((selectedMonth?.totalViews || 0) / Math.max(1, selectedMonth?.daysPassed || 1))) },
                { label: 'Dana prošlo', value: `${selectedMonth?.daysPassed || 0}/${selectedMonth?.daysTotal || 30}` },
                { label: 'Objavljeno klipova', value: selectedMonth?.publishedClips || 0 },
                { label: 'Status', value: selectedMonth?.contractStatus || 'Active' }
              ].map((stat, i) => (
                <div key={i}>
                  <p style={{ 
                    fontSize: '12px', 
                    color: '#86868b',
                    marginBottom: '4px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.3px'
                  }}>
                    {stat.label}
                  </p>
                  <p style={{ 
                    fontSize: '20px', 
                    fontWeight: '600',
                    color: '#1d1d1f'
                  }}>
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Metrics Grid */}
          <section style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '16px',
            marginBottom: '24px'
          }}>
            {[
              { label: 'Ukupno pregleda', value: selectedMonth?.totalViews, icon: '👁️', color: '#0071e3' },
              { label: 'Lajkovi', value: selectedMonth?.totalLikes, icon: '❤️', color: '#ff3b30' },
              { label: 'Komentari', value: selectedMonth?.totalComments, icon: '💬', color: '#5856d6' },
              { label: 'Deljenja', value: selectedMonth?.totalShares, icon: '↗️', color: '#34c759' }
            ].map((metric, i) => (
              <div 
                key={i}
                className="animate-slide-up"
                style={{
                  background: '#ffffff',
                  borderRadius: '16px',
                  padding: '24px',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                  border: '1px solid #e8e8ed',
                  animationDelay: `${i * 0.1}s`
                }}
              >
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '12px'
                }}>
                  <span style={{ fontSize: '24px' }}>{metric.icon}</span>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: metric.color
                  }} />
                </div>
                <p style={{ 
                  fontSize: '28px', 
                  fontWeight: '600',
                  color: '#1d1d1f',
                  marginBottom: '4px',
                  letterSpacing: '-0.5px'
                }}>
                  {formatNumber(metric.value)}
                </p>
                <p style={{ fontSize: '13px', color: '#86868b' }}>
                  {metric.label}
                </p>
              </div>
            ))}
          </section>

          {/* Clips Table */}
          <section style={{
            background: '#ffffff',
            borderRadius: '20px',
            overflow: 'hidden',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
            border: '1px solid #e8e8ed'
          }} className="animate-slide-up">
            <div style={{
              padding: '24px 28px',
              borderBottom: '1px solid #f5f5f7',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <h2 style={{ 
                  fontSize: '19px', 
                  fontWeight: '600',
                  color: '#1d1d1f',
                  marginBottom: '4px'
                }}>
                  Objavljeni sadržaj
                </h2>
                <p style={{ fontSize: '13px', color: '#86868b' }}>
                  {clips.length} klipova u ovom mesecu
                </p>
              </div>
            </div>
            
            {clipsLoading ? (
              <div style={{ padding: '60px', textAlign: 'center' }}>
                <p style={{ color: '#86868b' }}>Učitavanje klipova...</p>
              </div>
            ) : clips.length === 0 ? (
              <div style={{ padding: '60px', textAlign: 'center' }}>
                <p style={{ color: '#86868b' }}>Nema klipova za ovaj mesec</p>
              </div>
            ) : (
              <>
                {/* Table Header */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 100px 100px 80px 80px 90px 100px',
                  padding: '12px 28px',
                  background: '#f5f5f7',
                  fontSize: '12px',
                  color: '#86868b',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  fontWeight: '500'
                }}>
                  <div>Influenser</div>
                  <div>Platforma</div>
                  <div style={{ textAlign: 'right' }}>Pregledi</div>
                  <div style={{ textAlign: 'right' }}>Lajkovi</div>
                  <div style={{ textAlign: 'right' }}>Kom.</div>
                  <div style={{ textAlign: 'center' }}>Status</div>
                  <div style={{ textAlign: 'center' }}>Link</div>
                </div>
                
                {/* Table Rows */}
                {clips.map((clip, i) => (
                  <div 
                    key={clip.id}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '2fr 100px 100px 80px 80px 90px 100px',
                      padding: '16px 28px',
                      borderBottom: '1px solid #f5f5f7',
                      alignItems: 'center',
                      transition: 'background 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#fafafa'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '10px',
                        background: `linear-gradient(135deg, hsl(${(i * 47) % 360}, 60%, 92%) 0%, hsl(${(i * 47 + 30) % 360}, 60%, 88%) 100%)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: '600',
                        fontSize: '16px',
                        color: `hsl(${(i * 47) % 360}, 60%, 35%)`
                      }}>
                        {clip.influencer?.charAt(0) || '?'}
                      </div>
                      <div>
                        <p style={{ 
                          fontWeight: '500', 
                          color: '#1d1d1f',
                          fontSize: '14px'
                        }}>
                          {clip.influencer}
                        </p>
                        <p style={{ fontSize: '12px', color: '#86868b' }}>
                          {formatDate(clip.publishDate)}
                        </p>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <PlatformIcon platform={clip.platform} />
                      <span style={{ fontSize: '13px', color: '#1d1d1f' }}>
                        {clip.platform === 'Tik Tok' ? 'TikTok' : clip.platform}
                      </span>
                    </div>
                    
                    <div style={{ 
                      textAlign: 'right', 
                      fontWeight: '600',
                      fontSize: '14px',
                      color: '#1d1d1f'
                    }}>
                      {formatNumber(clip.views)}
                    </div>
                    
                    <div style={{ textAlign: 'right', fontSize: '14px', color: '#86868b' }}>
                      {formatNumber(clip.likes)}
                    </div>
                    
                    <div style={{ textAlign: 'right', fontSize: '14px', color: '#86868b' }}>
                      {formatNumber(clip.comments)}
                    </div>
                    
                    <div style={{ textAlign: 'center' }}>
                      <StatusBadge status={clip.status} />
                    </div>
                    
                    <div style={{ textAlign: 'center' }}>
                      {clip.link ? (
                        <a 
                          href={clip.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '8px 14px',
                            background: '#f5f5f7',
                            borderRadius: '8px',
                            color: '#0071e3',
                            textDecoration: 'none',
                            fontSize: '13px',
                            fontWeight: '500',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#0071e3';
                            e.currentTarget.style.color = '#ffffff';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = '#f5f5f7';
                            e.currentTarget.style.color = '#0071e3';
                          }}
                        >
                          Pogledaj
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"/>
                          </svg>
                        </a>
                      ) : (
                        <span style={{ color: '#d2d2d7', fontSize: '13px' }}>—</span>
                      )}
                    </div>
                  </div>
                ))}
              </>
            )}
          </section>

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

      <style jsx global>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </>
  );
}
