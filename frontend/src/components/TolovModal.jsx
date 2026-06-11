import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import api from '../api/client';
import Chek from './Chek';
import Icon from './Icon';

// DIQQAT: bu faqat KO'RINISH (UI). Haqiqiy karta/to'lov tizimi ulanmagan.
const TOLOV_TURLARI = [
  { id: 'payme', nom: 'Payme', tavsif: 'Bank kartasi orqali', ic: 'card', rang: '#185FA5', karta: true },
  { id: 'click', nom: 'Click', tavsif: 'Click ilovasi orqali', ic: 'card', rang: '#0F4D3C', karta: true },
  { id: 'naqd', nom: 'Naqd pul', tavsif: 'Kassada naqd to\'lash', ic: 'cash', rang: '#854F0B', karta: false },
];

const inp = { width: '100%', padding: '12px 14px', border: '1px solid var(--line)', borderRadius: 10, fontSize: 16, fontFamily: 'inherit', outline: 'none', letterSpacing: 1 };
const lbl = { fontSize: 12, color: 'var(--muted)', display: 'block', marginBottom: 5 };

// Formatlash yordamchilari
function kartaFormat(v) {
  return v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
}
function muddatFormat(v) {
  const d = v.replace(/\D/g, '').slice(0, 4);
  return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
}

