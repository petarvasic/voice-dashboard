// pages/coordinator/[slug].js - Coordinator Dashboard v10
// Features: Package tracking with Airtable integration
import { useState, useEffect, useMemo, useCallback } from 'react';
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

const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '-';
    return date.toLocaleDateString('sr-RS', { day: '2-digit', month: '2-digit', year: 'numeric' });
  } catch { return '-'; }
};

const formatShortDate = (dateStr) => {
  if (!dateStr) return '-';
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '-';
    return date.toLocaleDateString('sr-RS', { day: '2-digit', month: '2-digit' });
  } catch { return '-'; }
};

const getDaysAgo = (dateStr) => {
  if (!dateStr) return null;
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return null;
    const now = new Date();
    const diff = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    if (diff === 0) return 'Danas';
    if (diff === 1) return 'Juče';
    if (diff < 7) return `Pre ${diff} dana`;
    return formatShortDate(dateStr);
  } catch { return null; }
};

// ============ GLOBAL STYLES ============
const GlobalStyles = () => (
  <style>{`
    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
    @keyframes glow { 0%, 100% { box-shadow: 0 0 4px #22c55e; } 50% { box-shadow: 0 0 20px #22c55e; } }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }
    @keyframes scaleIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
    @keyframes spin { to { transform: rotate(360deg); } }
    ::-webkit-scrollbar { width: 8px; height: 8px; }
    ::-webkit-scrollbar-track { background: rgba(255,255,255,0.05); border-radius: 4px; }
    ::-webkit-scrollbar-thumb { background: rgba(139, 92, 246, 0.4); border-radius: 4px; }
    .glass { background: rgba(255, 255, 255, 0.03); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.08); }
    .glass-strong { background: rgba(15, 15, 30, 0.95); backdrop-filter: blur(40px); border: 1px solid rgba(255, 255, 255, 0.1); }
  `}</style>
);

// ============ COMPONENTS ============

// Live Indicator
const LiveIndicator = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', animation: 'pulse 2s infinite, glow 2s infinite' }} />
    <span style={{ fontSize: '11px', fontWeight: '600', color: '#22c55e', textTransform: 'uppercase', letterSpacing: '1px' }}>Live</span>
  </div>
);

// Status Badge
const StatusBadge = ({ status }) => {
  if (!status) return null;
  const s = status.toLowerCase();
  let bg, color;
  if (s.includes('green') || s.includes('ahead')) { bg = 'rgba(34, 197, 94, 0.2)'; color = '#22c55e'; }
  else if (s.includes('yellow')) { bg = 'rgba(234, 179, 8, 0.2)'; color = '#eab308'; }
  else if (s.includes('red') || s.includes('behind')) { bg = 'rgba(239, 68, 68, 0.2)'; color = '#ef4444'; }
  else if (s.includes('dead') || s.includes('critical')) { bg = 'rgba(127, 29, 29, 0.3)'; color = '#f87171'; }
  else { bg = 'rgba(255,255,255,0.1)'; color = '#fff'; }
  return <span style={{ fontSize: '10px', fontWeight: '600', padding: '4px 10px', borderRadius: '6px', background: bg, color, textTransform: 'uppercase' }}>{status}</span>;
};

