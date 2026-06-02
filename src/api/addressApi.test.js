import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getAllAddresses,
  getAddressById,
  createAddress,
  updateAddress,
  deleteAddress,
} from './addressApi';

// Prevent supabase.js from calling createClient() with undefined env vars
vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
    },
  },
}));

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

function okResponse(data, status = 200) {
  return { ok: true, status, json: () => Promise.resolve(data) };
}

function errorResponse(data, status) {
  return { ok: false, status, json: () => Promise.resolve(data) };
}

// When unauthenticated, getAuthHeaders() returns only Content-Type
const defaultHeaders = { 'Content-Type': 'application/json' };

describe('addressApi', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  describe('getAllAddresses', () => {
    it('fetches all addresses from /api/address', async () => {
      const addresses = [{ id: 1, street: 'Main St' }];
      mockFetch.mockResolvedValue(okResponse(addresses));

      const result = await getAllAddresses();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/address'),
        expect.objectContaining({ headers: defaultHeaders }),
      );
      expect(result).toEqual(addresses);
    });

    it('throws with server error message on failure', async () => {
      mockFetch.mockResolvedValue(errorResponse({ message: 'Not found' }, 404));

      await expect(getAllAddresses()).rejects.toThrow('Not found');
    });
  });

  describe('getAddressById', () => {
    it('fetches a single address by id', async () => {
      const address = { id: 42, street: 'Elm St' };
      mockFetch.mockResolvedValue(okResponse(address));

      const result = await getAddressById(42);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/address/42'),
        expect.objectContaining({ headers: defaultHeaders }),
      );
      expect(result).toEqual(address);
    });
  });

  describe('createAddress', () => {
    it('sends POST with address data', async () => {
      const payload = { street: 'Oak Ave', housenumber: '5' };
      const created = { id: 10, ...payload };
      mockFetch.mockResolvedValue(okResponse(created, 201));

      const result = await createAddress(payload);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/address'),
        expect.objectContaining({
          method: 'POST',
          headers: defaultHeaders,
          body: JSON.stringify(payload),
        }),
      );
      expect(result).toEqual(created);
    });
  });

  describe('updateAddress', () => {
    it('sends PUT with updated address data', async () => {
      const updates = { street: 'New St', housenumber: '7' };
      const updated = { id: 1, ...updates };
      mockFetch.mockResolvedValue(okResponse(updated));

      const result = await updateAddress(1, updates);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/address/1'),
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify(updates),
        }),
      );
      expect(result).toEqual(updated);
    });
  });

  describe('deleteAddress', () => {
    it('sends DELETE and returns null on 204 No Content', async () => {
      mockFetch.mockResolvedValue({ ok: true, status: 204, json: () => Promise.resolve(null) });

      const result = await deleteAddress(1);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/address/1'),
        expect.objectContaining({ method: 'DELETE' }),
      );
      expect(result).toBeNull();
    });
  });

  describe('error handling', () => {
    it('uses fallback message when response body cannot be parsed', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        json: () => Promise.reject(new Error('invalid json')),
      });

      await expect(getAllAddresses()).rejects.toThrow('An error occurred');
    });

    it('uses HTTP status in message when server returns no message field', async () => {
      mockFetch.mockResolvedValue(errorResponse({}, 503));

      await expect(getAllAddresses()).rejects.toThrow('HTTP error 503');
    });
  });
});
