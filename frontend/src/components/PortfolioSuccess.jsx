/**
 * PortifyAI — Portfolio Success Page
 * 
 * All functionality preserved:
 *   - useSelector(state.portfolio.formData)
 *   - handleShare (twitter, facebook, linkedin, whatsapp)
 *   - handleCopy with copied state
 *   - navigate('/dashboard')
 *   - dark mode from localStorage('portify-theme')
 * 
 * Place at: src/pages/PortfolioSuccess.jsx
 */
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { apiClient } from '../services/apiClient';
import { getTemplatePreviewImage } from '../config/templatePreviewImages';
import { getTemplateDisplayName } from '../config/templateDisplayNames';

/* ─── Theme tokens — exact match to PortifyAI design system ─────── */
const T = (dark) => ({
  pageBg:       dark ? '#070C18' : '#F8F7F4',
  surfaceBg:    dark ? '#0D1526' : '#FFFFFF',
  elevatedBg:   dark ? '#121F35' : '#FFFFFF',
  subtleBg:     dark ? '#090E1C' : '#F2F0EC',
  inputBg:      dark ? '#1A2640' : '#EDEAE4',
  text1:        dark ? '#F0EEF8' : '#0F0D0A',
  text2:        dark ? '#A8A4C0' : '#3D3830',
  text3:        dark ? '#6B6685' : '#7A7060',
  text4:        dark ? '#3D3B52' : '#B0A898',
  border1:      dark ? 'rgba(255,255,255,0.08)' : '#E2DDD5',
  border2:      dark ? 'rgba(255,255,255,0.05)' : '#C8C2B8',
  violetSurface:dark ? 'rgba(124,58,237,0.12)'  : '#EDE9FD',
  violetBorder: dark ? 'rgba(139,92,246,0.3)'   : '#C4B5FD',
  violetText:   dark ? '#C4B5FD'                : '#5B21B6',
  emeraldSurface:dark? 'rgba(16,185,129,0.1)'   : '#D1FAE5',
  emeraldBorder: dark? 'rgba(52,211,153,0.25)'  : '#6EE7B7',
  emeraldText:   dark? '#6EE7B7'                : '#065F46',
  shadow:       dark ? 'rgba(0,0,0,0.35)'       : 'rgba(15,13,10,0.08)',
  shadowLg:     dark ? 'rgba(0,0,0,0.6)'        : 'rgba(15,13,10,0.16)',
  grad: 'linear-gradient(135deg,#7C3AED 0%,#A855F7 50%,#06B6D4 100%)',
});

/* ─── Confetti particles ─────────────────────────────────────────── */
function Confetti() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const pieces = Array.from({ length: 80 }, () => ({
      x: Math.random() * canvas.width,
      y: -20 - Math.random() * 200,
      w: 6 + Math.random() * 8,
      h: 10 + Math.random() * 12,
      rot: Math.random() * Math.PI * 2,
      rotV: (Math.random() - 0.5) * 0.12,
      vy: 2 + Math.random() * 3,
      vx: (Math.random() - 0.5) * 1.5,
      color: ['#7C3AED','#A855F7','#8B5CF6','#F59E0B','#EC4899','#C4B5FD','#FFFFFF'][Math.floor(Math.random()*7)],
      opacity: 0.8 + Math.random() * 0.2,
    }));

    let alive = true;
    let frame = 0;
    let fade = 1;
    const totalFrames = 220;
    const fadeStart = 180;
    const fadeFrames = 40;
    const draw = () => {
      if (!alive || frame > totalFrames) return;
      frame++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // Fade out strips after animation
      if (frame > fadeStart) {
        fade = 1 - (frame - fadeStart) / fadeFrames;
        fade = Math.max(0, fade);
      }
      pieces.forEach(p => {
        p.y  += p.vy;
        p.x  += p.vx;
        p.rot += p.rotV;
        p.opacity = Math.max(0, p.opacity - (frame > 160 ? 0.012 : 0));
        ctx.save();
        ctx.globalAlpha = p.opacity * fade;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      });
      requestAnimationFrame(draw);
    };
    draw();
    return () => { alive = false; };
  }, []);

  return (
    <canvas ref={canvasRef} style={{
      position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 50,
    }} />
  );
}

