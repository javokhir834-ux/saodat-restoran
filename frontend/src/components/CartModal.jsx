import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../stores/cart';

export default function CartModal({ onYopish }) {
  const { items, miqdorOzgartir, jami } = useCart();
  const navigate = useNavigate();

  function buyurtmaBerishga() {
    onYopish();
    navigate('/buyurtma');
  }

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(10,30,24,0.55)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 50 }}
      onClick={(e) => e.target === e.currentTarget && onYopish()}
    >
      <div className="slide-up" style={{ background: '#fff', borderRadius: '20px 20px 0 0', maxWidth: 460, width: '100%', padding: '22px 18px calc(22px + env(safe-area-inset-bottom))', maxHeight: '85vh', overflowY: 'auto' }}>
        <button onClick={onYopish} style={{ float: 'right', cursor: 'pointer', color: 'var(--muted)', fontSize: 24, border: 'none', background: 'none', lineHeight: 1 }}>×</button>
        <div style={{ fontSize: 18, color: 'var(--green)', fontWeight: 600, marginBottom: 4 }}>Buyurtmangiz</div>
        <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 14 }}>Mahsulotlar ro'yxati</div>

        {items.map((item) => (
          <SavatQator key={item.id} item={item} miqdorOzgartir={miqdorOzgartir} />
        ))}

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, fontWeight: 700, color: 'var(--green)', padding: '14px 0 4px' }}>
          <span>Jami</span>
          <span>{jami.toLocaleString()} so'm</span>
        </div>

        <button
          onClick={buyurtmaBerishga}
          style={{ width: '100%', background: 'var(--green)', color: '#fff', border: 'none', fontSize: 15, fontWeight: 600, padding: 14, borderRadius: 12, cursor: 'pointer', marginTop: 12, fontFamily: 'inherit' }}
        >Buyurtma berish →</button>
      </div>
    </div>
  );
}

function SavatQator({ item, miqdorOzgartir }) {
  const ogirlik = item.birlik === 'kg';
  const qadam = item.qadam || 1;
  const [matn, setMatn] = useState(String(item.miqdori));
  useEffect(() => { setMatn(String(item.miqdori)); }, [item.miqdori]);

  function tasdiq() {
    const son = parseFloat(matn.replace(',', '.'));
    if (!isNaN(son) && son > 0) miqdorOzgartir(item.id, Math.round(son * 100) / 100);
    else setMatn(String(item.miqdori));
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '10px 0', borderBottom: '1px dashed var(--line)' }}>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.nom}</div>
        <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{(item.narx * item.miqdori).toLocaleString()} so'm</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexShrink: 0 }}>
        <button onClick={() => miqdorOzgartir(item.id, Math.round((item.miqdori - qadam) * 100) / 100)} style={btn}>−</button>
        {ogirlik ? (
          <div style={{ position: 'relative', width: 64 }}>
            <input type="text" inputMode="decimal" value={matn}
              onChange={(e) => setMatn(e.target.value.replace(',', '.').replace(/[^\d.]/g, ''))}
              onBlur={tasdiq} onKeyDown={(e) => e.key === 'Enter' && e.target.blur()}
              style={{ width: '100%', textAlign: 'center', padding: '7px 22px 7px 6px', border: '1px solid var(--green)', borderRadius: 8, fontSize: 14, fontWeight: 700, color: 'var(--green)', fontFamily: 'inherit', outline: 'none' }} />
            <span style={{ position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)', fontSize: 10, color: 'var(--muted)', pointerEvents: 'none' }}>kg</span>
          </div>
        ) : (
          <span style={{ fontSize: 14, fontWeight: 700, minWidth: 22, textAlign: 'center' }}>{item.miqdori}</span>
        )}
        <button onClick={() => miqdorOzgartir(item.id, Math.round((item.miqdori + qadam) * 100) / 100)} style={btn}>+</button>
      </div>
    </div>
  );
}

const btn = {
  width: 32, height: 32, flexShrink: 0, borderRadius: 8, border: '1px solid var(--green)',
  background: '#fff', color: 'var(--green)', fontSize: 17, fontWeight: 600, cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1,
};
