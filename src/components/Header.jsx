import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function Header() {
  const location = useLocation();
  const isHome = location.pathname === '/';
  const { logout } = useAuth();

  return (
    <header className="header">
      <div className="header-content">
        <Link to="/" className="header-title">
          <h1>Adressenboek</h1>
        </Link>
        <div className="header-actions">
          {isHome && (
            <Link to="/add" className="btn btn-primary">
              + Adres toevoegen
            </Link>
          )}
          {!isHome && (
            <Link to="/" className="btn btn-secondary">
              Terug
            </Link>
          )}
          <button onClick={logout} className="btn btn-secondary">
            Uitloggen
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;
