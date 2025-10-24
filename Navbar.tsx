// src/Navbar.tsx
import React from 'react';
import { Link } from 'react-router-dom';

interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role?: 'admin' | 'user';
}

interface NavbarProps {
  user: User | null;
  onLoginClick: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ user, onLoginClick, onLogout }) => (
  <header className="header">
    <div className="container header__inner">
      <div className="logo"><Link to="/">ТурбоПоиск</Link></div>
      <nav className="nav">
        <Link to="/" className="nav__link">Главная</Link>
        {user?.role === 'admin' && <Link to="/admin" className="nav__link">Админка</Link>}
      </nav>
      <div className="auth-controls">
        {user
          ? <>
              <span className="user-greeting">Привет, {user.first_name}</span>
              <button className="btn btn--outline auth-btn" onClick={onLogout}>Выйти</button>
            </>
          : <button className="btn btn--primary auth-btn" onClick={onLoginClick}>Войти</button>
        }
      </div>
    </div>
  </header>
);
