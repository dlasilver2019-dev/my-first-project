// src/AuthModal.tsx

import React, { useState } from 'react';

interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
}

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onAuthSuccess }) => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

  const [registerData, setRegisterData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  if (!isOpen) return null;

  const handleClose = () => {
    setError('');
    onClose();
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    console.log('LOGIN → отправка', loginData);

    try {
      const response = await fetch('http://myservervisit/public/api/auth_login.php', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData),
      });

      const data = await response.json();
      console.log('LOGIN ← ответ', data);

      if (data.status === 'success') {
        onAuthSuccess(data.user);
        handleClose();
      } else {
        setError(data.message || 'Ошибка входа');
      }
    } catch (err) {
      setError('Ошибка соединения с сервером');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (registerData.password !== registerData.confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }
    if (registerData.password.length < 6) {
      setError('Пароль должен содержать минимум 6 символов');
      return;
    }

    setLoading(true);
    console.log('REGISTER → отправка', registerData);

    try {
      const response = await fetch('http://myservervisit/public/api/auth_register.php', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: registerData.firstName,
          last_name: registerData.lastName,
          email: registerData.email,
          phone: registerData.phone,
          password: registerData.password
        }),
      });

      const data = await response.json();
      console.log('REGISTER ← ответ', data);

      if (data.status === 'success') {
        onAuthSuccess(data.user);
        handleClose();
      } else {
        setError(data.message || 'Ошибка регистрации');
      }
    } catch {
      setError('Ошибка соединения с сервером');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-modal-overlay" onClick={handleClose}>
      <div className="auth-modal" onClick={e => e.stopPropagation()}>
        <div className="auth-modal__header">
          <h2>{isLoginMode ? 'Вход' : 'Регистрация'}</h2>
          <button className="auth-modal__close" onClick={handleClose}>✕</button>
        </div>

        <div className="auth-modal__content">
          {error && <div className="auth-error">{error}</div>}

          {isLoginMode ? (
            <form onSubmit={handleLogin} className="auth-form">
              <div className="field">
                <label htmlFor="login-email" className="field__label">Email</label>
                <input
                  id="login-email"
                  name="email"
                  type="email"
                  className="field__input"
                  autoComplete="email"
                  value={loginData.email}
                  onChange={e => setLoginData({ ...loginData, email: e.target.value })}
                  required
                />
              </div>

              <div className="field">
                <label htmlFor="login-password" className="field__label">Пароль</label>
                <input
                  id="login-password"
                  name="password"
                  type="password"
                  className="field__input"
                  autoComplete="current-password"
                  value={loginData.password}
                  onChange={e => setLoginData({ ...loginData, password: e.target.value })}
                  required
                />
              </div>

              <button type="submit" className="btn btn--primary auth-form__submit" disabled={loading}>
                {loading ? 'Входим...' : 'Войти'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="auth-form">
              <div className="field">
                <label htmlFor="reg-firstName" className="field__label">Имя</label>
                <input
                  id="reg-firstName"
                  name="firstName"
                  type="text"
                  className="field__input"
                  autoComplete="given-name"
                  value={registerData.firstName}
                  onChange={e => setRegisterData({ ...registerData, firstName: e.target.value })}
                  required
                />
              </div>

              <div className="field">
                <label htmlFor="reg-lastName" className="field__label">Фамилия</label>
                <input
                  id="reg-lastName"
                  name="lastName"
                  type="text"
                  className="field__input"
                  autoComplete="family-name"
                  value={registerData.lastName}
                  onChange={e => setRegisterData({ ...registerData, lastName: e.target.value })}
                  required
                />
              </div>

              <div className="field">
                <label htmlFor="reg-email" className="field__label">Email</label>
                <input
                  id="reg-email"
                  name="email"
                  type="email"
                  className="field__input"
                  autoComplete="email"
                  value={registerData.email}
                  onChange={e => setRegisterData({ ...registerData, email: e.target.value })}
                  required
                />
              </div>

              <div className="field">
                <label htmlFor="reg-phone" className="field__label">Телефон (необязательно)</label>
                <input
                  id="reg-phone"
                  name="phone"
                  type="tel"
                  className="field__input"
                  autoComplete="tel"
                  placeholder="+7 (999) 123-45-67"
                  value={registerData.phone}
                  onChange={e => setRegisterData({ ...registerData, phone: e.target.value })}
                />
              </div>

              <div className="field">
                <label htmlFor="reg-password" className="field__label">Пароль</label>
                <input
                  id="reg-password"
                  name="password"
                  type="password"
                  className="field__input"
                  autoComplete="new-password"
                  value={registerData.password}
                  onChange={e => setRegisterData({ ...registerData, password: e.target.value })}
                  required
                  minLength={6}
                />
              </div>

              <div className="field">
                <label htmlFor="reg-confirmPassword" className="field__label">Подтвердите пароль</label>
                <input
                  id="reg-confirmPassword"
                  name="confirmPassword"
                  type="password"
                  className="field__input"
                  autoComplete="new-password"
                  value={registerData.confirmPassword}
                  onChange={e => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                  required
                />
              </div>

              <button type="submit" className="btn btn--primary auth-form__submit" disabled={loading}>
                {loading ? 'Регистрируем...' : 'Зарегистрироваться'}
              </button>
            </form>
          )}

          <div className="auth-switch">
            {isLoginMode ? (
              <p>
                Нет аккаунта?{' '}
                <button type="button" className="auth-switch__link" onClick={() => { setIsLoginMode(false); setError(''); }}>
                  Зарегистрироваться
                </button>
              </p>
            ) : (
              <p>
                Уже есть аккаунт?{' '}
                <button type="button" className="auth-switch__link" onClick={() => { setIsLoginMode(true); setError(''); }}>
                  Войти
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
