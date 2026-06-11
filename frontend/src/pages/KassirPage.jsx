import { useEffect, useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { io } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/client';
import { useAuth } from '../hooks/useAuth';
import Chek from '../components/Chek';
import Icon from '../components/Icon';

const HOLAT_CONFIG = {
  yangi:          { label: 'Yangi',           bg: '#E1F5EE', color: '#0F6E56', border: '#B2DFDB', dot: '#0F6E56' },
  qabul:          { label: 'Qabul qilindi',   bg: '#FAEEDA', color: '#854F0B', border: '#E8C97A', dot: '#854F0B' },
  tayyorlanmoqda: { label: 'Tayyorlanmoqda',  bg: '#FAEEDA', color: '#854F0B', border: '#E8C97A', dot: '#E8C97A' },
  tayyor:         { label: 'Tayyor!',          bg: '#E1F5EE', color: '#0F4D3C', border: '#0F4D3C', dot: '#0F4D3C' },
  berildi:        { label: 'Berildi',          bg: '#F3F0E8', color: '#888780', border: '#E0D8C8', dot: '#888780' },
  rad:            { label: 'Rad etildi',       bg: '#FCEBEB', color: '#A32D2D', border: '#F5C6C6', dot: '#A32D2D' },
};

const KEYINGI = { yangi: 'qabul', qabul: 'tayyorlanmoqda', tayyorlanmoqda: 'tayyor', tayyor: 'berildi' };
const KEYINGI_LABEL = { yangi: 'Qabul qilish', qabul: 'Tayyorlashga', tayyorlanmoqda: 'Tayyor', tayyor: 'Berildi' };
const TUR_ICON = { stol: 'dineIn', yetkazib_berish: 'delivery', olib_ketish: 'takeaway' };

const FILTRLAR = [
  { v: 'faol', l: 'Faol' },
  { v: 'yangi', l: 'Yangilar' },
  { v: 'tayyor', l: 'Tayyor' },
  { v: 'hammasi', l: 'Hammasi' },
];

function vaqtFarqi(vaqt) {
  const m = Math.floor((Date.now() - new Date(vaqt)) / 60000);
  if (m < 1) return 'Hozir';
  if (m < 60) return `${m} daq oldin`;
  return `${Math.floor(m / 60)} soat oldin`;
}

export default function KassirPage() {
  const { user, token, chiqish } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [filtr, setFiltr] = useState('faol');
  const [chekOrder, setChekOrder] = useState(null);

  const { data: buyurtmalar = [], isFetching } = useQuery({
    queryKey: ['orders-kassir'],
    queryFn: () => api.get('/orders').then((r) => r.data),
    refetchInterval: 30000,
  });

  const { mutate: holatOzgartir } = useMutation({
    mutationFn: ({ id, holat }) => api.patch(`/orders/${id}/holat`, { holat }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['orders-kassir'] }),
    onError: () => toast.error('Xatolik'),
  });

  useEffect(() => {
    // Token bilan ulanish — server "kassir" xonasiga qo'shadi
    const socket = io('/', { auth: { token } });

    socket.on('connect_error', (err) => {
      console.warn('Socket ulanish xatosi:', err.message);
    });

    socket.on('yangi_buyurtma', (order) => {
      toast.success(`Yangi buyurtma! #${order.raqam.split('-').pop()}`, {
        duration: 8000,
        icon: <Icon name="bell" size={20} color="var(--green)" />,
      });
      qc.invalidateQueries({ queryKey: ['orders-kassir'] });
    });

    socket.on('buyurtma_yangilandi', () => {
      qc.invalidateQueries({ queryKey: ['orders-kassir'] });
    });

    socket.on('yangi_bron', (bron) => {
      toast(`Yangi bron: ${bron.mijozIsmi} — ${bron.vaqt}`, {
        duration: 6000,
        icon: <Icon name="dineIn" size={20} color="var(--green)" />,
      });
    });

    return () => socket.disconnect();
  }, [token, qc]);

  const yangiSon = buyurtmalar.filter((b) => b.holat === 'yangi').length;
  const tayyor = buyurtmalar.filter((b) => b.holat === 'tayyor').length;

  const filtrlangan = buyurtmalar.filter((b) => {
    if (filtr === 'faol') return !['berildi', 'rad'].includes(b.holat);
    if (filtr === 'yangi') return b.holat === 'yangi';
    if (filtr === 'tayyor') return b.holat === 'tayyor';
    return true;
  }).sort((a, b) => new Date(b.yaratilganVaqt) - new Date(a.yaratilganVaqt));

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)' }}>
      {/* Header */}
      <div style={{ background: 'var(--green)', padding: '16px 20px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <div style={{ color: 'var(--cream)', fontSize: 20, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}><Icon name="chef" size={22} color="var(--gold)" /> Kassir</div>
            <div style={{ color: '#9FBDB0', fontSize: 12, marginTop: 2 }}>{user?.login}</div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {yangiSon > 0 && (
              <div style={{ position: 'relative', display: 'flex' }}>
                <Icon name="bell" size={22} color="var(--cream)" />
                <span style={{
                  position: 'absolute', top: -6, right: -6, background: '#E8C97A', color: 'var(--green)',
                  fontSize: 11, fontWeight: 700, width: 18, height: 18, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>{yangiSon}</span>
              </div>
            )}
            <button onClick={() => qc.invalidateQueries({ queryKey: ['orders-kassir'] })} style={{
              background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 10,
              padding: '7px 10px', cursor: 'pointer', color: '#fff', fontSize: 14,
            }}>↻{isFetching ? ' ...' : ''}</button>
            <button onClick={() => { chiqish(); navigate('/login'); }} style={{
              background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 10,
              padding: '7px 10px', cursor: 'pointer', color: '#fff', fontSize: 13, fontFamily: 'inherit',
            }}>Chiqish</button>
          </div>
        </div>

        {/* Statistika */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 16 }}>
          {[
            { l: 'Yangi', v: yangiSon, c: 'var(--gold)' },
            { l: 'Tayyor', v: tayyor, c: '#9FBDB0' },
            { l: 'Faol', v: filtrlangan.length, c: 'var(--cream)' },
          ].map(({ l, v, c }) => (
            <div key={l} style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: '10px 14px', textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: c }}>{v}</div>
              <div style={{ fontSize: 11, color: '#9FBDB0', marginTop: 2 }}>{l}</div>
            </div>
          ))}
        </div>

        {/* Filtrlar tabs */}
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 12 }}>
          {FILTRLAR.map(({ v, l }) => (
            <button key={v} onClick={() => setFiltr(v)} style={{
              padding: '7px 16px', borderRadius: 20, fontSize: 13, fontWeight: 600, cursor: 'pointer',
              whiteSpace: 'nowrap', fontFamily: 'inherit', border: 'none',
              background: filtr === v ? 'var(--gold)' : 'rgba(255,255,255,0.15)',
              color: filtr === v ? 'var(--green)' : '#9FBDB0',
            }}>{l}</button>
          ))}
        </div>
      </div>

      {/* Buyurtmalar */}
      <div style={{ padding: '16px 16px 40px', maxWidth: 680, margin: '0 auto' }}>
        {filtrlangan.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'center' }}><Icon name="bell" size={52} color="var(--line)" /></div>
            <div style={{ color: 'var(--muted)', marginTop: 12, fontWeight: 500 }}>Buyurtma yo'q</div>
            <div style={{ color: 'var(--muted)', fontSize: 13, marginTop: 4 }}>Yangi buyurtma kelganda shu yerda ko'rinadi</div>
          </div>
        )}

        {filtrlangan.map((b) => {
          const hc = HOLAT_CONFIG[b.holat] || HOLAT_CONFIG.yangi;
          const yangi = b.holat === 'yangi';
          return (
            <div key={b.id} style={{
              background: '#fff', borderRadius: 16, border: `1px solid var(--line)`,
              borderLeft: `4px solid ${hc.dot}`, marginBottom: 12, overflow: 'hidden',
              boxShadow: yangi ? '0 2px 16px rgba(15,77,60,0.10)' : 'none',
            }}>
              <div style={{ padding: '16px 16px 14px' }}>
                {/* Sarlavha */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 17, fontWeight: 700, color: 'var(--ink)' }}>#{b.raqam.split('-').pop()}</span>
                      <span style={{
                        fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 20,
                        background: hc.bg, color: hc.color, border: `1px solid ${hc.border}`,
                      }}>{hc.label}</span>
                      {b.tolovHolati === 'tolandi' && (
                        <span style={{ fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: '#E1F5EE', color: '#0F4D3C', border: '1px solid #B2DFDB', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <Icon name="checkCircle" size={12} color="#0F4D3C" /> To'landi
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap' }}>
                      <span>{b.mijozIsmi || "Noma'lum"}</span>
                      {b.customer && <span style={{ color: 'var(--green)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 3 }}>· <Icon name="gift" size={12} color="var(--green)" /> {b.customer.ballar}</span>}
                      <span>·</span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <Icon name={TUR_ICON[b.tur] || 'takeaway'} size={14} color="var(--muted)" />
                        {b.tur === 'stol' ? `Stol ${b.table?.raqam || '?'}` : b.tur === 'yetkazib_berish' ? 'Yetkazish' : 'Olib ketish'}
                      </span>
                    </div>
                    {b.mijozTelefon && <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{b.mijozTelefon}</div>}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 700, color: 'var(--green)', fontSize: 15 }}>{b.jamiSumma.toLocaleString()}</div>
                    <div style={{ fontSize: 12, color: 'var(--muted)' }}>{vaqtFarqi(b.yaratilganVaqt)}</div>
                  </div>
                </div>

                {/* Mahsulotlar */}
                <div style={{ background: 'var(--cream)', borderRadius: 10, padding: '10px 12px', marginBottom: 10 }}>
                  {b.items.map((item) => (
                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '3px 0' }}>
                      <span style={{ color: 'var(--ink)' }}>{item.mahsulotNomi} <span style={{ color: 'var(--muted)' }}>×{item.miqdori}</span></span>
                      <span style={{ color: 'var(--muted)' }}>{(item.narx * item.miqdori).toLocaleString()} so'm</span>
                    </div>
                  ))}
                </div>

                {b.izoh && (
                  <div style={{ background: 'var(--amber-soft)', border: '1px solid var(--gold)', borderRadius: 10, padding: '8px 12px', fontSize: 13, color: '#854F0B', marginBottom: 10 }}>
                    <strong>Izoh:</strong> {b.izoh}
                  </div>
                )}

                {b.manzil && (
                  <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 5 }}><Icon name="pin" size={13} color="var(--muted)" /> {b.manzil}</div>
                )}

                {/* Tugmalar */}
                <div style={{ display: 'flex', gap: 8 }}>
                  {KEYINGI[b.holat] && (
                    <button onClick={() => holatOzgartir({ id: b.id, holat: KEYINGI[b.holat] })} style={{
                      flex: 1, background: 'var(--green)', color: '#fff', border: 'none',
                      borderRadius: 10, padding: '11px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                    }}>{KEYINGI_LABEL[b.holat]}</button>
                  )}
                  {b.holat === 'yangi' && (
                    <button onClick={() => holatOzgartir({ id: b.id, holat: 'rad' })} style={{
                      background: 'var(--red-soft)', color: 'var(--red)', border: '1px solid #F5C6C6',
                      borderRadius: 10, padding: '11px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                    }}>Rad</button>
                  )}
                  <button onClick={() => setChekOrder(b)} title="Chek chop etish" style={{
                    background: '#fff', color: 'var(--green)', border: '1px solid var(--line)',
                    borderRadius: 10, padding: '11px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                    display: 'flex', alignItems: 'center', gap: 6,
                  }}><Icon name="printer" size={15} color="var(--green)" /> Chek</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {chekOrder && <Chek buyurtma={chekOrder} onYopish={() => setChekOrder(null)} />}
    </div>
  );
}
