import { Pencil, Plus, Tags } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { CategoryIcon } from '../components/CategoryIcon';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { EmptyState, ErrorState, Skeleton } from '../components/ui/EmptyState';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { useToast } from '../components/ui/useToast';
import { CATEGORY_ICONS, COLOR_BG, COLOR_LABEL } from '../config/categories';
import { useCategories, useDeleteCategory, useMonthExpenses, useSaveCategory } from '../hooks/queries';
import { useNow } from '../hooks/useNow';
import { cn } from '../lib/cn';
import { formatCurrency } from '../lib/format';
import { summarizeMonth } from '../lib/stats';
import { MAX_CATEGORY_NAME_LENGTH, validateCategoryName } from '../lib/validation';
import { CATEGORY_COLORS, type Category, type CategoryColor, type CategoryInput } from '../types';

interface CategoryFormProps {
  category: Category | null;
  existingNames: string[];
  saving: boolean;
  onSubmit: (input: CategoryInput) => void;
  onDelete?: () => void;
  onCancel: () => void;
}

function CategoryForm({ category, existingNames, saving, onSubmit, onDelete, onCancel }: CategoryFormProps) {
  const [name, setName] = useState(category?.name ?? '');
  const [color, setColor] = useState<CategoryColor>(category?.color ?? 'lavender');
  const [icon, setIcon] = useState(category?.icon ?? 'tag');
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const others = existingNames.filter((n) => n !== category?.name);
    const err = validateCategoryName(name, others);
    setError(err);
    if (!err) onSubmit({ name: name.trim(), color, icon });
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      <div className="flex items-end gap-3">
        <CategoryIcon icon={icon} color={color} />
        <div className="flex-1">
          <Input
            label="Name"
            placeholder="e.g. Coffee"
            maxLength={MAX_CATEGORY_NAME_LENGTH}
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={error}
          />
        </div>
      </div>

      <fieldset>
        <legend className="mb-2 text-sm font-medium">Color</legend>
        <div className="flex flex-wrap gap-2">
          {CATEGORY_COLORS.map((c) => (
            <label key={c} className="cursor-pointer">
              <input
                type="radio"
                name="color"
                value={c}
                checked={color === c}
                onChange={() => setColor(c)}
                className="peer sr-only"
              />
              <span
                title={COLOR_LABEL[c]}
                className={cn(
                  'peer-checked:border-primary peer-focus-visible:ring-primary-soft block size-9 rounded-xl border-2 border-transparent transition peer-focus-visible:ring-4',
                  COLOR_BG[c],
                )}
              />
              <span className="sr-only">{COLOR_LABEL[c]}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-2 text-sm font-medium">Icon</legend>
        <div className="grid grid-cols-8 gap-1.5">
          {Object.entries(CATEGORY_ICONS).map(([key, Icon]) => (
            <label key={key} className="cursor-pointer">
              <input
                type="radio"
                name="icon"
                value={key}
                checked={icon === key}
                onChange={() => setIcon(key)}
                className="peer sr-only"
              />
              <span className="text-text-muted peer-checked:bg-primary-soft peer-checked:text-primary peer-focus-visible:ring-primary hover:bg-surface-muted grid aspect-square place-items-center rounded-lg transition peer-focus-visible:ring-2">
                <Icon className="size-4" />
              </span>
              <span className="sr-only">{key.replace('-', ' ')}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="flex items-center gap-2">
        {onDelete && (
          <Button variant="danger-ghost" onClick={onDelete} className="mr-auto">
            Delete
          </Button>
        )}
        <Button variant="secondary" onClick={onCancel} className={onDelete ? '' : 'ml-auto'}>
          Cancel
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? 'Saving…' : category ? 'Save changes' : 'Add category'}
        </Button>
      </div>
    </form>
  );
}

export function CategoriesPage() {
  const toast = useToast();
  const now = useNow();
  const categories = useCategories();
  const expenses = useMonthExpenses(now);
  const save = useSaveCategory();
  const remove = useDeleteCategory();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [formKey, setFormKey] = useState(0);

  const summary = summarizeMonth(now, expenses.data ?? [], categories.data ?? []);
  const spentBy = new Map(summary.byCategory.map((c) => [c.categoryId, c]));
  const names = (categories.data ?? []).map((c) => c.name);

  function openForm(category: Category | null) {
    setEditing(category);
    setConfirmDelete(false);
    setFormKey((k) => k + 1);
    setOpen(true);
  }

  function close() {
    setOpen(false);
    setConfirmDelete(false);
  }

  function handleSubmit(input: CategoryInput) {
    save.mutate(
      { id: editing?.id, input },
      {
        onSuccess: () => {
          toast(editing ? 'Category updated' : 'Category added');
          close();
        },
        onError: (err) =>
          toast(err.message.includes('duplicate') ? 'You already have that category.' : err.message, 'error'),
      },
    );
  }

  function handleDelete() {
    if (!editing) return;
    remove.mutate(editing.id, {
      onSuccess: () => {
        toast('Category deleted');
        close();
      },
      onError: (err) => toast(err.message, 'error'),
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Categories</h1>
          <p className="text-text-muted mt-1 text-sm">Spending shown for this month.</p>
        </div>
        <Button onClick={() => openForm(null)}>
          <Plus className="size-4" />
          Add category
        </Button>
      </div>

      {categories.error && <ErrorState message={categories.error.message} />}

      {categories.isPending ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      ) : (categories.data ?? []).length === 0 ? (
        <Card>
          <EmptyState
            icon={Tags}
            title="No categories"
            message="Categories help you see where your money goes."
            action={<Button onClick={() => openForm(null)}>Add category</Button>}
          />
        </Card>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {(categories.data ?? []).map((c) => {
            const stats = spentBy.get(c.id);
            return (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => openForm(c)}
                  aria-label={`Edit ${c.name}`}
                  className="group border-border bg-surface hover:border-primary/40 flex w-full items-center gap-3 rounded-2xl border p-4 text-left transition hover:shadow-sm"
                >
                  <CategoryIcon icon={c.icon} color={c.color} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold">{c.name}</span>
                    <span className="text-text-muted block text-xs tabular-nums">
                      {stats
                        ? `${formatCurrency(stats.total)} · ${stats.count} ${stats.count === 1 ? 'expense' : 'expenses'}`
                        : 'No spending yet'}
                    </span>
                  </span>
                  <Pencil className="text-text-muted size-4 opacity-0 transition group-hover:opacity-100" />
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <Modal open={open && !confirmDelete} onClose={close} title={editing ? 'Edit category' : 'Add category'}>
        <CategoryForm
          key={formKey}
          category={editing}
          existingNames={names}
          saving={save.isPending}
          onSubmit={handleSubmit}
          onDelete={editing ? () => setConfirmDelete(true) : undefined}
          onCancel={close}
        />
      </Modal>
      <ConfirmDialog
        open={open && confirmDelete}
        title={`Delete "${editing?.name}"?`}
        message="Its expenses will be kept as Uncategorized, and any budgets for it will be removed."
        busy={remove.isPending}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}
