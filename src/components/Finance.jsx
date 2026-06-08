import React, { useState } from 'react';
import { Wallet, ArrowLeftRight, TrendingDown, TrendingUp, Printer, Edit2, Trash2 } from 'lucide-react';

export default function Finance({ tasks, projectsList, transactions, setTransactions }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [trxType, setTrxType] = useState('add');
  const [editingTrxId, setEditingTrxId] = useState(null);
  const [formData, setFormData] = useState({ amount: '', desc: '', date: new Date().toISOString().split('T')[0], projectId: 'main', toProjectId: 'main' });
  const [filterMonth, setFilterMonth] = useState('all');
  const [filterProject, setFilterProject] = useState('all');
  const [filterType, setFilterType] = useState('all');

  const openModal = (type) => {
    setTrxType(type);
    setEditingTrxId(null);
    setFormData({ amount: '', desc: '', date: new Date().toISOString().split('T')[0], projectId: 'main', toProjectId: 'main' });
    setIsModalOpen(true);
  };

  const handleEditTrx = (trx) => {
    setEditingTrxId(trx.id);
    setTrxType(trx.type);
    setFormData({ amount: trx.amount.toString(), desc: trx.desc, date: trx.date, projectId: trx.projectId, toProjectId: trx.toProjectId || 'main' });
    setIsModalOpen(true);
  };

  const handleDeleteTrx = (id) => {
    if (window.confirm("Hapus transaksi manual ini?")) {
      setTransactions(transactions.filter(t => t.id !== id));
    }
  };

  const handleTrxSubmit = (e) => {
    e.preventDefault();
    const amt = parseInt(String(formData.amount).replace(/[^0-9]/g, '')) || 0;
    if (editingTrxId) {
      setTransactions(transactions.map(t => t.id === editingTrxId ? { ...t, type: trxType, amount: amt, desc: formData.desc, date: formData.date, projectId: formData.projectId, toProjectId: trxType === 'transfer' ? formData.toProjectId : null } : t));
    } else {
      const newTrx = { id: Date.now(), type: trxType, amount: amt, desc: formData.desc || 'Transaksi Manual', date: formData.date, projectId: formData.projectId, toProjectId: trxType === 'transfer' ? formData.toProjectId : null };
      setTransactions([...transactions, newTrx]);
    }
    setIsModalOpen(false);
    setEditingTrxId(null);
    setFormData({ amount: '', desc: '', date: new Date().toISOString().split('T')[0], projectId: 'main', toProjectId: 'main' });
  };

  // --- KALKULASI KEUANGAN ---
  const getLastStage = (pid) => { const p = projectsList.find(x => x.id === pid); return p && p.columns ? p.columns[p.columns.length - 1] : 'Slesai'; };

  let mainBalance = 0;
  const projectFinances = {};
  projectsList.forEach(p => { projectFinances[p.id] = { income: 0, expense: 0, balance: 0, name: p.name, color: p.color }; });

  // 1. Hitung dari Tugas Otomatis Kanban
  tasks.forEach(t => {
    if (t.status === getLastStage(t.projectId) || t.isArchived) {
      const amt = parseInt(String(t.fee || '0').replace(/[^0-9]/g, '')) || 0;
      if (projectFinances[t.projectId]) {
        if (t.type === 'expense') { projectFinances[t.projectId].expense += amt; projectFinances[t.projectId].balance -= amt; }
        else { projectFinances[t.projectId].income += amt; projectFinances[t.projectId].balance += amt; }
      }
    }
  });

  // 2. Hitung dari Transaksi Manual
  transactions.forEach(trx => {
    const amt = parseInt(trx.amount) || 0;
    if (trx.type === 'add') {
      if (trx.projectId === 'main') mainBalance += amt;
      else if (projectFinances[trx.projectId]) { projectFinances[trx.projectId].income += amt; projectFinances[trx.projectId].balance += amt; }
    } else if (trx.type === 'sub') {
      if (trx.projectId === 'main') mainBalance -= amt;
      else if (projectFinances[trx.projectId]) { projectFinances[trx.projectId].expense += amt; projectFinances[trx.projectId].balance -= amt; }
    } else if (trx.type === 'transfer') {
      if (trx.projectId === 'main') mainBalance -= amt;
      else if (projectFinances[trx.projectId]) { projectFinances[trx.projectId].expense += amt; projectFinances[trx.projectId].balance -= amt; }

      if (trx.toProjectId === 'main') mainBalance += amt;
      else if (projectFinances[trx.toProjectId]) { projectFinances[trx.toProjectId].income += amt; projectFinances[trx.toProjectId].balance += amt; }
    }
  });

  // AKUMULASI Kas Utama
  const totalAllProjectsBalance = Object.values(projectFinances).reduce((sum, p) => sum + p.balance, 0);
  const totalKasUtamaTampil = mainBalance + totalAllProjectsBalance;

  // 3. SEEDING UNTUK LAPORAN MUTASI GABUNGAN
  const combinedMutations = [];
  transactions.forEach(trx => {
    combinedMutations.push({
      id: trx.id, date: trx.date, type: trx.type, desc: trx.desc,
      projectId: trx.projectId, toProjectId: trx.toProjectId, amount: trx.amount,
      isManual: true
    });
  });
  tasks.forEach(t => {
    if (t.status === getLastStage(t.projectId) || t.isArchived) {
      const amt = parseInt(String(t.fee || '0').replace(/[^0-9]/g, '')) || 0;
      const tDate = t.id ? new Date(t.id).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
      combinedMutations.push({
        id: t.id, date: tDate, type: t.type === 'expense' ? 'sub' : 'add',
        desc: `[Kanban] ${t.title} (${t.client})`, projectId: t.projectId, toProjectId: null, amount: amt,
        isManual: false
      });
    }
  });
  combinedMutations.sort((a, b) => b.id - a.id);

  return (
    <div style={{ paddingBottom: '3rem' }}>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print-area, .print-area * { visibility: visible; }
          .print-area { position: absolute; left: 0; top: 0; width: 100%; padding: 20px; margin: 0; }
          .no-print { display: none !important; }
          .finance-table-scroll { max-height: max-content !important; height: auto !important; overflow: visible !important; overflow-y: visible !important; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          table { page-break-inside: auto; width: 100%; }
          tr { page-break-inside: avoid; page-break-after: auto; }
          thead { display: table-header-group; }
          .widget-card { margin-bottom: 15px !important; break-inside: avoid; }
        }
      `}</style>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }} className="no-print">
        <h1 className="page-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}><Wallet color="var(--sky-blue)" /> Pusat Keuangan</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => openModal('transfer')} className="btn-secondary" style={{ display: 'flex', gap: '6px', margin: 0 }}><ArrowLeftRight size={16}/> Transfer</button>
          <button onClick={() => openModal('sub')} className="btn-secondary" style={{ display: 'flex', gap: '6px', margin: 0, color: '#ef4444' }}><TrendingDown size={16}/> Tarik</button>
          <button onClick={() => openModal('add')} className="btn-primary" style={{ display: 'flex', gap: '6px', margin: 0, background: '#10b981' }}><TrendingUp size={16}/> Tambah</button>
        </div>
      </div>

      <div className="print-area">
        {/* AKUN KAS UTAMA */}
        <div className="widget-card" style={{ background: 'linear-gradient(135deg, #0ea5e9, #3b82f6)', color: 'white', marginBottom: '2rem' }}>
          <h3 style={{ margin: '0 0 10px 0', opacity: 0.9, fontWeight: '500' }}>Total Kas Utama (Perusahaan)</h3>
          <h1 style={{ margin: 0, fontSize: '2.5rem' }}>Rp {totalKasUtamaTampil.toLocaleString('id-ID')}</h1>
        </div>

        {/* AKUN KAS PER PROJECT */}
        <h3 style={{ color: 'var(--text-dark)', marginBottom: '1rem' }}>Kas Per Project</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem', marginBottom: '3rem' }}>
          {projectsList.map(p => {
            const fin = projectFinances[p.id];
            return (
              <div key={p.id} className="widget-card" style={{ borderTop: `4px solid ${fin.color}` }}>
                <h4 style={{ margin: '0 0 15px 0', fontSize: '1.1rem' }}>{fin.name}</h4>
                <h2 style={{ margin: '0 0 15px 0', fontSize: '1.8rem', color: 'var(--text-dark)' }}>Rp {fin.balance.toLocaleString('id-ID')}</h2>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: '600' }}>
                  <span style={{ color: '#10b981' }}>+ Rp {fin.income.toLocaleString('id-ID')}</span>
                  <span style={{ color: '#ef4444' }}>- Rp {fin.expense.toLocaleString('id-ID')}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* FILTER & LAPORAN */}
        <div className="widget-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }} className="no-print">
            <h3 style={{ margin: 0 }}>Laporan Mutasi</h3>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <select value={filterMonth} onChange={e => setFilterMonth(e.target.value)} style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                <option value="all">Semua Bulan</option>
                <option value="01">Januari</option> <option value="02">Februari</option>
                <option value="03">Maret</option> <option value="04">April</option>
                <option value="05">Mei</option> <option value="06">Juni</option>
                <option value="07">Juli</option> <option value="08">Agustus</option>
                <option value="09">September</option> <option value="10">Oktober</option>
                <option value="11">November</option> <option value="12">Desember</option>
              </select>

              <select value={filterType} onChange={e => setFilterType(e.target.value)} style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                <option value="all">Semua Transaksi</option>
                <option value="add">💰 Pemasukan</option>
                <option value="sub">💸 Pengeluaran</option>
                <option value="transfer">🔄 Transfer</option>
              </select>

              <select value={filterProject} onChange={e => setFilterProject(e.target.value)} style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                <option value="all">Semua Akun</option>
                <option value="main">Kas Utama</option>
                {projectsList.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              
              <button onClick={() => window.print()} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: '#f1f5f9', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}><Printer size={16}/> Cetak PDF</button>
            </div>
          </div>

          <div className="finance-table-scroll" style={{ width: '100%', maxHeight: '580px', overflowY: 'auto', paddingRight: '4px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e2e8f0', textAlign: 'left', color: '#64748b' }}>
                  <th style={{ padding: '10px' }}>Tanggal</th>
                  <th style={{ padding: '10px' }}>Deskripsi</th>
                  <th style={{ padding: '10px' }}>Sumber/Tujuan</th>
                  <th style={{ padding: '10px', textAlign: 'right' }}>Nominal</th>
                  <th style={{ padding: '10px', width: '80px', textAlign: 'center' }} className="no-print">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {combinedMutations.filter(t => {
                  const matchProject = filterProject === 'all' || t.projectId === filterProject || t.toProjectId === filterProject;
                  const matchMonth = filterMonth === 'all' || (t.date && t.date.split('-')[1] === filterMonth);
                  const matchType = filterType === 'all' || t.type === filterType;
                  return matchProject && matchMonth && matchType;
                }).map(trx => (
                  <tr key={trx.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 10px' }}>{trx.date}</td>
                    <td style={{ padding: '12px 10px', fontWeight: '500' }}>
                      <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', marginRight: '8px', background: trx.type === 'add' ? '#dcfce7' : trx.type === 'sub' ? '#fee2e2' : '#e0e7ff', color: trx.type === 'add' ? '#16a34a' : trx.type === 'sub' ? '#dc2626' : '#4f46e5' }}>
                        {trx.type === 'add' ? 'MASUK' : trx.type === 'sub' ? 'KELUAR' : 'TRANSFER'}
                      </span>
                      {trx.desc}
                    </td>
                    <td style={{ padding: '12px 10px' }}>{trx.projectId === 'main' ? 'Kas Utama' : projectsList.find(p=>p.id===trx.projectId)?.name} {trx.type==='transfer' ? ` ➔ ${trx.toProjectId === 'main' ? 'Kas Utama' : projectsList.find(p=>p.id===trx.toProjectId)?.name}` : ''}</td>
                    <td style={{ padding: '12px 10px', textAlign: 'right', fontWeight: '600', color: trx.type === 'sub' ? '#ef4444' : '#10b981' }}>{trx.type === 'sub' ? '-' : '+'}Rp {trx.amount.toLocaleString('id-ID')}</td>
                    <td style={{ padding: '12px 10px', textAlign: 'center' }} className="no-print">
                      {trx.isManual ? (
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                          <button onClick={() => handleEditTrx(trx)} style={{ background: 'none', border: 'none', color: '#f59e0b', cursor: 'pointer' }}><Edit2 size={16} /></button>
                          <button onClick={() => handleDeleteTrx(trx.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={16} /></button>
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.7rem', color: '#94a3b8', background: '#f8fafc', padding: '2px 6px', borderRadius: '4px' }}>Kanban</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MODAL TRANSAKSI */}
      {isModalOpen && (
        <div className="modal-overlay no-print">
          <div className="modal-content">
            <h2 style={{ marginBottom: '1.5rem' }}>{trxType === 'add' ? 'Tambah Saldo' : trxType === 'sub' ? 'Tarik Saldo' : 'Transfer Antar Kas'}</h2>
            <form onSubmit={handleTrxSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label>Nominal (Rp)</label>
                <input type="text" className="form-input" required value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} placeholder="Misal: 500000" />
              </div>
              <div className="form-group">
                <label>Keterangan</label>
                <input type="text" className="form-input" required value={formData.desc} onChange={e => setFormData({...formData, desc: e.target.value})} placeholder="Misal: Beli tinta printer" />
              </div>
              <div className="form-group">
                <label>{trxType === 'transfer' ? 'Dari Akun' : 'Pilih Akun'}</label>
                <select className="form-input" value={formData.projectId} onChange={e => setFormData({...formData, projectId: e.target.value})}>
                  <option value="main">Kas Utama (Perusahaan)</option>
                  {projectsList.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              {trxType === 'transfer' && (
                <div className="form-group">
                  <label>Ke Akun</label>
                  <select className="form-input" value={formData.toProjectId} onChange={e => setFormData({...formData, toProjectId: e.target.value})}>
                    <option value="main">Kas Utama (Perusahaan)</option>
                    {projectsList.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
              )}
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="submit" className="btn-primary" style={{ flex: 2, margin: 0 }}>{editingTrxId ? 'Update' : 'Simpan Transaksi'}</button>
                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)} style={{ flex: 1, margin: 0 }}>Batal</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}