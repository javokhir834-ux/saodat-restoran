import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api/client';
import { useCart } from '../stores/cart';
import { useMijoz } from '../stores/mijoz';
import CartModal from '../components/CartModal';
import ProductCard from '../components/ProductCard';
import Icon from '../components/Icon';

const FAOL_HOLATLAR = ['yangi', 'qabul', 'tayyorlanmoqda', 'tayyor'];

export default function MenuPage() {
  const [savatOchiq, setSavatOchiq] = useState(false);
  const [faolKat, setFaolKat] = useState('Hammasi');
  const [qidiruv, setQidiruv] = useState('');
  const { soni, jami } = useCart();
  const { mijoz } = useMijoz();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  // QR orqali kelgan stol raqamini saqlash — buyurtma sahifasida ishlatiladi
  useEffect(() => {
    const stol = params.get('stol');
    if (stol) sessionStorage.setItem('saodat_stol', stol);
  }, [params]);
  const stolRaqam = params.get('stol') || sessionStorage.getItem('saodat_stol');

  // Oxirgi buyurtma — faol bo'lsa banner ko'rsatamiz
  const oxirgiRaqam = localStorage.getItem('saodat_oxirgi_buyurtma');
  const { data: oxirgiBuyurtma } = useQuery({
    queryKey: ['order-holat', oxirgiRaqam],
    queryFn: () => api.get(`/orders/holat/${oxirgiRaqam}`).then((r) => r.data),
    enabled: !!oxirgiRaqam,
    refetchInterval: 30000,
  });
  const faolBuyurtma = oxirgiBuyurtma && FAOL_HOLATLAR.includes(oxirgiBuyurtma.holat) ? oxirgiBuyurtma : null;

  const { data: kategoriyalar = [], isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get('/categories').then((r) => r.data),
  });

  const barcha = kategoriyalar.flatMap((k) => k.products.map((p) => ({ ...p, catNom: k.nom })));

  const korinuvchi = barcha.filter((p) => {
    const katMos = faolKat === 'Hammasi' || p.catNom === faolKat;
    const qidiruvMos = p.nom.toLowerCase().includes(qidiruv.toLowerCase());
    return katMos && qidiruvMos;
  });

  const katlar = ['Hammasi', ...kategoriyalar.map((k) => k.nom)];

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--cream)' }}>
      <div className="text-center">
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}><Icon name="utensils" size={52} color="var(--green)" /></div>
        <p style={{ color: 'var(--green)', fontWeight: 600 }}>Menyu yuklanmoqda...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen pb-24" style={{ background: 'var(--cream)' }}>

      {/* Header */}
      <header style={{ background: 'var(--green)', padding: '22px 20px 18px', position: 'sticky', top: 0, zIndex: 20 }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ color: 'var(--gold)', fontSize: 12, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 5 }}>Restoran</div>
            <div style={{ color: 'var(--cream)', fontSize: 24, fontWeight: 600 }}>Saodat</div>
            <div style={{ color: '#9FBDB0', fontSize: 13, marginTop: 3 }}>Milliy taomlar · Samarqand</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {stolRaqam && (
              <span style={{
                background: 'var(--gold)', color: 'var(--green)', fontSize: 13, fontWeight: 700,
                padding: '7px 12px', borderRadius: 20, display: 'inline-flex', alignItems: 'center', gap: 5,
              }}><Icon name="dineIn" size={15} color="var(--green)" /> Stol {stolRaqam}</span>
            )}
            {/* Profil / Kirish */}
            {mijoz ? (
              <button
                onClick={() => navigate('/profil')}
                title="Profil"
                style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', background: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: '7px 10px 7px 8px', border: 'none' }}
              >
                <span style={{ width: 30, height: 30, background: 'var(--gold)', color: 'var(--green)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700 }}>
                  {mijoz.ism?.[0]?.toUpperCase() || <Icon name="user" size={16} color="var(--green)" />}
                </span>
                <span style={{ color: 'var(--gold)', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}><Icon name="gift" size={14} color="var(--gold)" /> {mijoz.ballar}</span>
              </button>
            ) : (
              <button
                onClick={() => navigate('/kirish')}
                style={{ cursor: 'pointer', background: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: '9px 14px', border: 'none', color: 'var(--cream)', fontSize: 13, fontWeight: 600, fontFamily: 'inherit' }}
              >Kirish</button>
            )}
            <button
              onClick={() => soni > 0 && setSavatOchiq(true)}
              style={{ position: 'relative', cursor: 'pointer', background: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: '10px 12px', border: 'none' }}
            >
              <svg width="26" height="26" viewBox="0 0 24 24" fill="var(--cream)">
                <path d="M7 18c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12L8.1 13h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49A1 1 0 0 0 20 4H5.21l-.94-2H1zm16 16c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
              </svg>
              {soni > 0 && (
                <span style={{
                  position: 'absolute', top: -6, right: -6, background: 'var(--gold)', color: 'var(--green)',
                  fontSize: 11, fontWeight: 700, minWidth: 20, height: 20, borderRadius: 10,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 5px'
                }}>{soni}</span>
              )}
            </button>
          </div>
        </div>
      </header>

      <div style={{ maxWidth: 900, margin: '0 auto' }}>

        {/* Faol buyurtma banneri */}
        {faolBuyurtma && (
          <div
            onClick={() => navigate(`/buyurtma/${faolBuyurtma.raqam}`)}
            style={{
              margin: '16px 20px 0', background: '#fff', border: '1px solid var(--green)',
              borderRadius: 14, padding: '13px 16px', display: 'flex', alignItems: 'center',
              gap: 12, cursor: 'pointer',
            }}
            className="fade-up"
          >
            <Icon
              name={faolBuyurtma.holat === 'tayyor' ? 'checkCircle' : faolBuyurtma.holat === 'tayyorlanmoqda' ? 'chef' : 'clock'}
              size={24} color="var(--green)"
            />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--green)' }}>
                Sizning faol buyurtmangiz — #{faolBuyurtma.raqam.split('-').pop()}
              </div>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
                {faolBuyurtma.holat === 'yangi' ? 'Qabul kutilmoqda' :
                 faolBuyurtma.holat === 'qabul' ? 'Qabul qilindi' :
                 faolBuyurtma.holat === 'tayyorlanmoqda' ? 'Tayyorlanmoqda...' : 'Tayyor! Olib keting'}
              </div>
            </div>
            <span style={{ color: 'var(--green)', fontSize: 18 }}>→</span>
          </div>
        )}

        {/* Promo bannerlar */}
        <div style={{ display: 'flex', gap: 14, padding: '18px 20px', overflowX: 'auto' }}
          className="no-scrollbar">
          {[
            { bg: '#993C1D', img: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=600&q=80', tag: 'Aksiya', h: 'Osh + Choy', p: 'Faqat bugun — 38 000 so\'m' },
            { bg: '#0F6E56', img: 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=600&q=80', tag: 'Yangi', h: 'Shashlik to\'plami', p: '5 sixcha + salat — 120 000' },
            { bg: '#854F0B', img: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80', tag: 'Tadbir', h: 'To\'y va tadbirlar', p: 'Zal band qilish ochiq' },
          ].map((b, i) => (
            <div key={i} style={{
              minWidth: 300, height: 130, borderRadius: 18, position: 'relative', overflow: 'hidden',
              display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: 18, color: '#fff',
              background: `${b.bg} url('${b.img}') center/cover`
            }}>
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top,rgba(0,0,0,0.65),rgba(0,0,0,0.05))' }} />
              <span style={{
                position: 'absolute', top: 14, left: 14, background: 'var(--gold)', color: 'var(--green)',
                fontSize: 11, fontWeight: 700, padding: '5px 12px', borderRadius: 20, zIndex: 2
              }}>{b.tag}</span>
              <div style={{ position: 'relative', zIndex: 2 }}>
                <div style={{ fontSize: 19, fontWeight: 700 }}>{b.h}</div>
                <div style={{ fontSize: 13, opacity: 0.95, marginTop: 3 }}>{b.p}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Qidiruv */}
        <div style={{ padding: '0 16px 10px' }}>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
              <Icon name="search" size={17} color="var(--muted)" />
            </span>
            <input
              type="text"
              placeholder="Taom qidiring..."
              value={qidiruv}
              onChange={(e) => setQidiruv(e.target.value)}
              style={{
                width: '100%', padding: '11px 16px 11px 40px', border: '1px solid var(--line)',
                borderRadius: 12, fontSize: 14, fontFamily: 'inherit', background: '#fff',
                outline: 'none', color: 'var(--ink)'
              }}
            />
          </div>
        </div>

        {/* Kategoriya tablar */}
        <div style={{
          display: 'flex', gap: 8, padding: '10px 20px', overflowX: 'auto',
          background: 'var(--cream)', borderBottom: '1px solid var(--line)',
          position: 'sticky', top: 84, zIndex: 15
        }} className="no-scrollbar">
          {katlar.map((k) => (
            <button
              key={k}
              onClick={() => setFaolKat(k)}
              style={{
                background: faolKat === k ? 'var(--green)' : 'transparent',
                color: faolKat === k ? 'var(--cream)' : 'var(--muted)',
                fontSize: 13, padding: '7px 16px', borderRadius: 20,
                border: `1px solid ${faolKat === k ? 'var(--green)' : 'var(--line)'}`,
                whiteSpace: 'nowrap', cursor: 'pointer', fontFamily: 'inherit'
              }}
            >{k}</button>
          ))}
        </div>

        {/* Menyu sarlavha */}
        <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--green)', padding: '16px 20px 4px' }}>Menyu</div>

        {/* Mahsulotlar grid — telefonda 2 ustun, kengroq ekranda ko'proq */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(150px,1fr))',
          gap: 12, padding: '12px 14px 20px'
        }}>
          {korinuvchi.map((p) => <ProductCard key={p.id} mahsulot={p} />)}
          {korinuvchi.length === 0 && (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px 0', color: 'var(--muted)' }}>
              Hech narsa topilmadi
            </div>
          )}
        </div>

        {/* Stollar/xonalar */}
        <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--green)', padding: '6px 20px 0' }}>
          Stol va xonalarni band qilish
        </div>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))',
          gap: 16, padding: '16px 20px'
        }}>
          {[
            { nom: 'Asosiy zal', sig: '40 kishi', img: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&q=80' },
            { nom: 'Oilaviy xona', sig: '8–10 kishi', img: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&q=80' },
            { nom: 'VIP xona', sig: '6 kishi', img: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=600&q=80' },
            { nom: 'Ochiq teras', sig: '20 kishi', img: 'https://images.unsplash.com/photo-1592861956120-e524fc739696?w=600&q=80' },
          ].map((r, i) => (
            <div key={i} style={{ background: '#fff', borderRadius: 16, overflow: 'hidden', border: '1px solid var(--line)' }}>
              <div style={{ height: 150, position: 'relative', background: `#eee url('${r.img}') center/cover` }}>
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(to top,rgba(0,0,0,0.7),transparent)', padding: '14px 14px 10px' }}>
                  <div style={{ color: '#fff', fontSize: 16, fontWeight: 600 }}>{r.nom}</div>
                  <div style={{ color: '#eee', fontSize: 12 }}>{r.sig}</div>
                </div>
              </div>
              <div style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 13, color: 'var(--muted)', flex: 1 }}>{r.sig}gacha</span>
                <button
                  onClick={() => navigate('/bron')}
                  style={{
                    background: 'var(--gold)', color: 'var(--green)', border: 'none',
                    fontSize: 13, fontWeight: 600, padding: '8px 16px', borderRadius: 9, cursor: 'pointer', fontFamily: 'inherit'
                  }}
                >Band qilish</button>
              </div>
            </div>
          ))}
        </div>

        {/* Kontakt */}
        <div style={{ background: 'var(--green)', color: 'var(--cream)', margin: '0 20px 24px', borderRadius: 18, padding: 22 }}>
          <div style={{ fontSize: 17, fontWeight: 600, marginBottom: 12, color: 'var(--gold)' }}>Murojaat uchun</div>
          {[
            '+998 90 123 45 67',
            '+998 93 111 22 33',
          ].map((t, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, padding: '7px 0' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="var(--gold)" style={{ flexShrink: 0 }}><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>
              <span>{t}</span>
            </div>
          ))}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, padding: '7px 0' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="var(--gold)" style={{ flexShrink: 0 }}><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
            <span>Registon ko'chasi 12, Samarqand</span>
          </div>
        </div>

        {/* Xodim kirishi — kassa va admin paneli */}
        <div style={{ textAlign: 'center', paddingBottom: 90 }}>
          <span onClick={() => navigate('/login')} style={{ fontSize: 13, color: 'var(--muted)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6, borderBottom: '1px dashed var(--muted)', paddingBottom: 2 }}>
            <Icon name="chef" size={15} color="var(--muted)" /> Xodim kirishi (kassa / admin)
          </span>
        </div>

      </div>

      {/* Bottom bar */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, background: '#fff',
        borderTop: '1px solid var(--line)', padding: '14px 16px calc(14px + env(safe-area-inset-bottom))', zIndex: 30,
        boxShadow: '0 -4px 16px rgba(0,0,0,0.05)'
      }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 12, color: 'var(--muted)' }}>
              {soni > 0 ? `Jami (${soni} ta nom)` : "Savat bo'sh"}
            </div>
            <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--green)' }}>
              {jami.toLocaleString()} so'm
            </div>
          </div>
          <button
            disabled={soni === 0}
            onClick={() => setSavatOchiq(true)}
            style={{
              background: 'var(--gold)', color: 'var(--green)', border: 'none',
              fontSize: 15, fontWeight: 600, padding: '12px 28px', borderRadius: 12,
              cursor: soni > 0 ? 'pointer' : 'not-allowed', opacity: soni > 0 ? 1 : 0.4,
              fontFamily: 'inherit'
            }}
          >Buyurtma berish</button>
        </div>
      </div>

      {savatOchiq && <CartModal onYopish={() => setSavatOchiq(false)} />}
    </div>
  );
}
