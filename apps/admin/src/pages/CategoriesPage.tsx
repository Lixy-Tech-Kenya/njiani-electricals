import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { api } from '@/lib/api/client';
import type { Category } from '@njiani/shared';
import Modal from '@/components/Modal';
import ConfirmDialog from '@/components/ConfirmDialog';

function slugify(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

interface CategoryFormData {
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  sortOrder: string;
  metaTitle: string;
  metaDescription: string;
}

const EMPTY_FORM: CategoryFormData = {
  name: '', slug: '', description: '', imageUrl: '',
  sortOrder: '0', metaTitle: '', metaDescription: '',
};

function toForm(c: Category): CategoryFormData {
  return {
    name: c.name, slug: c.slug,
    description: c.description ?? '',
    imageUrl: c.imageUrl ?? '',
    sortOrder: (c.sortOrder ?? 0).toString(),
    metaTitle: c.metaTitle ?? '',
    metaDescription: c.metaDescription ?? '',
  };
}

function CategoryForm({ form, setForm, onSubmit, submitting }: {
  form: CategoryFormData;
  setForm: (f: CategoryFormData) => void;
  onSubmit: () => void;
  submitting: boolean;
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Name *</label>
          <input
            type="text"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value, slug: slugify(e.target.value) })}
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-primary outline-none text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Slug *</label>
          <input
            type="text"
            value={form.slug}
            onChange={e => setForm({ ...form, slug: e.target.value })}
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-primary outline-none text-sm font-mono"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Description</label>
        <textarea
          rows={3}
          value={form.description}
          onChange={e => setForm({ ...form, description: e.target.value })}
          className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-primary outline-none text-sm resize-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Image URL</label>
          <input
            type="text"
            value={form.imageUrl}
            placeholder="https://..."
            onChange={e => setForm({ ...form, imageUrl: e.target.value })}
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-primary outline-none text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Sort Order</label>
          <input
            type="number"
            min="0"
            value={form.sortOrder}
            onChange={e => setForm({ ...form, sortOrder: e.target.value })}
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-primary outline-none text-sm"
          />
        </div>
      </div>

      {/* SEO */}
      <div className="border-t border-gray-100 pt-4 space-y-4">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400">SEO (Optional)</p>
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Meta Title</label>
          <input type="text" value={form.metaTitle} onChange={e => setForm({ ...form, metaTitle: e.target.value })}
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-primary outline-none text-sm" />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Meta Description</label>
          <textarea rows={2} value={form.metaDescription} onChange={e => setForm({ ...form, metaDescription: e.target.value })}
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-primary outline-none text-sm resize-none" />
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <button onClick={onSubmit} disabled={submitting}
          className="bg-primary hover:bg-primary/90 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-colors disabled:opacity-50">
          {submitting ? 'Saving...' : 'Save Category'}
        </button>
      </div>
    </div>
  );
}

export default function CategoriesPage() {
  const qc = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState<Category | null>(null);
  const [form, setForm] = useState<CategoryFormData>(EMPTY_FORM);

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.categories.list(),
  });

  const createMutation = useMutation({
    mutationFn: (d: Parameters<typeof api.categories.create>[0]) => api.categories.create(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['categories'] }); closeModal(); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, d }: { id: string; d: Parameters<typeof api.categories.update>[1] }) => api.categories.update(id, d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['categories'] }); closeModal(); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.categories.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['categories'] }); setDeleting(null); },
  });

  function openCreate() { setEditing(null); setForm(EMPTY_FORM); setModalOpen(true); }
  function openEdit(c: Category) { setEditing(c); setForm(toForm(c)); setModalOpen(true); }
  function closeModal() { setModalOpen(false); setEditing(null); }

  function handleSubmit() {
    const payload = {
      name: form.name,
      slug: form.slug,
      description: form.description || undefined,
      imageUrl: form.imageUrl || undefined,
      sortOrder: parseInt(form.sortOrder) || 0,
      metaTitle: form.metaTitle || undefined,
      metaDescription: form.metaDescription || undefined,
    };
    if (editing) {
      updateMutation.mutate({ id: editing.id, d: payload });
    } else {
      createMutation.mutate(payload);
    }
  }

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
          <p className="text-sm text-gray-400 mt-0.5">{categories.length} categories</p>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-2.5 rounded-xl font-bold text-sm transition-colors shadow-lg shadow-primary/10">
          <Plus size={16} /> New Category
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="p-8 space-y-3">
            {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />)}
          </div>
        ) : !categories.length ? (
          <div className="py-20 text-center text-gray-400 text-sm">
            No categories yet. <button onClick={openCreate} className="text-primary font-bold hover:underline">Create one</button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  {['', 'Name', 'Slug', 'Description', 'Sort', ''].map((h, i) => (
                    <th key={i} className="py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...categories].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)).map(cat => (
                  <tr key={cat.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="py-2 px-4 w-12">
                      {cat.imageUrl ? (
                        <img src={cat.imageUrl} alt="" className="w-10 h-10 rounded-lg object-cover border border-gray-100" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 text-xs font-bold">
                          {cat.name[0]}
                        </div>
                      )}
                    </td>
                    <td className="py-2 px-4 font-medium text-sm">{cat.name}</td>
                    <td className="py-2 px-4 font-mono text-xs text-gray-500">{cat.slug}</td>
                    <td className="py-2 px-4 text-sm text-gray-500 max-w-xs truncate">{cat.description ?? '—'}</td>
                    <td className="py-2 px-4 text-sm text-gray-500">{cat.sortOrder ?? 0}</td>
                    <td className="py-2 px-4">
                      <div className="flex gap-1">
                        <button onClick={() => openEdit(cat)} className="p-1.5 rounded-lg hover:bg-blue-50 hover:text-blue-600 text-gray-400 transition-colors">
                          <Pencil size={15} />
                        </button>
                        <button onClick={() => setDeleting(cat)} className="p-1.5 rounded-lg hover:bg-red-50 hover:text-red-500 text-gray-400 transition-colors">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      <Modal open={modalOpen} title={editing ? `Edit: ${editing.name}` : 'New Category'} onClose={closeModal} width="max-w-xl">
        <CategoryForm form={form} setForm={setForm} onSubmit={handleSubmit} submitting={isSaving} />
      </Modal>

      {/* Delete confirm */}
      <ConfirmDialog
        open={!!deleting}
        title="Delete Category"
        message={`Are you sure you want to delete "${deleting?.name}"? Products in this category will be unlinked.`}
        onConfirm={() => deleting && deleteMutation.mutate(deleting.id)}
        onCancel={() => setDeleting(null)}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
