import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import AddressList from './AddressList';

const addresses = [
  { id: 1, street: 'Main St', housenumber: '1', city: 'Amsterdam', postalcode: '1000AA' },
  { id: 2, street: 'Elm St', housenumber: '2', city: 'Rotterdam', postalcode: '3000BB' },
];

function renderList({
  addressList = addresses,
  loading = false,
  searchAddresses = (q) => (q ? [] : addressList),
  onDelete = vi.fn(),
} = {}) {
  return render(
    <MemoryRouter>
      <AddressList
        addresses={addressList}
        loading={loading}
        onDelete={onDelete}
        searchAddresses={searchAddresses}
      />
    </MemoryRouter>,
  );
}

describe('AddressList', () => {
  it('shows loading spinner while fetching', () => {
    renderList({ loading: true });
    expect(screen.getByText('Adressen laden...')).toBeInTheDocument();
  });

  it('shows empty state when there are no addresses', () => {
    renderList({ addressList: [], searchAddresses: () => [] });
    expect(screen.getByText('Nog geen adressen.')).toBeInTheDocument();
  });

  it('renders a card for each address', () => {
    renderList({ searchAddresses: () => addresses });
    expect(screen.getByText('Main St 1')).toBeInTheDocument();
    expect(screen.getByText('Elm St 2')).toBeInTheDocument();
  });

  it('shows no-match message when search yields no results', () => {
    renderList({ searchAddresses: () => [] });
    expect(screen.getByText('Geen adressen gevonden voor je zoekopdracht.')).toBeInTheDocument();
  });

  it('filters displayed cards as the user types in the search bar', async () => {
    renderList({
      searchAddresses: (q) =>
        q ? addresses.filter((a) => a.street.toLowerCase().includes(q.toLowerCase())) : addresses,
    });

    await userEvent.type(screen.getByRole('textbox'), 'Main');

    expect(screen.getByText('Main St 1')).toBeInTheDocument();
    expect(screen.queryByText('Elm St 2')).not.toBeInTheDocument();
  });
});
