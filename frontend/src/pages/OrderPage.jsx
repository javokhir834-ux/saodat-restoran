import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../api/client';
import { useCart } from '../stores/cart';
import { useMijoz } from '../stores/mijoz';
import Icon from '../components/Icon';

const inp = { width: '100%', padding: '11px 12px', border: '1px solid var(--line)', borderRadius: 10, fontSize: 14, fontFamily: 'inherit', background: '#fff', outline: 'none' };
const lbl = { fontSize: 12, color: 'var(--muted)', display: 'block', marginBottom: 4 };

export default function OrderPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  // Stol raqami: URL'dan yoki QR skanerlashda saqlangan sessiyadan
  const stolRaqam = params.get('stol') || sessionStorage.getItem('saodat_stol');
  const { items, jami, tozala } = useCart();
  const { mijoz, token } = useMijoz();
  const [tur, setTur] = useState(stolRaqam ? 'stol' : 'yetkazib_berish');
  const [forma, setForma] = useState({
    mijozIsmi: mijoz?.ism || '',
    mijozTelefon: mijoz?.telefon ? `+${mijoz.telefon}` : '',
    manzil: '',
    izoh: '',
  });

  // HISOBSIZ BUYURTMA YO'Q — kirmagan bo'lsa darrov ro'yxatdan o'tish sahifasiga
  useEffect(() => {
    if (!token) navigate('/kirish?keyin=/buyurtma', { replace: true });
  }, [token, navigate]);

  // Savat bo'sh bo'lsa menyuga qaytaramiz (stol raqamini saqlagan holda)
  useEffect(() => {
    if (token && items.length === 0) navigate(stolRaqam ? `/?stol=${stolRaqam}` : '/', { replace: true });
  }, [items.length, navigate, stolRaqam, token]);

  // Hisobga kirgach ma'lumotlarni to'ldiramiz (sahifa qayta yuklanmasdan)
  useEffect(() => {
    if (mijoz) {
      setForma((f) => ({
        ...f,
        mijozIsmi: f.mijozIsmi || mijoz.ism || '',
        mijozTelefon: f.mijozTelefon || (mijoz.telefon ? `+${mijoz.telefon}` : ''),
      }));
    }
  }, [mijoz]);

  const { mutate: yuborish, isPending } = useMutation({
    mutationFn: () => api.post('/orders', {
      tur,
      stolRaqam: tur === 'stol' && stolRaqam ? Number(stolRaqam) : undefined,
      ...forma,
      items: items.map((i) => ({ productId: i.id, miqdori: i.miqdori })),
    }),
    onSuccess: (res) => {
      tozala();
      // Mijoz sahifani yopib qaytsa ham buyurtmasini topa oladi
      localStorage.setItem('saodat_oxirgi_buyurtma', res.data.raqam);
      sessionStorage.removeItem('saodat_stol');
      navigate(`/buyurtma/${res.data.raqam}`);
    },
    onError: (err) => toast.error(err.response?.data?.xato || 'Xatolik yuz berdi'),
  });

  if (!token || items.length === 0) return null; // hisobsiz yoki bo'sh savat — sahifa ko'rsatilmaydi
  const o = (k) => (e) => setForma({ ...forma, [k]: e.target.value });

  const telefonTogri = forma.mijozTelefon.replace(/[^\d]/g, '').length >= 9;
  const yuborishMumkin = forma.mijozIsmi.trim() && telefonTogri &&
    (tur !== 'yetkazib_berish' || forma.manzil.trim());

  return (
    <div style={{ background: 'var(--cream)', minHeight: '100vh', paddingBottom: 32 }}>
      {/* Header */}
      <div style={{ background: 'var(--green)', padding: '20px 20px 16px' }}>
        <button onClick={() => navigate(-1)} style={{ color: 'var(--gold)', background: 'none', border: 'none', fontSize: 14, cursor: 'pointer', marginBottom: 8, fontFamily: 'inherit' }}>← Orqaga</button>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ color: 'var(--cream)', fontSize: 22, fontWeight: 600 }}>Buyurtma berish</div>
          {stolRaqam && tur === 'stol' && (
            <span style={{ background: 'var(--gold)', color: 'var(--green)', fontSize: 13, fontWeight: 700, padding: '6px 14px', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Icon name="dineIn" size={15} color="var(--green)" /> Stol {stolRaqam}
            </span>
          )}
        </div>
      </div>

      <div style={{ maxWidth: 520, margin: '0 auto', padding: '20px 20px 0' }}>

        {/* Hisob banneri — bu sahifaga faqat kirgan mijoz tushadi */}
        {mijoz && (
          <div style={{ background: 'var(--green-soft)', border: '1px solid #B2DFDB', borderRadius: 12, padding: '11px 14px', marginBottom: 16, fontSize: 13, color: '#0F4D3C', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Icon name="gift" size={17} color="#0F4D3C" />
            <span>Buyurtma <b>{mijoz.ism}</b> hisobiga saqlanadi va ball yig'asiz</span>
          </div>
        )}

        {/* Tur tanlash */}
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid var(--line)', padding: 18, marginBottom: 16 }}>
          <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>Buyurtma turi</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
            {[
              { v: 'stol', ic: 'dineIn', l: 'Stolda' },
              { v: 'yetkazib_berish', ic: 'delivery', l: 'Yetkazish' },
              { v: 'olib_ketish', ic: 'takeaway', l: 'Olib ketish' },
            ].map(({ v, ic, l }) => (
              <button key={v} onClick={() => setTur(v)} style={{
                padding: '12px 6px', borderRadius: 10, fontSize: 12.5, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                background: tur === v ? 'var(--green)' : '#fff',
                color: tur === v ? 'var(--cream)' : 'var(--muted)',
                border: `1px solid ${tur === v ? 'var(--green)' : 'var(--line)'}`,
              }}>
                <Icon name={ic} size={22} color={tur === v ? 'var(--cream)' : 'var(--muted)'} />
                {l}
              </button>
            ))}
          </div>
          {tur === 'stol' && !stolRaqam && (
            <div style={{ marginTop: 10, fontSize: 12, color: '#854F0B', background: 'var(--amber-soft)', borderRadius: 8, padding: '8px 12px' }}>
              Stoldagi QR kodni skanerlasangiz stol avtomatik biriktiriladi
            </div>
          )}
        </div>

        {/* Ma'lumotlar */}
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid var(--line)', padding: 18, marginBottom: 16 }}>
          <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>Ma'lumotlar</div>
          <div style={{ marginBottom: 10 }}><label style={lbl}>Ismingiz *</label><input style={inp} placeholder="Ismingiz" value={forma.mijozIsmi} onChange={o('mijozIsmi')} /></div>
          <div style={{ marginBottom: 10 }}>
            <label style={lbl}>Telefon *</label>
            <input style={inp} placeholder="+998 90 123 45 67" type="tel" value={forma.mijozTelefon} onChange={o('mijozTelefon')} />
            {forma.mijozTelefon && !telefonTogri && (
              <div style={{ fontSize: 12, color: 'var(--red)', marginTop: 4 }}>Telefon raqami to'liq emas</div>
            )}
          </div>
          {tur === 'yetkazib_berish' && (
            <div style={{ marginBottom: 10 }}><label style={lbl}>Manzil *</label><input style={inp} placeholder="Ko'cha, uy raqami" value={forma.manzil} onChange={o('manzil')} /></div>
          )}
          <div><label style={lbl}>Izoh (ixtiyoriy)</label><textarea style={{ ...inp, resize: 'none' }} rows={2} placeholder="Piyozsiz, achchiqroq..." value={forma.izoh} onChange={o('izoh')} /></div>
        </div>

        {/* Tarkib */}
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid var(--line)', padding: 18, marginBottom: 20 }}>
          <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>Buyurtma tarkibi</div>
          {items.map((item) => (
            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, padding: '6px 0', borderBottom: '1px dashed var(--line)' }}>
              <span>{item.nom} <span style={{ color: 'var(--muted)' }}>×{item.miqdori}</span></span>
              <span style={{ fontWeight: 600 }}>{(item.narx * item.miqdori).toLocaleString()} so'm</span>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, fontWeight: 700, color: 'var(--green)', paddingTop: 10 }}>
            <span>Jami</span><span>{jami.toLocaleString()} so'm</span>
          </div>
        </div>

        <button
          onClick={() => yuborish()}
          disabled={isPending || !yuborishMumkin}
          style={{
            width: '100%', background: 'var(--green)', color: '#fff', border: 'none',
            fontSize: 15, fontWeight: 600, padding: 14, borderRadius: 12, cursor: isPending ? 'wait' : 'pointer',
            opacity: yuborishMumkin ? 1 : 0.4, fontFamily: 'inherit'
          }}
        >{isPending ? 'Yuborilmoqda...' : `Tasdiqlash va yuborish — ${jami.toLocaleString()} so'm`}</button>
      </div>
    </div>
  );
}
