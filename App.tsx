// src/App.tsx

import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { AuthModal } from './AuthModal';
import Infobar from './Infobar';
import SearchForm from './SearchForm';
import { AdminDashboard } from './AdminDashboard';

interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role?: 'admin' | 'user';
}

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    console.log('Initial auth check');
    fetch('http://myservervisit/public/api/auth_check.php', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        console.log('Auth check:', data);
        if (data.status === 'success') {
          setUser(data.user);
          if (data.user.role === 'admin') {
            console.log('Redirect to admin');
            navigate('/admin');
          }
        }
      })
      .catch(err => console.error(err));
  }, [navigate]);

  const handleLoginClick = () => {
    setIsAuthModalOpen(true);
  };

  const handleLogout = () => {
    fetch('http://myservervisit/public/api/auth_logout.php', {
      method: 'POST',
      credentials: 'include'
    }).then(() => {
      setUser(null);
      navigate('/');
    });
  };

  const handleAuthSuccess = (u: User) => {
    console.log('Logged in', u);
    setUser(u);
    setIsAuthModalOpen(false);
    if (u.role === 'admin') {
      navigate('/admin');
    } else {
      navigate('/');
    }
  };

  return (
    <>
      <Navbar user={user} onLoginClick={handleLoginClick} onLogout={handleLogout} />

      <Routes>
        <Route
          path="/"
          element={
            <main className="main">
              <div className="container">
                <SearchForm />
                <Infobar />
              </div>
            </main>
          }
        />
        <Route
          path="/admin"
          element={
            user?.role === 'admin' ? (
              <AdminDashboard />
            ) : (
              <div style={{ padding: '20px', textAlign: 'center' }}>
                <h2>Доступ запрещён</h2>
              </div>
            )
          }
        />
        <Route
          path="*"
          element={
            <div style={{ padding: '20px', textAlign: 'center' }}>
              <h2>Страница не найдена</h2>
            </div>
          }
        />
      </Routes>

      <Footer />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />
    </>
  );
};

export default App;
