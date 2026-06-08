import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect } from 'vitest';
import SearchBar from './SearchBar';

describe('SearchBar', () => {
  it('renders the search input', () => {
    render(<SearchBar value="" onChange={vi.fn()} />);
    expect(screen.getByPlaceholderText('Contacten zoeken...')).toBeInTheDocument();
  });

  it('calls onChange with the typed value', async () => {
    const onChange = vi.fn();
    render(<SearchBar value="" onChange={onChange} />);

    await userEvent.type(screen.getByRole('textbox'), 'elm');

    expect(onChange).toHaveBeenCalled();
  });

  it('does not show clear button when value is empty', () => {
    render(<SearchBar value="" onChange={vi.fn()} />);
    expect(screen.queryByLabelText('Zoekopdracht wissen')).not.toBeInTheDocument();
  });

  it('shows clear button when value is not empty', () => {
    render(<SearchBar value="elm" onChange={vi.fn()} />);
    expect(screen.getByLabelText('Zoekopdracht wissen')).toBeInTheDocument();
  });

  it('calls onChange with empty string when clear button is clicked', async () => {
    const onChange = vi.fn();
    render(<SearchBar value="elm" onChange={onChange} />);

    await userEvent.click(screen.getByLabelText('Zoekopdracht wissen'));

    expect(onChange).toHaveBeenCalledWith('');
  });
});
