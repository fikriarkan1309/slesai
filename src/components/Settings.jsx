import React, { useState } from 'react';
import { User, Edit2, Trash2, LogOut } from 'lucide-react';

export default function Settings({
  projectsList,
  setProjectsList,
  userEmail,
  onLogout,
}) {
  const [editingProject, setEditingProject] = useState(null);

  const handleDeleteProject = (id) => {
    if (
      window.confirm(
        'Yakin ingin menghapus proyek ini? Semua tugas di dalamnya juga akan hilang.'
      )
    ) {
      setProjectsList(projectsList.filter((proj) => proj.id !== id));
    }
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    const updatedList = projectsList.map((p) =>
      p.id === editingProject.id ? editingProject : p
    );
    setProjectsList(updatedList);
    setEditingProject(null);
  };

  return (
    <div style={{ paddingBottom: '2rem', maxWidth: '800px' }}>
      <h1 className="page-title">Pengaturan Sistem</h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* PROFIL PENGGUNA */}
        <div className="widget-card">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1rem',
            }}
          >
            <h2 className="widget-title" style={{ margin: 0 }}>
              <User size={20} color="var(--sky-blue)" /> Profil Pengguna
            </h2>
            <button
              onClick={onLogout}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                background: '#fee2e2',
                color: '#ef4444',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '600',
              }}
            >
              <LogOut size={16} /> Keluar
            </button>
          </div>
          <div
            style={{
              display: 'flex',
              gap: '1rem',
              alignItems: 'center',
              background: '#f8fafc',
              padding: '1rem',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
            }}
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                background: 'var(--sky-blue)',
                color: 'white',
                borderRadius: '50%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                fontWeight: 'bold',
                fontSize: '1.2rem',
              }}
            >
              {userEmail ? userEmail.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-gray)' }}>
                Login sebagai:
              </div>
              <div style={{ fontWeight: '600', color: 'var(--text-dark)' }}>
                {userEmail}
              </div>
            </div>
          </div>
        </div>

        {/* MANAJEMEN PROYEK */}
        <div className="widget-card">
          <h2 className="widget-title" style={{ marginBottom: '1rem' }}>
            <Edit2 size={20} color="var(--sky-blue)" /> Manajemen Proyek
          </h2>
          <p
            style={{
              fontSize: '0.85rem',
              color: 'var(--text-gray)',
              marginBottom: '1.5rem',
            }}
          >
            Kelola daftar proyek Anda. Ubah nama, warna, atau hapus proyek yang
            sudah selesai.
          </p>

          <div
            style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
          >
            {projectsList.length === 0 && (
              <div style={{ color: 'var(--text-gray)', fontSize: '0.9rem' }}>
                Belum ada proyek.
              </div>
            )}

            {projectsList.map((proj) => (
              <div
                key={proj.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '1rem',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  background: '#f8fafc',
                }}
              >
                <div
                  style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}
                >
                  <span
                    style={{
                      width: '16px',
                      height: '16px',
                      borderRadius: '50%',
                      backgroundColor: proj.color,
                    }}
                  ></span>
                  <span
                    style={{ fontWeight: '600', color: 'var(--text-dark)' }}
                  >
                    {proj.name}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => setEditingProject(proj)}
                    style={{
                      background: 'white',
                      border: '1px solid #cbd5e1',
                      padding: '0.5rem',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      color: 'var(--text-dark)',
                    }}
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteProject(proj.id)}
                    style={{
                      background: '#fee2e2',
                      border: 'none',
                      padding: '0.5rem',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      color: '#ef4444',
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MODAL EDIT PROYEK */}
      {editingProject && (
        <div className="modal-overlay" style={{ zIndex: 2000 }}>
          <div className="modal-content">
            <h2 style={{ marginBottom: '1.5rem' }}>Edit Proyek</h2>
            <form onSubmit={handleSaveEdit}>
              <div className="form-group">
                <label
                  style={{
                    fontSize: '0.85rem',
                    fontWeight: '500',
                    color: 'var(--text-dark)',
                  }}
                >
                  Nama Proyek
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={editingProject.name}
                  onChange={(e) =>
                    setEditingProject({
                      ...editingProject,
                      name: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label
                  style={{
                    fontSize: '0.85rem',
                    fontWeight: '500',
                    color: 'var(--text-dark)',
                  }}
                >
                  Warna Identitas
                </label>
                <input
                  type="color"
                  style={{
                    width: '100%',
                    height: '50px',
                    cursor: 'pointer',
                    border: 'none',
                    borderRadius: '6px',
                  }}
                  value={editingProject.color}
                  onChange={(e) =>
                    setEditingProject({
                      ...editingProject,
                      color: e.target.value,
                    })
                  }
                />
              </div>
              <div
                style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}
              >
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ flex: 1, margin: 0 }}
                >
                  Simpan Perubahan
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setEditingProject(null)}
                  style={{ flex: 1, margin: 0 }}
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
