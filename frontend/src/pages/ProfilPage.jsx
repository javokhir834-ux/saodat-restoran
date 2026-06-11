import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../api/client';
import { useMijoz } from '../stores/mijoz';
import { useCart } from '../stores/cart';
import Icon from '../components/Icon';

const HOLAT = {
  yangi:          { l: 'Qabul kutilmoqda', bg: '#E1F5EE', c: '#0F6E56' },
  qabul:          { l: 'Qabul qilindi',    bg: '#E1F5EE', c: '#0F4D3C' },
  tayyorlanmoqda: { l: 'Tayyorlanmoqda',   bg: '#FAEEDA', c: '#854F0B' },
  tayyor:         { l: 'Tayyor',           bg: '#E1F5EE', c: '#0F4D3C' },
  berildi:        { l: 'Yakunlandi',       bg: '#F3F0E8', c: '#888780' },
  rad:            { l: 'Rad etildi',       bg: '#FCEBEB', c: '#A32D2D' },
};

function sana(s) {
  return new Date(s).toLocaleDateString('uz', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

export default function ProfilPage() {
  const navigate = useNavigate();
  const { mijoz, token, chiqish, yangila } = useMijoz();
  const { qosh, tozala } = useCart();

  useEffect(() => {
    if (!token) navigate('/kirish', { replace: true });
    else yangila();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const { data: buyurtmalar = [], isLoading } = useQuery({
    queryKey: ['mijoz-buyurtmalar'],
    queryFn: () => api.get('/mijoz/buyurtmalar').then((r) => r.data),
    enabled: !!token,
    refetchInterval: 20000,
  });

  if (!token) return null;

  const jamiBuyurtma = buyurtmalar.length;
  const jamiSarf = buyurtmalar.filter((b) => b.tolovHolati === 'tolandi').reduce((s, b) => s + b.jamiSumma, 0);

  function qaytaBuyurtma(b) {
    tozala();
    b.items.forEach((it) => qosh({ id: it.productId, nom: it.mahsulotNomi, narx: it.narx, birlik: it.birlik, qadam: 1 }, it.miqdori));
    toast.success('Savatga qo\'shildi');
    navigate('/buyurtma');
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)', paddingBottom: 32 }}>
      {/* Header / profil kartasi */}
      <div style={{ background: 'var(--green)', padding: '18px 20px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <button onClick={() => navigate('/')} style={{ color: 'var(--gold)', background: 'none', border: 'none', fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>← Menyuga</button>
          <button onClick={() => { chiqish(); navigate('/'); }} style={{ background: 'rgba(255,255,255,0.14)', color: 'var(--cream)', border: 'none', borderRadius: 10, padding: '7px 12px', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>Chiqish</button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 56, height: 56, background: 'var(--gold)', color: 'var(--green)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 700 }}>
            {mijoz?.ism?.[0]?.toUpperCase() || <Icon name="user" size={26} color="var(--green)" />}
          </div>
          <div>
            <div style={{ color: 'var(--cream)', fontSize: 20, fontWeight: 700 }}>{mijoz?.ism}</div>
            <div style={{ color: '#9FBDB0', fontSize: 13, marginTop: 2 }}>{mijoz?.telefon}{mijoz?.email ? ` · ${mijoz.email}` : ''}</div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 600, margin: '0 auto', padding: '0 16px' }}>
        {/* Statistika kartalari */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginTop: -16 }}>
          {[
            { l: 'Ballar', v: mijoz?.ballar ?? 0, ic: 'gift', c: 'var(--gold)' },
            { l: 'Buyurtma', v: jamiBuyurtma, ic: 'receipt', c: 'var(--green)' },
            { l: 'Sarflangan', v: `${Math.round(jamiSarf / 1000)}K`, ic: 'cash', c: 'var(--green)' },
          ].map(({ l, v, ic, c }) => (
            <div key={l} style={{ background: '#fff', borderRadius: 14, border: '1px solid var(--line)', padding: '14px 8px', textAlign: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'flex', justifyContent: 'center' }}><Icon name={ic} size={20} color={c} /></div>
              <div style={{ fontSize: 20, fontWeight: 700, color: c, marginTop: 4 }}>{v}</div>
              <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{l}</div>
            </div>
          ))}
        </div>

        {/* Ballar haqida */}
        <div style={{ background: 'var(--amber-soft)', border: '1px solid var(--gold)', borderRadius: 12, padding: '12px 14px', fontSize: 13, color: '#854F0B', marginTop: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Icon name="gift" size={18} color="#854F0B" style={{ flexShrink: 0 }} />
          <span>Har <b>10 000 so'm</b> to'lov uchun <b>1 ball</b>. Ballarni keyingi buyurtmalarda chegirmaga almashtirasiz.</span>
        </div>

        {/* Buyurtmalar tarixi */}
        <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--green)', margin: '20px 4px 12px' }}>Buyurtmalar tarixi</div>

        {isLoading && <div style={{ textAlign: 'center', padding: 30, color: 'var(--muted)' }}>Yuklanmoqda...</div>}

        {!isLoading && buyurtmalar.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--muted)' }}>
            <div style={{ display: 'flex', justifyContent: 'center' }}><Icon name="receipt" size={46} color="var(--line)" /></div>
            <div style={{ marginTop: 10 }}>Hali buyurtma bermagansiz</div>
            <button onClick={() => navigate('/')} style={{ marginTop: 14, background: 'var(--green)', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 20px', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Menyuni ochish</button>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {buyurtmalar.map((b) => {
            const h = HOLAT[b.holat] || HOLAT.yangi;
            return (
              <div key={b.id} style={{ background: '#fff', borderRadius: 16, border: '1px solid var(--line)', padding: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)' }}>#{b.raqam.split('-').pop()}</span>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 20, background: h.bg, color: h.c }}>{h.l}</span>
                      {b.tolovHolati === 'tolandi' && <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 20, background: '#E1F5EE', color: '#0F4D3C', display: 'inline-flex', alignItems: 'center', gap: 4 }}><Icon name="checkCircle" size={12} color="#0F4D3C" /> To'langan</span>}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>{sana(b.yaratilganVaqt)}</div>
                  </div>
                  <div style={{ fontWeight: 700, color: 'var(--green)', fontSize: 15 }}>{b.jamiSumma.toLocaleString()} so'm</div>
                </div>

                <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 12, lineHeight: 1.5 }}>
                  {b.items.map((it) => `${it.mahsulotNomi} ×${it.miqdori}`).join(' · ')}
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => navigate(`/buyurtma/${b.raqam}`)} style={{ flex: 1, background: 'var(--cream)', color: 'var(--green)', border: '1px solid var(--line)', borderRadius: 10, padding: '9px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Holatini ko'rish</button>
                  <button onClick={() => qaytaBuyurtma(b)} style={{ flex: 1, background: 'var(--green)', color: '#fff', border: 'none', borderRadius: 10, padding: '9px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}><Icon name="refresh" size={15} color="#fff" /> Qayta buyurtma</button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
