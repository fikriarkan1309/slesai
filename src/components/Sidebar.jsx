import React, { useState, useEffect } from 'react';
import { Home, Settings, Menu, Plus, Shield, X, FileText } from 'lucide-react';

export default function Sidebar({
  activeTab,
  setActiveTab,
  projectsList,
  activeProjectId,
  setActiveProjectId,
  isOpen,
  setIsOpen,
  onAddProject,
  userEmail
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', color: '#f59e0b' });
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Deteksi ukuran layar
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const projectToAdd = {
      id: `p${Date.now()}`,
      name: newProject.name || 'Proyek Baru',
      color: newProject.color,
      columns: ['To-Do', 'In Progress', 'Waiting / Revision', 'Slesai'], // Bawaan tahapan
    };
    onAddProject(projectToAdd);
    setIsModalOpen(false);
    setNewProject({ name: '', color: '#f59e0b' });
  };

  const handleMenuClick = (action) => {
    action();
    if (isMobile) setIsOpen(false); // Otomatis tutup sidebar di HP setelah klik menu
  };

  return (
    <>
      {/* OVERLAY GELAP KHUSUS HP */}
      {isMobile && isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 1000,
          }}
        />
      )}

      {/* TOMBOL HAMBURGER KHUSUS HP (Saat sidebar tertutup) */}
      {isMobile && !isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            position: 'fixed',
            top: '10px',
            left: '10px',
            zIndex: 900,
            background: 'var(--sky-blue)',
            border: 'none',
            padding: '0.5rem',
            borderRadius: '8px',
            color: 'white',
          }}
        >
          <Menu size={24} />
        </button>
      )}

      {/* SIDEBAR UTAMA */}
      <div
        style={{
          // Logika Lebar: Di HP (260px atau 0px). Di Laptop (260px atau 80px).
          width: isMobile
            ? isOpen
              ? '260px'
              : '0px'
            : isOpen
            ? '260px'
            : '80px',
          backgroundColor: 'var(--sky-blue)',
          color: 'white',
          transition: 'width 0.3s ease',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          position: isMobile ? 'fixed' : 'relative',
          zIndex: isMobile ? 1500 : 100,
          overflow: 'hidden',
          whiteSpace: 'nowrap',
        }}
      >
        <div
          style={{
            padding: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: isOpen ? 'space-between' : 'center',
          }}
        >
          {isOpen && (
            <h2 style={{ fontWeight: '700', fontSize: '1.5rem', margin: 0 }}>
              S'lesai!
            </h2>
          )}
          <button
            onClick={() => setIsOpen(!isOpen)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
            }}
          >
            {isMobile && isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        <nav className="sidebar-nav" style={{ flex: 1, padding: '0 1rem', overflowY: 'auto' }}>
          <button
            onClick={() =>
              handleMenuClick(() => {
                setActiveTab('dashboard');
                setActiveProjectId(null);
              })
            }
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              padding: isOpen ? '0.75rem 1rem' : '0.75rem 0',
              justifyContent: isOpen ? 'flex-start' : 'center',
              background:
                activeTab === 'dashboard'
                  ? 'rgba(255,255,255,0.2)'
                  : 'transparent',
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              cursor: 'pointer',
              marginBottom: '1rem',
            }}
          >
            <Home size={22} /> {isOpen && <span>Dashboard</span>}
          </button>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: isOpen ? 'space-between' : 'center',
              padding: '0.5rem 1rem',
              opacity: 0.9,
            }}
          >
            {isOpen && <span style={{ fontWeight: '500' }}>Projects</span>}
            <button
              onClick={() => setIsModalOpen(true)}
              style={{
                background: 'rgba(255,255,255,0.3)',
                border: 'none',
                color: 'white',
                borderRadius: '4px',
                cursor: 'pointer',
                padding: isOpen ? '2px' : '6px',
              }}
            >
              <Plus size={16} />
            </button>
          </div>

          {projectsList.map((proj) => (
            <button
              key={proj.id}
              onClick={() =>
                handleMenuClick(() => {
                  setActiveTab('project');
                  setActiveProjectId(proj.id);
                })
              }
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: isOpen ? '0.75rem 1rem 0.75rem 1.5rem' : '0.75rem 0',
                justifyContent: isOpen ? 'flex-start' : 'center',
                background:
                  activeTab === 'project' && activeProjectId === proj.id
                    ? 'rgba(255,255,255,0.2)'
                    : 'transparent',
                border: 'none',
                borderRadius: '8px',
                color: 'white',
                cursor: 'pointer',
                marginTop: '0.25rem',
              }}
            >
              <span
                style={{
                  width: isOpen ? '10px' : '16px',
                  height: isOpen ? '10px' : '16px',
                  borderRadius: '50%',
                  backgroundColor: proj.color,
                  flexShrink: 0,
                }}
              ></span>
              {isOpen && <span>{proj.name}</span>}
            </button>
          ))}
        </nav>

        <div style={{ padding: '1rem' }}>
          
          {/* TOMBOL ADMIN */}
          {userEmail === 'fikriarkan1309@gmail.com' && (
            <button 
              onClick={() => handleMenuClick(() => { setActiveTab('admin'); setActiveProjectId(null); })} 
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '1rem', padding: isOpen ? '0.75rem 1rem' : '0.75rem 0', justifyContent: isOpen ? 'flex-start' : 'center', background: activeTab === 'admin' ? 'rgba(255,255,255,0.2)' : 'transparent', border: 'none', borderRadius: '8px', color: 'white', cursor: 'pointer', marginBottom: '0.5rem' }}
            >
              <Shield size={22} /> {isOpen && <span>Admin Panel</span>}
            </button>
          )}
          {/* --- SISIPKAN TOMBOL INI DI SINI --- */}
          <button 
            onClick={() => { 
              setActiveTab('invoice'); 
              setActiveProjectId(null); 
              if (window.innerWidth <= 768) setIsOpen(false); 
            }} 
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '1rem', padding: isOpen ? '0.75rem 1rem' : '0.75rem 0', justifyContent: isOpen ? 'flex-start' : 'center', background: activeTab === 'invoice' ? 'rgba(255,255,255,0.2)' : 'transparent', border: 'none', borderRadius: '8px', color: 'white', cursor: 'pointer', marginBottom: '0.5rem' }}
          >
            <FileText size={22} /> {isOpen && <span>Invoice</span>}
          </button>

          <button
            onClick={() =>
              handleMenuClick(() => {
                setActiveTab('settings');
                setActiveProjectId(null);
              })
            }
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              padding: isOpen ? '0.75rem 1rem' : '0.75rem 0',
              justifyContent: isOpen ? 'flex-start' : 'center',
              background:
                activeTab === 'settings'
                  ? 'rgba(255,255,255,0.2)'
                  : 'transparent',
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              cursor: 'pointer',
            }}
          >
            <Settings size={22} /> {isOpen && <span>Settings</span>}
          </button>
        </div>
      </div>

      {/* POPUP TAMBAH PROYEK (Dari kodingan aslimu) */}
      {isModalOpen && (
        <div className="modal-overlay" style={{ zIndex: 2000 }}>
          <div className="modal-content">
            <h2 style={{ marginBottom: '1.5rem' }}>Buat Proyek Baru</h2>
            <form onSubmit={handleSubmit}>
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
                  placeholder="Misal: Redesign Website"
                  value={newProject.name}
                  onChange={(e) =>
                    setNewProject({ ...newProject, name: e.target.value })
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
                  Pilih Warna Identitas
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
                  value={newProject.color}
                  onChange={(e) =>
                    setNewProject({ ...newProject, color: e.target.value })
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
                  Buat Proyek
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
            </form>
          </div>
        </div>
      )}
    </>
  );
}
