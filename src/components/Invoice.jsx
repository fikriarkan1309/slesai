import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Printer, Lock, Unlock } from 'lucide-react';

export default function Invoice() {
  const [bizName, setBizName] = useState(localStorage.getItem('inv_biz_name') || 'Nama Usahamu');
  const [bankName, setBankName] = useState(localStorage.getItem('inv_bank') || 'Bank BCA');
  const [rekNum, setRekNum] = useState(localStorage.getItem('inv_rek') || '123456789');
  const [rekName, setRekName] = useState(localStorage.getItem('inv_rek_name') || 'Nama Pemilik');
  const [isHeaderLocked, setIsHeaderLocked] = useState(localStorage.getItem('inv_head_lock') === 'true');
  const [isPayLocked, setIsPayLocked] = useState(localStorage.getItem('inv_pay_lock') === 'true');

  const [invNum, setInvNum] = useState(`INV/${Date.now().toString().slice(-6)}`);
  const [invDate, setInvDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');
  const [payStatus, setPayStatus] = useState('Unpaid');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [ownerSign, setOwnerSign] = useState(localStorage.getItem('inv_owner_sign') || 'Pemilik Toko');
  const [clientSign, setClientSign] = useState('Nama Klien');

  const [items, setItems] = useState([{ id: 1, desc: 'Pesanan Desain Jersey', qty: 1, price: 150000 }]);

  useEffect(() => { localStorage.setItem('inv_biz_name', bizName); }, [bizName]);
  useEffect(() => { localStorage.setItem('inv_bank', bankName); }, [bankName]);
  useEffect(() => { localStorage.setItem('inv_rek', rekNum); }, [rekNum]);
  useEffect(() => { localStorage.setItem('inv_rek_name', rekName); }, [rekName]);
  useEffect(() => { localStorage.setItem('inv_owner_sign', ownerSign); }, [ownerSign]);
  useEffect(() => { localStorage.setItem('inv_head_lock', isHeaderLocked); }, [isHeaderLocked]);
  useEffect(() => { localStorage.setItem('inv_pay_lock', isPayLocked); }, [isPayLocked]);

  const handleAddItem = () => setItems([...items, { id: Date.now(), desc: '', qty: 1, price: 0 }]);
  const handleItemChange = (id, field, value) => setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  const handleRemoveItem = (id) => { if (items.length > 1) setItems(items.filter(item => item.id !== id)); };

  const totalAkhir = items.reduce((sum, item) => sum + (item.qty * (parseInt(item.price) || 0)), 0);

  return (
    <div style={{ paddingBottom: '3rem' }} className="invoice-container-main">
      <style>{`
        @media print {
          body * { visibility: hidden; background: white !important; }
          .print-area, .print-area * { visibility: visible; }
          .print-area { position: absolute; left: 0; top: 0; width: 100%; max-width: 210mm; height: 297mm; padding: 10mm !important; box-shadow: none !important; margin: 0 !important; }
          .no-print { display: none !important; }
          .invoice-card-sheet { border: none !important; box-shadow: none !important; padding: 0 !important; }
          input, select, textarea { border: none !important; padding: 0 !important; background: transparent !important; appearance: none; outline: none; width: 100%; color: #000 !important; }
          .btn-row-action { display: none !important; }
          .inv-table-wrapper { overflow-x: visible !important; }
        }
      `}</style>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }} className="no-print">
        <h1 className="page-title" style={{ margin: 0 }}>Pembuatan Invoice</h1>
        <button onClick={() => window.print()} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0, background: '#10b981' }}>
          <Printer size={18} /> Cetak / PDF (A4)
        </button>
      </div>

      <div className="print-area" style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.02)', padding: '2.5rem', maxWidth: '800px', margin: '0 auto', fontFamily: 'sans-serif', color: '#1e293b' }}>
        <div className="invoice-card-sheet">
          
          <div className="inv-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #f1f5f9', paddingBottom: '1.5rem', marginBottom: '1.5rem' }}>
            <div style={{ flex: 1, width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }} className="no-print">
                <button type="button" onClick={() => setIsHeaderLocked(!isHeaderLocked)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: isHeaderLocked ? '#f59e0b' : '#94a3b8' }}>{isHeaderLocked ? <Lock size={16} /> : <Unlock size={16} />}</button>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{isHeaderLocked ? 'Header Dikunci' : 'Header Terbuka'}</span>
              </div>
              <input type="text" value={bizName} disabled={isHeaderLocked} onChange={(e) => setBizName(e.target.value)} style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--sky-blue)', background: isHeaderLocked ? 'transparent' : '#f8fafc', border: isHeaderLocked ? 'none' : '1px dashed #cbd5e1', borderRadius: '4px', padding: '4px 8px', width: '100%', maxWidth: '350px' }} />
            </div>
            <h1 style={{ fontSize: '2.25rem', fontWeight: '900', color: '#64748b', margin: 0, letterSpacing: '1px' }}>INVOICE</h1>
          </div>

          <div className="inv-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px' }}>
              <h3 style={{ fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase', margin: '0 0 0.75rem 0' }}>Info Klien:</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <input type="text" placeholder="Nama Klien" value={clientName} onChange={(e) => { setClientName(e.target.value); setClientSign(e.target.value); }} style={{ fontWeight: '600', fontSize: '1rem', borderBottom: '1px solid #e2e8f0', padding: '2px 0', background: 'transparent' }} />
                <input type="text" placeholder="No. Telp / WhatsApp" value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} style={{ fontSize: '0.9rem', borderBottom: '1px solid #e2e8f0', padding: '2px 0', background: 'transparent' }} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '0.5rem 1rem', alignItems: 'center' }}>
              <span style={{ fontSize: '0.9rem', color: '#64748b' }}>No. Invoice</span>
              <input type="text" value={invNum} onChange={(e) => setInvNum(e.target.value)} style={{ fontWeight: '600', fontSize: '0.95rem' }} />
              <span style={{ fontSize: '0.9rem', color: '#64748b' }}>Tgl Invoice</span>
              <input type="date" value={invDate} onChange={(e) => setInvDate(e.target.value)} style={{ fontSize: '0.95rem' }} />
              <span style={{ fontSize: '0.9rem', color: '#64748b' }}>Jatuh Tempo</span>
              <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} style={{ fontSize: '0.95rem' }} />
              <span style={{ fontSize: '0.9rem', color: '#64748b' }}>Status</span>
              <select value={payStatus} onChange={(e) => setPayStatus(e.target.value)} style={{ fontWeight: '700', color: payStatus === 'Paid' ? '#10b981' : payStatus === 'DP' ? '#f59e0b' : '#ef4444', cursor: 'pointer', fontSize: '0.95rem' }}>
                <option value="Unpaid">❌ Unpaid</option><option value="DP">⏳ DP (Down Payment)</option><option value="Paid">✅ Paid</option>
              </select>
            </div>
          </div>

          <div className="inv-table-wrapper">
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'var(--sky-blue)', color: 'white' }}>
                  <th style={{ padding: '10px', borderRadius: '6px 0 0 6px', width: '40px' }}>No</th>
                  <th style={{ padding: '10px', minWidth: '200px' }}>Deskripsi Item</th>
                  <th style={{ padding: '10px', width: '60px', textAlign: 'center' }}>Qty</th>
                  <th style={{ padding: '10px', width: '130px' }}>Harga</th>
                  <th style={{ padding: '10px', width: '130px' }}>Subtotal</th>
                  <th style={{ width: '40px' }} className="btn-row-action"></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '12px 10px', fontWeight: '500' }}>{idx + 1}</td>
                    <td style={{ padding: '12px 10px' }}><input type="text" placeholder="Deskripsi pekerjaan..." value={item.desc} onChange={(e) => handleItemChange(item.id, 'desc', e.target.value)} style={{ width: '100%' }} /></td>
                    <td style={{ padding: '12px 10px', textAlign: 'center' }}><input type="number" value={item.qty} onChange={(e) => handleItemChange(item.id, 'qty', parseInt(e.target.value) || 0)} style={{ width: '100%', textAlign: 'center' }} /></td>
                    <td style={{ padding: '12px 10px' }}><div style={{ display: 'flex', alignItems: 'center' }}><span>Rp&nbsp;</span><input type="number" value={item.price} onChange={(e) => handleItemChange(item.id, 'price', parseInt(e.target.value) || 0)} style={{ width: '100%' }} /></div></td>
                    <td style={{ padding: '12px 10px', fontWeight: '600' }}>Rp {(item.qty * item.price).toLocaleString('id-ID')}</td>
                    <td className="btn-row-action" style={{ padding: '12px 0', textAlign: 'center' }}><button type="button" onClick={() => handleRemoveItem(item.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={16} /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button type="button" onClick={handleAddItem} className="btn-secondary no-print" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.5rem 1rem', fontSize: '0.85rem', marginBottom: '2rem' }}>
            <Plus size={16} /> Tambah Item Baru
          </button>

          <div className="inv-footer" style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '2rem', borderTop: '2px solid #f1f5f9', paddingTop: '1.5rem', marginBottom: '3rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem' }} className="no-print">
                <button type="button" onClick={() => setIsPayLocked(!isPayLocked)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: isPayLocked ? '#f59e0b' : '#94a3b8' }}>{isPayLocked ? <Lock size={16} /> : <Unlock size={16} />}</button>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{isPayLocked ? 'Info Rekening Dikunci' : 'Info Rekening Terbuka'}</span>
              </div>
              <h4 style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 0.5rem 0' }}>INFORMASI PEMBAYARAN:</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr', gap: '4px', fontSize: '0.9rem' }}>
                <span>Nama Bank:</span><input type="text" value={bankName} disabled={isPayLocked} onChange={(e) => setBankName(e.target.value)} style={{ fontWeight: '500' }} />
                <span>No. Rek:</span><input type="text" value={rekNum} disabled={isPayLocked} onChange={(e) => setRekNum(e.target.value)} style={{ fontWeight: '600', color: 'var(--text-dark)' }} />
                <span>Atas Nama:</span><input type="text" value={rekName} disabled={isPayLocked} onChange={(e) => setRekName(e.target.value)} style={{ fontWeight: '500' }} />
              </div>
            </div>

            <div className="inv-total" style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <span style={{ fontSize: '0.95rem', color: '#64748b', fontWeight: '500' }}>TOTAL BILLING</span>
              <span style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--text-dark)', marginTop: '4px' }}>Rp {totalAkhir.toLocaleString('id-ID')}</span>
            </div>
          </div>

          <div className="inv-ttd" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', textAlign: 'center', marginTop: '3rem', pageBreakInside: 'avoid' }}>
            <div>
              <p style={{ fontSize: '0.9rem', color: '#64748b', margin: '0 0 4rem 0' }}>Hormat Kami,</p>
              <input type="text" value={ownerSign} onChange={(e) => setOwnerSign(e.target.value)} style={{ textAlign: 'center', fontWeight: '600', fontSize: '0.95rem', borderTop: '1px solid #cbd5e1', paddingTop: '6px', width: '100%', maxWidth: '160px', margin: '0 auto' }} />
            </div>
            <div>
              <p style={{ fontSize: '0.9rem', color: '#64748b', margin: '0 0 4rem 0' }}>Tanda Tangan Klien,</p>
              <input type="text" value={clientSign} onChange={(e) => setClientSign(e.target.value)} style={{ textAlign: 'center', fontWeight: '600', fontSize: '0.95rem', borderTop: '1px solid #cbd5e1', paddingTop: '6px', width: '100%', maxWidth: '160px', margin: '0 auto' }} />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}