import { useState } from 'react';
import AddressCard from './AddressCard';
import SearchBar from './SearchBar';

export function AddressList({ addresses, loading, onDelete, searchAddresses }) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredAddresses = searchAddresses(searchQuery);

  if (loading) {
    return <div className="loading">Loading addresses...</div>;
  }

  return (
    <div className="address-list-container">
      <SearchBar value={searchQuery} onChange={setSearchQuery} />

      {addresses.length === 0 ? (
        <div className="empty-state">
          <p>No addresses yet.</p>
          <p>Add your first address to get started!</p>
        </div>
      ) : filteredAddresses.length === 0 ? (
        <div className="empty-state">
          <p>No addresses match your search.</p>
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
