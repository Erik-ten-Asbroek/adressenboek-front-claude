import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import AddressForm from './AddressForm';

function LocationDisplay() {
  const location = useLocation();
  return <div data-testid="location">{location.pathname}</div>;
}

function renderAddForm({ onSubmit = vi.fn() } = {}) {
  return render(
    <MemoryRouter initialEntries={['/add']}>
      <Routes>
        <Route path="/add" element={<AddressForm onSubmit={onSubmit} />} />
        <Route path="/" element={<LocationDisplay />} />
      </Routes>
    </MemoryRouter>,
  );
}

function renderEditForm({ onSubmit = vi.fn(), getAddress = vi.fn() } = {}) {
  return render(
    <MemoryRouter initialEntries={['/edit/1']}>
      <Routes>
        <Route path="/edit/:id" element={<AddressForm onSubmit={onSubmit} getAddress={getAddress} />} />
        <Route path="/" element={<LocationDisplay />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('AddressForm', () => {
  describe('add mode', () => {
    it('renders the add form heading', () => {
      renderAddForm();
      expect(screen.getByRole('heading', { name: 'Add Address' })).toBeInTheDocument();
    });

    it('shows validation error when required fields are empty', () => {
      const { container } = renderAddForm();
      fireEvent.submit(container.querySelector('form'));
      expect(screen.getByText('Street and house number are required')).toBeInTheDocument();
    });

    it('calls onSubmit with null id and navigates to / on success', async () => {
      const onSubmit = vi.fn().mockResolvedValue(undefined);
      renderAddForm({ onSubmit });

      await userEvent.type(screen.getByLabelText('Street *'), 'Main St');
      await userEvent.type(screen.getByLabelText('Number *'), '42');
      await userEvent.type(screen.getByLabelText('City'), 'Amsterdam');
      await userEvent.click(screen.getByRole('button', { name: 'Add Address' }));

      await waitFor(() => expect(onSubmit).toHaveBeenCalled());
      expect(onSubmit).toHaveBeenCalledWith(
        null,
        expect.objectContaining({ street: 'Main St', housenumber: '42', city: 'Amsterdam' }),
      );
      await waitFor(() => expect(screen.getByTestId('location')).toHaveTextContent('/'));
    });

    it('shows an error message when onSubmit throws', async () => {
      const onSubmit = vi.fn().mockRejectedValue(new Error('Save failed'));
      renderAddForm({ onSubmit });

      await userEvent.type(screen.getByLabelText('Street *'), 'Main St');
      await userEvent.type(screen.getByLabelText('Number *'), '42');
      await userEvent.click(screen.getByRole('button', { name: 'Add Address' }));

      await waitFor(() => expect(screen.getByText('Failed to save address')).toBeInTheDocument());
    });

    it('navigates to / when Cancel is clicked', async () => {
      renderAddForm();
      await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
      await waitFor(() => expect(screen.getByTestId('location')).toHaveTextContent('/'));
    });
  });

  describe('edit mode', () => {
    const existingAddress = {
      id: 1,
      street: 'Old St',
      housenumber: 10,
      addition: 'A',
      postalcode: '1234AB',
      city: 'Amsterdam',
      country: 'Netherlands',
    };

    it('renders the edit form heading after loading', async () => {
      const getAddress = vi.fn().mockResolvedValue(existingAddress);
      renderEditForm({ getAddress });
      await waitFor(() => expect(screen.getByText('Edit Address')).toBeInTheDocument());
    });

    it('pre-fills inputs with the existing address data', async () => {
      const getAddress = vi.fn().mockResolvedValue(existingAddress);
      renderEditForm({ getAddress });

      await waitFor(() => expect(screen.getByDisplayValue('Old St')).toBeInTheDocument());
      // housenumber is a number from the API — the fix converts it to a string for the input
      expect(screen.getByDisplayValue('10')).toBeInTheDocument();
      expect(screen.getByDisplayValue('A')).toBeInTheDocument();
    });

    it('calls onSubmit with the address id (string) on update', async () => {
      const getAddress = vi.fn().mockResolvedValue({ ...existingAddress, housenumber: '42' });
      const onSubmit = vi.fn().mockResolvedValue(undefined);
      renderEditForm({ getAddress, onSubmit });

      await waitFor(() => expect(screen.getByDisplayValue('Old St')).toBeInTheDocument());
      await userEvent.click(screen.getByRole('button', { name: 'Update' }));

      await waitFor(() =>
        expect(onSubmit).toHaveBeenCalledWith('1', expect.objectContaining({ street: 'Old St' })),
      );
    });

    it('shows error when getAddress fails', async () => {
      const getAddress = vi.fn().mockRejectedValue(new Error('Not found'));
      renderEditForm({ getAddress });

      await waitFor(() =>
        expect(screen.getByText('Failed to load address')).toBeInTheDocument(),
      );
    });
  });
});
