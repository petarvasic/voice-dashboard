// pages/hod.js - HOD Dashboard for Teodora
import { useState, useEffect, useMemo } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

const formatNumber = (num) => {
  if (!num || isNaN(num)) return '0';
  const n = parseInt(num);
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return n.toLocaleString();
};

const formatPercent = (num) => {
  if (!num || isNaN(num)) return '0%';
  return Math.round(num) + '%';
};

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

// Status Badge
const StatusBadge = ({ status, size = 'normal' }) => {
  const getStyle = () => {
    switch(status) {
      case 'KRITIČNO': return { bg: 'rgba(239, 68, 68, 0.2)', color: '#f87171', border: 'rgba(239, 68, 68, 0.4)' };
      case 'KASNI': return { bg: 'rgba(249, 115, 22, 0.2)', color: '#fb923c', border: 'rgba(249, 115, 22, 0.4)' };
      case 'PRATI': return { bg: 'rgba(234, 179, 8, 0.2)', color: '#fbbf24', border: 'rgba(234, 179, 8, 0.4)' };
      case 'OK': return { bg: 'rgba(34, 197, 94, 0.2)', color: '#4ade80', border: 'rgba(34, 197, 94, 0.4)' };
      case 'DONE': return { bg: 'rgba(34, 197, 94, 0.25)', color: '#22c55e', border: 'rgba(34, 197, 94, 0.5)' };
      default: return { bg: 'rgba(156, 163, 175, 0.2)', color: '#9ca3af', border: 'rgba(156, 163, 175, 0.4)' };
    }
  };
  const style = getStyle();
  const padding = size === 'small' ? '3px 8px' : '5px 12px';
  const fontSize = size === 'small' ? '9px' : '10px';
  
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '4px',
      padding, borderRadius: '6px', fontSize, fontWeight: '700',
      background: style.bg, color: style.color, border: `1px solid ${style.border}`,
      textTransform: 'uppercase', letterSpacing: '0.5px'
    }}>
      {status === 'KRITIČNO' && '🚨'}
      {status === 'KASNI' && '⚠️'}
      {status === 'PRATI' && '👀'}
      {status === 'OK' && '✓'}
      {status === 'DONE' && '✅'}
      {status}
    </span>
  );
};

// Progress Bar
const ProgressBar = ({ percent, expected, size = 'normal', showExpected = true }) => {
  const height = size === 'small' ? '6px' : '8px';
  const actualPercent = Math.min(percent || 0, 150);
  const expectedPercent = Math.min(expected || 0, 100);
  
  const getColor = () => {
    if (percent >= 100) return '#22c55e';
    if (percent >= expected - 10) return '#818cf8';
    if (percent >= expected - 20) return '#fbbf24';
    return '#ef4444';
  };
  
  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <div style={{ height, background: 'rgba(255,255,255,0.1)', borderRadius: '100px', overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          width: `${Math.min(actualPercent, 100)}%`,
          background: getColor(),
          borderRadius: '100px',
          transition: 'width 0.3s ease'
        }} />
      </div>
      {showExpected && expected > 0 && expected < 100 && (
        <div style={{
          position: 'absolute',
          left: `${expectedPercent}%`,
          top: '-2px',
          bottom: '-2px',
          width: '2px',
          background: 'rgba(255,255,255,0.5)',
          borderRadius: '1px'
        }} />
      )}
    </div>
  );
};

// Stat Card
const StatCard = ({ icon, label, value, subValue, color, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        background: isHovered ? `rgba(${color}, 0.15)` : 'rgba(255,255,255,0.03)',
        border: `1px solid ${isHovered ? `rgba(${color}, 0.4)` : 'rgba(255,255,255,0.06)'}`,
        borderRadius: '16px',
        padding: '20px',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s ease',
        transform: isHovered ? 'translateY(-2px)' : 'none'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
        <span style={{ fontSize: '20px' }}>{icon}</span>
        <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</span>
      </div>
      <p style={{ fontSize: '32px', fontWeight: '800', margin: 0, color: '#fff' }}>{value}</p>
      {subValue && (
        <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', margin: '4px 0 0' }}>{subValue}</p>
      )}
    </div>
  );
};

