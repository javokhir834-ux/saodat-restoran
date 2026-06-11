/*
 * Saodat Restoran — mijoz kirishi va ro'yxatdan o'tishi
 * Muallif: Ibrayimov Javohir
 *
 * Ro'yxat ikki bosqich: forma -> emailga kod -> kodni tasdiqlash.
 */
import { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useMijoz } from '../stores/mijoz';
import Icon from '../components/Icon';

const inp = {
  width: '100%', padding: '13px 14px', border: '1px solid var(--line)',
  borderRadius: 12, fontSize: 15, fontFamily: 'inherit', background: '#fff',
  outline: 'none', boxSizing: 'border-box',
};
const lbl = { fontSize: 12, color: 'var(--muted)', display: 'block', marginBottom: 5 };

export default function MijozKirishPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const keyin = params.get('keyin') || '/profil';
  const { kodYubor, kodQayta, tasdiqla, kirish } = useMijoz();

  const [rejim, setRejim] = useState('kirish'); // 'kirish' | 'royxat' | 'tasdiq'
  const [loading, setLoading] = useState(false);
  const [korinsin, setKorinsin] = useState(false);
  const [forma, setForma] = useState({ ism: '', telefon: '', email: '', parol: '', login: '' });

  // Kod bosqichi holati
  const [kodlar, setKodlar] = useState(['', '', '', '', '', '']);
  const [sekund, setSekund] = useState(0); // qayta yuborishgacha
  const kodRef = useRef([]);

  const o = (k) => (e) => setForma({ ...forma, [k]: e.target.value });

  useEffect(() => {
    if (sekund <= 0) return;
    const t = setTimeout(() => setSekund((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [sekund]);

  // === Kirish ===
  async function kirishSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await kirish(forma.login, forma.parol);
      toast.success('Xush kelibsiz!');
      navigate(keyin, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.xato || 'Xatolik yuz berdi');
    } finally { setLoading(false); }
  }

  // === 1-bosqich: kod yuborish ===
  async function kodYuborSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const r = await kodYubor({ ism: forma.ism, telefon: forma.telefon, email: forma.email, parol: forma.parol });
      setRejim('tasdiq');
      setKodlar(['', '', '', '', '', '']);
      setSekund(60);
      setTimeout(() => kodRef.current[0]?.focus(), 100);
      if (r.devKod) toast(`Sinov kodi: ${r.devKod}`, { icon: <Icon name="flash" size={18} color="var(--gold)" />, duration: 8000 });
      else toast.success('Kod emailingizga yuborildi');
    } catch (err) {
      toast.error(err.response?.data?.xato || 'Xatolik yuz berdi');
    } finally { setLoading(false); }
  }

  // === 2-bosqich: tasdiqlash ===
  async function tasdiqlaSubmit(kodMatn) {
    setLoading(true);
    try {
      await tasdiqla(forma.email, kodMatn);
      toast.success('Hisobingiz tasdiqlandi!');
      navigate(keyin, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.xato || 'Kod noto\'g\'ri');
      setKodlar(['', '', '', '', '', '']);
      kodRef.current[0]?.focus();
    } finally { setLoading(false); }
  }

  function kodKirit(i, val) {
    const raqam = val.replace(/\D/g, '').slice(-1);
    const yangi = [...kodlar];
    yangi[i] = raqam;
    setKodlar(yangi);
    if (raqam && i < 5) kodRef.current[i + 1]?.focus();
    if (yangi.every((x) => x !== '')) tasdiqlaSubmit(yangi.join(''));
  }
  function kodKey(i, e) {
    if (e.key === 'Backspace' && !kodlar[i] && i > 0) kodRef.current[i - 1]?.focus();
  }
  function kodPaste(e) {
    const matn = (e.clipboardData.getData('text') || '').replace(/\D/g, '').slice(0, 6);
    if (matn.length) {
      e.preventDefault();
      const yangi = matn.split('').concat(Array(6).fill('')).slice(0, 6);
      setKodlar(yangi);
      if (yangi.every((x) => x !== '')) tasdiqlaSubmit(yangi.join(''));
    }
  }
  async function qaytaYubor() {
    if (sekund > 0) return;
    try {
      const r = await kodQayta(forma.email);
      setSekund(60);
      if (r.devKod) toast(`Sinov kodi: ${r.devKod}`, { icon: <Icon name="flash" size={18} color="var(--gold)" />, duration: 8000 });
      else toast.success('Kod qayta yuborildi');
    } catch (err) { toast.error(err.response?.data?.xato || 'Xatolik'); }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ background: 'var(--green)', padding: '18px 20px 22px' }}>
        <button onClick={() => (rejim === 'tasdiq' ? setRejim('royxat') : navigate('/'))} style={{ color: 'var(--gold)', background: 'none', border: 'none', fontSize: 14, cursor: 'pointer', marginBottom: 14, fontFamily: 'inherit' }}>← {rejim === 'tasdiq' ? 'Orqaga' : 'Menyuga'}</button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 48, height: 48, background: 'rgba(255,255,255,0.12)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="utensils" size={26} color="var(--gold)" /></div>
          <div>
            <div style={{ color: 'var(--cream)', fontSize: 20, fontWeight: 700 }}>Saodat hisobingiz</div>
            <div style={{ color: '#9FBDB0', fontSize: 13, marginTop: 2 }}>Buyurtmalar tarixi, ballar va tezkor buyurtma</div>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'flex-start', padding: '20px' }}>
        <div style={{ maxWidth: 400, width: '100%' }} className="fade-up">

          {/* KOD TASDIQLASH BOSQICHI */}
          {rejim === 'tasdiq' ? (
            <div style={{ background: '#fff', borderRadius: 18, border: '1px solid var(--line)', padding: '26px 22px', boxShadow: '0 4px 24px rgba(0,0,0,0.05)', textAlign: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'center' }}><Icon name="mail" size={40} color="var(--green)" /></div>
              <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--green)', marginTop: 8 }}>Emailni tasdiqlang</div>
              <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 6, marginBottom: 22 }}>
                <b style={{ color: 'var(--ink)' }}>{forma.email}</b> manziliga<br />6 xonali kod yuborildi
              </div>

              <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 18 }} onPaste={kodPaste}>
                {kodlar.map((k, i) => (
                  <input
                    key={i} ref={(el) => (kodRef.current[i] = el)}
                    value={k} onChange={(e) => kodKirit(i, e.target.value)} onKeyDown={(e) => kodKey(i, e)}
                    inputMode="numeric" maxLength={1}
                    style={{
                      width: 44, height: 54, textAlign: 'center', fontSize: 24, fontWeight: 700,
                      border: `2px solid ${k ? 'var(--green)' : 'var(--line)'}`, borderRadius: 12,
                      color: 'var(--green)', fontFamily: 'inherit', outline: 'none', background: '#fff',
                    }}
                  />
                ))}
              </div>

              {loading && <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 10 }}>Tekshirilmoqda...</div>}

              <button onClick={qaytaYubor} disabled={sekund > 0} style={{
                background: 'none', border: 'none', cursor: sekund > 0 ? 'default' : 'pointer',
                color: sekund > 0 ? 'var(--muted)' : 'var(--green)', fontSize: 14, fontWeight: 600, fontFamily: 'inherit',
              }}>{sekund > 0 ? `Qayta yuborish — ${sekund}s` : (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Icon name="refresh" size={15} color="var(--green)" /> Kodni qayta yuborish</span>
              )}</button>
            </div>
          ) : (
            <>
              {/* Tab almashtirish */}
              <div style={{ display: 'flex', background: '#fff', borderRadius: 14, padding: 4, border: '1px solid var(--line)', marginBottom: 18 }}>
                {[
                  { v: 'kirish', l: 'Kirish' },
                  { v: 'royxat', l: "Ro'yxatdan o'tish" },
                ].map(({ v, l }) => (
                  <button key={v} onClick={() => setRejim(v)} style={{
                    flex: 1, padding: '11px', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer',
                    border: 'none', fontFamily: 'inherit',
                    background: rejim === v ? 'var(--green)' : 'transparent',
                    color: rejim === v ? 'var(--cream)' : 'var(--muted)',
                  }}>{l}</button>
                ))}
              </div>

              <div style={{ background: '#fff', borderRadius: 18, border: '1px solid var(--line)', padding: '24px 22px', boxShadow: '0 4px 24px rgba(0,0,0,0.05)' }}>
                <form onSubmit={rejim === 'royxat' ? kodYuborSubmit : kirishSubmit}>
                  {rejim === 'royxat' ? (
                    <>
                      <div style={{ marginBottom: 14 }}>
                        <label style={lbl}>Ismingiz *</label>
                        <input style={inp} placeholder="Ism Familiya" value={forma.ism} onChange={o('ism')} required />
                      </div>
                      <div style={{ marginBottom: 14 }}>
                        <label style={lbl}>Telefon raqami *</label>
                        <input style={inp} type="tel" placeholder="+998 90 123 45 67" value={forma.telefon} onChange={o('telefon')} required />
                      </div>
                      <div style={{ marginBottom: 14 }}>
                        <label style={lbl}>Email (Gmail) *</label>
                        <input style={inp} type="email" placeholder="email@gmail.com" value={forma.email} onChange={o('email')} required />
                        <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 5 }}>Tasdiqlash kodi shu emailga yuboriladi</div>
                      </div>
                    </>
                  ) : (
                    <div style={{ marginBottom: 14 }}>
                      <label style={lbl}>Telefon yoki email</label>
                      <input style={inp} placeholder="+998 90 123 45 67" value={forma.login} onChange={o('login')} required />
                    </div>
                  )}

                  <div style={{ marginBottom: 20 }}>
                    <label style={lbl}>Parol *</label>
                    <div style={{ position: 'relative' }}>
                      <input style={{ ...inp, paddingRight: 44 }} placeholder="••••••••"
                        type={korinsin ? 'text' : 'password'} value={forma.parol} onChange={o('parol')} required minLength={4} />
                      <button type="button" onClick={() => setKorinsin(!korinsin)} style={{
                        position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                        background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: 16,
                      }}><Icon name={korinsin ? 'eyeOff' : 'eye'} size={18} color="var(--muted)" /></button>
                    </div>
                  </div>

                  <button type="submit" disabled={loading} style={{
                    width: '100%', background: 'var(--green)', color: '#fff', border: 'none',
                    fontSize: 15, fontWeight: 600, padding: 14, borderRadius: 12, cursor: 'pointer',
                    fontFamily: 'inherit', boxShadow: '0 4px 14px rgba(15,77,60,0.25)', opacity: loading ? 0.6 : 1,
                  }}>{loading ? 'Kuting...' : rejim === 'royxat' ? 'Kod olish →' : 'Kirish'}</button>
                </form>

                <div style={{ marginTop: 16, textAlign: 'center', fontSize: 13, color: 'var(--muted)' }}>
                  {rejim === 'royxat' ? (
                    <>Hisobingiz bormi? <span onClick={() => setRejim('kirish')} style={{ color: 'var(--green)', fontWeight: 600, cursor: 'pointer' }}>Kirish</span></>
                  ) : (
                    <>Hisobingiz yo'qmi? <span onClick={() => setRejim('royxat')} style={{ color: 'var(--green)', fontWeight: 600, cursor: 'pointer' }}>Ro'yxatdan o'ting</span></>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
