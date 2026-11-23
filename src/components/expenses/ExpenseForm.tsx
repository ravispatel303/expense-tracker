import { useState, type FormEvent } from 'react';
import { toISODate } from '../../lib/dates';
import { readLastCategory, rememberLastCategory } from './lastCategory';
import { MAX_NOTE_LENGTH, parseAmount } from '../../lib/validation';
import type { Category, Expense, ExpenseInput } from '../../types';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';

interface ExpenseFormProps {
  categories: Category[];
  expense?: Expense | null;
  saving?: boolean;
  onSubmit: (input: ExpenseInput) => void;
  onDelete?: () => void;
  onCancel: () => void;
}

export function ExpenseForm({ categories, expense, saving, onSubmit, onDelete, onCancel }: ExpenseFormProps) {
  const [amount, setAmount] = useState(expense ? expense.amount.toFixed(2) : '');
  const [categoryId, setCategoryId] = useState(() => {
    if (expense) return expense.category_id ?? '';
    const last = readLastCategory();
    return last && categories.some((c) => c.id === last) ? last : (categories[0]?.id ?? '');
  });
  const [date, setDate] = useState(() => expense?.spent_on ?? toISODate(new Date()));
  const [note, setNote] = useState(expense?.note ?? '');
  const [amountError, setAmountError] = useState<string | null>(null);
  const [dateError, setDateError] = useState<string | null>(null);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const parsed = parseAmount(amount);
    const amountErr = 'error' in parsed ? parsed.error : null;
    const dateErr = /^\d{4}-\d{2}-\d{2}$/.test(date) ? null : 'Pick a date.';
    setAmountError(amountErr);
    setDateError(dateErr);
    if (amountErr || dateErr || 'error' in parsed) return;
    if (!expense) rememberLastCategory(categoryId);
    onSubmit({
      amount: parsed.value,
      category_id: categoryId || null,
      spent_on: date,
      note: note.trim() || null,
    });
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <Input
        label="Amount"
        prefix="$"
        inputMode="decimal"
        autoComplete="off"
        placeholder="0.00"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        error={amountError}
        className="text-lg font-semibold"
      />
      <Select label="Category" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
        <option value="">Uncategorized</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </Select>
      <Input
        label="Date"
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        error={dateError}
      />
      <Input
        label="Note (optional)"
        placeholder="e.g. Lunch with team"
        maxLength={MAX_NOTE_LENGTH}
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />

      <div className="mt-2 flex items-center gap-2">
        {onDelete && (
          <Button variant="danger-ghost" onClick={onDelete} className="mr-auto">
            Delete
          </Button>
        )}
        <Button variant="secondary" onClick={onCancel} className={onDelete ? '' : 'ml-auto'}>
          Cancel
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? 'Saving…' : expense ? 'Save changes' : 'Add expense'}
        </Button>
      </div>
    </form>
  );
}