// Campaign Row
const CampaignRow = ({ campaign, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        display: 'grid',
        gridTemplateColumns: '2fr 1fr 1fr 120px 100px 80px',
        gap: '16px',
        alignItems: 'center',
        padding: '16px 20px',
        background: isHovered ? 'rgba(255,255,255,0.04)' : 'transparent',
        borderBottom: '1px solid rgba(255,255,255,0.04)',
        cursor: 'pointer',
        transition: 'background 0.15s ease'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          width: '40px', height: '40px', borderRadius: '10px', overflow: 'hidden',
          background: campaign.client?.logo ? 'transparent' : 'linear-gradient(135deg, #818cf8, #a78bfa)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
        }}>
          {campaign.client?.logo ? (
            <img src={campaign.client.logo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <span style={{ color: '#fff', fontWeight: '700', fontSize: '14px' }}>{campaign.client?.name?.charAt(0) || '?'}</span>
          )}
        </div>
        <div>
          <p style={{ fontSize: '14px', fontWeight: '600', margin: 0, color: '#fff' }}>{campaign.month}</p>
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', margin: '2px 0 0' }}>{campaign.client?.name}</p>
        </div>
      </div>
      
      <div>
        <p style={{ fontSize: '14px', fontWeight: '600', margin: 0, color: '#fff' }}>{formatNumber(campaign.delivered)}</p>
        <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', margin: '2px 0 0' }}>/ {formatNumber(campaign.goal)}</p>
      </div>
      
      <div style={{ width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
          <span style={{ fontSize: '13px', fontWeight: '600', color: '#fff' }}>{formatPercent(campaign.percentDelivered)}</span>
          {campaign.gap !== undefined && (
            <span style={{ 
              fontSize: '11px', 
              color: campaign.gap >= 0 ? '#4ade80' : campaign.gap > -10 ? '#fbbf24' : '#f87171'
            }}>
              {campaign.gap >= 0 ? '+' : ''}{Math.round(campaign.gap)}%
            </span>
          )}
        </div>
        <ProgressBar percent={campaign.percentDelivered} expected={campaign.expectedProgress} size="small" />
      </div>
      
      <div>
        {campaign.daysRemaining !== undefined && (
          <span style={{ 
            fontSize: '12px', 
            color: campaign.daysRemaining <= 7 ? '#f87171' : campaign.daysRemaining <= 14 ? '#fbbf24' : 'rgba(255,255,255,0.5)'
          }}>
            {campaign.daysRemaining <= 0 ? 'Istekao' : `${campaign.daysRemaining}d ostalo`}
          </span>
        )}
      </div>
      
      <StatusBadge status={campaign.status} size="small" />
      
      <div style={{ textAlign: 'right' }}>
        <span style={{ fontSize: '16px', opacity: isHovered ? 1 : 0.3, transition: 'opacity 0.15s' }}>→</span>
      </div>
    </div>
  );
};

// Critical Alert Card
const CriticalAlertCard = ({ campaign, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const bgColor = campaign.status === 'KRITIČNO' ? '239, 68, 68' : '249, 115, 22';
  
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        background: `linear-gradient(135deg, rgba(${bgColor}, 0.15) 0%, rgba(${bgColor}, 0.05) 100%)`,
        border: `1px solid rgba(${bgColor}, ${isHovered ? 0.5 : 0.25})`,
        borderRadius: '16px',
        padding: '20px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        transform: isHovered ? 'translateY(-2px)' : 'none'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '44px', height: '44px', borderRadius: '12px', overflow: 'hidden',
            background: campaign.client?.logo ? 'transparent' : 'linear-gradient(135deg, #818cf8, #a78bfa)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            {campaign.client?.logo ? (
              <img src={campaign.client.logo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span style={{ color: '#fff', fontWeight: '700', fontSize: '16px' }}>{campaign.client?.name?.charAt(0) || '?'}</span>
            )}
          </div>
          <div>
            <p style={{ fontSize: '16px', fontWeight: '700', margin: 0, color: '#fff' }}>{campaign.client?.name}</p>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', margin: '2px 0 0' }}>{campaign.month}</p>
          </div>
        </div>
        <StatusBadge status={campaign.status} />
      </div>
      
      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' }}>
          <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>Progress</span>
          <div>
            <span style={{ fontSize: '20px', fontWeight: '700', color: '#fff' }}>{formatPercent(campaign.percentDelivered)}</span>
            {campaign.expectedProgress && (
              <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginLeft: '8px' }}>
                očekivano: {formatPercent(campaign.expectedProgress)}
              </span>
            )}
          </div>
        </div>
        <ProgressBar percent={campaign.percentDelivered} expected={campaign.expectedProgress} />
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', margin: '0 0 2px', textTransform: 'uppercase' }}>Gap</p>
          <p style={{ fontSize: '16px', fontWeight: '700', margin: 0, color: '#f87171' }}>
            {campaign.gap !== undefined ? `${Math.round(campaign.gap)}%` : 'N/A'}
          </p>
        </div>
        <div>
          <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', margin: '0 0 2px', textTransform: 'uppercase' }}>Nedostaje</p>
          <p style={{ fontSize: '16px', fontWeight: '700', margin: 0, color: '#fff' }}>{formatNumber(campaign.remaining)}</p>
        </div>
        <div>
          <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', margin: '0 0 2px', textTransform: 'uppercase' }}>Rok</p>
          <p style={{ fontSize: '16px', fontWeight: '700', margin: 0, color: campaign.daysRemaining <= 7 ? '#f87171' : '#fbbf24' }}>
            {campaign.daysRemaining <= 0 ? 'Istekao!' : `${campaign.daysRemaining} dana`}
          </p>
        </div>
      </div>
    </div>
  );
};