export default function TolovModal({ summa, orderId, onYopish, onMuvaffaqiyat }) {
  const [tanlangan, setTanlangan] = useState(null);
  const [bosqich, setBosqich] = useState('tanlash'); // tanlash | karta | jarayon | chek
  const [karta, setKarta] = useState({ raqam: '', muddat: '', cvv: '', egasi: '' });
  const [chekBuyurtma, setChekBuyurtma] = useState(null);

  const { mutate: tolovYuborish, isPending } = useMutation({
    mutationFn: (tur) => api.patch(`/orders/${orderId}/tolov`, { tolovTuri: tur }),
    onSuccess: (res) => {
      // To'lov muvaffaqiyatli — chekni avtomatik ko'rsatamiz
      setChekBuyurtma(res.data);
      setBosqich('chek');
    },
    onError: (err) => {
      alert(err.response?.data?.xato || 'To\'lovda xatolik');
      setBosqich(tanlangan === 'naqd' ? 'tanlash' : 'karta');
    },
  });

  const tanlanganTur = TOLOV_TURLARI.find((t) => t.id === tanlangan);

  function davomEtish() {
    if (!tanlangan) return;
    if (tanlanganTur.karta) setBosqich('karta');
    else { setBosqich('jarayon'); setTimeout(() => tolovYuborish('naqd'), 1200); }
  }

  function kartaTolov(e) {
    e.preventDefault();
    setBosqich('jarayon');
    setTimeout(() => tolovYuborish(tanlangan), 1800);
  }

  // To'lovdan keyin chek
  if (bosqich === 'chek') {
    return <Chek buyurtma={chekBuyurtma} onYopish={() => onMuvaffaqiyat?.()} />;
  }

  const kartaToldi = karta.raqam.replace(/\s/g, '').length >= 16 && karta.muddat.length === 5 && karta.cvv.length === 3;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(10,30,24,0.55)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 50 }}
      onClick={(e) => bosqich === 'tanlash' && e.target === e.currentTarget && onYopish()}>
      <div className="slide-up" style={{ background: '#fff', borderRadius: '20px 20px 0 0', maxWidth: 420, width: '100%', padding: '24px 20px 32px', maxHeight: '92vh', overflowY: 'auto' }}>

        {/* Jarayon */}
        {bosqich === 'jarayon' && (
          <div style={{ textAlign: 'center', padding: '36px 0' }}>
            <div style={{ width: 54, height: 54, border: '4px solid var(--green-soft)', borderTopColor: 'var(--green)', borderRadius: '50%', margin: '0 auto 18px', animation: 'spin 0.8s linear infinite' }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--green)' }}>To'lov amalga oshirilmoqda...</div>
            <div style={{ color: 'var(--muted)', marginTop: 6, fontSize: 13 }}>Iltimos kuting</div>
          </div>
        )}

        {/* Karta to'lovi (namuna) */}
        {bosqich === 'karta' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <button onClick={() => setBosqich('tanlash')} style={{ color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14 }}>← Orqaga</button>
              <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--green)', display: 'flex', alignItems: 'center', gap: 7 }}><Icon name={tanlanganTur.ic} size={18} color="var(--green)" /> {tanlanganTur.nom}</div>
              <div style={{ width: 50 }} />
            </div>

            {/* Jonli karta ko'rinishi */}
            <div style={{
              background: tanlangan === 'payme' ? 'linear-gradient(135deg,#185FA5,#0D3D70)' : 'linear-gradient(135deg,#0F4D3C,#0A3A2D)',
              borderRadius: 16, padding: 20, color: '#fff', marginBottom: 18, boxShadow: '0 8px 24px rgba(0,0,0,0.18)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                <div style={{ width: 38, height: 28, background: 'var(--gold)', borderRadius: 6, opacity: 0.9 }} />
                <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: 1, opacity: 0.85 }}>{tanlanganTur.nom.toUpperCase()}</div>
              </div>
              <div style={{ fontSize: 20, fontFamily: 'monospace', letterSpacing: 3 }}>
                {karta.raqam || '•••• •••• •••• ••••'}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16 }}>
                <div><div style={{ fontSize: 10, opacity: 0.7 }}>KARTA EGASI</div><div style={{ fontWeight: 600, fontSize: 13 }}>{karta.egasi.toUpperCase() || 'ISM FAMILIYA'}</div></div>
                <div><div style={{ fontSize: 10, opacity: 0.7 }}>MUDDAT</div><div style={{ fontWeight: 600, fontSize: 13 }}>{karta.muddat || 'MM/YY'}</div></div>
              </div>
            </div>

            <form onSubmit={kartaTolov}>
              <div style={{ marginBottom: 12 }}><label style={lbl}>Karta raqami</label>
                <input style={inp} inputMode="numeric" placeholder="0000 0000 0000 0000" value={karta.raqam}
                  onChange={(e) => setKarta({ ...karta, raqam: kartaFormat(e.target.value) })} /></div>
              <div style={{ marginBottom: 12 }}><label style={lbl}>Karta egasi</label>
                <input style={{ ...inp, letterSpacing: 0 }} placeholder="ISM FAMILIYA" value={karta.egasi}
                  onChange={(e) => setKarta({ ...karta, egasi: e.target.value })} /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                <div><label style={lbl}>Amal muddati</label>
                  <input style={inp} inputMode="numeric" placeholder="MM/YY" value={karta.muddat}
                    onChange={(e) => setKarta({ ...karta, muddat: muddatFormat(e.target.value) })} /></div>
                <div><label style={lbl}>CVV</label>
                  <input style={inp} inputMode="numeric" type="password" placeholder="•••" maxLength={3} value={karta.cvv}
                    onChange={(e) => setKarta({ ...karta, cvv: e.target.value.replace(/\D/g, '').slice(0, 3) })} /></div>
              </div>
              <button type="submit" disabled={!kartaToldi || isPending} style={{
                width: '100%', background: tanlangan === 'payme' ? '#185FA5' : 'var(--green)',
                color: '#fff', border: 'none', fontSize: 15, fontWeight: 600, padding: 15, borderRadius: 12,
                cursor: kartaToldi ? 'pointer' : 'not-allowed', opacity: kartaToldi ? 1 : 0.5, fontFamily: 'inherit'
              }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
                  <Icon name="lock" size={16} color="#fff" /> {summa.toLocaleString()} so'm to'lash
                </span>
              </button>
              <div style={{ textAlign: 'center', fontSize: 11, color: 'var(--muted)', marginTop: 10, display: 'flex', alignItems: 'center', gap: 5, justifyContent: 'center' }}>
                <Icon name="lock" size={12} color="var(--muted)" /> Namuna rejimi — haqiqiy pul yechilmaydi
              </div>
            </form>
          </>
        )}

        {/* To'lov turini tanlash */}
        {bosqich === 'tanlash' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--green)' }}>To'lov usulini tanlang</div>
              <button onClick={onYopish} style={{ color: 'var(--muted)', fontSize: 24, background: 'none', border: 'none', cursor: 'pointer', lineHeight: 1 }}>×</button>
            </div>
            <div style={{ background: 'var(--green-soft)', borderRadius: 14, padding: '14px 18px', textAlign: 'center', marginBottom: 20 }}>
              <div style={{ color: 'var(--muted)', fontSize: 13 }}>To'lov miqdori</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--green)', marginTop: 4 }}>{summa.toLocaleString()} so'm</div>
            </div>

            {/* Karta / Naqd guruhlari */}
            <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}><Icon name="card" size={13} color="var(--muted)" /> Karta orqali</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
              {TOLOV_TURLARI.filter((t) => t.karta).map((t) => <Usul key={t.id} t={t} tanlangan={tanlangan} setTanlangan={setTanlangan} />)}
            </div>
            <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}><Icon name="cash" size={13} color="var(--muted)" /> Naqd</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
              {TOLOV_TURLARI.filter((t) => !t.karta).map((t) => <Usul key={t.id} t={t} tanlangan={tanlangan} setTanlangan={setTanlangan} />)}
            </div>

            <button onClick={davomEtish} disabled={!tanlangan || isPending} style={{
              width: '100%', background: 'var(--green)', color: '#fff', border: 'none',
              fontSize: 15, fontWeight: 600, padding: 15, borderRadius: 12, cursor: tanlangan ? 'pointer' : 'not-allowed', opacity: tanlangan ? 1 : 0.4, fontFamily: 'inherit'
            }}>{isPending ? 'Kuting...' : 'Davom etish →'}</button>
          </>
        )}
      </div>
    </div>
  );
}

function Usul({ t, tanlangan, setTanlangan }) {
  const aktiv = tanlangan === t.id;
  return (
    <button onClick={() => setTanlangan(t.id)} style={{
      display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', borderRadius: 14, cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
      background: aktiv ? 'var(--green-soft)' : '#fff', border: `2px solid ${aktiv ? 'var(--green)' : 'var(--line)'}`,
    }}>
      <div style={{ width: 44, height: 44, borderRadius: 12, background: t.rang, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name={t.ic} size={22} color="#fff" /></div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600, color: 'var(--ink)' }}>{t.nom}</div>
        <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 2 }}>{t.tavsif}</div>
      </div>
      <div style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${aktiv ? 'var(--green)' : 'var(--line)'}`, background: aktiv ? 'var(--green)' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {aktiv && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#fff' }} />}
      </div>
    </button>
  );
}
