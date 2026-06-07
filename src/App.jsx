import Admin from './components/Admin';
import React, { useState, useEffect } from 'react';
import { auth, database } from './firebaseConfig';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { ref, onValue, set } from 'firebase/database';
import Auth from './components/Auth';
import Sidebar from './components/Sidebar';
import Projects from './components/Projects';
import Dashboard from './components/Dashboard';
import Settings from './components/Settings';
import Invoice from './components/Invoice';
import './index.css';


export default function App() {
  const [user, setUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  
  // STATE BARU UNTUK APPROVAL
  const [isApproved, setIsApproved] = useState(false);
  const [isProfileLoaded, setIsProfileLoaded] = useState(false);

  const [activeTab, setActiveTab] = useState('dashboard');
  const [projectsList, setProjectsList] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [activeProjectId, setActiveProjectId] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const updateOnlineStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoadingAuth(false);

      if (currentUser) {
        // CEK STATUS APPROVAL
        const profileRef = ref(database, `users/${currentUser.uid}/profile`);
        onValue(profileRef, (snapshot) => {
          const profileData = snapshot.val();
          if (profileData && profileData.isApproved) {
            setIsApproved(true);
          } else {
            setIsApproved(false);
          }
          setIsProfileLoaded(true);
        });

        const projectsRef = ref(database, `users/${currentUser.uid}/projects`);
        const tasksRef = ref(database, `users/${currentUser.uid}/tasks`);

        onValue(projectsRef, (snapshot) => {
          const data = snapshot.val();
          if (data) {
            const parsedData = Array.isArray(data) ? data : Object.values(data);
            setProjectsList(parsedData);
            localStorage.setItem(`projects_${currentUser.uid}`, JSON.stringify(parsedData));
          } else {
            const localData = localStorage.getItem(`projects_${currentUser.uid}`);
            if (localData) setProjectsList(JSON.parse(localData));
            else setProjectsList([]);
          }
        });

        onValue(tasksRef, (snapshot) => {
          const data = snapshot.val();
          if (data) {
            const parsedData = Array.isArray(data) ? data : Object.values(data);
            setTasks(parsedData);
            localStorage.setItem(`tasks_${currentUser.uid}`, JSON.stringify(parsedData));
          } else {
            const localData = localStorage.getItem(`tasks_${currentUser.uid}`);
            if (localData) setTasks(JSON.parse(localData));
            else setTasks([]);
          }
        });
      } else {
        setProjectsList([]);
        setTasks([]);
        setIsApproved(false);
        setIsProfileLoaded(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  const syncProjectsToFirebase = (newProjects) => { if (user) set(ref(database, `users/${user.uid}/projects`), newProjects); };
  const syncTasksToFirebase = (newTasks) => { if (user) set(ref(database, `users/${user.uid}/tasks`), newTasks); };

  const handleAddProject = (newProject) => {
    const updatedProjects = [...projectsList, newProject];
    syncProjectsToFirebase(updatedProjects);
    setActiveProjectId(newProject.id);
    setActiveTab('project');
  };

  const handleUpdateProject = (updatedProject) => {
    const newProjects = projectsList.map(p => p.id === updatedProject.id ? updatedProject : p);
    syncProjectsToFirebase(newProjects);
  };

  const handleLogout = () => signOut(auth);

  // --- LAYAR PENGHALANG ---
  if (loadingAuth) return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Memuat S'lesai...</div>;
  if (!user) return <Auth />;
  if (!isProfileLoaded) return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Memverifikasi akses...</div>;
  
  // JIKA LOGIN TAPI BELUM DI-ACC
  if (!isApproved) {
    return (
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-light)', padding: '1rem', textAlign: 'center' }}>
        <img src="/Logo.png" alt="S'lesai Logo" style={{ width: '80px', height: '80px', objectFit: 'contain', marginBottom: '1.5rem' }} />
        <h2 style={{ marginBottom: '0.5rem', color: 'var(--text-dark)' }}>Akun Menunggu Persetujuan</h2>
        <p style={{ color: 'var(--text-gray)', marginBottom: '2rem', maxWidth: '400px', lineHeight: '1.6' }}>
          Akun dengan email <strong>{user.email}</strong> berhasil didaftarkan, namun belum memiliki akses masuk. Silakan hubungi Admin untuk persetujuan.
        </p>
        <button onClick={handleLogout} className="btn-secondary" style={{ width: 'auto', padding: '0.75rem 2rem' }}>Kembali ke Login</button>
      </div>
    );
  }
  
  const renderContent = () => {
    if (activeTab === 'admin' && user.email === 'fikriarkan1309@gmail.com') {
      return <Admin />;
    }
    if (activeTab === 'dashboard') {
      return (
        <Dashboard
          tasks={tasks}
          projectsList={projectsList}
          setActiveTab={setActiveTab}
          setActiveProjectId={setActiveProjectId}
        />
      );
    }
    if (activeTab === 'invoice') {
      return <Invoice />;
    }
    if (activeTab === 'settings') {
      return (
        <Settings
          projectsList={projectsList}
          setProjectsList={syncProjectsToFirebase}
          userEmail={user.email}
          onLogout={handleLogout}
        />
      );
    }
    if (activeTab === 'project') {
      const currentProject = projectsList.find((p) => p.id === activeProjectId);
      return currentProject ? (
        <Projects
          projectData={currentProject}
          tasks={tasks}
          setTasks={syncTasksToFirebase}
          onUpdateProject={handleUpdateProject}
        />
      ) : (
        <Dashboard
          tasks={tasks}
          projectsList={projectsList}
          setActiveTab={setActiveTab}
          setActiveProjectId={setActiveProjectId}
        />
      );
    }
    return (
      <Dashboard
        tasks={tasks}
        projectsList={projectsList}
        setActiveTab={setActiveTab}
        setActiveProjectId={setActiveProjectId}
      />
    );
  };

  return (
    <div className="app-container">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        projectsList={projectsList}
        activeProjectId={activeProjectId}
        setActiveProjectId={setActiveProjectId}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        onAddProject={handleAddProject}
        userEmail={user.email}
      />
      <main className="main-content">{renderContent()}</main>

      {/* Spanduk Notifikasi Mode Offline */}
      {!isOnline && (
        <div
          style={{
            position: 'fixed',
            bottom: '1rem',
            right: '1rem',
            background: '#ef4444',
            color: 'white',
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            fontSize: '0.8rem',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            zIndex: 9999,
          }}
        >
          Anda sedang offline. Data tersimpan di perangkat.
        </div>
      )}
    </div>
  );
}
