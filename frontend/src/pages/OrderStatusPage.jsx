import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { io } from 'socket.io-client';
import api from '../api/client';
import TolovModal from '../components/TolovModal';
import Icon from '../components/Icon';

const HOLATLAR = {
  yangi:          { label: 'Qabul kutilmoqda',  ic: 'clock',       bg: '#E1F5EE', color: '#0F6E56' },
  qabul:          { label: 'Qabul qilindi',     ic: 'checkCircle', bg: '#E1F5EE', color: '#0F4D3C' },
  tayyorlanmoqda: { label: 'Tayyorlanmoqda...', ic: 'chef',        bg: '#FAEEDA', color: '#854F0B' },
  tayyor:         { label: 'Tayyor! Keling',    ic: 'checkCircle', bg: '#E1F5EE', color: '#0F4D3C' },
  berildi:        { label: 'Berildi',           ic: 'utensils',    bg: '#F3F0E8', color: '#888780' },
  rad:            { label: 'Rad etildi',        ic: 'close',       bg: '#FCEBEB', color: '#A32D2D' },
};

export default function OrderStatusPage() {
  const { raqam } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [tolovOchiq, setTolovOchiq] = useState(false);

  const { data: buyurtma, isLoading } = useQuery({
    queryKey: ['order-holat', raqam],
    queryFn: () => api.get(`/orders/holat/${raqam}`).then((r) => r.data),
    refetchInterval: 15000,
  });

  useEffect(() => {
    const socket = io('/');
    // connect event'dan keyin emit qilamiz — ulanish kafolatlansin
    socket.on('connect', () => {
      socket.emit('buyurtma_xonasiga_kir', raqam);
    });
    socket.on('holat_ozgardi', () => {
      qc.invalidateQueries({ queryKey: ['order-holat', raqam] });
    });
    return () => socket.disconnect();
  }, [raqam, qc]);

  if (isLoading) return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}><div style={{ display: 'flex', justifyContent: 'center' }}><Icon name="utensils" size={52} color="var(--green)" /></div><p style={{ color: 'var(--green)', marginTop: 12 }}>Yuklanmoqda...</p></div>
    </div>
  );

  if (!buyurtma) return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
      <Icon name="search" size={46} color="var(--line)" />
      <p style={{ color: 'var(--muted)' }}>Buyurtma topilmadi</p>
      <button onClick={() => navigate('/')} style={{ background: 'var(--green)', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>Bosh sahifa</button>
    </div>
  );

  const h = HOLATLAR[buyurtma.holat] || HOLATLAR.yangi;
  const tolanmagan = buyurtma.tolovHolati === 'kutilmoqda';

  return (
    <div style={{ background: 'var(--cream)', minHeight: '100vh', paddingBottom: 32 }}>
      <div style={{ background: 'var(--green)', padding: '20px 20px 16px' }}>
        <button onClick={() => navigate('/')} style={{ color: 'var(--gold)', background: 'none', border: 'none', fontSize: 14, cursor: 'pointer', marginBottom: 8, fontFamily: 'inherit' }}>← Menyuga qaytish</button>
        <div style={{ color: 'var(--cream)', fontSize: 22, fontWeight: 600 }}>Buyurtma holati</div>
        <div style={{ color: '#9FBDB0', fontSize: 13, marginTop: 3 }}>#{buyurtma.raqam}</div>
      </div>

      <div style={{ maxWidth: 520, margin: '0 auto', padding: '20px 20px 0' }}>

        {/* Holat */}
        <div style={{ background: h.bg, borderRadius: 18, padding: '32px 24px', textAlign: 'center', marginBottom: 16, border: '1px solid var(--line)' }}>
          <div style={{ display: 'flex', justifyContent: 'center' }}><Icon name={h.ic} size={60} color={h.color} stroke={1.6} /></div>
          <div style={{ fontSize: 22, fontWeight: 700, color: h.color, marginTop: 12 }}>{h.label}</div>
          {buyurtma.mijozIsmi && <div style={{ color: 'var(--muted)', fontSize: 14, marginTop: 6 }}>Assalomu alaykum, {buyurtma.mijozIsmi}!</div>}
        </div>

        {/* To'lov */}
        {tolanmagan && buyurtma.holat !== 'rad' && (
          <div style={{ background: 'var(--green)', borderRadius: 16, padding: '16px 18px', marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ color: 'var(--gold)', fontWeight: 600, fontSize: 16 }}>To'lov qilish</div>
              <div style={{ color: '#9FBDB0', fontSize: 13, marginTop: 2 }}>{buyurtma.jamiSumma.toLocaleString()} so'm</div>
            </div>
            <button onClick={() => setTolovOchiq(true)} style={{
              background: 'var(--gold)', color: 'var(--green)', border: 'none',
              fontWeight: 700, padding: '10px 18px', borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit'
            }}><span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Icon name="card" size={16} color="var(--green)" /> To'lash</span></button>
          </div>
        )}

        {!tolanmagan && (
          <div style={{ background: '#E1F5EE', border: '1px solid #B2DFDB', borderRadius: 14, padding: '14px 18px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
            <Icon name="checkCircle" size={22} color="#0F4D3C" />
            <div>
              <div style={{ fontWeight: 600, color: '#0F4D3C' }}>To'lov amalga oshirildi</div>
              <div style={{ color: '#0F6E56', fontSize: 13 }}>{buyurtma.jamiSumma.toLocaleString()} so'm</div>
            </div>
          </div>
        )}

        {/* Tarkib */}
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid var(--line)', padding: 18, marginBottom: 16 }}>
          <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>Buyurtma tarkibi</div>
          {buyurtma.items.map((item) => (
            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, padding: '6px 0', borderBottom: '1px dashed var(--line)' }}>
              <span>{item.mahsulotNomi} <span style={{ color: 'var(--muted)' }}>×{item.miqdori}</span></span>
              <span style={{ fontWeight: 600 }}>{(item.narx * item.miqdori).toLocaleString()} so'm</span>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, fontWeight: 700, color: 'var(--green)', paddingTop: 10 }}>
            <span>Jami</span><span>{buyurtma.jamiSumma.toLocaleString()} so'm</span>
          </div>
        </div>

        <button onClick={() => navigate('/')} style={{
          width: '100%', background: '#fff', color: 'var(--green)', border: '1px solid var(--green)',
          fontSize: 15, fontWeight: 600, padding: 13, borderRadius: 12, cursor: 'pointer', fontFamily: 'inherit'
        }}><span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, justifyContent: 'center' }}><Icon name="plus" size={16} color="var(--green)" /> Yana buyurtma berish</span></button>
      </div>

      {tolovOchiq && (
        <TolovModal
          summa={buyurtma.jamiSumma}
          orderId={buyurtma.id}
          onYopish={() => setTolovOchiq(false)}
          onMuvaffaqiyat={() => { setTolovOchiq(false); qc.invalidateQueries({ queryKey: ['order-holat', raqam] }); }}
        />
      )}
    </div>
  );
}
