const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

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
  const response = await fetch(`${API_BASE_URL}/api/address`);
  return handleResponse(response);
}

export async function getAddressById(id) {
  const response = await fetch(`${API_BASE_URL}/api/address/${id}`);
  return handleResponse(response);
}

export async function createAddress(address) {
  const response = await fetch(`${API_BASE_URL}/api/address`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(address),
  });
  return handleResponse(response);
}

export async function updateAddress(id, address) {
  const response = await fetch(`${API_BASE_URL}/api/address/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(address),
  });
  return handleResponse(response);
}

export async function deleteAddress(id) {
  const response = await fetch(`${API_BASE_URL}/api/address/${id}`, {
    method: 'DELETE',
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
