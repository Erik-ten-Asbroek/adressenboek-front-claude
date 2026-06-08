import { Link } from 'react-router-dom';

export function AddressCard({ address, onDelete }) {
  const displayText = [address.street, address.housenumber, address.addition]
    .filter(Boolean)
    .join(' ');

  const cityLine = [address.postalcode, address.city]
    .filter(Boolean)
    .join(' ');

  const handleDelete = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm(`Dit adres verwijderen?`)) {
      onDelete(address.id);
    }
  };

  return (
    <div className="address-card">
      <Link to={`/edit/${address.id}`} className="address-card-link">
        <div className="address-icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
        </div>
        <div className="address-info">
          <h3 className="address-street">{displayText || 'Geen straat'}</h3>
          {cityLine && <p className="address-detail">{cityLine}</p>}
          {address.country && <p className="address-detail">{address.country}</p>}
        </div>
      </Link>
      <button
        type="button"
        onClick={handleDelete}
        className="btn-delete"
        aria-label="Adres verwijderen"
      >
        &times;
      </button>
    </div>
  );
}

export default AddressCard;
