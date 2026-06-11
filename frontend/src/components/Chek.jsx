// Chek (kvitansiya) — to'lovdan keyin avtomatik ko'rsatiladi va chop etiladi.
// Haqiqiy fiskal chek emas — namuna ko'rinishi.
import Icon from './Icon';

const TOLOV_NOM = { payme: 'Payme', click: 'Click', naqd: 'Naqd pul', uzcard: 'UzCard', humo: 'Humo' };

function vaqtFormat(s) {
  const d = s ? new Date(s) : new Date();
  return d.toLocaleString('uz', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function Chek({ buyurtma, onYopish }) {
  if (!buyurtma) return null;
  const tur = buyurtma.tur === 'stol' ? `Stol ${buyurtma.table?.raqam ?? ''}`.trim()
    : buyurtma.tur === 'yetkazib_berish' ? 'Yetkazib berish' : 'Olib ketish';

  function chopEt() { window.print(); }

  const dashed = { borderTop: '1px dashed #999', margin: '10px 0' };
  const qator = { display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '2px 0' };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(10,30,24,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 60, padding: 16, overflowY: 'auto' }}
      onClick={(e) => e.target === e.currentTarget && onYopish?.()}>
      <div style={{ maxWidth: 340, width: '100%' }}>

        {/* Chek qog'ozi */}
        <div className="chek-chop slide-up" style={{
          background: '#fff', borderRadius: 14, padding: '22px 22px 26px',
          fontFamily: "'Courier New', monospace", color: '#1a1a1a',
        }}>
          {/* Sarlavha */}
          <div style={{ textAlign: 'center', marginBottom: 6 }}>
            <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: 2 }}>SAODAT</div>
            <div style={{ fontSize: 11, color: '#555' }}>Milliy taomlar · Samarqand</div>
            <div style={{ fontSize: 11, color: '#555' }}>Registon ko'chasi 12</div>
            <div style={{ fontSize: 11, color: '#555' }}>+998 90 123 45 67</div>
          </div>

          <div style={dashed} />

          <div style={qator}><span>Chek №</span><span>{buyurtma.raqam}</span></div>
          <div style={qator}><span>Sana</span><span>{vaqtFormat(buyurtma.tolanganVaqt || buyurtma.yaratilganVaqt)}</span></div>
          <div style={qator}><span>Turi</span><span>{tur}</span></div>
          {buyurtma.mijozIsmi && <div style={qator}><span>Mijoz</span><span>{buyurtma.mijozIsmi}</span></div>}

          <div style={dashed} />

          {/* Mahsulotlar */}
          {buyurtma.items?.map((it) => (
            <div key={it.id} style={{ marginBottom: 4 }}>
              <div style={{ fontSize: 13 }}>{it.mahsulotNomi}</div>
              <div style={qator}>
                <span style={{ color: '#555' }}>{it.miqdori} × {it.narx.toLocaleString()}</span>
                <span style={{ fontWeight: 700 }}>{(it.narx * it.miqdori).toLocaleString()}</span>
              </div>
            </div>
          ))}

          <div style={dashed} />

          <div style={{ ...qator, fontSize: 16, fontWeight: 700 }}>
            <span>JAMI</span><span>{buyurtma.jamiSumma.toLocaleString()} so'm</span>
          </div>
          <div style={qator}>
            <span>To'lov turi</span>
            <span>{TOLOV_NOM[buyurtma.tolovTuri] || buyurtma.tolovTuri || '—'}</span>
          </div>
          <div style={qator}>
            <span>Holati</span>
            <span style={{ fontWeight: 700 }}>{buyurtma.tolovHolati === 'tolandi' ? "TO'LANGAN" : 'KUTILMOQDA'}</span>
          </div>
          {buyurtma.ballarBerildi > 0 && (
            <div style={qator}><span>Yig'ilgan ball</span><span>+{buyurtma.ballarBerildi} ball</span></div>
          )}

          <div style={dashed} />

          <div style={{ textAlign: 'center', fontSize: 12, color: '#555', marginTop: 8 }}>
            Tashrifingiz uchun rahmat!
          </div>
          <div style={{ textAlign: 'center', fontSize: 11, color: '#888', marginTop: 2 }}>
            Yana kutib qolamiz
          </div>
        </div>

        {/* Tugmalar — chop etishda yashiriladi */}
        <div className="chek-yashir" style={{ display: 'flex', gap: 10, marginTop: 14 }}>
          <button onClick={onYopish} style={{
            flex: 1, background: 'rgba(255,255,255,0.92)', color: 'var(--green)', border: 'none',
            borderRadius: 12, padding: 13, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
          }}>Yopish</button>
          <button onClick={chopEt} style={{
            flex: 1, background: 'var(--gold)', color: 'var(--green)', border: 'none',
            borderRadius: 12, padding: 13, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
          }}><span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, justifyContent: 'center' }}><Icon name="printer" size={17} color="var(--green)" /> Chop etish</span></button>
        </div>
      </div>
    </div>
  );
}
