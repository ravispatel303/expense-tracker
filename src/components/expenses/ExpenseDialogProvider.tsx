import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { useCategories, useDeleteExpense, useSaveExpense } from '../../hooks/queries';
import type { Expense, ExpenseInput } from '../../types';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { Modal } from '../ui/Modal';
import { useToast } from '../ui/useToast';
import { ExpenseForm } from './ExpenseForm';
import { ExpenseDialogContext } from './useExpenseDialog';

/** Hosts one add/edit expense dialog for the whole app. */
export function ExpenseDialogProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  // Changing the key remounts the form so it starts fresh each time.
  const [formKey, setFormKey] = useState(0);

  const { data: categories = [] } = useCategories();
  const save = useSaveExpense();
  const remove = useDeleteExpense();
  const toast = useToast();

  const open = useCallback((expense?: Expense) => {
    setEditing(expense ?? null);
    setFormKey((k) => k + 1);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setConfirmDelete(false);
  }, []);

  function handleSubmit(input: ExpenseInput) {
    save.mutate(
      { id: editing?.id, input },
      {
        onSuccess: () => {
          toast(editing ? 'Expense updated' : 'Expense added');
          close();
        },
        onError: (err) => toast(err.message, 'error'),
      },
    );
  }

  function handleDelete() {
    if (!editing) return;
    remove.mutate(editing.id, {
      onSuccess: () => {
        toast('Expense deleted');
        close();
      },
      onError: (err) => toast(err.message, 'error'),
    });
  }

  const api = useMemo(() => ({ open }), [open]);

  return (
    <ExpenseDialogContext.Provider value={api}>
      {children}
      <Modal open={isOpen && !confirmDelete} onClose={close} title={editing ? 'Edit expense' : 'Add expense'}>
        <ExpenseForm
          key={formKey}
          categories={categories}
          expense={editing}
          saving={save.isPending}
          onSubmit={handleSubmit}
          onDelete={editing ? () => setConfirmDelete(true) : undefined}
          onCancel={close}
        />
      </Modal>
      <ConfirmDialog
        open={isOpen && confirmDelete}
        title="Delete this expense?"
        message="This can't be undone."
        busy={remove.isPending}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </ExpenseDialogContext.Provider>
  );
}
