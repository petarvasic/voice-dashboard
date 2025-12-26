// pages/coordinator/[slug].js - COORDINATOR DASHBOARD v2.0
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

const formatPercent = (num) => {
  if (!num || isNaN(num)) return '0%';
  return Math.round(num * 100) + '%';
};

// Components
const Badge = ({ children, color = '#818cf8' }) => (
  <span style={{
    padding: '4px 10px',
    fontSize: '11px',
    fontWeight: '600',
    background: `${color}22`,
    color: color,
    borderRadius: '6px',
    whiteSpace: 'nowrap'
  }}>
    {children}
  </span>
);

const Button = ({ children, onClick, variant = 'primary', disabled = false, loading = false, small = false }) => {
  const styles = {
    primary: { bg: '#818cf8', color: '#fff' },
    success: { bg: '#22c55e', color: '#fff' },
    danger: { bg: '#ef4444', color: '#fff' },
    ghost: { bg: 'rgba(255,255,255,0.1)', color: '#fff' }
  };
  const style = styles[variant];
  
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      style={{
        padding: small ? '6px 12px' : '10px 16px',
        fontSize: small ? '11px' : '13px',
        fontWeight: '600',
        background: style.bg,
        color: style.color,
        border: 'none',
        borderRadius: '8px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'all 0.2s',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px'
      }}
    >
      {loading && '⏳'} {children}
    </button>
  );
};

