import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';
import Icon from '../components/Icon';

const inp = {
  width: '100%', padding: '13px 14px', border: '1px solid var(--line)',
  borderRadius: 12, fontSize: 15, fontFamily: 'inherit', background: '#fff',
  outline: 'none', boxSizing: 'border-box',
};

export default function LoginPage() {
  const [login, setLogin] = useState('');
  const [parol, setParol] = useState('');
  const [korinsin, setKorinsin] = useState(false);
  const [loading, setLoading] = useState(false);
  const { kirish } = useAuth();
  const navigate = useNavigate();

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await kirish(login, parol);
      navigate(user.rol === 'admin' ? '/admin' : '/kassir');
    } catch {
      toast.error("Login yoki parol noto'g'ri");
    } finally {
      setLoading(false);
    }
  }

  function tezToldirish(l, p) { setLogin(l); setParol(p); }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{
          width: 72, height: 72, background: 'var(--green)', borderRadius: 20,
          display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
          boxShadow: '0 8px 24px rgba(15,77,60,0.3)',
        }}>
          <Icon name="utensils" size={36} color="var(--gold)" />
        </div>
        <div style={{ fontSize: 26, fontWeight: 700, color: 'var(--green)' }}>Saodat</div>
        <div style={{ color: 'var(--muted)', fontSize: 14, marginTop: 4 }}>Restoran boshqaruv tizimi</div>
      </div>

      {/* Karta */}
      <div style={{ background: '#fff', borderRadius: 20, border: '1px solid var(--line)', padding: '28px 24px', maxWidth: 380, width: '100%', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
        <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--ink)', marginBottom: 20 }}>Tizimga kirish</div>

        <form onSubmit={submit}>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, color: 'var(--muted)', display: 'block', marginBottom: 5 }}>Login</label>
            <input style={inp} placeholder="admin yoki kassir" value={login} onChange={(e) => setLogin(e.target.value)} required />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 12, color: 'var(--muted)', display: 'block', marginBottom: 5 }}>Parol</label>
            <div style={{ position: 'relative' }}>
              <input style={{ ...inp, paddingRight: 44 }} placeholder="••••••••"
                type={korinsin ? 'text' : 'password'} value={parol} onChange={(e) => setParol(e.target.value)} required />
              <button type="button" onClick={() => setKorinsin(!korinsin)} style={{
                position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: 16,
              }}><Icon name={korinsin ? 'eyeOff' : 'eye'} size={18} color="var(--muted)" /></button>
            </div>
          </div>
          <button type="submit" disabled={loading} style={{
            width: '100%', background: 'var(--green)', color: '#fff', border: 'none',
            fontSize: 15, fontWeight: 600, padding: 14, borderRadius: 12, cursor: 'pointer',
            fontFamily: 'inherit', boxShadow: '0 4px 14px rgba(15,77,60,0.3)',
            opacity: loading ? 0.6 : 1,
          }}>{loading ? 'Tekshirilmoqda...' : 'Kirish'}</button>
        </form>

        <div style={{ marginTop: 20, borderTop: '1px solid var(--line)', paddingTop: 16 }}>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 10, textAlign: 'center' }}>Demo kirish</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <button onClick={() => tezToldirish('admin', 'admin123')} style={{
              padding: '10px 12px', borderRadius: 10, fontSize: 13, fontWeight: 500, cursor: 'pointer',
              background: 'var(--green-soft)', color: 'var(--green)', border: '1px solid var(--green)', fontFamily: 'inherit',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}><Icon name="settings" size={15} color="var(--green)" /> Admin</button>
            <button onClick={() => tezToldirish('kassir', 'kassir123')} style={{
              padding: '10px 12px', borderRadius: 10, fontSize: 13, fontWeight: 500, cursor: 'pointer',
              background: 'var(--amber-soft)', color: '#854F0B', border: '1px solid var(--gold)', fontFamily: 'inherit',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}><Icon name="chef" size={15} color="#854F0B" /> Kassir</button>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 24, color: 'var(--muted)', fontSize: 13 }}>
        <span onClick={() => navigate('/')} style={{ cursor: 'pointer', color: 'var(--green)', textDecoration: 'underline' }}>← Menyuga qaytish</span>
      </div>
    </div>
  );
}