// Progress Bar
const ProgressBar = ({ percent, showLabel = true, size = 'normal' }) => {
  const p = Math.min(100, Math.max(0, percent || 0));
  const height = size === 'small' ? '6px' : '10px';
  let color = p >= 100 ? '#22c55e' : p >= 70 ? '#8b5cf6' : p >= 40 ? '#eab308' : '#ef4444';
  return (
    <div style={{ width: '100%' }}>
      <div style={{ height, background: 'rgba(255,255,255,0.1)', borderRadius: '10px', overflow: 'hidden' }}>
        <div style={{ width: `${p}%`, height: '100%', background: `linear-gradient(90deg, ${color}, ${color}aa)`, borderRadius: '10px', transition: 'width 0.5s ease' }} />
      </div>
      {showLabel && <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', margin: '4px 0 0', textAlign: 'right' }}>{Math.round(p)}%</p>}
    </div>
  );
};

// Flip Stat Card
const FlipStatCard = ({ icon, label, value, gradient = 'purple', items = [], size = 'normal' }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const isLarge = size === 'large';
  
  const gradients = {
    purple: { bg: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(99, 102, 241, 0.1))', border: 'rgba(139, 92, 246, 0.4)' },
    green: { bg: 'linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(16, 185, 129, 0.1))', border: 'rgba(34, 197, 94, 0.4)' },
    blue: { bg: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(99, 102, 241, 0.1))', border: 'rgba(59, 130, 246, 0.4)' },
    orange: { bg: 'linear-gradient(135deg, rgba(249, 115, 22, 0.15), rgba(234, 179, 8, 0.1))', border: 'rgba(249, 115, 22, 0.4)' },
    red: { bg: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(236, 72, 153, 0.1))', border: 'rgba(239, 68, 68, 0.4)' },
  };
  
  const g = gradients[gradient];
  const hasItems = items && items.length > 0;
  const canFlip = hasItems || parseInt(value) > 0;

  return (
    <div style={{ perspective: '1000px', height: isLarge ? '160px' : '140px' }}
         onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
      <div onClick={() => canFlip && setIsFlipped(!isFlipped)}
           style={{
             position: 'relative', width: '100%', height: '100%',
             transformStyle: 'preserve-3d',
             transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
             transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
             cursor: canFlip ? 'pointer' : 'default'
           }}>
        {/* Front */}
        <div className="glass" style={{
          position: 'absolute', width: '100%', height: '100%',
          backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden',
          borderRadius: '20px', padding: '16px', background: g.bg,
          border: isHovered ? `1px solid ${g.border}` : '1px solid rgba(255,255,255,0.08)',
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '18px' }}>{icon}</span>
            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', fontWeight: '600', textTransform: 'uppercase' }}>{label}</span>
            {canFlip && <span style={{ marginLeft: 'auto', fontSize: '10px', color: 'rgba(255,255,255,0.3)' }}>🔄</span>}
          </div>
          <div>
            <p style={{ fontSize: isLarge ? '48px' : '36px', fontWeight: '800', margin: 0, color: '#fff' }}>{value}</p>
            {canFlip && <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', margin: '4px 0 0' }}>Klikni za detalje →</p>}
          </div>
        </div>
        {/* Back */}
        <div className="glass" style={{
          position: 'absolute', width: '100%', height: '100%',
          backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden',
          borderRadius: '20px', padding: '14px', background: g.bg,
          border: `1px solid ${g.border}`, transform: 'rotateY(180deg)',
          display: 'flex', flexDirection: 'column'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', fontWeight: '600' }}>{label}</span>
            <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)' }}>← Nazad</span>
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {items.slice(0, 4).map((item, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '11px' }}>
                <span style={{ color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '70%' }}>{item.name || item.influencerName || 'N/A'}</span>
                <span style={{ color: 'rgba(255,255,255,0.5)' }}>{item.views ? formatNumber(item.views) : getDaysAgo(item.publishDate)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Package Tracking Section with REAL DATA
const PackageSection = ({ shipments = [], summary = {}, onAddPackage, onUpdateStatus, isExpanded, onToggle, loading }) => {
  const waiting = summary.waiting || 0;
  const inTransit = summary.inTransit || 0;
  const delivered = summary.delivered || 0;
  const total = summary.total || 0;
  
  return (
    <div style={{ marginBottom: '20px' }}>
      <button onClick={onToggle} style={{
        width: '100%', padding: '14px 20px',
        background: isExpanded ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(59, 130, 246, 0.1))' : 'rgba(255,255,255,0.03)',
        border: isExpanded ? '1px solid rgba(139, 92, 246, 0.4)' : '1px solid rgba(255,255,255,0.08)',
        borderRadius: isExpanded ? '16px 16px 0 0' : '16px',
        color: '#fff', cursor: 'pointer', transition: 'all 0.3s ease',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '20px' }}>📦</span>
          <span style={{ fontSize: '15px', fontWeight: '700' }}>Praćenje paketa</span>
          {total > 0 && (
            <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '20px', background: 'rgba(139, 92, 246, 0.3)', color: '#a78bfa' }}>{total}</span>
          )}
          {loading && <span style={{ fontSize: '12px', color: '#8b5cf6' }}>⟳</span>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {!isExpanded && total > 0 && (
            <div style={{ display: 'flex', gap: '12px', fontSize: '12px' }}>
              <span style={{ color: '#f97316' }}>⏳ {waiting}</span>
              <span style={{ color: '#3b82f6' }}>🚚 {inTransit}</span>
              <span style={{ color: '#22c55e' }}>✅ {delivered}</span>
            </div>
          )}
          <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)', transition: 'transform 0.3s', transform: isExpanded ? 'rotate(180deg)' : 'none' }}>▼</span>
        </div>
      </button>
      
      {isExpanded && (
        <div className="glass" style={{
          borderRadius: '0 0 16px 16px', padding: '20px',
          border: '1px solid rgba(139, 92, 246, 0.4)', borderTop: 'none',
          animation: 'fadeIn 0.3s ease'
        }}>
          {/* Summary Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '16px' }}>
            <div style={{ padding: '14px', background: 'rgba(249, 115, 22, 0.1)', borderRadius: '12px', border: '1px solid rgba(249, 115, 22, 0.3)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{ fontSize: '16px' }}>⏳</span>
                <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.6)', fontWeight: '600' }}>ČEKA SLANJE</span>
              </div>
              <p style={{ fontSize: '28px', fontWeight: '800', margin: 0, color: '#f97316' }}>{waiting}</p>
            </div>
            <div style={{ padding: '14px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '12px', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{ fontSize: '16px' }}>🚚</span>
                <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.6)', fontWeight: '600' }}>U DOSTAVI</span>
              </div>
              <p style={{ fontSize: '28px', fontWeight: '800', margin: 0, color: '#3b82f6' }}>{inTransit}</p>
            </div>
            <div style={{ padding: '14px', background: 'rgba(34, 197, 94, 0.1)', borderRadius: '12px', border: '1px solid rgba(34, 197, 94, 0.3)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{ fontSize: '16px' }}>✅</span>
                <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.6)', fontWeight: '600' }}>DOSTAVLJENO</span>
              </div>
              <p style={{ fontSize: '28px', fontWeight: '800', margin: 0, color: '#22c55e' }}>{delivered}</p>
            </div>
          </div>
          
          {/* Shipment List */}
          {shipments.length > 0 && (
            <div style={{ marginBottom: '16px', maxHeight: '300px', overflowY: 'auto' }}>
              {shipments.map((shipment, i) => (
                <ShipmentRow key={shipment.id} shipment={shipment} onUpdateStatus={onUpdateStatus} />
              ))}
            </div>
          )}
          
          {/* Add Button */}
          <button onClick={onAddPackage} style={{
            width: '100%', padding: '12px',
            background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
            border: 'none', borderRadius: '10px', color: '#fff',
            fontSize: '13px', fontWeight: '600', cursor: 'pointer',
            transition: 'transform 0.2s, box-shadow 0.2s'
          }}
          onMouseEnter={(e) => { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 10px 30px rgba(139, 92, 246, 0.4)'; }}
          onMouseLeave={(e) => { e.target.style.transform = 'none'; e.target.style.boxShadow = 'none'; }}>
            + Dodaj novi paket
          </button>
        </div>
      )}
    </div>
  );
};

// Shipment Row Component
const ShipmentRow = ({ shipment, onUpdateStatus }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const statusColors = {
    'Čeka slanje': { bg: 'rgba(249, 115, 22, 0.15)', color: '#f97316', icon: '⏳' },
    'U dostavi': { bg: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', icon: '🚚' },
    'Dostavljeno': { bg: 'rgba(34, 197, 94, 0.15)', color: '#22c55e', icon: '✅' }
  };
  
  const nextStatus = {
    'Čeka slanje': 'U dostavi',
    'U dostavi': 'Dostavljeno',
    'Dostavljeno': null
  };
  
  const statusStyle = statusColors[shipment.status] || statusColors['Čeka slanje'];
  const canProgress = nextStatus[shipment.status];
  
  return (
    <div 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: '12px',
        padding: '12px', marginBottom: '8px',
        background: isHovered ? 'rgba(139, 92, 246, 0.1)' : 'rgba(255,255,255,0.02)',
        borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)',
        transition: 'all 0.2s'
      }}
    >
      {/* Status Icon */}
      <div style={{
        width: '40px', height: '40px', borderRadius: '10px',
        background: statusStyle.bg, display: 'flex',
        alignItems: 'center', justifyContent: 'center', fontSize: '18px'
      }}>
        {statusStyle.icon}
      </div>
      
      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: '13px', fontWeight: '600', margin: 0, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {shipment.influencerName || 'N/A'}
        </p>
        <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', margin: '2px 0 0' }}>
          {shipment.contractMonthName || shipment.items || 'Paket'}
        </p>
      </div>
      
      {/* Tracking */}
      {shipment.trackingNumber && (
        <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace' }}>
          {shipment.trackingNumber}
        </span>
      )}
      
      {/* Status Badge */}
      <span style={{
        fontSize: '10px', fontWeight: '600', padding: '4px 10px',
        borderRadius: '6px', background: statusStyle.bg, color: statusStyle.color
      }}>
        {shipment.status}
      </span>
      
      {/* Progress Button */}
      {canProgress && (
        <button
          onClick={() => onUpdateStatus(shipment.id, nextStatus[shipment.status])}
          style={{
            padding: '6px 12px', borderRadius: '8px',
            background: 'rgba(139, 92, 246, 0.2)',
            border: '1px solid rgba(139, 92, 246, 0.4)',
            color: '#a78bfa', fontSize: '11px', fontWeight: '600',
            cursor: 'pointer', transition: 'all 0.2s',
            opacity: isHovered ? 1 : 0
          }}
        >
          → {nextStatus[shipment.status]}
        </button>
      )}
    </div>
  );
};

// Add Package Modal
const AddPackageModal = ({ isOpen, onClose, onSubmit, campaigns = [], influencers = [] }) => {
  const [selectedCampaign, setSelectedCampaign] = useState('');
  const [selectedInfluencer, setSelectedInfluencer] = useState('');
  const [items, setItems] = useState('');
  const [courier, setCourier] = useState('Post Express');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  if (!isOpen) return null;
  
  const handleSubmit = async () => {
    if (!selectedCampaign || !selectedInfluencer) {
      alert('Molimo izaberite kampanju i influensera');
      return;
    }
    
    setSubmitting(true);
    await onSubmit({
      contractMonthId: selectedCampaign,
      influencerId: selectedInfluencer,
      items,
      courier,
      notes
    });
    setSubmitting(false);
    
    // Reset form
    setSelectedCampaign('');
    setSelectedInfluencer('');
    setItems('');
    setNotes('');
  };
  
  // Get influencers for selected campaign
  const campaignInfluencers = useMemo(() => {
    if (!selectedCampaign) return [];
    const campaign = campaigns.find(c => c.id === selectedCampaign);
    return campaign?.influencers || [];
  }, [selectedCampaign, campaigns]);
  
  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', zIndex: 200 }} />
      <div className="glass-strong" style={{
        position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        width: '480px', maxWidth: '92vw', padding: '28px', borderRadius: '20px',
        zIndex: 201, animation: 'scaleIn 0.3s ease'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '700', margin: 0, color: '#fff' }}>📦 Novi paket</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', fontSize: '24px', cursor: 'pointer' }}>×</button>
        </div>
        
        {/* Campaign Select */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginBottom: '6px', fontWeight: '600' }}>KAMPANJA *</label>
          <select
            value={selectedCampaign}
            onChange={(e) => { setSelectedCampaign(e.target.value); setSelectedInfluencer(''); }}
            style={{
              width: '100%', padding: '12px', borderRadius: '10px',
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
              color: '#fff', fontSize: '14px', outline: 'none'
            }}
          >
            <option value="">Izaberi kampanju...</option>
            {campaigns.map(c => (
              <option key={c.id} value={c.id}>{c.month}</option>
            ))}
          </select>
        </div>
        
        {/* Influencer Select */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginBottom: '6px', fontWeight: '600' }}>INFLUENSER *</label>
          <select
            value={selectedInfluencer}
            onChange={(e) => setSelectedInfluencer(e.target.value)}
            disabled={!selectedCampaign}
            style={{
              width: '100%', padding: '12px', borderRadius: '10px',
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
              color: '#fff', fontSize: '14px', outline: 'none',
              opacity: selectedCampaign ? 1 : 0.5
            }}
          >
            <option value="">Izaberi influensera...</option>
            {campaignInfluencers.map(inf => (
              <option key={inf.id} value={inf.id}>{inf.name}</option>
            ))}
          </select>
        </div>
        
        {/* Items */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginBottom: '6px', fontWeight: '600' }}>SADRŽAJ PAKETA</label>
          <textarea
            value={items}
            onChange={(e) => setItems(e.target.value)}
            placeholder="Npr: 2x majica M, 1x parfem, 1x kozmetika set"
            style={{
              width: '100%', padding: '12px', borderRadius: '10px', minHeight: '80px',
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
              color: '#fff', fontSize: '14px', outline: 'none', resize: 'vertical'
            }}
          />
        </div>
        
        {/* Courier */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginBottom: '6px', fontWeight: '600' }}>KURIR</label>
          <select
            value={courier}
            onChange={(e) => setCourier(e.target.value)}
            style={{
              width: '100%', padding: '12px', borderRadius: '10px',
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
              color: '#fff', fontSize: '14px', outline: 'none'
            }}
          >
            <option value="Post Express">Post Express</option>
            <option value="AKS">AKS</option>
            <option value="DHL">DHL</option>
            <option value="Lično">Lično preuzimanje</option>
            <option value="Ostalo">Ostalo</option>
          </select>
        </div>
        
        {/* Notes */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginBottom: '6px', fontWeight: '600' }}>NAPOMENA</label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Opciono..."
            style={{
              width: '100%', padding: '12px', borderRadius: '10px',
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
              color: '#fff', fontSize: '14px', outline: 'none'
            }}
          />
        </div>
        
        {/* Buttons */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={handleSubmit}
            disabled={submitting || !selectedCampaign || !selectedInfluencer}
            style={{
              flex: 1, padding: '14px',
              background: submitting ? 'rgba(139, 92, 246, 0.3)' : 'linear-gradient(135deg, #8b5cf6, #6366f1)',
              border: 'none', borderRadius: '10px', color: '#fff',
              fontSize: '14px', fontWeight: '600', cursor: submitting ? 'wait' : 'pointer'
            }}
          >
            {submitting ? 'Kreiranje...' : '✓ Kreiraj paket'}
          </button>
          <button
            onClick={onClose}
            style={{
              padding: '14px 24px',
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '10px', color: '#fff', fontSize: '14px', cursor: 'pointer'
            }}
          >
            Otkaži
          </button>
        </div>
      </div>
    </>
  );
};