const StatCard = ({ icon, label, value, color = '#818cf8', subvalue }) => (
  <div style={{
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '16px',
    padding: '20px'
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
      <span style={{ fontSize: '20px' }}>{icon}</span>
      <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>{label}</span>
    </div>
    <p style={{ fontSize: '28px', fontWeight: '700', margin: 0, color }}>{value}</p>
    {subvalue && <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', margin: '4px 0 0' }}>{subvalue}</p>}
  </div>
);

const SectionCard = ({ title, icon, count, color = '#818cf8', children }) => (
  <section style={{
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '18px',
    overflow: 'hidden'
  }}>
    <div style={{
      padding: '16px 20px',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ fontSize: '18px' }}>{icon}</span>
        <h2 style={{ fontSize: '14px', fontWeight: '600', margin: 0 }}>{title}</h2>
      </div>
      {count !== undefined && (
        <Badge color={color}>{count}</Badge>
      )}
    </div>
    <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
      {children}
    </div>
  </section>
);

const OfferRow = ({ offer, showActions = false, onApprove, onReject, loading }) => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    padding: '14px 20px',
    borderBottom: '1px solid rgba(255,255,255,0.04)',
    gap: '12px'
  }}>
    {/* Avatar */}
    <div style={{
      width: '40px', height: '40px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0,
      background: offer.influencer?.image ? 'transparent' : 'linear-gradient(135deg, #818cf8, #a78bfa)',
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      {offer.influencer?.image 
        ? <img src={offer.influencer.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        : <span style={{ color: '#fff', fontWeight: '600' }}>{offer.influencerName?.charAt(0)}</span>
      }
    </div>
    
    {/* Info */}
    <div style={{ flex: 1, minWidth: 0 }}>
      <p style={{ fontSize: '14px', fontWeight: '600', margin: 0 }}>{offer.influencerName}</p>
      <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', margin: '2px 0 0' }}>
        {offer.clientName} • {offer.contractMonthName}
      </p>
    </div>
    
    {/* Status or Actions */}
    {showActions ? (
      <div style={{ display: 'flex', gap: '8px' }}>
        <Button small variant="success" onClick={() => onApprove(offer.id)} loading={loading}>
          ✓ Odobri
        </Button>
        <Button small variant="danger" onClick={() => onReject(offer.id)} loading={loading}>
          ✗ Odbij
        </Button>
      </div>
    ) : (
      <Badge color={offer.status === 'Accepted' ? '#22c55e' : '#ef4444'}>
        {offer.status === 'Accepted' ? '✅ Prihvatio' : '❌ Odbio'}
      </Badge>
    )}
    
    {/* Date */}
    <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', minWidth: '60px', textAlign: 'right' }}>
      {formatDate(offer.responseDate || offer.sentDate)}
    </span>
  </div>
);

const ClipRow = ({ clip }) => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    padding: '14px 20px',
    borderBottom: '1px solid rgba(255,255,255,0.04)',
    gap: '12px'
  }}>
    {/* Avatar */}
    <div style={{
      width: '40px', height: '40px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0,
      background: clip.influencer?.image ? 'transparent' : 'linear-gradient(135deg, #818cf8, #a78bfa)',
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      {clip.influencer?.image 
        ? <img src={clip.influencer.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        : <span style={{ color: '#fff', fontWeight: '600' }}>{clip.influencerName?.charAt(0)}</span>
      }
    </div>
    
    {/* Info */}
    <div style={{ flex: 1, minWidth: 0 }}>
      <p style={{ fontSize: '14px', fontWeight: '600', margin: 0 }}>{clip.influencerName}</p>
      <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', margin: '2px 0 0' }}>
        {clip.clientName} • {clip.platform || 'TikTok'}
      </p>
    </div>
    
    {/* Views */}
    {clip.views > 0 && (
      <div style={{ textAlign: 'right', marginRight: '8px' }}>
        <p style={{ fontSize: '14px', fontWeight: '700', margin: 0 }}>{formatNumber(clip.views)}</p>
        <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', margin: 0 }}>views</p>
      </div>
    )}
    
    {/* Status */}
    <Badge color={clip.status === 'Published' ? '#22c55e' : '#fbbf24'}>
      {clip.status === 'Published' ? '✅' : '⏳'} {clip.status}
    </Badge>
    
    {/* Link */}
    {clip.link && (
      <a href={clip.link} target="_blank" rel="noopener noreferrer" style={{
        padding: '6px 12px',
        background: 'rgba(129, 140, 248, 0.15)',
        borderRadius: '6px',
        color: '#818cf8',
        textDecoration: 'none',
        fontSize: '11px',
        fontWeight: '600'
      }}>
        ↗
      </a>
    )}
    
    {/* WhatsApp */}
    {clip.influencer?.phone && (
      <a href={`https://wa.me/${clip.influencer.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" style={{
        padding: '6px 10px',
        background: 'rgba(34, 197, 94, 0.15)',
        borderRadius: '6px',
        color: '#22c55e',
        textDecoration: 'none',
        fontSize: '14px'
      }}>
        💬
      </a>
    )}
  </div>
);

const MonthRow = ({ month }) => {
  const progress = Math.min((month.percentDelivered || 0) * 100, 100);
  const statusEmoji = month.progressStatus?.charAt(0) || '📊';
  
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      padding: '14px 20px',
      borderBottom: '1px solid rgba(255,255,255,0.04)',
      gap: '12px'
    }}>
      <span style={{ fontSize: '20px' }}>{statusEmoji}</span>
      
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: '14px', fontWeight: '600', margin: 0 }}>{month.clientName}</p>
        <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', margin: '2px 0 0' }}>{month.month}</p>
      </div>
      
      <div style={{ width: '100px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
          <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>{formatNumber(month.totalViews)}</span>
          <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>{formatNumber(month.campaignGoal)}</span>
        </div>
        <div style={{ height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            width: `${progress}%`,
            background: progress >= 100 ? '#22c55e' : progress >= 70 ? '#fbbf24' : '#818cf8',
            borderRadius: '2px'
          }} />
        </div>
      </div>
      
      <span style={{ 
        fontSize: '13px', 
        fontWeight: '700', 
        color: progress >= 100 ? '#22c55e' : '#fff',
        minWidth: '45px',
        textAlign: 'right'
      }}>
        {progress.toFixed(0)}%
      </span>
      
      <Badge color="#60a5fa">{month.publishedClips || 0} klipova</Badge>
    </div>
  );
};

const EmptyState = ({ icon, text }) => (
  <div style={{ padding: '40px', textAlign: 'center' }}>
    <span style={{ fontSize: '32px', opacity: 0.5 }}>{icon}</span>
    <p style={{ color: 'rgba(255,255,255,0.4)', margin: '12px 0 0', fontSize: '13px' }}>{text}</p>
  </div>
);

// Main Component
export default function CoordinatorDashboard() {
  const router = useRouter();
  const { slug } = router.query;
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  const fetchData = async () => {
    try {
      const res = await fetch(`/api/coordinator/${slug}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const json = await res.json();
      setData(json);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!slug) return;
    fetchData();
    const interval = setInterval(fetchData, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, [slug]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleAction = async (action, offerId) => {
    setActionLoading(true);
    try {
      const res = await fetch('/api/coordinator/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, offerId })
      });
      const result = await res.json();
      
      if (res.ok) {
        showToast(result.message, 'success');
        fetchData();
      } else {
        showToast(result.error, 'error');
      }
    } catch (err) {
      showToast('Greška pri slanju', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0a0a0f 0%, #0d0d14 50%, #0a0a0f 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center', color: '#fff' }}>
          <div style={{ fontSize: '40px', marginBottom: '16px' }}>⏳</div>
          <p style={{ color: 'rgba(255,255,255,0.5)' }}>Učitavanje...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0a0a0f 0%, #0d0d14 50%, #0a0a0f 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center', color: '#fff' }}>
          <div style={{ fontSize: '40px', marginBottom: '16px' }}>❌</div>
          <p style={{ color: '#ef4444' }}>Greška: {error}</p>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', marginTop: '8px' }}>
            Proveri da li je slug "{slug}" tačan u Users tabeli
          </p>
        </div>
      </div>
    );
  }

  const { user, summary, offers, clips, months } = data;
  const isHOD = user.role === 'HOD' || user.role === 'Admin';

  return (
    <>
      <Head>
        <title>{user.name} | Coordinator Dashboard</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          padding: '14px 24px',
          background: toast.type === 'success' ? '#22c55e' : '#ef4444',
          color: '#fff',
          borderRadius: '10px',
          fontSize: '14px',
          fontWeight: '600',
          zIndex: 1000,
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
        }}>
          {toast.message}
        </div>
      )}

      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0a0a0f 0%, #0d0d14 50%, #0a0a0f 100%)',
        color: '#ffffff',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        {/* Header */}
        <header style={{
          padding: '20px 32px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: '700', margin: 0 }}>
              👋 {user.name}
            </h1>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', margin: '4px 0 0' }}>
              {user.role} {isHOD && '• Vidiš sve kampanje'}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '8px', height: '8px', borderRadius: '50%',
              background: '#22c55e',
              animation: 'pulse 2s ease-in-out infinite'
            }} />
            <span style={{ fontSize: '11px', fontWeight: '600', color: '#22c55e', textTransform: 'uppercase' }}>
              Live
            </span>
          </div>
        </header>

        <main style={{ padding: '24px 32px', maxWidth: '1400px', margin: '0 auto' }}>
          
          {/* Stats Row */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '16px',
            marginBottom: '24px'
          }}>
            <StatCard icon="📊" label="Aktivne kampanje" value={summary.activeMonths} color="#818cf8" />
            <StatCard icon="✋" label="Nove prijave" value={summary.pendingApplications} color="#fbbf24" />
            <StatCard icon="✅" label="Prihvatili danas" value={summary.acceptedToday} color="#22c55e" />
            <StatCard icon="❌" label="Odbili danas" value={summary.declinedToday} color="#ef4444" />
            <StatCard icon="📹" label="Objavljeno danas" value={summary.publishedToday} color="#60a5fa" subvalue={`${formatNumber(summary.viewsToday)} views`} />
          </div>

          {/* Main Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '20px',
            marginBottom: '24px'
          }}>
            
            {/* New Applications - PRIORITY */}
            <SectionCard title="Nove prijave" icon="✋" count={offers.applications.length} color="#fbbf24">
              {offers.applications.length === 0 ? (
                <EmptyState icon="🎉" text="Nema novih prijava" />
              ) : (
                offers.applications.map(offer => (
                  <OfferRow 
                    key={offer.id} 
                    offer={offer} 
                    showActions={true}
                    onApprove={(id) => handleAction('approve_application', id)}
                    onReject={(id) => handleAction('reject_application', id)}
                    loading={actionLoading}
                  />
                ))
              )}
            </SectionCard>

            {/* Today's Responses */}
            <SectionCard title="Odgovori danas" icon="📬" count={offers.acceptedToday.length + offers.declinedToday.length} color="#818cf8">
              {offers.acceptedToday.length === 0 && offers.declinedToday.length === 0 ? (
                <EmptyState icon="📭" text="Nema odgovora danas" />
              ) : (
                <>
                  {offers.acceptedToday.map(offer => (
                    <OfferRow key={offer.id} offer={offer} />
                  ))}
                  {offers.declinedToday.map(offer => (
                    <OfferRow key={offer.id} offer={offer} />
                  ))}
                </>
              )}
            </SectionCard>

            {/* Waiting for Content */}
            <SectionCard title="Čeka se content" icon="⏳" count={clips.waitingContent.length} color="#fbbf24">
              {clips.waitingContent.length === 0 ? (
                <EmptyState icon="🎉" text="Svi klipovi su završeni" />
              ) : (
                clips.waitingContent.map(clip => (
                  <ClipRow key={clip.id} clip={clip} />
                ))
              )}
            </SectionCard>

            {/* Recently Published */}
            <SectionCard title="Nedavno objavljeno" icon="✅" count={clips.publishedRecent.length} color="#22c55e">
              {clips.publishedRecent.length === 0 ? (
                <EmptyState icon="📹" text="Nema objavljenih klipova" />
              ) : (
                clips.publishedRecent.map(clip => (
                  <ClipRow key={clip.id} clip={clip} />
                ))
              )}
            </SectionCard>

          </div>

          {/* Active Campaigns */}
          <SectionCard title="Aktivne kampanje" icon="📊" count={months.length} color="#818cf8">
            {months.length === 0 ? (
              <EmptyState icon="📋" text="Nema aktivnih kampanja" />
            ) : (
              months.map(month => (
                <MonthRow key={month.id} month={month} />
              ))
            )}
          </SectionCard>

        </main>

        {/* Footer */}
        <footer style={{
          padding: '20px 32px',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          textAlign: 'center'
        }}>
          <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>
            Powered by <span style={{ fontWeight: '700' }}>VOICE</span> • Poslednje ažuriranje: {new Date().toLocaleString('sr-RS')}
          </p>
        </footer>
      </div>

      <style jsx global>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { overflow-x: hidden; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: rgba(255,255,255,0.02); }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px; }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        
        @media (max-width: 900px) {
          main > div { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  );
}
