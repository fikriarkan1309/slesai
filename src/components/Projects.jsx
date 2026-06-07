import React, { useState } from 'react';
import {
  Star,
  Link2,
  MoreHorizontal,
  Plus,
  Clock,
  ArrowRight,
  ArrowLeft,
  Trash2,
  Check,
  Archive,
} from 'lucide-react';

export default function Projects({
  projectData,
  tasks,
  setTasks,
  onUpdateProject,
}) {
  const defaultColumns = ['To-Do', 'In Progress', 'Waiting / Revision', 'Done'];
  const columns = projectData.columns || defaultColumns;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState(null);

  const [editingColIndex, setEditingColIndex] = useState(null);
  const [editColName, setEditColName] = useState('');

  const [formData, setFormData] = useState({
    title: '', client: '', deadline: '', fee: '', dp: '', linkAset: '', type: 'income'
  });

  const handleDeleteColumn = (index) => {
    if (window.confirm("Hapus tahapan ini? Semua tugas di dalamnya akan ikut TERHAPUS permanen!")) {
      const colToRemove = columns[index];
      const newCols = columns.filter((_, i) => i !== index);
      onUpdateProject({ ...projectData, columns: newCols });
      setTasks(tasks.filter(t => t.projectId === projectData.id ? t.status !== colToRemove : true));
    }
  };

  const filteredTasks = tasks.filter(
    (task) => task.projectId === projectData.id && !task.isArchived
  );

  const formatDeadlineText = (dateString) => {
    if (!dateString) return { text: 'Tanpa Tenggat', color: 'inherit', weight: 'normal' };
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return { text: dateString, color: 'inherit', weight: 'normal' }; // Fallback teks manual lama
    
    const now = new Date();
    now.setHours(0,0,0,0);
    const targetDate = new Date(d);
    targetDate.setHours(0,0,0,0);

    const diff = targetDate - now;
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    
    if (days < 0) return { text: `Terlewat ${Math.abs(days)} hari`, color: '#ef4444', weight: '700' };
    if (days === 0) return { text: 'Hari ini', color: '#f59e0b', weight: '700' };
    return { text: `${days} hari lagi`, color: 'var(--text-dark)', weight: '500' };
  };

  const startEditColumn = (index, currentName) => {
    setEditingColIndex(index);
    setEditColName(currentName);
  };

  const saveColumnName = (index) => {
    if (!editColName.trim()) return;
    const oldStatus = columns[index];
    const newStatus = editColName.trim();

    const newCols = [...columns];
    newCols[index] = newStatus;
    onUpdateProject({ ...projectData, columns: newCols });

    if (oldStatus !== newStatus) {
      const updatedTasks = tasks.map((t) =>
        t.projectId === projectData.id && t.status === oldStatus
          ? { ...t, status: newStatus }
          : t
      );
      setTasks(updatedTasks);
    }
    setEditingColIndex(null);
  };

  const handleAddColumn = () => {
    const newCols = [...columns, `Tahap Baru ${columns.length + 1}`];
    onUpdateProject({ ...projectData, columns: newCols });
  };

  const handleToggleStar = (taskId) =>
    setTasks(
      tasks.map((t) =>
        t.id === taskId ? { ...t, isStarred: !t.isStarred } : t
      )
    );

  const handleMoveTask = (taskId, currentStatus, direction) => {
    const currentIndex = columns.indexOf(currentStatus);
    let nextIndex = currentIndex;
    if (direction === 'next' && currentIndex < columns.length - 1) nextIndex++;
    if (direction === 'prev' && currentIndex > 0) nextIndex--;
    if (nextIndex !== currentIndex)
      setTasks(
        tasks.map((t) =>
          t.id === taskId ? { ...t, status: columns[nextIndex] } : t
        )
      );
  };

  const handleDeleteTask = (taskId) => {
    if (
      window.confirm(
        'Hapus permanen? Uang dari tugas ini akan HILANG dari grafik pendapatan.'
      )
    ) {
      setTasks(tasks.filter((t) => t.id !== taskId));
      setIsModalOpen(false);
    }
  };

  const handleArchiveTask = (taskId) => {
    if (
      window.confirm(
        'Arsipkan tugas ini? Tugas akan hilang dari papan, TAPI nominal pendapatannya TETAP MASUK di grafik.'
      )
    ) {
      setTasks(
        tasks.map((t) => (t.id === taskId ? { ...t, isArchived: true } : t))
      );
      setIsModalOpen(false);
    }
  };

  const openAddModal = (targetColumn = columns[0]) => {
    setEditingTaskId(null);
    setFormData({ title: '', client: '', deadline: '', fee: '', dp: '', linkAset: '', status: targetColumn, type: 'income' });
    setIsModalOpen(true);
  };

  const openEditModal = (task) => {
    setEditingTaskId(task.id);
    setFormData({ 
      title: task.title, client: task.client, deadline: task.deadline, 
      fee: task.fee ? task.fee.replace(/[^0-9]/g, '') : '', dp: task.dpValue || '', linkAset: task.linkAset || '', status: task.status, type: task.type || 'income'
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanFee = formData.fee
      ? `Rp ${parseInt(
          formData.fee.toString().replace(/[^0-9]/g, '') || '0'
        ).toLocaleString('id-ID')}`
      : 'Rp 0';
    const feeNumber = parseInt(cleanFee.replace(/[^0-9]/g, '')) || 0;
    const dpNumber = parseInt(
      formData.dp.toString().replace(/[^0-9]/g, '') || '0'
    );
    const dpPercent =
      feeNumber > 0
        ? Math.min(Math.round((dpNumber / feeNumber) * 100), 100)
        : 0;

    if (editingTaskId) {
      setTasks(tasks.map(t => t.id === editingTaskId ? { ...t, title: formData.title, client: formData.client, deadline: formData.deadline, fee: cleanFee, dpValue: dpNumber, dp: dpPercent, linkAset: formData.linkAset, hasLink: formData.linkAset.trim() !== '', type: formData.type } : t));
    } else {
      const newTask = {
        id: Date.now(), projectId: projectData.id, title: formData.title || 'Tugas Tanpa Judul', client: formData.client || '-', deadline: formData.deadline || '-', fee: cleanFee, dpValue: dpNumber, dp: dpPercent, linkAset: formData.linkAset, hasLink: formData.linkAset.trim() !== '', color: projectData.color, status: formData.status, isStarred: false, isArchived: false, type: formData.type
      };
      setTasks([...tasks, newTask]);
    }
    setIsModalOpen(false);
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
        }}
      >
        <h1
          className="page-title"
          style={{
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
          }}
        >
          <span
            style={{
              width: '16px',
              height: '16px',
              borderRadius: '50%',
              backgroundColor: projectData.color,
            }}
          ></span>
          {projectData.name}
        </h1>
        <button
          onClick={() => openAddModal()}
          style={{
            padding: '0.6rem 1.2rem',
            background: 'var(--sky-blue)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            display: 'flex',
            gap: '0.5rem',
            alignItems: 'center',
            cursor: 'pointer',
            fontWeight: '500',
          }}
        >
          <Plus size={18} /> Tugas Baru
        </button>
      </div>

      <div className="kanban-board">
        {columns.map((col, index) => (
          <div key={index} className="kanban-column">
            <div className="column-header">
              {editingColIndex === index ? (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    width: '100%',
                  }}
                >
                  <input
                    type="text"
                    autoFocus
                    value={editColName}
                    onChange={(e) => setEditColName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') saveColumnName(index);
                    }}
                    style={{
                      flex: 1,
                      padding: '4px 8px',
                      borderRadius: '4px',
                      border: '1px solid var(--sky-blue)',
                      fontSize: '0.9rem',
                      fontWeight: '600',
                    }}
                  />
                  <button
                    onClick={() => saveColumnName(index)}
                    style={{
                      background: 'var(--sky-blue)',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '4px',
                      cursor: 'pointer',
                      color: 'white',
                    }}
                  >
                    <Check size={16} />
                  </button>
                </div>
              ) : (
                <>
                  <span>{col}</span>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button onClick={() => { setEditingColIndex(index); setEditColName(col); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-gray)' }}><MoreHorizontal size={18} /></button>
                    {columns.length > 1 && <button onClick={() => handleDeleteColumn(index)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}><Trash2 size={16} /></button>}
                  </div>
                </>
              )}
            </div>

            {filteredTasks
              .filter((t) => t.status === col)
              .map((task) => {
                const dlData = formatDeadlineText(task.deadline);
                return ( 
                <div
                  key={task.id}
                  className="kanban-card"
                  style={{ borderLeftColor: task.color }}
                >
                  <div className="card-header">
                    <span className="card-title">{task.title}</span>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button
                        onClick={() => handleToggleStar(task.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                        }}
                      >
                        <Star
                          size={16}
                          fill={task.isStarred ? task.color : 'none'}
                          color={
                            task.isStarred ? task.color : 'var(--text-gray)'
                          }
                        />
                      </button>
                      <button
                        onClick={() => openEditModal(task)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: 'var(--text-gray)',
                        }}
                      >
                        <MoreHorizontal size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="card-client">{task.client}</div>
                  <div
                    style={{
                      fontSize: '0.8rem',
                      color: 'var(--text-gray)',
                      display: 'flex',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span>
                      Total:{' '}
                      <strong style={{ color: 'var(--text-dark)' }}>
                        {task.fee}
                      </strong>
                    </span>
                    {task.dpValue > 0 && (
                      <span>DP: Rp {task.dpValue.toLocaleString('id-ID')}</span>
                    )}
                  </div>
                  <div className="progress-bg">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${task.dp}%`,
                        backgroundColor: task.color,
                      }}
                    ></div>
                  </div>

                  <div className="card-footer">
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: dlData.color, fontWeight: dlData.weight }}>
                      <Clock size={14} /> {dlData.text}
                    </span>
                    <div
                      style={{
                        display: 'flex',
                        gap: '8px',
                        alignItems: 'center',
                      }}
                    >
                      {task.hasLink && task.linkAset && (
                        <a
                          href={
                            task.linkAset.startsWith('http')
                              ? task.linkAset
                              : `https://${task.linkAset}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: 'var(--sky-blue)' }}
                        >
                          <Link2 size={16} />
                        </a>
                      )}
                      {index !== 0 && (
                        <button
                          onClick={() =>
                            handleMoveTask(task.id, task.status, 'prev')
                          }
                          style={{
                            background: '#f1f5f9',
                            border: 'none',
                            borderRadius: '4px',
                            padding: '4px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                          }}
                        >
                          <ArrowLeft size={14} color="var(--text-dark)" />
                        </button>
                      )}
                      {index !== columns.length - 1 && (
                        <button
                          onClick={() =>
                            handleMoveTask(task.id, task.status, 'next')
                          }
                          style={{
                            background: '#f1f5f9',
                            border: 'none',
                            borderRadius: '4px',
                            padding: '4px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                          }}
                        >
                          <ArrowRight size={14} color="var(--text-dark)" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            <button
              onClick={() => openAddModal(col)}
              style={{
                background: 'transparent',
                border: '1px dashed #cbd5e1',
                padding: '0.75rem',
                borderRadius: '6px',
                color: 'var(--text-gray)',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '0.5rem',
                width: '100%',
                marginTop: '0.5rem',
              }}
            >
              <Plus size={16} /> Tambah
            </button>
          </div>
        ))}

        <div
          style={{
            minWidth: '320px',
            padding: '1rem',
            border: '2px dashed #cbd5e1',
            borderRadius: '8px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            cursor: 'pointer',
            color: 'var(--text-gray)',
            fontWeight: '500',
            height: 'fit-content',
          }}
          onClick={handleAddColumn}
        >
          <Plus size={20} style={{ marginRight: '0.5rem' }} /> Tambah Tahapan
        </div>
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ position: 'relative' }}>
            <h2 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>
              {editingTaskId ? 'Edit Tugas' : 'Tambah Tugas Baru'}
            </h2>
            <form onSubmit={handleSubmit}>
              {/* PENAMBAHAN CLASS .form-row-responsive AGAR MENYUSUT DI HP */}
              <div
                className="form-row-responsive"
                style={{ display: 'flex', gap: '1rem' }}
              >
                <div className="form-group" style={{ flex: 1 }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: '500' }}>
                    Nama Tugas
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: '500' }}>
                    Nama Klien
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.client}
                    onChange={(e) =>
                      setFormData({ ...formData, client: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: '500', display: 'block', marginBottom: '0.5rem' }}>Jenis Arus Kas</label>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: formData.type === 'income' ? '#10b981' : 'var(--text-gray)', fontWeight: '600' }}>
                    <input type="radio" name="type" checked={formData.type === 'income'} onChange={() => setFormData({...formData, type: 'income'})} /> 💰 Pemasukan
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: formData.type === 'expense' ? '#ef4444' : 'var(--text-gray)', fontWeight: '600' }}>
                    <input type="radio" name="type" checked={formData.type === 'expense'} onChange={() => setFormData({...formData, type: 'expense'})} /> 💸 Pengeluaran
                  </label>
                </div>
              </div>
              
              <div
                className="form-row-responsive"
                style={{ display: 'flex', gap: '1rem' }}
              >
                <div className="form-group" style={{ flex: 1 }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: '500' }}>
                    Total Harga (Rp)
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Misal: 1500000"
                    value={formData.fee}
                    onChange={(e) =>
                      setFormData({ ...formData, fee: e.target.value })
                    }
                  />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: '500' }}>
                    DP Dibayar (Rp)
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Misal: 500000"
                    value={formData.dp}
                    onChange={(e) =>
                      setFormData({ ...formData, dp: e.target.value })
                    }
                  />
                </div>
              </div>

              <div
                className="form-row-responsive"
                style={{ display: 'flex', gap: '1rem' }}
              >
                <div className="form-group" style={{ flex: 1 }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: '500' }}>
                    Tenggat Waktu
                  </label>
                  <input type="datetime-local" className="form-input" value={formData.deadline} onChange={e => setFormData({...formData, deadline: e.target.value})} />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: '500' }}>
                    Link Aset
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="https://..."
                    value={formData.linkAset}
                    onChange={(e) =>
                      setFormData({ ...formData, linkAset: e.target.value })
                    }
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ flex: 2, margin: 0 }}
                >
                  Simpan Tugas
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setIsModalOpen(false)}
                  style={{ flex: 1, margin: 0 }}
                >
                  Batal
                </button>
              </div>

              {editingTaskId && (
                <div
                  style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}
                >
                  <button
                    type="button"
                    onClick={() => handleArchiveTask(editingTaskId)}
                    style={{
                      flex: 1,
                      padding: '0.75rem',
                      background: '#fef3c7',
                      color: '#d97706',
                      border: 'none',
                      borderRadius: '6px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    <Archive size={18} /> Arsipkan Tugas
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteTask(editingTaskId)}
                    style={{
                      flex: 1,
                      padding: '0.75rem',
                      background: '#fee2e2',
                      color: '#ef4444',
                      border: 'none',
                      borderRadius: '6px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    <Trash2 size={18} /> Hapus Permanen
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
