import { renderHook, act, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('../api/addressApi');

import { useAddresses } from './useAddresses';
import {
  getAllAddresses,
  getAddressById,
  createAddress,
  updateAddress,
  deleteAddress,
} from '../api/addressApi';

const mockAddresses = [
  { id: 1, street: 'Main St', housenumber: '1', city: 'Amsterdam', postalcode: '1000AA' },
  { id: 2, street: 'Elm St', housenumber: '2', city: 'Rotterdam', postalcode: '3000BB' },
];

describe('useAddresses', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getAllAddresses.mockResolvedValue(mockAddresses);
  });

  it('loads addresses on mount', async () => {
    const { result } = renderHook(() => useAddresses());

    expect(result.current.loading).toBe(true);

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.addresses).toEqual(mockAddresses);
    expect(result.current.error).toBeNull();
  });

  it('sets error state when loading fails', async () => {
    getAllAddresses.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useAddresses());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe('Failed to load addresses');
    expect(result.current.addresses).toEqual([]);
  });

  it('creates an address and refreshes the list', async () => {
    const payload = { street: 'Oak Ave', housenumber: '3' };
    createAddress.mockResolvedValue({ id: 3, ...payload });

    const { result } = renderHook(() => useAddresses());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.addAddress(payload);
    });

    expect(createAddress).toHaveBeenCalledWith(payload);
    expect(getAllAddresses).toHaveBeenCalledTimes(2);
  });

  it('updates an address and refreshes the list', async () => {
    updateAddress.mockResolvedValue(undefined);

    const { result } = renderHook(() => useAddresses());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.editAddress(1, { street: 'New St' });
    });

    expect(updateAddress).toHaveBeenCalledWith(1, { street: 'New St' });
    expect(getAllAddresses).toHaveBeenCalledTimes(2);
  });

  it('deletes an address and refreshes the list', async () => {
    deleteAddress.mockResolvedValue(null);

    const { result } = renderHook(() => useAddresses());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.removeAddress(1);
    });

    expect(deleteAddress).toHaveBeenCalledWith(1);
    expect(getAllAddresses).toHaveBeenCalledTimes(2);
  });

  it('fetches a single address by id', async () => {
    getAddressById.mockResolvedValue(mockAddresses[0]);

    const { result } = renderHook(() => useAddresses());
    await waitFor(() => expect(result.current.loading).toBe(false));

    let address;
    await act(async () => {
      address = await result.current.getAddress(1);
    });

    expect(address).toEqual(mockAddresses[0]);
  });

  describe('searchAddresses', () => {
    async function loadedHook() {
      const { result } = renderHook(() => useAddresses());
      await waitFor(() => expect(result.current.loading).toBe(false));
      return result;
    }

    it('returns all addresses when query is empty', async () => {
      const result = await loadedHook();
      expect(result.current.searchAddresses('')).toEqual(mockAddresses);
    });

    it('returns all addresses when query is only whitespace', async () => {
      const result = await loadedHook();
      expect(result.current.searchAddresses('   ')).toEqual(mockAddresses);
    });

    it('filters by street (case-insensitive)', async () => {
      const result = await loadedHook();
      const filtered = result.current.searchAddresses('MAIN');
      expect(filtered).toHaveLength(1);
      expect(filtered[0].street).toBe('Main St');
    });

    it('filters by city', async () => {
      const result = await loadedHook();
      const filtered = result.current.searchAddresses('rotterdam');
      expect(filtered).toHaveLength(1);
      expect(filtered[0].city).toBe('Rotterdam');
    });

    it('filters by postal code', async () => {
      const result = await loadedHook();
      const filtered = result.current.searchAddresses('3000');
      expect(filtered).toHaveLength(1);
      expect(filtered[0].postalcode).toBe('3000BB');
    });

    it('returns empty array when nothing matches', async () => {
      const result = await loadedHook();
      expect(result.current.searchAddresses('xyzxyz')).toHaveLength(0);
    });
  });
});
