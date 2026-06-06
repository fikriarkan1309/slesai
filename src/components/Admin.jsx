import React, { useState, useEffect } from 'react';
import { database } from '../firebaseConfig';
import { ref, onValue, update } from 'firebase/database';
import { Shield, CheckCircle, XCircle } from 'lucide-react';

export default function Admin() {
  const [usersList, setUsersList] = useState([]);

  // Ambil semua data pengguna dari Firebase
  useEffect(() => {
    const usersRef = ref(database, 'users');
    onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // Ekstrak data profil dari setiap User ID
        const loadedUsers = Object.keys(data).map(uid => ({
          uid,
          ...data[uid].profile
        })).filter(u => u && u.email); // Pastikan profilnya valid
        
        setUsersList(loadedUsers);
      } else {
        setUsersList([]);
      }
    });
  }, []);

  // Fungsi mengubah status persetujuan (Acc/Cabut)
  const toggleApproval = (uid, currentStatus) => {
    update(ref(database, `users/${uid}/profile`), {
      isApproved: !currentStatus
    });
  };

  return (
    <div style={{ paddingBottom: '2rem', maxWidth: '800px' }}>
      <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <Shield color="var(--sky-blue)" size={28} /> Admin Dashboard
      </h1>
      <p style={{ color: 'var(--text-gray)', marginBottom: '2rem' }}>
        Kelola persetujuan akses akun S'lesai Workspace. Hanya email utama yang bisa melihat halaman ini.
      </p>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {usersList.length === 0 && <div style={{ color: 'var(--text-gray)' }}>Belum ada pengguna yang mendaftar.</div>}
        
        {usersList.map(u => (
          <div key={u.uid} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 2px 5px rgba(0,0,0,0.02)' }}>
            <div>
              <div style={{ fontWeight: '600', color: 'var(--text-dark)', fontSize: '1.1rem' }}>{u.email}</div>
              <div style={{ fontSize: '0.85rem', color: u.isApproved ? '#10b981' : '#f59e0b', marginTop: '4px', fontWeight: '500' }}>
                {u.isApproved ? 'Akses Terbuka' : 'Menunggu Persetujuan'}
              </div>
            </div>
            <button 
              onClick={() => toggleApproval(u.uid, u.isApproved)}
              style={{ background: u.isApproved ? '#fee2e2' : '#dcfce7', color: u.isApproved ? '#ef4444' : '#10b981', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              {u.isApproved ? <><XCircle size={16}/> Cabut Akses</> : <><CheckCircle size={16}/> Acc Akses</>}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}