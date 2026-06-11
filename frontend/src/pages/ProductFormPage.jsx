import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../api/client';
import Icon from '../components/Icon';

const inp = {
  width: '100%', padding: '11px 13px', border: '1px solid var(--line)',
  borderRadius: 10, fontSize: 14, fontFamily: 'inherit', background: '#fff',
  outline: 'none', boxSizing: 'border-box',
};
const lbl = { fontSize: 12, color: 'var(--muted)', display: 'block', marginBottom: 4 };

export default function ProductFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const yangi = id === 'yangi';

  const [forma, setForma] = useState({
    categoryId: '', nom: '', tavsif: '', narx: '',
    birlik: 'porsiya', tur: 'whole', qadam: '1', qoldiq: '',
  });
  const [rasm, setRasm] = useState(null);

  const { data: kategoriyalar = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get('/categories').then((r) => r.data),
  });

  const { data: mahsulot } = useQuery({
    queryKey: ['product', id],
    queryFn: () => api.get(`/products/${id}`).then((r) => r.data),
    enabled: !yangi,
  });

  useEffect(() => {
    if (mahsulot) {
      setForma({
        categoryId: String(mahsulot.categoryId),
        nom: mahsulot.nom, tavsif: mahsulot.tavsif || '',
        narx: String(mahsulot.narx), birlik: mahsulot.birlik,
        tur: mahsulot.tur, qadam: String(mahsulot.qadam),
        qoldiq: mahsulot.qoldiq !== null ? String(mahsulot.qoldiq) : '',
      });
    }
  }, [mahsulot]);

  const { mutate: saqlash, isPending } = useMutation({
    mutationFn: () => {
      const fd = new FormData();
      Object.entries(forma).forEach(([k, v]) => { if (v !== '') fd.append(k, v); });
      if (rasm) fd.append('rasm', rasm);
      if (yangi) return api.post('/products', fd);
      return api.put(`/products/${id}`, fd);
    },
    onSuccess: () => {
      toast.success(yangi ? "Mahsulot qo'shildi" : 'Yangilandi');
      qc.invalidateQueries({ queryKey: ['categories'] });
      navigate('/admin');
    },
    onError: () => toast.error('Xatolik'),
  });

  const o = (k) => (e) => setForma({ ...forma, [k]: e.target.value });

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)', paddingBottom: 40 }}>
      {/* Header */}
      <div style={{ background: 'var(--green)', padding: '16px 20px' }}>
        <button onClick={() => navigate('/admin')} style={{ color: 'var(--gold)', background: 'none', border: 'none', fontSize: 14, cursor: 'pointer', marginBottom: 8, fontFamily: 'inherit' }}>← Admin</button>
        <div style={{ color: 'var(--cream)', fontSize: 20, fontWeight: 600 }}>{yangi ? "Yangi mahsulot qo'shish" : 'Mahsulotni tahrirlash'}</div>
      </div>

      <div style={{ maxWidth: 520, margin: '0 auto', padding: '20px 20px 0' }}>
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid var(--line)', padding: 18, marginBottom: 14 }}>
          <div style={{ marginBottom: 12 }}>
            <label style={lbl}>Kategoriya</label>
            <select value={forma.categoryId} onChange={o('categoryId')} style={inp}>
              <option value="">Tanlang</option>
              {kategoriyalar.map((k) => <option key={k.id} value={k.id}>{k.nom}</option>)}
            </select>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={lbl}>Nom *</label>
            <input value={forma.nom} onChange={o('nom')} style={inp} placeholder="Mahsulot nomi" />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={lbl}>Tavsif</label>
            <textarea value={forma.tavsif} onChange={o('tavsif')} style={{ ...inp, resize: 'none' }} rows={2} placeholder="Qisqacha tavsif" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
            <div>
              <label style={lbl}>Narx (so'm) *</label>
              <input type="number" value={forma.narx} onChange={o('narx')} style={inp} placeholder="25000" />
            </div>
            <div>
              <label style={lbl}>Birlik</label>
              <select value={forma.birlik} onChange={o('birlik')} style={inp}>
                {['porsiya','dona','kg','sixcha','stakan'].map((b) => <option key={b}>{b}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
            <div>
              <label style={lbl}>Tur</label>
              <select value={forma.tur} onChange={o('tur')} style={inp}>
                <option value="whole">Butun (dona)</option>
                <option value="weight">Og'irlik (kg)</option>
              </select>
            </div>
            <div>
              <label style={lbl}>Qadam</label>
              <input type="number" step="0.5" value={forma.qadam} onChange={o('qadam')} style={inp} />
            </div>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={lbl}>Qoldiq (bo'sh = cheksiz)</label>
            <input type="number" value={forma.qoldiq} onChange={o('qoldiq')} style={inp} placeholder="Masalan: 10" />
          </div>

          {/* Rasm yuklash */}
          <div>
            <label style={lbl}>Rasm</label>
            <label style={{
              display: 'block', border: '2px dashed var(--line)', borderRadius: 12,
              padding: '20px 16px', textAlign: 'center', cursor: 'pointer',
              background: rasm ? 'var(--green-soft)' : 'var(--cream)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 6 }}><Icon name={rasm ? 'checkCircle' : 'image'} size={28} color={rasm ? 'var(--green)' : 'var(--muted)'} /></div>
              <div style={{ fontSize: 13, color: 'var(--muted)' }}>{rasm ? rasm.name : 'Rasm tanlash uchun bosing'}</div>
              <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => setRasm(e.target.files[0])} />
            </label>
          </div>
        </div>

        <button onClick={() => saqlash()} disabled={isPending || !forma.nom || !forma.narx || !forma.categoryId} style={{
          width: '100%', background: 'var(--green)', color: '#fff', border: 'none',
          borderRadius: 12, padding: 14, fontSize: 15, fontWeight: 600, cursor: 'pointer',
          opacity: (!forma.nom || !forma.narx || !forma.categoryId) ? 0.4 : 1, fontFamily: 'inherit',
          boxShadow: '0 4px 14px rgba(15,77,60,0.25)',
        }}>{isPending ? 'Saqlanmoqda...' : 'Saqlash'}</button>
      </div>
    </div>
  );
}
