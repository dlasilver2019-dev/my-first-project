import React from 'react';

interface AppProps {
  title?: string;
}
export const Footer: React.FC<AppProps> = () => {
  return (
<footer className="footer">
        <div className="container footer__inner">
          <span>© {new Date().getFullYear()} ТурбоПоиск</span>
          <a className="footer__link" href="#">Политика конфиденциальности</a>
        </div>
      </footer>)}