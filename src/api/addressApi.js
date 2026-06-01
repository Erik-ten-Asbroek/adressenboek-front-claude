import { supabase } from '../lib/supabase';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

async function getAuthHeaders() {
  const { data: { session } } = await supabase.auth.getSession();
  return session
    ? { Authorization: `Bearer ${session.access_token}`, 'Content-Type': 'application/json' }
    : { 'Content-Type': 'application/json' };
}

async function handleResponse(response) {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An error occurred' }));
    throw new Error(error.message || `HTTP error ${response.status}`);
  }
  if (response.status === 204) {
    return null;
  }
  return response.json();
}

export async function getAllAddresses() {
  const response = await fetch(`${API_BASE_URL}/api/address`, {
    headers: await getAuthHeaders(),
  });
  return handleResponse(response);
}

export async function getAddressById(id) {
  const response = await fetch(`${API_BASE_URL}/api/address/${id}`, {
    headers: await getAuthHeaders(),
  });
  return handleResponse(response);
}

export async function createAddress(address) {
  const response = await fetch(`${API_BASE_URL}/api/address`, {
    method: 'POST',
    headers: await getAuthHeaders(),
    body: JSON.stringify(address),
  });
  return handleResponse(response);
}

export async function updateAddress(id, address) {
  const response = await fetch(`${API_BASE_URL}/api/address/${id}`, {
    method: 'PUT',
    headers: await getAuthHeaders(),
    body: JSON.stringify(address),
  });
  return handleResponse(response);
}

export async function deleteAddress(id) {
  const response = await fetch(`${API_BASE_URL}/api/address/${id}`, {
    method: 'DELETE',
    headers: await getAuthHeaders(),
  });
  return handleResponse(response);
}

export default {
  getAllAddresses,
  getAddressById,
  createAddress,
  updateAddress,
  deleteAddress,
};