// Client Card for client view
const ClientCard = ({ clientData, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const hasCritical = clientData.criticalCount > 0;
  const hasBehind = clientData.behindCount > 0;
  const borderColor = hasCritical ? '239, 68, 68' : hasBehind ? '249, 115, 22' : '129, 140, 248';
  
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: `1px solid rgba(${borderColor}, ${isHovered ? 0.4 : 0.15})`,
        borderRadius: '16px',
        padding: '20px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        transform: isHovered ? 'translateY(-2px)' : 'none'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        <div style={{
          width: '48px', height: '48px', borderRadius: '12px', overflow: 'hidden',
          background: clientData.client?.logo ? 'transparent' : 'linear-gradient(135deg, #818cf8, #a78bfa)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          {clientData.client?.logo ? (
            <img src={clientData.client.logo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <span style={{ color: '#fff', fontWeight: '700', fontSize: '18px' }}>{clientData.client?.name?.charAt(0) || '?'}</span>
          )}
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: '16px', fontWeight: '700', margin: 0, color: '#fff' }}>{clientData.client?.name}</p>
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', margin: '2px 0 0' }}>
            {clientData.campaigns.length} kampanj{clientData.campaigns.length === 1 ? 'a' : 'e'}
          </p>
        </div>
        {(hasCritical || hasBehind) && (
          <div style={{ display: 'flex', gap: '6px' }}>
            {hasCritical && (
              <span style={{ 
                background: 'rgba(239, 68, 68, 0.2)', 
                color: '#f87171', 
                padding: '4px 8px', 
                borderRadius: '6px', 
                fontSize: '11px', 
                fontWeight: '700' 
              }}>
                🚨 {clientData.criticalCount}
              </span>
            )}
            {hasBehind && (
              <span style={{ 
                background: 'rgba(249, 115, 22, 0.2)', 
                color: '#fb923c', 
                padding: '4px 8px', 
                borderRadius: '6px', 
                fontSize: '11px', 
                fontWeight: '700' 
              }}>
                ⚠️ {clientData.behindCount}
              </span>
            )}
          </div>
        )}
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div>
          <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', margin: '0 0 4px', textTransform: 'uppercase' }}>Ukupno Views</p>
          <p style={{ fontSize: '18px', fontWeight: '700', margin: 0, color: '#fff' }}>{formatNumber(clientData.totalDelivered)}</p>
        </div>
        <div>
          <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', margin: '0 0 4px', textTransform: 'uppercase' }}>Avg Delivery</p>
          <p style={{ fontSize: '18px', fontWeight: '700', margin: 0, color: clientData.avgDelivery >= 90 ? '#4ade80' : clientData.avgDelivery >= 70 ? '#fbbf24' : '#f87171' }}>
            {formatPercent(clientData.avgDelivery)}
          </p>
        </div>
      </div>
    </div>
  );
};


