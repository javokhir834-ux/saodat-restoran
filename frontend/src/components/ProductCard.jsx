import { useState, useEffect } from 'react';
import { useCart } from '../stores/cart';
import Icon from './Icon';

export default function ProductCard({ mahsulot }) {
  const { items, qosh, miqdorOzgartir } = useCart();
  const savatdagi = items.find((i) => i.id === mahsulot.id);
  const tugadi = mahsulot.qoldiq !== null && mahsulot.qoldiq <= 0;
  const qadam = mahsulot.qadam || 1;
  const ogirlik = mahsulot.tur === 'weight'; // kg bilan o'lchanadi

  // Qo'lda yoziladigan miqdor (faqat kg uchun)
  const [matn, setMatn] = useState('');
  useEffect(() => {
    setMatn(savatdagi ? String(savatdagi.miqdori) : '');
  }, [savatdagi?.miqdori]);

  function matnKirit(e) {
    const v = e.target.value.replace(',', '.').replace(/[^\d.]/g, '');
    setMatn(v);
  }
  function matnTasdiq() {
    const son = parseFloat(matn);
    if (!isNaN(son) && son > 0) {
      // qoldiqdan oshmasin
      const yakuniy = mahsulot.qoldiq !== null ? Math.min(son, mahsulot.qoldiq) : son;
      miqdorOzgartir(mahsulot.id, Math.round(yakuniy * 100) / 100);
    } else {
      setMatn(savatdagi ? String(savatdagi.miqdori) : '');
    }
  }

  return (
    <div style={{
      background: '#fff', borderRadius: 16, overflow: 'hidden',
      border: '1px solid var(--line)', display: 'flex', flexDirection: 'column',
      opacity: tugadi ? 0.65 : 1
    }}>
      {/* Rasm */}
      <div style={{ aspectRatio: '4 / 3', position: 'relative', background: `#eee${mahsulot.rasmUrl ? ` url('${mahsulot.rasmUrl}') center/cover` : ''}` }}>
        {!mahsulot.rasmUrl && (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--line)' }}>
            <Icon name="utensils" size={44} color="var(--line)" />
          </div>
        )}
        {ogirlik && (
          <span style={{
            position: 'absolute', bottom: 8, left: 8, background: 'rgba(15,77,60,0.92)', color: '#fff',
            fontSize: 11, fontWeight: 600, padding: '4px 9px', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 4
          }}><Icon name="scale" size={13} color="#fff" /> kg</span>
        )}
        {tugadi && (
          <span style={{
            position: 'absolute', top: 8, left: 8, background: '#A32D2D', color: '#fff',
            fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 8
          }}>Tugadi</span>
        )}
        {mahsulot.qoldiq !== null && mahsulot.qoldiq > 0 && mahsulot.qoldiq <= 5 && (
          <span style={{
            position: 'absolute', top: 8, right: 8, background: '#FAEEDA', color: '#854F0B',
            fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 8
          }}>{mahsulot.qoldiq} {mahsulot.birlik} qoldi</span>
        )}
      </div>

      {/* Tana */}
      <div style={{ padding: '11px 13px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--ink)', lineHeight: 1.25 }}>{mahsulot.nom}</div>
        {mahsulot.tavsif && (
          <div style={{ fontSize: 12, color: 'var(--muted)', margin: '3px 0 10px', flex: 1, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
            {mahsulot.tavsif}
          </div>
        )}
        <div style={{ marginTop: mahsulot.tavsif ? 0 : 'auto' }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--green)', marginBottom: 10 }}>
            {mahsulot.narx.toLocaleString()} <span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 400 }}>so'm/{mahsulot.birlik}</span>
          </div>

          {savatdagi ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'space-between' }}>
              <button
                onClick={() => miqdorOzgartir(mahsulot.id, Math.round((savatdagi.miqdori - qadam) * 100) / 100)}
                style={btnStep}
              >−</button>

              {ogirlik ? (
                <div style={{ position: 'relative', flex: 1 }}>
                  <input
                    type="text" inputMode="decimal" value={matn}
                    onChange={matnKirit} onBlur={matnTasdiq}
                    onKeyDown={(e) => e.key === 'Enter' && e.target.blur()}
                    style={{
                      width: '100%', textAlign: 'center', padding: '7px 26px 7px 8px',
                      border: '1px solid var(--green)', borderRadius: 8, fontSize: 14, fontWeight: 700,
                      color: 'var(--green)', fontFamily: 'inherit', outline: 'none', background: '#fff',
                    }}
                  />
                  <span style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', fontSize: 11, color: 'var(--muted)', pointerEvents: 'none' }}>kg</span>
                </div>
              ) : (
                <span style={{ fontSize: 15, fontWeight: 700, minWidth: 24, textAlign: 'center', color: 'var(--green)' }}>{savatdagi.miqdori}</span>
              )}

              <button
                onClick={() => miqdorOzgartir(mahsulot.id, Math.round((savatdagi.miqdori + qadam) * 100) / 100)}
                style={btnStep}
              >+</button>
            </div>
          ) : (
            <button
              disabled={tugadi}
              onClick={() => !tugadi && qosh(mahsulot, qadam)}
              style={{
                width: '100%', background: tugadi ? 'var(--line)' : 'var(--green)', color: '#fff',
                border: 'none', fontSize: 13.5, fontWeight: 600, padding: '9px 14px',
                borderRadius: 9, cursor: tugadi ? 'not-allowed' : 'pointer', fontFamily: 'inherit'
              }}
            >{ogirlik ? `+ ${qadam} kg qo'shish` : "Qo'shish"}</button>
          )}
        </div>
      </div>
    </div>
  );
}

const btnStep = {
  width: 34, height: 34, flexShrink: 0, borderRadius: 8, border: '1px solid var(--green)',
  background: '#fff', color: 'var(--green)', fontSize: 18, fontWeight: 600, cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1,
};