// Campaign Row
const CampaignRow = ({ campaign, isExpanded, onToggle, onInfluencerClick }) => {
  const percent = (campaign.percentDelivered || 0) * 100;
  
  return (
    <div style={{ marginBottom: '8px' }}>
      <div onClick={onToggle}
           style={{
             display: 'flex', alignItems: 'center', justifyContent: 'space-between',
             padding: '14px 18px', borderRadius: isExpanded ? '16px 16px 0 0' : '16px',
             background: isExpanded ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(59, 130, 246, 0.1))' : 'rgba(255,255,255,0.02)',
             border: isExpanded ? '1px solid rgba(139, 92, 246, 0.4)' : '1px solid rgba(255,255,255,0.06)',
             cursor: 'pointer', transition: 'all 0.3s'
           }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: 0 }}>
          <div style={{
            width: '44px', height: '44px', borderRadius: '12px',
            background: `linear-gradient(135deg, hsl(${(campaign.month?.charCodeAt(0) || 0) * 5}, 70%, 50%), hsl(${(campaign.month?.charCodeAt(0) || 0) * 5 + 30}, 70%, 40%))`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '18px', fontWeight: '700', color: '#fff', flexShrink: 0
          }}>
            {campaign.clientName?.charAt(0) || campaign.month?.charAt(0) || '?'}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 style={{ fontSize: '14px', fontWeight: '700', margin: 0, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {campaign.month}
            </h3>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', margin: '2px 0 0' }}>
              {formatNumber(campaign.totalViews)} / {formatNumber(campaign.campaignGoal)} • {campaign.publishedClips || 0} klipova
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '100px' }}><ProgressBar percent={percent} showLabel={false} size="small" /></div>
          <span style={{ fontSize: '16px', fontWeight: '800', color: percent >= 100 ? '#22c55e' : '#fff', minWidth: '45px', textAlign: 'right' }}>
            {Math.round(percent)}%
          </span>
          <StatusBadge status={campaign.progressStatus} />
          <span style={{ fontSize: '16px', color: 'rgba(255,255,255,0.4)', transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s' }}>▼</span>
        </div>
      </div>
      
      {isExpanded && (
        <div className="glass" style={{
          borderRadius: '0 0 16px 16px', padding: '20px',
          border: '1px solid rgba(139, 92, 246, 0.4)', borderTop: 'none'
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }}>
            <div style={{ textAlign: 'center', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px' }}>
              <p style={{ fontSize: '20px', fontWeight: '800', margin: 0, color: '#fff' }}>{formatNumber(campaign.totalViews)}</p>
              <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)' }}>VIEWS</p>
            </div>
            <div style={{ textAlign: 'center', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px' }}>
              <p style={{ fontSize: '20px', fontWeight: '800', margin: 0, color: '#fff' }}>{campaign.publishedClips || 0}</p>
              <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)' }}>KLIPOVA</p>
            </div>
            <div style={{ textAlign: 'center', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px' }}>
              <p style={{ fontSize: '20px', fontWeight: '800', margin: 0, color: '#fff' }}>{campaign.totalInfluencers || 0}</p>
              <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)' }}>INFLUENSERA</p>
            </div>
            <div style={{ textAlign: 'center', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px' }}>
              <p style={{ fontSize: '20px', fontWeight: '800', margin: 0, color: campaign.daysLeft > 10 ? '#fff' : '#ef4444' }}>{campaign.daysLeft || 0}</p>
              <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)' }}>DANA</p>
            </div>
          </div>
          
          {campaign.influencers?.length > 0 && (
            <>
              <h4 style={{ fontSize: '13px', fontWeight: '700', margin: '0 0 12px', color: '#fff' }}>👥 Influenseri ({campaign.influencers.length})</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {campaign.influencers.slice(0, 10).map((inf, i) => (
                  <div key={inf.id || i} onClick={() => onInfluencerClick(inf, campaign)}
                       style={{
                         display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '12px', alignItems: 'center',
                         padding: '10px 14px', background: 'rgba(255,255,255,0.02)', borderRadius: '10px',
                         cursor: 'pointer', transition: 'all 0.2s'
                       }}
                       onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(139, 92, 246, 0.15)'}
                       onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #ec4899, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700', color: '#fff' }}>
                        {inf.name?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                      <span style={{ fontSize: '13px', fontWeight: '600', color: '#fff' }}>{inf.name}</span>
                    </div>
                    <span style={{ fontSize: '13px', color: '#fff' }}>{inf.clips} klip.</span>
                    <span style={{ fontSize: '13px', fontWeight: '700', color: inf.views >= 100000 ? '#22c55e' : '#fff' }}>{formatNumber(inf.views)}</span>
                    <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>{getDaysAgo(inf.lastClipDate)}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

// Clip Card
const ClipCard = ({ clip }) => {
  const hasLink = clip.link && clip.link.length > 0;
  return (
    <div onClick={() => hasLink && window.open(clip.link, '_blank')}
         style={{
           display: 'flex', alignItems: 'center', gap: '12px', padding: '12px',
           background: 'rgba(255,255,255,0.02)', borderRadius: '12px',
           cursor: hasLink ? 'pointer' : 'default', transition: 'all 0.2s',
           border: '1px solid rgba(255,255,255,0.06)'
         }}
         onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(139, 92, 246, 0.1)'}
         onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}>
      <div style={{
        width: '42px', height: '42px', borderRadius: '10px',
        background: clip.platform === 'Tik Tok' ? 'linear-gradient(135deg, #010101, #69C9D0)' : 'linear-gradient(45deg, #f09433, #dc2743)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '18px'
      }}>
        {clip.platform === 'Tik Tok' ? '♪' : '📷'}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: '13px', fontWeight: '600', margin: 0, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {clip.influencerName || 'Unknown'}
        </p>
        <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', margin: '2px 0 0' }}>{clip.clientName || ''}</p>
      </div>
      <div style={{ textAlign: 'right' }}>
        <p style={{ fontSize: '14px', fontWeight: '700', margin: 0, color: clip.views >= 50000 ? '#22c55e' : '#fff' }}>{formatNumber(clip.views)}</p>
        <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)' }}>{getDaysAgo(clip.publishDate)}</p>
      </div>
    </div>
  );
};

// Section Header
const SectionHeader = ({ icon, title, count }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
    <span style={{ fontSize: '18px' }}>{icon}</span>
    <h2 style={{ fontSize: '16px', fontWeight: '700', margin: 0, color: '#fff' }}>{title}</h2>
    {count !== undefined && (
      <span style={{ fontSize: '11px', fontWeight: '700', padding: '3px 10px', borderRadius: '20px', background: 'rgba(139, 92, 246, 0.3)', color: '#a78bfa' }}>{count}</span>
    )}
  </div>
);

// ============ MAIN COMPONENT ============
export default function CoordinatorDashboard() {
  const router = useRouter();
  const { slug } = router.query;
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedCampaign, setExpandedCampaign] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('active');
  const [sortBy, setSortBy] = useState('progress');
  
  // Package states
  const [shipments, setShipments] = useState([]);
  const [shipmentsSummary, setShipmentsSummary] = useState({});
  const [shipmentsLoading, setShipmentsLoading] = useState(false);
  const [packagesExpanded, setPackagesExpanded] = useState(false);
  const [showAddPackageModal, setShowAddPackageModal] = useState(false);

  // Fetch main data
  useEffect(() => {
    if (!slug) return;
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
    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, [slug]);

  // Fetch shipments
  const fetchShipments = useCallback(async () => {
    setShipmentsLoading(true);
    try {
      const res = await fetch('/api/shipments');
      if (res.ok) {
        const json = await res.json();
        setShipments(json.shipments || []);
        setShipmentsSummary(json.summary || {});
      }
    } catch (err) {
      console.error('Shipments fetch error:', err);
    } finally {
      setShipmentsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchShipments();
  }, [fetchShipments]);

  // Add package handler
  const handleAddPackage = async (packageData) => {
    try {
      const res = await fetch('/api/shipments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...packageData,
          coordinatorId: data?.user?.id
        })
      });
      
      if (res.ok) {
        alert('✅ Paket je uspešno kreiran!');
        setShowAddPackageModal(false);
        fetchShipments();
      } else {
        const err = await res.json();
        alert(`❌ Greška: ${err.error || 'Neuspešno kreiranje paketa'}`);
      }
    } catch (err) {
      console.error('Add package error:', err);
      alert('❌ Greška pri kreiranju paketa');
    }
  };

  // Update shipment status
  const handleUpdateStatus = async (shipmentId, newStatus) => {
    try {
      const res = await fetch('/api/shipments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shipmentId, status: newStatus })
      });
      
      if (res.ok) {
        fetchShipments();
      } else {
        alert('❌ Greška pri ažuriranju statusa');
      }
    } catch (err) {
      console.error('Update status error:', err);
    }
  };

  // Filter campaigns
  const filteredCampaigns = useMemo(() => {
    if (!data?.months) return [];
    let filtered = [...data.months];
    
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();
    
    if (dateFilter === 'active') {
      filtered = filtered.filter(c => {
        if (!c.startDate) return false;
        const start = new Date(c.startDate);
        const end = c.endDate ? new Date(c.endDate) : null;
        return start <= now && (!end || end >= new Date(thisYear, thisMonth, 1));
      });
    } else if (dateFilter === 'thisMonth') {
      filtered = filtered.filter(c => {
        if (!c.startDate) return false;
        const start = new Date(c.startDate);
        return start.getMonth() === thisMonth && start.getFullYear() === thisYear;
      });
    }
    
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(c => c.month?.toLowerCase().includes(q));
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(c => {
        const s = c.progressStatus?.toLowerCase() || '';
        const p = (c.percentDelivered || 0) * 100;
        if (statusFilter === 'critical') return s.includes('dead') || s.includes('critical');
        if (statusFilter === 'behind') return s.includes('red') || s.includes('behind');
        if (statusFilter === 'ontrack') return s.includes('yellow');
        if (statusFilter === 'ahead') return s.includes('green') || p >= 100;
        return true;
      });
    }
    
    filtered.sort((a, b) => (a.percentDelivered || 0) - (b.percentDelivered || 0));
    
    return filtered;
  }, [data?.months, searchQuery, statusFilter, dateFilter]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f0f1a, #1a1a2e)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <GlobalStyles />
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '50px', height: '50px', border: '3px solid rgba(139, 92, 246, 0.2)', borderTopColor: '#8b5cf6', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 20px' }} />
          <p style={{ color: 'rgba(255,255,255,0.5)' }}>Učitavanje...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f0f1a, #1a1a2e)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <GlobalStyles />
        <div style={{ textAlign: 'center', color: '#fff' }}>
          <p style={{ fontSize: '48px', marginBottom: '16px' }}>😕</p>
          <h2>Greška pri učitavanju</h2>
          <p style={{ color: 'rgba(255,255,255,0.5)' }}>{error}</p>
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
      <GlobalStyles />
      
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f0f1a, #1a1a2e, #16213e)', padding: '20px' }}>
        <div style={{ maxWidth: '1600px', margin: '0 auto' }}>
          
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
            <div>
              <h1 style={{ fontSize: '32px', fontWeight: '800', margin: '0 0 4px', color: '#fff' }}>
                👋 {data.user?.name}
              </h1>
              <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', margin: 0 }}>
                🎯 {data.user?.role || 'Coordinator'}
              </p>
            </div>
            <LiveIndicator />
          </div>
          
          {/* Stats Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
            <FlipStatCard icon="📊" label="Aktivne kampanje" value={data.summary?.activeMonths || 0} gradient="purple" size="large" />
            <FlipStatCard icon="🤝" label="Nove prijave" value={data.summary?.pendingOffers || 0} gradient="orange" items={data.offers?.pending || []} />
            <FlipStatCard icon="✅" label="Prihvatili danas" value={data.summary?.acceptedToday || 0} gradient="green" items={data.offers?.acceptedToday || []} />
            <FlipStatCard icon="❌" label="Odbili danas" value={data.summary?.declinedToday || 0} gradient="red" items={data.offers?.declinedToday || []} />
          </div>
          
          {/* Package Section */}
          <PackageSection 
            shipments={shipments}
            summary={shipmentsSummary}
            onAddPackage={() => setShowAddPackageModal(true)}
            onUpdateStatus={handleUpdateStatus}
            isExpanded={packagesExpanded}
            onToggle={() => setPackagesExpanded(!packagesExpanded)}
            loading={shipmentsLoading}
          />
          
          {/* Main Content */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '24px' }}>
            
            {/* Campaigns */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <SectionHeader icon="📊" title="Kampanje" count={filteredCampaigns.length} />
                <div style={{ display: 'flex', gap: '8px' }}>
                  {['active', 'thisMonth', 'all'].map(f => (
                    <button key={f} onClick={() => setDateFilter(f)}
                      style={{
                        padding: '6px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: '600',
                        background: dateFilter === f ? 'rgba(139, 92, 246, 0.3)' : 'rgba(255,255,255,0.05)',
                        border: dateFilter === f ? '1px solid rgba(139, 92, 246, 0.5)' : '1px solid rgba(255,255,255,0.1)',
                        color: dateFilter === f ? '#a78bfa' : 'rgba(255,255,255,0.6)',
                        cursor: 'pointer'
                      }}>
                      {f === 'active' ? '🔥 Aktivne' : f === 'thisMonth' ? 'Ovaj mesec' : 'Sve'}
                    </button>
                  ))}
                </div>
              </div>
              
              <input
                type="text"
                placeholder="🔍 Pretraži kampanje..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%', padding: '12px 16px', marginBottom: '16px',
                  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '12px', color: '#fff', fontSize: '14px', outline: 'none'
                }}
              />
              
              <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
                {filteredCampaigns.map(campaign => (
                  <CampaignRow
                    key={campaign.id}
                    campaign={campaign}
                    isExpanded={expandedCampaign === campaign.id}
                    onToggle={() => setExpandedCampaign(expandedCampaign === campaign.id ? null : campaign.id)}
                    onInfluencerClick={() => {}}
                  />
                ))}
                {filteredCampaigns.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.4)' }}>
                    <p style={{ fontSize: '32px', marginBottom: '8px' }}>📭</p>
                    <p>Nema kampanja za prikaz</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Right Sidebar - Clips */}
            <div>
              {/* Published Today */}
              <div className="glass" style={{ borderRadius: '16px', padding: '16px', marginBottom: '16px' }}>
                <SectionHeader icon="📤" title="Objavljeno danas" count={data.clips?.publishedToday?.length || 0} />
                <div style={{ maxHeight: '300px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {data.clips?.publishedToday?.slice(0, 10).map((clip, i) => (
                    <ClipCard key={clip.id || i} clip={clip} />
                  ))}
                  {(!data.clips?.publishedToday || data.clips.publishedToday.length === 0) && (
                    <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', padding: '20px', fontSize: '13px' }}>Nema objava danas</p>
                  )}
                </div>
              </div>
              
              {/* Recent Clips */}
              <div className="glass" style={{ borderRadius: '16px', padding: '16px' }}>
                <SectionHeader icon="🎬" title="Nedavno objavljeno" count={data.clips?.publishedRecent?.length || 0} />
                <div style={{ maxHeight: '400px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {data.clips?.publishedRecent?.slice(0, 20).map((clip, i) => (
                    <ClipCard key={clip.id || i} clip={clip} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Add Package Modal */}
      <AddPackageModal
        isOpen={showAddPackageModal}
        onClose={() => setShowAddPackageModal(false)}
        onSubmit={handleAddPackage}
        campaigns={data?.months || []}
      />
    </>
  );
}