export default function HODDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState('critical');
  const [selectedClient, setSelectedClient] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/hod/campaigns');
      if (!res.ok) throw new Error('Failed to fetch data');
      const result = await res.json();
      setData(result);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Filter campaigns
  const filteredCampaigns = useMemo(() => {
    if (!data?.campaigns) return [];
    
    let filtered = [...data.campaigns];
    
    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(c => c.status === statusFilter);
    }
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(c => 
        c.month?.toLowerCase().includes(query) ||
        c.client?.name?.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  }, [data, statusFilter, searchQuery]);

  // Critical campaigns
  const criticalCampaigns = useMemo(() => {
    if (!data?.campaigns) return [];
    return data.campaigns.filter(c => c.status === 'KRITIČNO' || c.status === 'KASNI');
  }, [data]);

  // Selected client campaigns
  const selectedClientCampaigns = useMemo(() => {
    if (!selectedClient || !data?.campaigns) return [];
    return data.campaigns.filter(c => c.clientId === selectedClient.client.id);
  }, [selectedClient, data]);

  if (loading && !data) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        background: 'linear-gradient(135deg, #0a0a14 0%, #12121f 50%, #0f0f1a 100%)' 
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
          <p style={{ color: 'rgba(255,255,255,0.5)' }}>Učitavanje...</p>
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
        background: 'linear-gradient(135deg, #0a0a14 0%, #12121f 50%, #0f0f1a 100%)' 
      }}>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p style={{ color: '#f87171', fontSize: '18px' }}>Greška: {error}</p>
          <button 
            onClick={fetchData}
            style={{
              marginTop: '16px',
              padding: '10px 20px',
              background: '#818cf8',
              border: 'none',
              borderRadius: '8px',
              color: '#fff',
              cursor: 'pointer'
            }}
          >
            Pokušaj ponovo
          </button>
        </div>
      </div>
    );
  }

  const stats = data?.stats || {};

  return (
    <>
      <Head>
        <title>HOD Dashboard | VOICE</title>
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
          position: 'sticky',
          top: 0,
          zIndex: 100
        }}>
          <div style={{
            maxWidth: '1600px',
            margin: '0 auto',
            padding: '14px 28px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <span style={{ fontSize: '24px', fontWeight: '700' }}>voice</span>
              <div style={{ height: '24px', width: '1px', background: 'rgba(255,255,255,0.1)' }} />
              <div>
                <h1 style={{ fontSize: '16px', fontWeight: '600', margin: 0 }}>HOD Dashboard</h1>
                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', margin: '2px 0 0' }}>Head of Delivery Overview</p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <LiveIndicator />
              {lastUpdated && (
                <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>
                  Ažurirano: {lastUpdated.toLocaleTimeString('sr-RS')}
                </span>
              )}
              <button
                onClick={fetchData}
                style={{
                  padding: '8px 16px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
              >
                🔄 Osveži
              </button>
            </div>
          </div>
        </header>

        <main style={{ maxWidth: '1600px', margin: '0 auto', padding: '28px' }}>
          
          {/* Stats Cards */}
          <section style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '16px',
            marginBottom: '32px'
          }}>
            <StatCard
              icon="🎯"
              label="Aktivne kampanje"
              value={stats.total || 0}
              color="129, 140, 248"
            />
            <StatCard
              icon="🚨"
              label="Kritično"
              value={stats.critical || 0}
              subValue={stats.critical > 0 ? 'Potrebna akcija!' : ''}
              color="239, 68, 68"
              onClick={() => { setActiveTab('critical'); setStatusFilter('KRITIČNO'); }}
            />
            <StatCard
              icon="⚠️"
              label="Kasni"
              value={stats.behind || 0}
              color="249, 115, 22"
              onClick={() => { setActiveTab('all'); setStatusFilter('KASNI'); }}
            />
            <StatCard
              icon="👀"
              label="Prati"
              value={stats.watch || 0}
              color="234, 179, 8"
              onClick={() => { setActiveTab('all'); setStatusFilter('PRATI'); }}
            />
            <StatCard
              icon="✅"
              label="OK / Done"
              value={(stats.ok || 0) + (stats.done || 0)}
              color="34, 197, 94"
              onClick={() => { setActiveTab('all'); setStatusFilter('OK'); }}
            />
            <StatCard
              icon="📊"
              label="Prosečan Delivery"
              value={formatPercent(stats.avgDelivery)}
              color="167, 139, 250"
            />
          </section>

          {/* Tabs */}
          <div style={{
            display: 'flex',
            gap: '8px',
            marginBottom: '24px',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            paddingBottom: '16px'
          }}>
            {[
              { id: 'critical', label: '🔥 Kritično', count: criticalCampaigns.length },
              { id: 'clients', label: '🏢 Po Klijentu', count: data?.clientStats?.length || 0 },
              { id: 'all', label: '📋 Sve Kampanje', count: data?.campaigns?.length || 0 }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setSelectedClient(null); setStatusFilter('all'); }}
                style={{
                  padding: '10px 20px',
                  background: activeTab === tab.id ? 'rgba(129, 140, 248, 0.15)' : 'transparent',
                  border: `1px solid ${activeTab === tab.id ? 'rgba(129, 140, 248, 0.3)' : 'transparent'}`,
                  borderRadius: '10px',
                  color: activeTab === tab.id ? '#fff' : 'rgba(255,255,255,0.5)',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                {tab.label}
                <span style={{
                  background: 'rgba(255,255,255,0.1)',
                  padding: '2px 8px',
                  borderRadius: '100px',
                  fontSize: '11px'
                }}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Critical Tab */}
          {activeTab === 'critical' && (
            <section>
              {criticalCampaigns.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '60px',
                  background: 'rgba(34, 197, 94, 0.1)',
                  borderRadius: '20px',
                  border: '1px solid rgba(34, 197, 94, 0.2)'
                }}>
                  <span style={{ fontSize: '48px' }}>✅</span>
                  <h3 style={{ fontSize: '20px', fontWeight: '600', margin: '16px 0 8px', color: '#4ade80' }}>
                    Sve kampanje su na dobrom putu!
                  </h3>
                  <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)' }}>
                    Nema kritičnih kampanja koje zahtevaju hitnu akciju.
                  </p>
                </div>
              ) : (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
                  gap: '20px'
                }}>
                  {criticalCampaigns.map(campaign => (
                    <CriticalAlertCard
                      key={campaign.id}
                      campaign={campaign}
                      onClick={() => router.push(`/client/${campaign.clientId}`)}
                    />
                  ))}
                </div>
              )}
            </section>
          )}

          {/* Clients Tab */}
          {activeTab === 'clients' && !selectedClient && (
            <section>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: '20px'
              }}>
                {(data?.clientStats || []).map((clientData, i) => (
                  <ClientCard
                    key={i}
                    clientData={clientData}
                    onClick={() => setSelectedClient(clientData)}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Selected Client Detail */}
          {activeTab === 'clients' && selectedClient && (
            <section>
              <button
                onClick={() => setSelectedClient(null)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 16px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '13px',
                  cursor: 'pointer',
                  marginBottom: '20px'
                }}
              >
                ← Nazad na sve klijente
              </button>
              
              <div style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '20px',
                padding: '24px',
                marginBottom: '24px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                  <div style={{
                    width: '60px', height: '60px', borderRadius: '14px', overflow: 'hidden',
                    background: selectedClient.client?.logo ? 'transparent' : 'linear-gradient(135deg, #818cf8, #a78bfa)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    {selectedClient.client?.logo ? (
                      <img src={selectedClient.client.logo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span style={{ color: '#fff', fontWeight: '700', fontSize: '22px' }}>{selectedClient.client?.name?.charAt(0) || '?'}</span>
                    )}
                  </div>
                  <div>
                    <h2 style={{ fontSize: '24px', fontWeight: '700', margin: 0 }}>{selectedClient.client?.name}</h2>
                    <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', margin: '4px 0 0' }}>
                      {selectedClient.campaigns.length} kampanj{selectedClient.campaigns.length === 1 ? 'a' : 'e'} • 
                      Ukupno: {formatNumber(selectedClient.totalDelivered)} views • 
                      Avg: {formatPercent(selectedClient.avgDelivery)}
                    </p>
                  </div>
                </div>
              </div>
              
              <div style={{
                background: 'rgba(255,255,255,0.02)',
                borderRadius: '16px',
                border: '1px solid rgba(255,255,255,0.06)',
                overflow: 'hidden'
              }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 1fr 1fr 120px 100px 80px',
                  gap: '16px',
                  padding: '14px 20px',
                  background: 'rgba(255,255,255,0.03)',
                  borderBottom: '1px solid rgba(255,255,255,0.06)',
                  fontSize: '11px',
                  color: 'rgba(255,255,255,0.5)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  <span>Kampanja</span>
                  <span>Delivered</span>
                  <span>Progress</span>
                  <span>Rok</span>
                  <span>Status</span>
                  <span></span>
                </div>
                {selectedClientCampaigns.map(campaign => (
                  <CampaignRow
                    key={campaign.id}
                    campaign={campaign}
                    onClick={() => router.push(`/client/${campaign.clientId}`)}
                  />
                ))}
              </div>
            </section>
          )}

          {/* All Campaigns Tab */}
          {activeTab === 'all' && (
            <section>
              {/* Filters */}
              <div style={{
                display: 'flex',
                gap: '12px',
                marginBottom: '20px',
                flexWrap: 'wrap'
              }}>
                <input
                  type="text"
                  placeholder="🔍 Pretraži..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    padding: '10px 16px',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '13px',
                    width: '200px'
                  }}
                />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  style={{
                    padding: '10px 16px',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '13px',
                    cursor: 'pointer'
                  }}
                >
                  <option value="all" style={{ background: '#1a1a2e' }}>Svi statusi</option>
                  <option value="KRITIČNO" style={{ background: '#1a1a2e' }}>🚨 Kritično</option>
                  <option value="KASNI" style={{ background: '#1a1a2e' }}>⚠️ Kasni</option>
                  <option value="PRATI" style={{ background: '#1a1a2e' }}>👀 Prati</option>
                  <option value="OK" style={{ background: '#1a1a2e' }}>✓ OK</option>
                  <option value="DONE" style={{ background: '#1a1a2e' }}>✅ Done</option>
                </select>
                <span style={{ 
                  padding: '10px 16px', 
                  fontSize: '13px', 
                  color: 'rgba(255,255,255,0.5)',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  Prikazano: {filteredCampaigns.length} kampanja
                </span>
              </div>

              {/* Table */}
              <div style={{
                background: 'rgba(255,255,255,0.02)',
                borderRadius: '16px',
                border: '1px solid rgba(255,255,255,0.06)',
                overflow: 'hidden'
              }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 1fr 1fr 120px 100px 80px',
                  gap: '16px',
                  padding: '14px 20px',
                  background: 'rgba(255,255,255,0.03)',
                  borderBottom: '1px solid rgba(255,255,255,0.06)',
                  fontSize: '11px',
                  color: 'rgba(255,255,255,0.5)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  <span>Kampanja</span>
                  <span>Delivered</span>
                  <span>Progress</span>
                  <span>Rok</span>
                  <span>Status</span>
                  <span></span>
                </div>
                
                {filteredCampaigns.length === 0 ? (
                  <div style={{ padding: '40px', textAlign: 'center', color: 'rgba(255,255,255,0.4)' }}>
                    Nema rezultata
                  </div>
                ) : (
                  filteredCampaigns.map(campaign => (
                    <CampaignRow
                      key={campaign.id}
                      campaign={campaign}
                      onClick={() => router.push(`/client/${campaign.clientId}`)}
                    />
                  ))
                )}
              </div>
            </section>
          )}

        </main>
      </div>
    </>
  );
}
