import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { Category, Expense } from '../../types';
import { ExpenseForm } from './ExpenseForm';

const categories: Category[] = [
  { id: 'c1', name: 'Groceries', color: 'mint', icon: 'shopping-basket', created_at: '' },
  { id: 'c2', name: 'Transport', color: 'sky', icon: 'car', created_at: '' },
];

function setup(props: Partial<Parameters<typeof ExpenseForm>[0]> = {}) {
  const onSubmit = vi.fn();
  const onCancel = vi.fn();
  render(<ExpenseForm categories={categories} onSubmit={onSubmit} onCancel={onCancel} {...props} />);
  return { onSubmit, onCancel, user: userEvent.setup() };
}

describe('ExpenseForm', () => {
  it('submits a new expense with parsed values', async () => {
    const { onSubmit, user } = setup();
    await user.type(screen.getByLabelText(/amount/i), '1,234.5');
    await user.selectOptions(screen.getByLabelText(/category/i), 'c2');
    await user.clear(screen.getByLabelText(/date/i));
    await user.type(screen.getByLabelText(/date/i), '2026-11-20');
    await user.type(screen.getByLabelText(/note/i), '  Train pass  ');
    await user.click(screen.getByRole('button', { name: /add expense/i }));

    expect(onSubmit).toHaveBeenCalledWith({
      amount: 1234.5,
      category_id: 'c2',
      spent_on: '2026-11-20',
      note: 'Train pass',
    });
  });

  it('shows an error and does not submit an invalid amount', async () => {
    const { onSubmit, user } = setup();
    await user.type(screen.getByLabelText(/amount/i), 'abc');
    await user.click(screen.getByRole('button', { name: /add expense/i }));

    expect(screen.getByText(/up to 2 decimals/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/amount/i)).toHaveAttribute('aria-invalid', 'true');
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('pre-fills when editing and allows uncategorized', async () => {
    const expense: Expense = {
      id: 'e1',
      amount: 42,
      category_id: 'c1',
      spent_on: '2026-11-03',
      note: 'Farmers market',
      currency: 'USD',
      created_at: '',
    };
    const onDelete = vi.fn();
    const { onSubmit, user } = setup({ expense, onDelete });

    expect(screen.getByLabelText(/amount/i)).toHaveValue('42.00');
    await user.selectOptions(screen.getByLabelText(/category/i), '');
    await user.click(screen.getByRole('button', { name: /save changes/i }));
    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ amount: 42, category_id: null }));

    await user.click(screen.getByRole('button', { name: /delete/i }));
    expect(onDelete).toHaveBeenCalled();
  });
});
