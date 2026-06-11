import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../api/client';
import Icon from '../components/Icon';

const inp = {
  width: '100%', padding: '12px 14px', border: '1px solid var(--line)',
  borderRadius: 12, fontSize: 14, fontFamily: 'inherit', background: '#fff',
  outline: 'none', boxSizing: 'border-box',
};

const VAQTLAR = ['12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00','21:00','22:00'];

export default function BronPage() {
  const navigate = useNavigate();
  const [muvaffaqiyat, setMuvaffaqiyat] = useState(false);
  const [forma, setForma] = useState({ tableId: '', mijozIsmi: '', telefon: '', sana: '', vaqt: '', kishiSoni: '2', izoh: '' });

  const { data: stollar = [] } = useQuery({
    queryKey: ['tables'],
    queryFn: () => api.get('/tables').then((r) => r.data),
  });

  const { mutate: bronYuborish, isPending } = useMutation({
    mutationFn: () => api.post('/bookings', forma),
    onSuccess: () => setMuvaffaqiyat(true),
    onError: () => toast.error('Xatolik yuz berdi'),
  });

  const o = (k) => (e) => setForma({ ...forma, [k]: e.target.value });
  const minSana = new Date().toISOString().split('T')[0];
  const maxSana = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];

  if (muvaffaqiyat) return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: '#fff', borderRadius: 24, padding: '40px 28px', textAlign: 'center', maxWidth: 380, width: '100%', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
        <div style={{ width: 72, height: 72, background: 'var(--green-soft)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <Icon name="checkCircle" size={38} color="var(--green)" />
        </div>
        <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--green)', marginBottom: 10 }}>Bron qilindi!</div>
        <div style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.6, marginBottom: 8 }}>
          <strong>{forma.sana}</strong> kuni soat <strong>{forma.vaqt}</strong> da
        </div>
        <div style={{ color: 'var(--muted)', fontSize: 14, marginBottom: 28 }}>
          {forma.kishiSoni} kishi uchun joy band qilindi. Tez orada administrator siz bilan bog'lanadi.
        </div>
        <button onClick={() => navigate('/')} style={{
          width: '100%', background: 'var(--green)', color: '#fff', border: 'none',
          borderRadius: 12, padding: 13, fontSize: 14, fontWeight: 600, cursor: 'pointer', marginBottom: 10, fontFamily: 'inherit',
        }}>Bosh sahifa</button>
        <button onClick={() => { setMuvaffaqiyat(false); setForma({ tableId: '', mijozIsmi: '', telefon: '', sana: '', vaqt: '', kishiSoni: '2', izoh: '' }); }} style={{
          width: '100%', background: 'none', color: 'var(--muted)', border: '1px solid var(--line)',
          borderRadius: 12, padding: 13, fontSize: 14, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
        }}>Yana bron qilish</button>
      </div>
    </div>
  );

  return (
    <div style={{ background: 'var(--cream)', minHeight: '100vh', paddingBottom: 40 }}>
      {/* Header */}
      <div style={{ background: 'var(--green)', padding: '20px 20px 16px' }}>
        <button onClick={() => navigate(-1)} style={{ color: 'var(--gold)', background: 'none', border: 'none', fontSize: 14, cursor: 'pointer', marginBottom: 8, fontFamily: 'inherit' }}>← Orqaga</button>
        <div style={{ color: 'var(--cream)', fontSize: 22, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 9 }}><Icon name="dineIn" size={22} color="var(--gold)" /> Stol bron qilish</div>
        <div style={{ color: '#9FBDB0', fontSize: 13, marginTop: 4 }}>Oldindan joy band qilib qo'ying</div>
      </div>

      <div style={{ maxWidth: 520, margin: '0 auto', padding: '20px 20px 0' }}>

        {/* Sana va vaqt */}
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid var(--line)', padding: 18, marginBottom: 14 }}>
          <div style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}><Icon name="calendar" size={14} color="var(--muted)" /> Sana va vaqt</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>Sana</label>
              <input type="date" value={forma.sana} onChange={o('sana')} min={minSana} max={maxSana} style={inp} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>Vaqt</label>
              <select value={forma.vaqt} onChange={o('vaqt')} style={inp}>
                <option value="">Tanlang</option>
                {VAQTLAR.map((v) => <option key={v}>{v}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Kishilar soni */}
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid var(--line)', padding: 18, marginBottom: 14 }}>
          <div style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}><Icon name="users" size={14} color="var(--muted)" /> Necha kishi?</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
            {[1,2,3,4,5,6,7,8,9,10].map((n) => (
              <button key={n} onClick={() => setForma({ ...forma, kishiSoni: String(n) })} style={{
                padding: '11px 0', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                background: forma.kishiSoni === String(n) ? 'var(--green)' : 'var(--cream)',
                color: forma.kishiSoni === String(n) ? '#fff' : 'var(--ink)',
                border: `1px solid ${forma.kishiSoni === String(n) ? 'var(--green)' : 'var(--line)'}`,
              }}>{n}</button>
            ))}
          </div>
        </div>

        {/* Stol tanlash */}
        {stollar.length > 0 && (
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid var(--line)', padding: 18, marginBottom: 14 }}>
            <div style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}><Icon name="dineIn" size={14} color="var(--muted)" /> Stol (ixtiyoriy)</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
              <button onClick={() => setForma({ ...forma, tableId: '' })} style={{
                padding: '10px 0', borderRadius: 10, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                background: !forma.tableId ? 'var(--green)' : 'var(--cream)',
                color: !forma.tableId ? '#fff' : 'var(--muted)',
                border: `1px solid ${!forma.tableId ? 'var(--green)' : 'var(--line)'}`,
              }}>Farq yo'q</button>
              {stollar.map((s) => (
                <button key={s.id} onClick={() => setForma({ ...forma, tableId: String(s.id) })} style={{
                  padding: '8px 0', borderRadius: 10, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                  background: forma.tableId === String(s.id) ? 'var(--green)' : 'var(--cream)',
                  color: forma.tableId === String(s.id) ? '#fff' : 'var(--ink)',
                  border: `1px solid ${forma.tableId === String(s.id) ? 'var(--green)' : 'var(--line)'}`,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                }}>
                  <span>#{s.raqam}</span>
                  <span style={{ fontSize: 11, opacity: 0.75 }}>{s.sigim} kishi</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Aloqa ma'lumotlari */}
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid var(--line)', padding: 18, marginBottom: 20 }}>
          <div style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}><Icon name="clipboard" size={14} color="var(--muted)" /> Aloqa ma'lumotlari</div>
          <div style={{ marginBottom: 10 }}><label style={{ fontSize: 12, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>Ismingiz *</label><input style={inp} placeholder="Ismingiz" value={forma.mijozIsmi} onChange={o('mijozIsmi')} /></div>
          <div style={{ marginBottom: 10 }}><label style={{ fontSize: 12, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>Telefon *</label><input style={inp} placeholder="+998 90 123 45 67" type="tel" value={forma.telefon} onChange={o('telefon')} /></div>
          <div><label style={{ fontSize: 12, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>Izoh (ixtiyoriy)</label><textarea style={{ ...inp, resize: 'none' }} rows={2} placeholder="Tug'ilgan kun, maxsus so'rov..." value={forma.izoh} onChange={o('izoh')} /></div>
        </div>

        <button onClick={() => bronYuborish()} disabled={isPending || !forma.mijozIsmi || !forma.telefon || !forma.sana || !forma.vaqt} style={{
          width: '100%', background: 'var(--green)', color: '#fff', border: 'none',
          borderRadius: 12, padding: 14, fontSize: 15, fontWeight: 600, cursor: 'pointer',
          opacity: (!forma.mijozIsmi || !forma.telefon || !forma.sana || !forma.vaqt) ? 0.4 : 1,
          fontFamily: 'inherit', boxShadow: '0 4px 14px rgba(15,77,60,0.25)',
        }}>{isPending ? 'Yuborilmoqda...' : (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}><Icon name="dineIn" size={17} color="#fff" /> Bron qilish</span>
        )}</button>
      </div>
    </div>
  );
}
