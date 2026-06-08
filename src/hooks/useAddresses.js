import { useState, useEffect, useCallback } from 'react';
import {
  getAllAddresses,
  getAddressById,
  createAddress,
  updateAddress,
  deleteAddress,
} from '../api/addressApi';

export function useAddresses() {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadAddresses = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getAllAddresses();
      setAddresses(data || []);
      setError(null);
    } catch (err) {
      setError('Adressen laden mislukt');
      console.error('Error loading addresses:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAddresses();
  }, [loadAddresses]);

  const addAddress = useCallback(async (address) => {
    try {
      const newAddress = await createAddress(address);
      await loadAddresses();
      return newAddress;
    } catch (err) {
      setError('Adres toevoegen mislukt');
      console.error('Error adding address:', err);
      throw err;
    }
  }, [loadAddresses]);

  const editAddress = useCallback(async (id, updates) => {
    try {
      await updateAddress(id, updates);
      await loadAddresses();
    } catch (err) {
      setError('Adres bijwerken mislukt');
      console.error('Error updating address:', err);
      throw err;
    }
  }, [loadAddresses]);

  const removeAddress = useCallback(async (id) => {
    try {
      await deleteAddress(id);
      await loadAddresses();
    } catch (err) {
      setError('Adres verwijderen mislukt');
      console.error('Error deleting address:', err);
      throw err;
    }
  }, [loadAddresses]);

  const getAddress = useCallback(async (id) => {
    try {
      return await getAddressById(id);
    } catch (err) {
      setError('Adres ophalen mislukt');
      console.error('Error getting address:', err);
      throw err;
    }
  }, []);

  const searchAddresses = useCallback((query) => {
    if (!query.trim()) {
      return addresses;
    }
    const lowerQuery = query.toLowerCase();
    return addresses.filter(address =>
      address.street?.toLowerCase().includes(lowerQuery) ||
      address.city?.toLowerCase().includes(lowerQuery) ||
      address.postalcode?.toLowerCase().includes(lowerQuery)
    );
  }, [addresses]);

  return {
    addresses,
    loading,
    error,
    addAddress,
    editAddress,
    removeAddress,
    getAddress,
    searchAddresses,
    refreshAddresses: loadAddresses,
  };
}

export default useAddresses;