/* ─── Animated counter ───────────────────────────────────────────── */
function Counter({ to, suffix = '', duration = 1800 }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(ease * to));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [to, duration]);
  return <>{val}{suffix}</>;
}

/* ─── SVG Icon ───────────────────────────────────────────────────── */
function Ico({ d, size = 18, color = 'currentColor', fill = 'none' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24"
      fill={fill} stroke={fill === 'none' ? color : 'none'}
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
      style={{ display: 'block', flexShrink: 0 }}>
      <path d={d} />
    </svg>
  );
}

const IC = {
  link:    'M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71',
  copy:    'M8 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-2M8 4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2M8 4h8',
  check:   'M20 6L9 17l-5-5',
  share:   'M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 1 1 0-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 1 0 5.367-2.684 3 3 0 0 0-5.367 2.684zm0 9.316a3 3 0 1 0 5.368 2.684 3 3 0 0 0-5.368-2.684z',
  eye:     'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z',
  external:'M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3',
  layout:  'M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z',
  sparkle: 'M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z',
  arrow:   'M5 12h14M12 5l7 7-7 7',
  bar:     'M12 20V10M18 20V4M6 20v-4',
  download:'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3',
};

/* ─── CSS ────────────────────────────────────────────────────────── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
    :root { --grad: linear-gradient(90deg,#7C3AED 0%,#A855F7 50%,#8B5CF6 100%); }
  .ps * { font-family:'DM Sans',sans-serif; box-sizing:border-box; margin:0; padding:0; }
  .ps h1,.ps h2,.ps h3 { font-family:'Syne',sans-serif; }

  /* gradient text */
  .ps-grad { background:var(--grad); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }

  /* animations */
  @keyframes ps-up    { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
  @keyframes ps-scale { from{opacity:0;transform:scale(0.88)} to{opacity:1;transform:scale(1)} }
  @keyframes ps-pop   { 0%{transform:scale(0.5);opacity:0} 70%{transform:scale(1.08)} 100%{transform:scale(1);opacity:1} }
  @keyframes ps-spin  { to{transform:rotate(360deg)} }
  @keyframes ps-pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
  @keyframes ps-glow  { 0%,100%{box-shadow:0 0 0 0 rgba(124,58,237,0.4)} 50%{box-shadow:0 0 0 12px rgba(124,58,237,0)} }
  @keyframes ps-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
  @keyframes ps-shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }

  .ps-in1 { animation:ps-up 0.6s 0.0s ease both; }
  .ps-in2 { animation:ps-up 0.6s 0.1s ease both; }
  .ps-in3 { animation:ps-up 0.6s 0.2s ease both; }
  .ps-in4 { animation:ps-up 0.6s 0.3s ease both; }
  .ps-in5 { animation:ps-up 0.6s 0.4s ease both; }
  .ps-scale { animation:ps-scale 0.5s 0.05s ease both; }
  .ps-pop { animation:ps-pop 0.5s ease both; }

  .ps-card { transition:transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease; }
  .ps-card:hover { transform:translateY(-3px); }

  .ps-btn-primary {
    background: var(--grad);
    transition: transform .22s ease, box-shadow .22s ease;
    box-shadow: 0 4px 20px rgba(124,58,237,0.35);
  }
  .ps-btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 30px rgba(124,58,237,0.5);
  }

  .ps-social-btn { transition:transform .18s ease, box-shadow .18s ease; }
  .ps-social-btn:hover { transform:translateY(-2px) scale(1.06); }

  .ps-preview-img { transition:transform 0.8s cubic-bezier(0.34,1.2,0.64,1); }
  .ps-preview-wrap:hover .ps-preview-img { transform:scale(1.05); }
  .ps-overlay { transition:opacity 0.35s ease; }

  .ps-url-input:focus { outline:none; }

  /* stat shimmer */
  .ps-stat-shine {
    background: linear-gradient(90deg, transparent 0%, rgba(124,58,237,0.08) 50%, transparent 100%);
    background-size: 200% 100%;
    animation: ps-shimmer 2.5s infinite;
  }

  @media(max-width:900px) {
    .ps-grid { grid-template-columns:1fr !important; }
  }
