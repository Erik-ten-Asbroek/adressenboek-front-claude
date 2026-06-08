import { useState } from 'react';
import AddressCard from './AddressCard';
import SearchBar from './SearchBar';

export function AddressList({ addresses, loading, onDelete, searchAddresses }) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredAddresses = searchAddresses(searchQuery);

  if (loading) {
    return <div className="loading">Adressen laden...</div>;
  }

  return (
    <div className="address-list-container">
      <SearchBar value={searchQuery} onChange={setSearchQuery} />

      {addresses.length === 0 ? (
        <div className="empty-state">
          <p>Nog geen adressen.</p>
          <p>Voeg je eerste adres toe om te beginnen!</p>
        </div>
      ) : filteredAddresses.length === 0 ? (
        <div className="empty-state">
          <p>Geen adressen gevonden voor je zoekopdracht.</p>
        </div>
      ) : (
        <div className="address-list">
          {filteredAddresses.map(address => (
            <AddressCard
              key={address.id}
              address={address}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default AddressList;
