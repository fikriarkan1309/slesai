import React, { useState } from 'react';
import { auth } from '../firebaseConfig';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { Lock, Mail, AlertCircle } from 'lucide-react';

export default function Auth() {
  const [isLoginView, setIsLoginView] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      if (isLoginView) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (error) {
      // Ubah pesan error bahasa Inggris bawaan Firebase agar lebih ramah
      if (error.code === 'auth/invalid-credential')
        setErrorMsg('Email atau password salah.');
      else if (error.code === 'auth/email-already-in-use')
        setErrorMsg('Email ini sudah terdaftar.');
      else if (error.code === 'auth/weak-password')
        setErrorMsg('Password minimal 6 karakter.');
      else setErrorMsg('Terjadi kesalahan. Coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      setErrorMsg(
        'Masukkan email Anda terlebih dahulu untuk mereset password.'
      );
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      alert('Tautan reset password telah dikirim ke email Anda!');
      setErrorMsg('');
    } catch (error) {
      setErrorMsg('Gagal mengirim email reset password.');
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--bg-light)',
        padding: '1rem',
      }}
    >
      <div
        style={{
          background: 'white',
          padding: '2.5rem',
          borderRadius: '16px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
          width: '100%',
          maxWidth: '400px',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              background: 'var(--sky-blue)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
            }}
          >
            <Lock color="white" size={24} />
          </div>
          <h1
            style={{
              fontSize: '1.5rem',
              fontWeight: '700',
              color: 'var(--text-dark)',
              margin: 0,
            }}
          >
            S'lesai!
          </h1>
          <p
            style={{
              color: 'var(--text-gray)',
              fontSize: '0.9rem',
              marginTop: '0.5rem',
            }}
          >
            {isLoginView ? 'Masuk ke ruang kerjamu' : 'Buat akun baru'}
          </p>
        </div>

        {errorMsg && (
          <div
            style={{
              background: '#fee2e2',
              color: '#ef4444',
              padding: '0.75rem',
              borderRadius: '8px',
              fontSize: '0.85rem',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <AlertCircle size={16} /> {errorMsg}
          </div>
        )}

        <form
          onSubmit={handleAuth}
          style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
        >
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '0.85rem',
                fontWeight: '500',
                color: 'var(--text-dark)',
                marginBottom: '0.5rem',
              }}
            >
              Email
            </label>
            <div style={{ position: 'relative' }}>
              <Mail
                size={18}
                color="var(--text-gray)"
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                }}
              />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem 0.75rem 2.5rem',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.95rem',
                }}
                placeholder="nama@email.com"
              />
            </div>
          </div>

          <div>
            <label
              style={{
                display: 'block',
                fontSize: '0.85rem',
                fontWeight: '500',
                color: 'var(--text-dark)',
                marginBottom: '0.5rem',
              }}
            >
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.95rem',
              }}
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.875rem',
              background: 'var(--sky-blue)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              marginTop: '0.5rem',
              transition: 'background 0.2s',
            }}
          >
            {loading
              ? 'Memproses...'
              : isLoginView
              ? 'Masuk'
              : 'Daftar Sekarang'}
          </button>
        </form>

        <div
          style={{
            marginTop: '1.5rem',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            fontSize: '0.85rem',
          }}
        >
          {isLoginView && (
            <button
              onClick={handleResetPassword}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-gray)',
                cursor: 'pointer',
              }}
            >
              Lupa password?
            </button>
          )}
          <div style={{ color: 'var(--text-gray)' }}>
            {isLoginView ? 'Belum punya akun? ' : 'Sudah punya akun? '}
            <button
              onClick={() => {
                setIsLoginView(!isLoginView);
                setErrorMsg('');
              }}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--sky-blue)',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              {isLoginView ? 'Daftar di sini' : 'Masuk di sini'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
