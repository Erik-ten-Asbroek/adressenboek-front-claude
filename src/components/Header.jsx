import { Link, useLocation } from 'react-router-dom';

export function Header() {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <header className="header">
      <div className="header-content">
        <Link to="/" className="header-title">
          <h1>Address Book</h1>
        </Link>
        {isHome && (
          <Link to="/add" className="btn btn-primary">
            + Add Address
          </Link>
        )}
        {!isHome && (
          <Link to="/" className="btn btn-secondary">
            Back
          </Link>
        )}
      </div>
    </header>
  );
}

export default Header;
