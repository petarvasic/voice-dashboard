// pages/influencer/[slug].js - Influencer Dashboard v1
// Premium light theme, animations, WOW factor
import { useState, useEffect, useMemo } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

// ============ UTILITIES ============
const formatNumber = (num) => {
  if (!num || isNaN(num)) return '0';
  const n = parseInt(num);
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return n.toLocaleString('sr-RS');
};

const formatCurrency = (num) => {
  if (!num || isNaN(num)) return '0 RSD';
  return parseInt(num).toLocaleString('sr-RS') + ' RSD';
};

const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('sr-RS', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch { return '-'; }
};

const getTimeAgo = (dateStr) => {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Danas';
  if (days === 1) return 'Juče';
  if (days < 7) return `Pre ${days} dana`;
  return formatDate(dateStr);
};

// ============ GLOBAL STYLES ============
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Playfair+Display:wght@600;700&display=swap');
    
    * { box-sizing: border-box; margin: 0; padding: 0; }
    
    body {
      font-family: 'Outfit', -apple-system, sans-serif;
      background: linear-gradient(180deg, #fafbff 0%, #f0f4ff 50%, #e8efff 100%);
      min-height: 100vh;
    }
    
    @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
    @keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.8; transform: scale(1.05); } }
    @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
    @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideInRight { from { opacity: 0; transform: translateX(50px); } to { opacity: 1; transform: translateX(0); } }
    @keyframes scaleIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
    @keyframes gradientShift { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
    @keyframes confetti { 0% { transform: translateY(0) rotate(0deg); opacity: 1; } 100% { transform: translateY(-100px) rotate(720deg); opacity: 0; } }
    @keyframes borderGlow { 0%, 100% { box-shadow: 0 0 20px rgba(99, 102, 241, 0.1); } 50% { box-shadow: 0 0 40px rgba(99, 102, 241, 0.3); } }
    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes countUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    
    ::-webkit-scrollbar { width: 8px; height: 8px; }
    ::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 10px; }
    ::-webkit-scrollbar-thumb { background: linear-gradient(180deg, #a78bfa, #818cf8); border-radius: 10px; }
    ::-webkit-scrollbar-thumb:hover { background: linear-gradient(180deg, #8b5cf6, #6366f1); }
    
    .card {
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.8);
      box-shadow: 0 4px 24px rgba(99, 102, 241, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04);
      border-radius: 24px;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .card:hover {
      transform: translateY(-4px);
      box-shadow: 0 20px 60px rgba(99, 102, 241, 0.15), 0 4px 12px rgba(0, 0, 0, 0.05);
    }
    
    .gradient-text {
      background: linear-gradient(135deg, #6366f1, #8b5cf6, #a78bfa);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    
    .shine-effect {
      position: relative;
      overflow: hidden;
    }
    
    .shine-effect::after {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: linear-gradient(
        to right,
        transparent 0%,
        rgba(255, 255, 255, 0.4) 50%,
        transparent 100%
      );
      transform: rotate(30deg);
      animation: shimmer 3s infinite;
    }
    
    .btn-primary {
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      color: white;
      border: none;
      padding: 12px 28px;
      border-radius: 14px;
      font-weight: 600;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 4px 20px rgba(99, 102, 241, 0.3);
    }
    
    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 30px rgba(99, 102, 241, 0.4);
    }
    
    .btn-secondary {
      background: white;
      color: #6366f1;
      border: 2px solid #e0e7ff;
      padding: 10px 24px;
      border-radius: 12px;
      font-weight: 600;
      font-size: 13px;
      cursor: pointer;
      transition: all 0.3s ease;
    }
    
    .btn-secondary:hover {
      border-color: #6366f1;
      background: #f5f3ff;
    }
    
    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 14px;
      border-radius: 100px;
      font-size: 12px;
      font-weight: 600;
    }
    
    .status-pending { background: #fef3c7; color: #d97706; }
    .status-accepted { background: #d1fae5; color: #059669; }
    .status-declined { background: #fee2e2; color: #dc2626; }
    .status-active { background: #e0e7ff; color: #4f46e5; }
    
    input, textarea, select {
      font-family: 'Outfit', sans-serif;
    }
  `}</style>
);

// ============ COMPONENTS ============

// Animated Background Shapes
const BackgroundShapes = () => (
  <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
    {/* Gradient orbs */}
    <div style={{
      position: 'absolute', top: '-20%', right: '-10%', width: '600px', height: '600px',
      background: 'radial-gradient(circle, rgba(167, 139, 250, 0.15) 0%, transparent 70%)',
      animation: 'float 20s ease-in-out infinite'
    }} />
    <div style={{
      position: 'absolute', bottom: '-30%', left: '-15%', width: '800px', height: '800px',
      background: 'radial-gradient(circle, rgba(129, 140, 248, 0.12) 0%, transparent 70%)',
      animation: 'float 25s ease-in-out infinite reverse'
    }} />
    <div style={{
      position: 'absolute', top: '40%', left: '60%', width: '400px', height: '400px',
      background: 'radial-gradient(circle, rgba(236, 72, 153, 0.08) 0%, transparent 70%)',
      animation: 'float 18s ease-in-out infinite'
    }} />
    
    {/* Grid pattern */}
    <div style={{
      position: 'absolute', inset: 0,
      backgroundImage: `
        linear-gradient(rgba(99, 102, 241, 0.03) 1px, transparent 1px),
        linear-gradient(90deg, rgba(99, 102, 241, 0.03) 1px, transparent 1px)
      `,
      backgroundSize: '60px 60px'
    }} />
  </div>
);

// Logo
const Logo = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
    <div style={{
      width: '44px', height: '44px', borderRadius: '14px',
      background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: '0 4px 20px rgba(99, 102, 241, 0.3)'
    }}>
      <span style={{ fontSize: '22px' }}>🎬</span>
    </div>
    <div>
      <h1 style={{ fontSize: '22px', fontWeight: '800', margin: 0, color: '#1e1b4b' }}>VOICE</h1>
      <p style={{ fontSize: '11px', color: '#6b7280', margin: 0, letterSpacing: '2px' }}>CREATOR HUB</p>
    </div>
  </div>
);

// Stat Card with animation
const StatCard = ({ icon, label, value, subValue, color = 'indigo', delay = 0 }) => {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);
  
  const colors = {
    indigo: { bg: 'linear-gradient(135deg, #eef2ff, #e0e7ff)', accent: '#6366f1', shadow: 'rgba(99, 102, 241, 0.2)' },
    emerald: { bg: 'linear-gradient(135deg, #ecfdf5, #d1fae5)', accent: '#10b981', shadow: 'rgba(16, 185, 129, 0.2)' },
    amber: { bg: 'linear-gradient(135deg, #fffbeb, #fef3c7)', accent: '#f59e0b', shadow: 'rgba(245, 158, 11, 0.2)' },
    rose: { bg: 'linear-gradient(135deg, #fff1f2, #fce7f3)', accent: '#ec4899', shadow: 'rgba(236, 72, 153, 0.2)' }
  };
  
  const c = colors[color];
  
  return (
    <div className="card" style={{
      padding: '24px',
      background: c.bg,
      opacity: isVisible ? 1 : 0,
      transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
      transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
      border: 'none',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{
        position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px',
        background: `radial-gradient(circle, ${c.shadow} 0%, transparent 70%)`,
        animation: 'pulse 4s ease-in-out infinite'
      }} />
      
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px', position: 'relative' }}>
        <div style={{
          width: '52px', height: '52px', borderRadius: '16px',
          background: 'white', boxShadow: `0 4px 20px ${c.shadow}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '24px'
        }}>
          {icon}
        </div>
      </div>
      
      <p style={{ fontSize: '13px', color: '#6b7280', fontWeight: '500', margin: '0 0 6px', letterSpacing: '0.5px' }}>{label}</p>
      <p style={{ fontSize: '32px', fontWeight: '800', margin: 0, color: '#1e1b4b', lineHeight: 1, animation: isVisible ? 'countUp 0.8s ease' : 'none' }}>
        {value}
      </p>
      {subValue && <p style={{ fontSize: '12px', color: c.accent, fontWeight: '600', margin: '6px 0 0' }}>{subValue}</p>}
    </div>
  );
};

// Opportunity Card (Brand looking for influencers)
const OpportunityCard = ({ opportunity, onApply }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [note, setNote] = useState('');
  const [showNoteInput, setShowNoteInput] = useState(false);
  
  return (
    <div className="card" 
         onMouseEnter={() => setIsHovered(true)} 
         onMouseLeave={() => setIsHovered(false)}
         style={{
           padding: '24px',
           animation: 'fadeInUp 0.6s ease',
           transform: isHovered ? 'translateY(-4px) scale(1.01)' : 'none',
           border: isHovered ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid rgba(255, 255, 255, 0.8)'
         }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
        <div style={{ display: 'flex', gap: '14px' }}>
          <div style={{
            width: '56px', height: '56px', borderRadius: '16px',
            background: 'linear-gradient(135deg, #f0f9ff, #e0f2fe)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '26px', fontWeight: '700', color: '#0ea5e9',
            border: '2px solid white', boxShadow: '0 4px 12px rgba(14, 165, 233, 0.15)'
          }}>
            {opportunity.clientName?.charAt(0) || '?'}
          </div>
          <div>
            <h3 style={{ fontSize: '17px', fontWeight: '700', margin: '0 0 4px', color: '#1e1b4b' }}>
              {opportunity.clientName}
            </h3>
            <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>
              {opportunity.niche || 'Lifestyle'} • {opportunity.platform || 'TikTok'}
            </p>
          </div>
        </div>
        <span className="status-badge status-active">
          🔥 Novo
        </span>
      </div>
      
      <p style={{ fontSize: '14px', color: '#4b5563', lineHeight: 1.6, margin: '0 0 16px' }}>
        {opportunity.description || 'Tražimo kreativne influensere za promociju proizvoda. Prijavi se i pokaži svoj stil!'}
      </p>
      
      <div style={{ display: 'flex', gap: '20px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '16px' }}>💰</span>
          <span style={{ fontSize: '14px', fontWeight: '600', color: '#10b981' }}>{formatCurrency(opportunity.payment || 5000)}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '16px' }}>📅</span>
          <span style={{ fontSize: '13px', color: '#6b7280' }}>Rok: {formatDate(opportunity.deadline)}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '16px' }}>👁️</span>
          <span style={{ fontSize: '13px', color: '#6b7280' }}>{formatNumber(opportunity.viewsRequired || 50000)} views</span>
        </div>
      </div>
      
      {showNoteInput ? (
        <div style={{ marginBottom: '12px', animation: 'fadeIn 0.3s ease' }}>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Zašto si ti pravi/a za ovaj posao? (npr. 'Idem na more sledeće nedelje, savršeno za ovaj brend!')"
            style={{
              width: '100%', padding: '12px 16px', borderRadius: '12px',
              border: '2px solid #e0e7ff', background: '#fafaff',
              fontSize: '13px', resize: 'none', height: '80px',
              outline: 'none', transition: 'border-color 0.3s'
            }}
            onFocus={(e) => e.target.style.borderColor = '#6366f1'}
            onBlur={(e) => e.target.style.borderColor = '#e0e7ff'}
          />
        </div>
      ) : null}
      
      <div style={{ display: 'flex', gap: '10px' }}>
        {!showNoteInput ? (
          <>
            <button className="btn-primary" onClick={() => setShowNoteInput(true)} style={{ flex: 1 }}>
              ✨ Prijavi se
            </button>
            <button className="btn-secondary" onClick={() => {}}>
              ℹ️ Detalji
            </button>
          </>
        ) : (
          <>
            <button className="btn-primary" onClick={() => onApply(opportunity, note)} style={{ flex: 1 }}>
              📤 Pošalji prijavu
            </button>
            <button className="btn-secondary" onClick={() => setShowNoteInput(false)}>
              ✕
            </button>
          </>
        )}
      </div>
    </div>
  );
};

// Application Card
const ApplicationCard = ({ application }) => {
  const statusConfig = {
    'Sent': { class: 'status-pending', icon: '⏳', text: 'Čeka se' },
    'Pending': { class: 'status-pending', icon: '⏳', text: 'Čeka se' },
    'Accepted': { class: 'status-accepted', icon: '✅', text: 'Prihvaćeno' },
    'Declined': { class: 'status-declined', icon: '❌', text: 'Odbijeno' }
  };
  
  const status = statusConfig[application.status] || statusConfig['Pending'];
  
  return (
    <div className="card" style={{ padding: '18px', display: 'flex', alignItems: 'center', gap: '14px' }}>
      <div style={{
        width: '46px', height: '46px', borderRadius: '12px',
        background: 'linear-gradient(135deg, #f1f5f9, #e2e8f0)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '20px', fontWeight: '700', color: '#64748b'
      }}>
        {application.clientName?.charAt(0) || '?'}
      </div>
      
      <div style={{ flex: 1 }}>
        <h4 style={{ fontSize: '14px', fontWeight: '600', margin: '0 0 3px', color: '#1e1b4b' }}>
          {application.clientName}
        </h4>
        <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>
          Prijavljeno {getTimeAgo(application.dateApplied)}
        </p>
      </div>
      
      <span className={`status-badge ${status.class}`}>
        {status.icon} {status.text}
      </span>
    </div>
  );
};

// Clip Card
const ClipCard = ({ clip }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <a href={clip.link} target="_blank" rel="noopener noreferrer"
       onMouseEnter={() => setIsHovered(true)}
       onMouseLeave={() => setIsHovered(false)}
       style={{
         display: 'block', textDecoration: 'none',
         background: 'white', borderRadius: '16px', overflow: 'hidden',
         boxShadow: isHovered ? '0 20px 40px rgba(99, 102, 241, 0.15)' : '0 2px 12px rgba(0, 0, 0, 0.04)',
         transform: isHovered ? 'translateY(-6px) scale(1.02)' : 'none',
         transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
       }}>
      {/* Thumbnail placeholder */}
      <div style={{
        height: '140px',
        background: clip.platform === 'Tik Tok' 
          ? 'linear-gradient(135deg, #010101, #25f4ee)' 
          : 'linear-gradient(45deg, #f09433, #e6683c, #dc2743)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative'
      }}>
        <span style={{ fontSize: '40px', opacity: 0.9 }}>
          {clip.platform === 'Tik Tok' ? '📱' : '📸'}
        </span>
        <div style={{
          position: 'absolute', bottom: '10px', right: '10px',
          background: 'rgba(0,0,0,0.7)', borderRadius: '8px',
          padding: '4px 10px', fontSize: '12px', color: 'white', fontWeight: '600'
        }}>
          {clip.platform}
        </div>
      </div>
      
      <div style={{ padding: '14px' }}>
        <p style={{ fontSize: '13px', fontWeight: '600', margin: '0 0 8px', color: '#1e1b4b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {clip.clientName || 'Klip'}
        </p>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '16px', fontWeight: '700', color: '#10b981' }}>{formatNumber(clip.views)}</span>
          <span style={{ fontSize: '11px', color: '#9ca3af' }}>{getTimeAgo(clip.publishDate)}</span>
        </div>
      </div>
    </a>
  );
};

// Profile Section
const ProfileSection = ({ profile, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(profile || {});
  
  const fields = [
    { key: 'phone', label: 'Telefon', icon: '📱', type: 'tel' },
    { key: 'city', label: 'Grad', icon: '📍', type: 'text' },
    { key: 'tiktokHandle', label: 'TikTok', icon: '🎵', type: 'text', placeholder: '@username' },
    { key: 'instagramHandle', label: 'Instagram', icon: '📸', type: 'text', placeholder: '@username' },
    { key: 'shirtSize', label: 'Veličina majice', icon: '👕', type: 'select', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL'] },
    { key: 'pantsSize', label: 'Veličina pantalona', icon: '👖', type: 'text', placeholder: 'npr. 32' },
    { key: 'shoeSize', label: 'Broj cipela', icon: '👟', type: 'text', placeholder: 'npr. 42' },
    { key: 'categories', label: 'Kategorije', icon: '🏷️', type: 'multiselect', options: ['Beauty', 'Fashion', 'Fitness', 'Food', 'Tech', 'Travel', 'Gaming', 'Lifestyle', 'Parenting', 'Comedy'] }
  ];
  
  const handleSave = () => {
    onUpdate(formData);
    setIsEditing(false);
  };
  
  return (
    <div className="card" style={{ padding: '28px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '700', margin: 0, color: '#1e1b4b', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span>👤</span> Moj profil
        </h2>
        <button 
          className={isEditing ? 'btn-primary' : 'btn-secondary'}
          onClick={isEditing ? handleSave : () => setIsEditing(true)}
          style={{ padding: '8px 16px', fontSize: '12px' }}
        >
          {isEditing ? '💾 Sačuvaj' : '✏️ Izmeni'}
        </button>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
        {fields.map(field => (
          <div key={field.key} style={{ 
            display: 'flex', alignItems: 'center', gap: '12px',
            padding: '14px', background: '#fafaff', borderRadius: '12px',
            gridColumn: field.type === 'multiselect' ? 'span 2' : 'auto'
          }}>
            <span style={{ fontSize: '20px' }}>{field.icon}</span>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '11px', color: '#9ca3af', fontWeight: '500', display: 'block', marginBottom: '4px' }}>
                {field.label}
              </label>
              {isEditing ? (
                field.type === 'select' ? (
                  <select
                    value={formData[field.key] || ''}
                    onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                    style={{
                      width: '100%', padding: '6px 10px', border: '1px solid #e0e7ff',
                      borderRadius: '8px', fontSize: '14px', background: 'white'
                    }}
                  >
                    <option value="">Izaberi...</option>
                    {field.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                ) : field.type === 'multiselect' ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {field.options.map(opt => {
                      const selected = (formData[field.key] || []).includes(opt);
                      return (
                        <button key={opt} onClick={() => {
                          const current = formData[field.key] || [];
                          setFormData({
                            ...formData,
                            [field.key]: selected ? current.filter(x => x !== opt) : [...current, opt]
                          });
                        }} style={{
                          padding: '4px 10px', borderRadius: '20px', fontSize: '12px', cursor: 'pointer',
                          background: selected ? '#6366f1' : 'white', color: selected ? 'white' : '#6b7280',
                          border: selected ? 'none' : '1px solid #e0e7ff', fontWeight: '500', transition: 'all 0.2s'
                        }}>
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <input
                    type={field.type}
                    value={formData[field.key] || ''}
                    placeholder={field.placeholder}
                    onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                    style={{
                      width: '100%', padding: '6px 10px', border: '1px solid #e0e7ff',
                      borderRadius: '8px', fontSize: '14px', outline: 'none'
                    }}
                  />
                )
              ) : (
                <p style={{ fontSize: '14px', fontWeight: '600', color: '#1e1b4b', margin: 0 }}>
                  {field.type === 'multiselect' 
                    ? (formData[field.key] || []).join(', ') || '—'
                    : formData[field.key] || '—'}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Earnings Chart
const EarningsChart = ({ earnings = [] }) => {
  const maxValue = Math.max(...earnings.map(e => e.amount), 1);
  
  return (
    <div className="card" style={{ padding: '24px' }}>
      <h3 style={{ fontSize: '16px', fontWeight: '700', margin: '0 0 20px', color: '#1e1b4b', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span>📊</span> Zarada po mesecima
      </h3>
      
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '140px' }}>
        {earnings.length > 0 ? earnings.slice(-6).map((item, i) => (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '100%', borderRadius: '8px 8px 0 0',
              background: 'linear-gradient(180deg, #6366f1, #8b5cf6)',
              height: `${(item.amount / maxValue) * 100}%`,
              minHeight: '20px',
              transition: 'height 0.5s ease',
              animationDelay: `${i * 0.1}s`
            }} />
            <span style={{ fontSize: '10px', color: '#9ca3af', fontWeight: '500' }}>{item.month}</span>
          </div>
        )) : (
          <p style={{ width: '100%', textAlign: 'center', color: '#9ca3af', fontSize: '13px' }}>
            Nema podataka o zaradi
          </p>
        )}
      </div>
    </div>
  );
};

// Navigation Tab
const NavTab = ({ icon, label, isActive, onClick, badge }) => (
  <button onClick={onClick} style={{
    display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 20px',
    background: isActive ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'transparent',
    border: 'none', borderRadius: '14px', cursor: 'pointer',
    color: isActive ? 'white' : '#6b7280', fontWeight: '600', fontSize: '14px',
    transition: 'all 0.3s ease', position: 'relative',
    boxShadow: isActive ? '0 4px 20px rgba(99, 102, 241, 0.3)' : 'none'
  }}>
    <span style={{ fontSize: '18px' }}>{icon}</span>
    <span>{label}</span>
    {badge > 0 && (
      <span style={{
        position: 'absolute', top: '8px', right: '8px',
        width: '20px', height: '20px', borderRadius: '50%',
        background: '#ef4444', color: 'white', fontSize: '11px', fontWeight: '700',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        animation: 'pulse 2s infinite'
      }}>
        {badge}
      </span>
    )}
  </button>
);

// Section Title
const SectionTitle = ({ icon, title, action }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
    <h2 style={{ fontSize: '20px', fontWeight: '700', margin: 0, color: '#1e1b4b', display: 'flex', alignItems: 'center', gap: '10px' }}>
      <span>{icon}</span> {title}
    </h2>
    {action}
  </div>
);

// ============ MAIN COMPONENT ============
export default function InfluencerDashboard() {
  const router = useRouter();
  const { slug } = router.query;
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('opportunities');
  
  // Mock data for demonstration
  useEffect(() => {
    if (!slug) return;
    
    // Simulate API call
    setTimeout(() => {
      setData({
        influencer: {
          id: 'inf123',
          name: 'Marija Petrović',
          email: 'marija@example.com',
          phone: '+381 64 123 4567',
          city: 'Beograd',
          tiktokHandle: '@marija_p',
          instagramHandle: '@marija.petrovic',
          shirtSize: 'M',
          shoeSize: '39',
          categories: ['Beauty', 'Fashion', 'Lifestyle']
        },
        stats: {
          totalEarnings: 125000,
          totalViews: 2450000,
          totalClips: 24,
          avgViewsPerClip: 102000,
          pendingPayment: 15000
        },
        opportunities: [
          { id: 1, clientName: 'Nivea Serbia', niche: 'Beauty', platform: 'TikTok', payment: 8000, viewsRequired: 100000, deadline: '2025-01-15', description: 'Tražimo kreativce za zimsku kampanju hidratacije. Potreban autentičan sadržaj!' },
          { id: 2, clientName: 'Fashion Nova', niche: 'Fashion', platform: 'Instagram', payment: 12000, viewsRequired: 150000, deadline: '2025-01-20', description: 'Nova kolekcija - budi deo tima! Traži se OOTD content.' },
          { id: 3, clientName: 'Protein World', niche: 'Fitness', platform: 'TikTok', payment: 6000, viewsRequired: 80000, deadline: '2025-01-10', description: 'Fitness influenseri za promociju novih ukusa protein šejka.' }
        ],
        applications: [
          { id: 1, clientName: 'Samsung Serbia', status: 'Accepted', dateApplied: '2024-12-20' },
          { id: 2, clientName: 'Adidas', status: 'Pending', dateApplied: '2024-12-24' },
          { id: 3, clientName: 'L\'Oreal', status: 'Declined', dateApplied: '2024-12-15' }
        ],
        clips: [
          { id: 1, clientName: 'Samsung Serbia', platform: 'Tik Tok', views: 245000, publishDate: '2024-12-22', link: '#' },
          { id: 2, clientName: 'Coca-Cola', platform: 'Instagram', views: 180000, publishDate: '2024-12-18', link: '#' },
          { id: 3, clientName: 'Nike', platform: 'Tik Tok', views: 320000, publishDate: '2024-12-10', link: '#' },
          { id: 4, clientName: 'Zara', platform: 'Tik Tok', views: 95000, publishDate: '2024-12-05', link: '#' }
        ],
        earnings: [
          { month: 'Jul', amount: 15000 },
          { month: 'Aug', amount: 22000 },
          { month: 'Sep', amount: 18000 },
          { month: 'Okt', amount: 28000 },
          { month: 'Nov', amount: 35000 },
          { month: 'Dec', amount: 42000 }
        ]
      });
      setLoading(false);
    }, 1000);
  }, [slug]);
  
  const handleApply = (opportunity, note) => {
    console.log('Applying to:', opportunity.clientName, 'Note:', note);
    alert(`✅ Prijava poslata za ${opportunity.clientName}!`);
  };
  
  const handleProfileUpdate = (profile) => {
    console.log('Updating profile:', profile);
    setData(prev => ({ ...prev, influencer: { ...prev.influencer, ...profile } }));
  };
  
  if (loading) {
    return (
      <>
        <GlobalStyles />
        <BackgroundShapes />
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '60px', height: '60px', borderRadius: '50%',
              border: '3px solid #e0e7ff', borderTopColor: '#6366f1',
              animation: 'spin 1s linear infinite', margin: '0 auto 20px'
            }} />
            <p style={{ color: '#6b7280', fontWeight: '500' }}>Učitavanje...</p>
          </div>
        </div>
      </>
    );
  }
  
  if (error || !data) {
    return (
      <>
        <GlobalStyles />
        <BackgroundShapes />
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="card" style={{ padding: '40px', textAlign: 'center', maxWidth: '400px' }}>
            <span style={{ fontSize: '48px', display: 'block', marginBottom: '16px' }}>😕</span>
            <h2 style={{ margin: '0 0 8px', color: '#1e1b4b' }}>Greška</h2>
            <p style={{ color: '#6b7280', margin: '0 0 20px' }}>{error}</p>
            <button className="btn-primary" onClick={() => window.location.reload()}>
              Pokušaj ponovo
            </button>
          </div>
        </div>
      </>
    );
  }
  
  return (
    <>
      <Head>
        <title>{data.influencer?.name} | VOICE Creator Hub</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <GlobalStyles />
      <BackgroundShapes />
      
      <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh' }}>
        {/* Header */}
        <header style={{
          padding: '20px 40px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.5)',
          position: 'sticky', top: 0, zIndex: 100
        }}>
          <Logo />
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '15px', fontWeight: '700', margin: 0, color: '#1e1b4b' }}>{data.influencer?.name}</p>
              <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>{data.influencer?.tiktokHandle}</p>
            </div>
            <div style={{
              width: '48px', height: '48px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '20px', fontWeight: '700', color: 'white',
              boxShadow: '0 4px 20px rgba(139, 92, 246, 0.3)'
            }}>
              {data.influencer?.name?.charAt(0) || '?'}
            </div>
          </div>
        </header>
        
        <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '32px 40px' }}>
          
          {/* Hero Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '40px' }}>
            <StatCard icon="💰" label="Ukupna zarada" value={formatCurrency(data.stats?.totalEarnings)} subValue={`+ ${formatCurrency(data.stats?.pendingPayment)} pending`} color="emerald" delay={0} />
            <StatCard icon="👁️" label="Ukupni views" value={formatNumber(data.stats?.totalViews)} color="indigo" delay={100} />
            <StatCard icon="🎬" label="Objavljenih klipova" value={data.stats?.totalClips || 0} color="rose" delay={200} />
            <StatCard icon="📈" label="Prosek po klipu" value={formatNumber(data.stats?.avgViewsPerClip)} subValue="views" color="amber" delay={300} />
          </div>
          
          {/* Navigation Tabs */}
          <div style={{ 
            display: 'flex', gap: '8px', marginBottom: '32px', padding: '6px',
            background: 'rgba(255, 255, 255, 0.8)', borderRadius: '18px',
            boxShadow: '0 2px 20px rgba(99, 102, 241, 0.08)',
            width: 'fit-content'
          }}>
            <NavTab icon="🔥" label="Prilike" isActive={activeTab === 'opportunities'} onClick={() => setActiveTab('opportunities')} badge={data.opportunities?.length || 0} />
            <NavTab icon="📋" label="Moje prijave" isActive={activeTab === 'applications'} onClick={() => setActiveTab('applications')} />
            <NavTab icon="🎬" label="Moji klipovi" isActive={activeTab === 'clips'} onClick={() => setActiveTab('clips')} />
            <NavTab icon="💳" label="Zarada" isActive={activeTab === 'earnings'} onClick={() => setActiveTab('earnings')} />
            <NavTab icon="👤" label="Profil" isActive={activeTab === 'profile'} onClick={() => setActiveTab('profile')} />
          </div>
          
          {/* Content based on active tab */}
          {activeTab === 'opportunities' && (
            <div>
              <SectionTitle icon="🔥" title="Aktivne prilike" action={
                <span style={{ fontSize: '13px', color: '#6b7280' }}>
                  {data.opportunities?.length || 0} dostupnih
                </span>
              } />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '20px' }}>
                {data.opportunities?.map(opp => (
                  <OpportunityCard key={opp.id} opportunity={opp} onApply={handleApply} />
                ))}
              </div>
              {(!data.opportunities || data.opportunities.length === 0) && (
                <div className="card" style={{ padding: '60px', textAlign: 'center' }}>
                  <span style={{ fontSize: '48px', display: 'block', marginBottom: '16px' }}>🔍</span>
                  <h3 style={{ margin: '0 0 8px', color: '#1e1b4b' }}>Nema aktivnih prilika</h3>
                  <p style={{ color: '#6b7280', margin: 0 }}>Nove prilike stižu uskoro!</p>
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'applications' && (
            <div>
              <SectionTitle icon="📋" title="Moje prijave" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '600px' }}>
                {data.applications?.map(app => (
                  <ApplicationCard key={app.id} application={app} />
                ))}
              </div>
              {(!data.applications || data.applications.length === 0) && (
                <div className="card" style={{ padding: '60px', textAlign: 'center' }}>
                  <span style={{ fontSize: '48px', display: 'block', marginBottom: '16px' }}>📭</span>
                  <h3 style={{ margin: '0 0 8px', color: '#1e1b4b' }}>Nema prijava</h3>
                  <p style={{ color: '#6b7280', margin: 0 }}>Prijavi se na neku od aktivnih prilika!</p>
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'clips' && (
            <div>
              <SectionTitle icon="🎬" title="Moji klipovi" action={
                <span style={{ fontSize: '13px', color: '#6b7280' }}>
                  {data.clips?.length || 0} klipova • {formatNumber(data.stats?.totalViews)} views
                </span>
              } />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px' }}>
                {data.clips?.map(clip => (
                  <ClipCard key={clip.id} clip={clip} />
                ))}
              </div>
              {(!data.clips || data.clips.length === 0) && (
                <div className="card" style={{ padding: '60px', textAlign: 'center' }}>
                  <span style={{ fontSize: '48px', display: 'block', marginBottom: '16px' }}>🎥</span>
                  <h3 style={{ margin: '0 0 8px', color: '#1e1b4b' }}>Nema klipova</h3>
                  <p style={{ color: '#6b7280', margin: 0 }}>Tvoji klipovi će se pojaviti ovde nakon objave.</p>
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'earnings' && (
            <div>
              <SectionTitle icon="💳" title="Zarada" />
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
                <EarningsChart earnings={data.earnings} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div className="card" style={{ padding: '24px', background: 'linear-gradient(135deg, #ecfdf5, #d1fae5)' }}>
                    <p style={{ fontSize: '12px', color: '#059669', fontWeight: '600', margin: '0 0 8px' }}>UKUPNO ZARADJENO</p>
                    <p style={{ fontSize: '32px', fontWeight: '800', color: '#047857', margin: 0 }}>{formatCurrency(data.stats?.totalEarnings)}</p>
                  </div>
                  <div className="card" style={{ padding: '24px', background: 'linear-gradient(135deg, #fef3c7, #fde68a)' }}>
                    <p style={{ fontSize: '12px', color: '#d97706', fontWeight: '600', margin: '0 0 8px' }}>ČEKA ISPLATU</p>
                    <p style={{ fontSize: '32px', fontWeight: '800', color: '#b45309', margin: 0 }}>{formatCurrency(data.stats?.pendingPayment)}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'profile' && (
            <ProfileSection profile={data.influencer} onUpdate={handleProfileUpdate} />
          )}
          
        </main>
        
        {/* Footer */}
        <footer style={{ 
          padding: '24px 40px', textAlign: 'center',
          borderTop: '1px solid rgba(255, 255, 255, 0.5)',
          color: '#9ca3af', fontSize: '12px'
        }}>
          <p style={{ margin: 0 }}>
            Powered by <strong style={{ color: '#6366f1' }}>VOICE</strong> • © 2025
          </p>
        </footer>
      </div>
    </>
  );
}