`;

/* ═══════════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════════ */
const PortfolioSuccess = () => {
  const navigate = useNavigate();
  const { formData, generatedPortfolio } = useSelector((state) => state.portfolio);

  // ── Original state ───────────────────────────────────────────────
  const [isHovered, setIsHovered] = useState(false);
  const [copied,    setCopied]    = useState(false);
  const [template, setTemplate] = useState(null);
  const [loadingTemplate, setLoadingTemplate] = useState(true);

  // Theme — matches Landing page
  const dark = localStorage.getItem('portify-theme') !== 'light';
  const t = T(dark);

  // Fetch template info on mount
  useEffect(() => {
    const fetchTemplateInfo = async () => {
      try {
        const templateName = generatedPortfolio?.templateName || 'developer_resume_multi';
        const data = await apiClient.get(`/templates/${templateName}`);
        setTemplate({
          ...data,
          name: getTemplateDisplayName(templateName, data?.name || templateName),
          previewImage: getTemplatePreviewImage(templateName, data?.previewImage)
        });
      } catch (err) {
        console.error('Failed to load template info:', err);
      } finally {
        setLoadingTemplate(false);
      }
    };
    
    fetchTemplateInfo();
  }, [generatedPortfolio?.templateName]);

  // ── Original data ────────────────────────────────────────────────
  const baseUrl = window.location.origin;
  const liveUrl = generatedPortfolio?.slug
    ? `${baseUrl}/${generatedPortfolio.slug}`
    : (generatedPortfolio?.liveUrl || `https://portfolio.yoursite.com/${formData?.personalInfo?.name?.toLowerCase().replace(/\s+/g, '-') || 'user'}`);

  const portfolioData = {
    templateName: template?.name || 'Professional Template',
    previewImage: 'https://s3-alpha.figma.com/hub/file/4099079435/resized/800x480/42cb390b-5db1-41ad-9501-c2867b18dcc0-cover.png',
    templateImage: getTemplatePreviewImage(
      generatedPortfolio?.templateName || 'developer_resume_multi',
      template?.previewImage || '/template-images/developer-resume-multi.png'
    ),
    liveUrl,
  };

  // ── Original handlers ────────────────────────────────────────────
  const handleShare = (platform) => {
    const url  = encodeURIComponent(portfolioData.liveUrl);
    const text = encodeURIComponent('Check out my new portfolio!');
    const shareUrls = {
      twitter:  `https://twitter.com/intent/tweet?url=${url}&text=${text}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
      whatsapp: `https://wa.me/?text=${text}%20${url}`,
    };
    window.open(shareUrls[platform], '_blank', 'width=600,height=400');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(portfolioData.liveUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ── Stats ────────────────────────────────────────────────────────
  const stats = [
    { label: 'AI Score',    val: 98,  suffix: '%', color: '#7C3AED', bg: t.violetSurface, bd: t.violetBorder },
    { label: 'SEO Ready',   val: 100, suffix: '%', color: '#10B981', bg: t.emeraldSurface, bd: t.emeraldBorder },
    { label: 'Load Speed',  val: 99,  suffix: '%', color: '#06B6D4', bg: dark ? 'rgba(6,182,212,0.1)' : '#E0F9FF', bd: dark ? 'rgba(34,211,238,0.25)' : '#7FE8F5' },
  ];

  // ── Social share buttons ─────────────────────────────────────────
  const socials = [
    { key: 'twitter',  label: 'Twitter',  color: '#1DA1F2', bg: dark ? 'rgba(29,161,242,0.12)' : '#E8F5FE', bd: dark ? 'rgba(29,161,242,0.25)' : '#BAE3FC',
      icon: 'M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z' },
    { key: 'linkedin', label: 'LinkedIn', color: '#0A66C2', bg: dark ? 'rgba(10,102,194,0.12)' : '#E8F0FA', bd: dark ? 'rgba(10,102,194,0.25)' : '#BAD1F5',
      icon: 'M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z' },
    { key: 'whatsapp', label: 'WhatsApp', color: '#25D366', bg: dark ? 'rgba(37,211,102,0.1)' : '#E9FBF0', bd: dark ? 'rgba(37,211,102,0.25)' : '#9AE6B4',
      icon: 'M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z' },
    { key: 'facebook', label: 'Facebook', color: '#1877F2', bg: dark ? 'rgba(24,119,242,0.12)' : '#E8F1FE', bd: dark ? 'rgba(24,119,242,0.25)' : '#BAD1FD',
      icon: 'M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z' },
  ];

  /* card style helper */
  const cardStyle = (extra = {}) => ({
    background: t.surfaceBg,
    border: `1px solid ${t.border1}`,
    borderRadius: 20,
    padding: '24px',
    ...extra,
  });

  return (
    <div className="ps" style={{
      minHeight: '100vh',
      background: t.pageBg,
      padding: '40px 24px 60px',
      position: 'relative',
      overflow: 'hidden',
      transition: 'background 0.4s ease',
    }}>
      <style>{CSS}</style>
      <Confetti />

      {/* ── Ambient background blobs ────────────────────────────── */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div style={{
          position: 'absolute', top: '10%', left: '5%',
          width: 500, height: 500, borderRadius: '50%',
          background: dark ? 'radial-gradient(circle,rgba(124,58,237,0.1) 0%,transparent 70%)' : 'radial-gradient(circle,rgba(124,58,237,0.06) 0%,transparent 70%)',
          filter: 'blur(60px)',
        }} />
        <div style={{
          position: 'absolute', bottom: '10%', right: '5%',
          width: 400, height: 400, borderRadius: '50%',
          background: dark ? 'radial-gradient(circle,rgba(6,182,212,0.08) 0%,transparent 70%)' : 'radial-gradient(circle,rgba(6,182,212,0.05) 0%,transparent 70%)',
          filter: 'blur(60px)',
        }} />
        {/* Grid texture */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `linear-gradient(${dark ? 'rgba(124,58,237,0.03)' : 'rgba(124,58,237,0.04)'} 1px,transparent 1px),linear-gradient(90deg,${dark ? 'rgba(124,58,237,0.03)' : 'rgba(124,58,237,0.04)'} 1px,transparent 1px)`,
          backgroundSize: '52px 52px',
        }} />
      </div>

      {/* ── Content ─────────────────────────────────────────────── */}
      <div style={{ maxWidth: 1140, margin: '0 auto', position: 'relative', zIndex: 1 }}>

        {/* ── HEADER ──────────────────────────────────────────── */}
        <div className="ps-in1" style={{ textAlign: 'center', marginBottom: 48 }}>
          {/* Live pill */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '7px 16px', borderRadius: 100,
            background: t.emeraldSurface,
            border: `1px solid ${t.emeraldBorder}`,
            marginBottom: 20,
          }}>
            <div style={{
              width: 8, height: 8, borderRadius: '50%',
              background: '#10B981',
              animation: 'ps-pulse 1.8s ease infinite',
              boxShadow: '0 0 0 3px rgba(16,185,129,0.2)',
            }} />
            <span style={{ fontSize: 12, fontWeight: 700, color: t.emeraldText, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Live & Ready
            </span>
          </div>

          {/* Big heading */}
          <h1 style={{
            fontFamily: 'Syne, sans-serif',
            fontSize: 'clamp(48px,8vw,88px)',
            fontWeight: 800,
            lineHeight: 1,
            marginBottom: 14,
            color: t.text1,
            letterSpacing: '-0.03em',
          }}>
            Your Portfolio<br />
            <span className="ps-grad">is Live!</span> 
          </h1>

          <p style={{ fontSize: 17, color: t.text3, lineHeight: 1.6 }}>
            AI has crafted your portfolio. It's polished, optimized and ready to impress.
          </p>
        </div>

        {/* ── STAT ROW ─────────────────────────────────────────── */}
        <div className="ps-in2" style={{
          display: 'grid', gridTemplateColumns: 'repeat(3,1fr)',
          gap: 16, marginBottom: 32,
        }}>
          {stats.map((s, i) => (
            <div key={s.label} className="ps-card ps-stat-shine" style={{
              ...cardStyle(),
              display: 'flex', alignItems: 'center', gap: 16,
              padding: '20px 24px',
            }}>
              <div style={{
                width: 48, height: 48, borderRadius: 14, flexShrink: 0,
                background: s.bg,
                border: `1px solid ${s.bd}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Ico d={i === 0 ? IC.sparkle : i === 1 ? IC.bar : IC.arrow} size={20} color={s.color} />
              </div>
              <div>
                <div style={{
                  fontFamily: 'Syne, sans-serif',
                  fontSize: 28, fontWeight: 800,
                  color: s.color, lineHeight: 1,
                }}>
                  <Counter to={s.val} suffix={s.suffix} />
                </div>
                <div style={{ fontSize: 12, fontWeight: 600, color: t.text3, marginTop: 2, letterSpacing: '0.05em' }}>
                  {s.label}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── MAIN GRID ─────────────────────────────────────────── */}
        <div className="ps-grid" style={{
          display: 'grid',
          gridTemplateColumns: '1fr 420px',
          gap: 20,
          alignItems: 'start',
        }}>

          {/* ════ LEFT — Preview ════ */}
          <div className="ps-in3" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Preview card */}
            <div className="ps-preview-wrap" style={{
              ...cardStyle({ padding: 0, overflow: 'hidden' }),
              position: 'relative',
              cursor: 'pointer',
              minHeight: 360,
            }}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              {/* Browser chrome bar */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '12px 16px',
                background: t.subtleBg,
                borderBottom: `1px solid ${t.border1}`,
              }}>
                {['#FF5F57','#FFBD2E','#28C840'].map((c, i) => (
                  <div key={i} style={{ width: 11, height: 11, borderRadius: '50%', background: c }} />
                ))}
                <div style={{
                  flex: 1, marginLeft: 10,
                  height: 24, borderRadius: 6,
                  background: t.inputBg,
                  display: 'flex', alignItems: 'center',
                  padding: '0 12px',
                }}>
                  <span style={{ fontSize: 11, fontFamily: 'monospace', color: t.text3 }}>
                    {portfolioData.liveUrl}
                  </span>
                </div>
              </div>

              {/* Screenshot */}
              <img
                src={portfolioData.previewImage}
                alt="Portfolio Preview"
                className="ps-preview-img"
                style={{ width: '100%', minHeight: 360, objectFit: 'cover', display: 'block' }}
              />

              {/* Hover overlay */}
              <div className="ps-overlay" style={{
                position: 'absolute', inset: 0,
                background: 'rgba(7,12,24,0.75)',
                backdropFilter: 'blur(8px)',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                gap: 12,
                opacity: isHovered ? 1 : 0,
                pointerEvents: isHovered ? 'auto' : 'none',
                marginTop: 46,   // below browser bar
              }}>
                <a
                  href={portfolioData.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    padding: '12px 28px',
                    borderRadius: 100,
                    background: 'rgba(255,255,255,0.15)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255,255,255,0.3)',
                    color: '#fff',
                    fontSize: 14, fontWeight: 700,
                    textDecoration: 'none',
                    transition: 'background 0.2s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.25)'}
                  onMouseLeave={e => e.currentTarget.style.background='rgba(255,255,255,0.15)'}
                >
                  <Ico d={IC.external} size={15} color="#fff" />
                  View Live Site
                </a>
                <button
                  onClick={() => navigate('/dashboard')}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    padding: '12px 28px',
                    borderRadius: 100,
                    background: 'rgba(124,58,237,0.5)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(139,92,246,0.4)',
                    color: '#fff',
                    fontSize: 14, fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'background 0.2s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background='rgba(124,58,237,0.7)'}
                  onMouseLeave={e => e.currentTarget.style.background='rgba(124,58,237,0.5)'}
                >
                  <Ico d={IC.layout} size={15} color="#fff" />
                  Dashboard
                </button>
              </div>
            </div>
          </div>

          {/* ════ RIGHT — Actions ════ */}
          <div className="ps-in4" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* ── Share Link card ── */}
            <div className="ps-card" style={cardStyle()}
              onMouseEnter={e => { e.currentTarget.style.borderColor = dark ? 'rgba(139,92,246,0.3)' : '#C4B5FD'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = t.border1; }}>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
                <div style={{
                  width: 34, height: 34, borderRadius: 10,
                  background: t.violetSurface, border: `1px solid ${t.violetBorder}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Ico d={IC.link} size={16} color={dark ? '#C4B5FD' : '#7C3AED'} />
                </div>
                <h3 style={{ fontSize: 15, fontFamily: 'Syne, sans-serif', fontWeight: 700, color: t.text1 }}>
                  Your Live URL
                </h3>
              </div>

              {/* URL input */}
              <div style={{
                display: 'flex', alignItems: 'center',
                background: t.inputBg,
                border: `1.5px solid ${t.border1}`,
                borderRadius: 12,
                padding: '10px 14px',
                gap: 8, marginBottom: 12,
              }}>
                <div style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: '#10B981',
                  animation: 'ps-pulse 2s infinite',
                  flexShrink: 0,
                }} />
                <span style={{
                  fontSize: 13, color: t.text2,
                  flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  fontFamily: 'monospace',
                }}>
                  {portfolioData.liveUrl}
                </span>
              </div>

              {/* Copy button */}
              <button
                onClick={handleCopy}
                className="ps-btn-primary"
                style={{
                  width: '100%', padding: '12px 0',
                  borderRadius: 12, border: 'none',
                  background: copied ? '#10B981' : 'var(--grad)',
                  color: '#fff',
                  fontSize: 14, fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  transition: 'background 0.3s ease, transform 0.2s ease, box-shadow 0.2s ease',
                  fontFamily: 'DM Sans, sans-serif',
                  boxShadow: copied ? '0 4px 20px rgba(16,185,129,0.4)' : '0 4px 20px rgba(124,58,237,0.35)',
                }}>
                <Ico d={copied ? IC.check : IC.copy} size={16} color="#fff" />
                {copied ? 'Copied to Clipboard!' : 'Copy Link'}
              </button>
            </div>

            {/* ── Social Share card ── */}
            <div className="ps-card" style={cardStyle()}
              onMouseEnter={e => { e.currentTarget.style.borderColor = dark ? 'rgba(139,92,246,0.3)' : '#C4B5FD'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = t.border1; }}>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
                <div style={{
                  width: 34, height: 34, borderRadius: 10,
                  background: t.violetSurface, border: `1px solid ${t.violetBorder}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Ico d={IC.share} size={16} color={dark ? '#C4B5FD' : '#7C3AED'} />
                </div>
                <h3 style={{ fontSize: 15, fontFamily: 'Syne, sans-serif', fontWeight: 700, color: t.text1 }}>
                  Share Your Work
                </h3>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {socials.map(s => (
                  <button key={s.key} className="ps-social-btn"
                    onClick={() => handleShare(s.key)}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                      padding: '11px 0',
                      borderRadius: 12,
                      background: s.bg,
                      border: `1px solid ${s.bd}`,
                      color: s.color,
                      fontSize: 13, fontWeight: 600,
                      cursor: 'pointer',
                      fontFamily: 'DM Sans, sans-serif',
                    }}>
                    <svg width="16" height="16" viewBox="0 0 24 24"
                      fill={s.key === 'twitter' || s.key === 'facebook' || s.key === 'linkedin' || s.key === 'whatsapp' ? s.color : 'none'}
                      stroke={s.key === 'whatsapp' ? s.color : 'none'}
                      strokeWidth="1.5" style={{ flexShrink: 0 }}>
                      <path d={s.icon} />
                    </svg>
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* ── Quick actions card ── */}
            <div className="ps-card" style={cardStyle()}
              onMouseEnter={e => { e.currentTarget.style.borderColor = dark ? 'rgba(139,92,246,0.3)' : '#C4B5FD'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = t.border1; }}>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
                <div style={{
                  width: 34, height: 34, borderRadius: 10,
                  background: t.violetSurface, border: `1px solid ${t.violetBorder}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Ico d={IC.layout} size={16} color={dark ? '#C4B5FD' : '#7C3AED'} />
                </div>
                <h3 style={{ fontSize: 15, fontFamily: 'Syne, sans-serif', fontWeight: 700, color: t.text1 }}>
                  Quick Actions
                </h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {/* View live */}
                <a
                  href={portfolioData.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '12px 16px',
                    borderRadius: 12,
                    background: t.subtleBg,
                    border: `1px solid ${t.border1}`,
                    textDecoration: 'none',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = dark ? '#C4B5FD' : '#7C3AED'; e.currentTarget.style.background = t.violetSurface; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = t.border1; e.currentTarget.style.background = t.subtleBg; }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Ico d={IC.eye} size={15} color={dark ? '#C4B5FD' : '#7C3AED'} />
                    <span style={{ fontSize: 13, fontWeight: 600, color: t.text1 }}>View Live Portfolio</span>
                  </div>
                  <Ico d={IC.external} size={13} color={t.text3} />
                </a>

                {/* Dashboard */}
                <button
                  onClick={() => navigate('/dashboard')}
                  className="ps-btn-primary"
                  style={{
                    width: '100%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    padding: '13px 0',
                    borderRadius: 12, border: 'none',
                    color: '#fff',
                    fontSize: 14, fontWeight: 700,
                    cursor: 'pointer',
                    fontFamily: 'DM Sans, sans-serif',
                  }}>
                  <Ico d={IC.layout} size={16} color="#fff" />
                  Go to Dashboard
                  <Ico d={IC.arrow} size={15} color="#fff" />
                </button>
              </div>
            </div>

            {/* ── Template Info Card ── */}
            {!loadingTemplate && template && (
            <div className="ps-card" style={cardStyle()}
              onMouseEnter={e => { e.currentTarget.style.borderColor = dark ? 'rgba(139,92,246,0.3)' : '#C4B5FD'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = t.border1; }}>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <div style={{
                  width: 34, height: 34, borderRadius: 10,
                  background: t.violetSurface, border: `1px solid ${t.violetBorder}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Ico d={IC.layout} size={16} color={dark ? '#C4B5FD' : '#7C3AED'} />
                </div>
                <h3 style={{ fontSize: 15, fontFamily: 'Syne, sans-serif', fontWeight: 700, color: t.text1 }}>
                  Your Template
                </h3>
              </div>

              {/* Template Preview Image */}
              {template.previewImage && (
                <div style={{
                  width: '100%',
                  height: 140,
                  borderRadius: 12,
                  overflow: 'hidden',
                  marginBottom: 12,
                  border: `1px solid ${t.border1}`,
                  background: t.subtleBg,
                }}>
                  <img 
                    src={template.previewImage}
                    alt={template.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                    onError={(e) => {
                      e.currentTarget.src = '/template-images/developer-minimal.png';
                    }}
                  />
                </div>
              )}

              <div>
                <h4 style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: t.text1,
                  marginBottom: 4,
                }}>
                  {template.name}
                </h4>
                <p style={{
                  fontSize: 12,
                  color: t.text3,
                  lineHeight: '1.4',
                  marginBottom: 12,
                }}>
                  {template.description}
                </p>

                {template.features && template.features.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {template.features.map((feature, idx) => (
                      <span key={idx}
                        style={{
                          fontSize: 11,
                          padding: '4px 8px',
                          borderRadius: 6,
                          background: dark ? 'rgba(139,92,246,0.15)' : 'rgba(124,58,237,0.1)',
                          color: dark ? '#C4B5FD' : '#7C3AED',
                          fontWeight: 500,
                        }}>
                        {feature}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={() => navigate('/dashboard?tab=manageTemplate')}
                style={{
                  width: '100%',
                  marginTop: 12,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  padding: '10px 0',
                  borderRadius: 10,
                  background: t.subtleBg,
                  border: `1px solid ${t.border1}`,
                  color: t.text1,
                  fontSize: 13, fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  fontFamily: 'DM Sans, sans-serif',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = dark ? '#C4B5FD' : '#7C3AED'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = t.border1; }}>
                <Ico d={IC.layout} size={13} color={t.text1} />
                Manage Template
              </button>
            </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioSuccess;