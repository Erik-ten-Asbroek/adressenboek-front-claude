import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import AddressCard from './AddressCard';

const baseAddress = {
  id: 1,
  street: 'Main St',
  housenumber: '42',
  addition: 'B',
  postalcode: '1234AB',
  city: 'Amsterdam',
  country: 'Netherlands',
};

function renderCard(overrides = {}, onDelete = vi.fn()) {
  return render(
    <MemoryRouter>
      <AddressCard address={{ ...baseAddress, ...overrides }} onDelete={onDelete} />
    </MemoryRouter>,
  );
}

describe('AddressCard', () => {
  describe('display', () => {
    it('shows street, house number and addition joined', () => {
      renderCard();
      expect(screen.getByText('Main St 42 B')).toBeInTheDocument();
    });

    it('omits addition when it is empty', () => {
      renderCard({ addition: '' });
      expect(screen.getByText('Main St 42')).toBeInTheDocument();
    });

    it('shows "Geen straat" when street, housenumber and addition are absent', () => {
      renderCard({ street: '', housenumber: '', addition: '' });
      expect(screen.getByText('Geen straat')).toBeInTheDocument();
    });

    it('shows postal code and city on the city line', () => {
      renderCard();
      expect(screen.getByText('1234AB Amsterdam')).toBeInTheDocument();
    });

    it('omits city line when both postal code and city are absent', () => {
      renderCard({ postalcode: '', city: '' });
      expect(screen.queryByText('1234AB Amsterdam')).not.toBeInTheDocument();
    });

    it('shows country', () => {
      renderCard();
      expect(screen.getByText('Netherlands')).toBeInTheDocument();
    });

    it('links to the edit page for the address', () => {
      renderCard();
      expect(screen.getByRole('link')).toHaveAttribute('href', '/edit/1');
    });
  });

  describe('delete', () => {
    it('shows a confirmation dialog when the delete button is clicked', async () => {
      renderCard();

      await userEvent.click(screen.getByLabelText('Adres verwijderen'));

      expect(screen.getByText('Dit adres verwijderen?')).toBeInTheDocument();
    });

    it('calls onDelete with the address id when user confirms', async () => {
      const onDelete = vi.fn();
      renderCard({}, onDelete);

      await userEvent.click(screen.getByLabelText('Adres verwijderen'));
      await userEvent.click(screen.getByRole('button', { name: 'Verwijderen' }));

      expect(onDelete).toHaveBeenCalledWith(1);
    });

    it('does not call onDelete when user cancels the confirmation', async () => {
      const onDelete = vi.fn();
      renderCard({}, onDelete);

      await userEvent.click(screen.getByLabelText('Adres verwijderen'));
      await userEvent.click(screen.getByRole('button', { name: 'Annuleren' }));

      expect(onDelete).not.toHaveBeenCalled();
    });

    it('closes the dialog after cancelling', async () => {
      renderCard();

      await userEvent.click(screen.getByLabelText('Adres verwijderen'));
      await userEvent.click(screen.getByRole('button', { name: 'Annuleren' }));

      expect(screen.queryByText('Dit adres verwijderen?')).not.toBeInTheDocument();
    });
  });
});
