import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../api/client';
import { useAuth } from '../hooks/useAuth';
import Icon from '../components/Icon';

const inp = {
  width: '100%', padding: '10px 12px', border: '1px solid var(--line)',
  borderRadius: 10, fontSize: 14, fontFamily: 'inherit', background: '#fff', outline: 'none', boxSizing: 'border-box',
};

const TABLAR = [
  { v: 'mahsulotlar', l: 'Menyu', ic: 'utensils' },
  { v: 'qoldiq', l: 'Qoldiq', ic: 'box' },
  { v: 'stollar', l: 'Stollar', ic: 'dineIn' },
  { v: 'statistika', l: 'Stat', ic: 'chart' },
];

export default function AdminPage() {
  const { user, chiqish } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [tab, setTab] = useState('mahsulotlar');
  const [stolForma, setStolForma] = useState({ raqam: '', nom: '', sigim: '4' });

  useEffect(() => { if (!user || user.rol !== 'admin') navigate('/login'); }, [user, navigate]);

  const { data: kategoriyalar = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get('/categories').then((r) => r.data),
  });

  const { data: stollar = [] } = useQuery({
    queryKey: ['tables'],
    queryFn: () => api.get('/tables').then((r) => r.data),
  });

  const { data: stats } = useQuery({
    queryKey: ['stats-kunlik'],
    queryFn: () => api.get('/stats/kunlik').then((r) => r.data),
  });

  const { data: topMahsulotlar = [] } = useQuery({
    queryKey: ['top-mahsulotlar'],
    queryFn: () => api.get('/stats/top-mahsulotlar').then((r) => r.data),
    enabled: tab === 'statistika',
  });

  const { mutate: mahsulotOchir } = useMutation({
    mutationFn: (id) => api.delete(`/products/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['categories'] }); toast.success("O'chirildi"); },
  });

  const { mutate: stolQosh, isPending: stolPending } = useMutation({
    mutationFn: () => api.post('/tables', stolForma),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tables'] });
      setStolForma({ raqam: '', nom: '', sigim: '4' });
      toast.success("Stol qo'shildi!");
    },
    onError: () => toast.error("Xatolik — raqam band bo'lishi mumkin"),
  });

  const { mutate: stolOchir } = useMutation({
    mutationFn: (id) => api.delete(`/tables/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['tables'] }); toast.success("O'chirildi"); },
  });

  const { mutate: qoldiqYangilaFn } = useMutation({
    mutationFn: ({ id, qoldiq }) => api.patch(`/products/${id}/qoldiq`, { qoldiq }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['categories'] }),
  });

  const barcha_mahsulotlar = kategoriyalar.flatMap((k) => k.products);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)' }}>
      {/* Header */}
      <div style={{ background: 'var(--green)', padding: '16px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ color: 'var(--cream)', fontSize: 19, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}><Icon name="settings" size={20} color="var(--gold)" /> Admin panel</div>
            <div style={{ color: '#9FBDB0', fontSize: 12, marginTop: 2 }}>{user?.login}</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => navigate('/kassir')} style={{
              background: 'rgba(255,255,255,0.15)', color: 'var(--cream)', border: 'none',
              borderRadius: 10, padding: '7px 12px', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit',
            }}>Kassir</button>
            <button onClick={() => { chiqish(); navigate('/login'); }} style={{
              background: 'rgba(255,255,255,0.15)', color: 'var(--cream)', border: 'none',
              borderRadius: 10, padding: '7px 12px', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit',
            }}>Chiqish</button>
          </div>
        </div>
      </div>

      {/* Tablar */}
      <div style={{ background: '#fff', borderBottom: '1px solid var(--line)', display: 'flex', overflowX: 'auto' }}>
        {TABLAR.map(({ v, l, ic }) => (
          <button key={v} onClick={() => setTab(v)} style={{
            padding: '13px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap',
            background: 'none', border: 'none', fontFamily: 'inherit',
            borderBottom: `2px solid ${tab === v ? 'var(--green)' : 'transparent'}`,
            color: tab === v ? 'var(--green)' : 'var(--muted)',
            display: 'inline-flex', alignItems: 'center', gap: 6,
          }}><Icon name={ic} size={15} color={tab === v ? 'var(--green)' : 'var(--muted)'} /> {l}</button>
        ))}
      </div>

      <div style={{ padding: '16px', maxWidth: 680, margin: '0 auto' }}>

        {/* MAHSULOTLAR */}
        {tab === 'mahsulotlar' && (
          <div>
            <button onClick={() => navigate('/admin/mahsulot/yangi')} style={{
              width: '100%', background: 'var(--green)', color: '#fff', border: 'none',
              borderRadius: 12, padding: 14, fontSize: 14, fontWeight: 600, cursor: 'pointer',
              marginBottom: 16, fontFamily: 'inherit',
            }}>+ Yangi mahsulot qo'shish</button>

            {kategoriyalar.map((kat) => (
              <div key={kat.id} style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
                  {kat.nom} ({kat.products.length})
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {kat.products.map((p) => (
                    <div key={p.id} style={{ background: '#fff', borderRadius: 14, border: '1px solid var(--line)', padding: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 52, height: 52, borderRadius: 10, overflow: 'hidden', flexShrink: 0, background: 'var(--cream)' }}>
                        {p.rasmUrl ? <img src={p.rasmUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> :
                          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="utensils" size={24} color="var(--line)" /></div>}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.nom}</div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--green)', marginTop: 1 }}>{p.narx.toLocaleString()} so'm</div>
                        {p.qoldiq !== null && (
                          <div style={{ fontSize: 12, color: p.qoldiq <= 0 ? 'var(--red)' : '#0F6E56' }}>Qoldiq: {p.qoldiq} {p.birlik}</div>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => navigate(`/admin/mahsulot/${p.id}`)} title="Tahrirlash" style={{
                          width: 34, height: 34, background: '#EEF4FF', color: '#3B82F6', border: 'none', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}><Icon name="edit" size={16} color="#3B82F6" /></button>
                        <button onClick={() => { if (confirm("O'chirasizmi?")) mahsulotOchir(p.id); }} title="O'chirish" style={{
                          width: 34, height: 34, background: 'var(--red-soft)', color: 'var(--red)', border: 'none', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}><Icon name="trash" size={16} color="var(--red)" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* QOLDIQ */}
        {tab === 'qoldiq' && (
          <div>
            <div style={{ background: 'var(--amber-soft)', border: '1px solid var(--gold)', borderRadius: 12, padding: '12px 14px', fontSize: 13, color: '#854F0B', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Icon name="box" size={16} color="#854F0B" style={{ flexShrink: 0 }} />
              <span>Har kuni mahsulotlar qoldiqini kiriting. Tugagan mahsulot menyuda "Tugadi" ko'rinadi.</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {barcha_mahsulotlar.map((p) => (
                <div key={p.id} style={{ background: '#fff', borderRadius: 14, border: '1px solid var(--line)', padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 10, overflow: 'hidden', flexShrink: 0, background: 'var(--cream)' }}>
                    {p.rasmUrl ? <img src={p.rasmUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> :
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="utensils" size={20} color="var(--line)" /></div>}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.nom}</div>
                    <div style={{ fontSize: 12, color: 'var(--muted)' }}>{p.birlik}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input type="number" defaultValue={p.qoldiq ?? ''} placeholder="∞" min="0" style={{ ...inp, width: 70, textAlign: 'center', padding: '8px' }}
                      onBlur={(e) => qoldiqYangilaFn({ id: p.id, qoldiq: e.target.value === '' ? null : Number(e.target.value) })} />
                    <span style={{
                      fontSize: 12, fontWeight: 700, padding: '4px 8px', borderRadius: 8,
                      background: p.qoldiq === null ? '#E1F5EE' : p.qoldiq <= 0 ? 'var(--red-soft)' : p.qoldiq <= 5 ? 'var(--amber-soft)' : '#E1F5EE',
                      color: p.qoldiq === null ? '#0F6E56' : p.qoldiq <= 0 ? 'var(--red)' : p.qoldiq <= 5 ? '#854F0B' : '#0F6E56',
                    }}>{p.qoldiq === null ? '∞' : p.qoldiq <= 0 ? 'Tugadi' : p.qoldiq}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STOLLAR */}
        {tab === 'stollar' && (
          <div>
            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid var(--line)', padding: 16, marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>Yangi stol qo'shish</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 10 }}>
                <div>
                  <label style={{ fontSize: 11, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>Raqam</label>
                  <input type="number" value={stolForma.raqam} onChange={(e) => setStolForma({ ...stolForma, raqam: e.target.value })} style={inp} placeholder="11" />
                </div>
                <div>
                  <label style={{ fontSize: 11, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>Nom</label>
                  <input value={stolForma.nom} onChange={(e) => setStolForma({ ...stolForma, nom: e.target.value })} style={inp} placeholder="VIP" />
                </div>
                <div>
                  <label style={{ fontSize: 11, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>Sig'imi</label>
                  <select value={stolForma.sigim} onChange={(e) => setStolForma({ ...stolForma, sigim: e.target.value })} style={inp}>
                    {[2,4,6,8,10].map((n) => <option key={n}>{n}</option>)}
                  </select>
                </div>
              </div>
              <button onClick={() => stolQosh()} disabled={stolPending || !stolForma.raqam} style={{
                width: '100%', background: 'var(--green)', color: '#fff', border: 'none',
                borderRadius: 10, padding: 11, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                opacity: !stolForma.raqam ? 0.4 : 1, fontFamily: 'inherit',
              }}>+ Qo'shish va QR yaratish</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {stollar.map((s) => (
                <div key={s.id} style={{ background: '#fff', borderRadius: 14, border: '1px solid var(--line)', padding: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div>
                      <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--ink)' }}>#{s.raqam}</div>
                      <div style={{ fontSize: 12, color: 'var(--muted)' }}>{s.nom} • {s.sigim} kishi</div>
                    </div>
                    <button onClick={() => { if (confirm("O'chirasizmi?")) stolOchir(s.id); }} style={{
                      width: 30, height: 30, background: 'var(--red-soft)', color: 'var(--red)', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13,
                    }}>×</button>
                  </div>
                  {s.qrKodUrl && (
                    <div>
                      <img src={s.qrKodUrl} alt={`QR ${s.raqam}`} style={{ width: 72, height: 72, margin: '0 auto', display: 'block', border: '1px solid var(--line)', borderRadius: 8, padding: 4 }} />
                      <a href={s.qrKodUrl} download={`stol_${s.raqam}_qr.png`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, fontSize: 12, color: 'var(--green)', marginTop: 6 }}>
                        <Icon name="download" size={13} color="var(--green)" /> QR yuklab olish
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STATISTIKA */}
        {tab === 'statistika' && (
          <div>
            {stats && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 16 }}>
                {[
                  { l: "Bugungi buyurtma", v: stats.buyurtmaSoni, c: 'var(--green)', bg: 'var(--green-soft)' },
                  { l: "Daromad (so'm)", v: `${(stats.jamiDaromad / 1000).toFixed(0)}K`, c: '#854F0B', bg: 'var(--amber-soft)' },
                  { l: "Yangi buyurtma", v: stats.yangi, c: 'var(--red)', bg: 'var(--red-soft)' },
                ].map(({ l, v, c, bg }) => (
                  <div key={l} style={{ background: bg, borderRadius: 14, padding: '14px 10px', textAlign: 'center' }}>
                    <div style={{ fontSize: 24, fontWeight: 700, color: c }}>{v}</div>
                    <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>{l}</div>
                  </div>
                ))}
              </div>
            )}

            {topMahsulotlar.length > 0 && (
              <div style={{ background: '#fff', borderRadius: 16, border: '1px solid var(--line)', padding: 16 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 7 }}><Icon name="trophy" size={17} color="var(--gold)" /> Top mahsulotlar</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {topMahsulotlar.slice(0, 8).map((item, i) => (
                    <div key={item.productId} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{
                        width: 26, height: 26, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 12, fontWeight: 700,
                        background: i === 0 ? 'var(--gold)' : i === 1 ? '#C0C0C0' : i === 2 ? '#CD7F32' : 'var(--cream)',
                        color: i < 3 ? '#fff' : 'var(--muted)',
                      }}>{i + 1}</span>
                      <span style={{ flex: 1, fontSize: 14, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.mahsulotNomi}</span>
                      <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--green)' }}>{item._sum.miqdori} dona</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {topMahsulotlar.length === 0 && (
              <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--muted)' }}>
                <div style={{ display: 'flex', justifyContent: 'center' }}><Icon name="chart" size={46} color="var(--line)" /></div>
                <div style={{ marginTop: 12 }}>Hali buyurtma yo'q</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
