import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, Upload, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { api } from '@/lib/api/client';
import type { Product, Category } from '@njiani/shared';
import Modal from '@/components/Modal';
import ConfirmDialog from '@/components/ConfirmDialog';

const STATUS_STYLES: Record<string, string> = {
  ACTIVE:       'bg-green-100 text-green-700',
  INACTIVE:     'bg-gray-100 text-gray-500',
  OUT_OF_STOCK: 'bg-red-100 text-red-600',
};

function slugify(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

interface ProductFormData {
  name: string;
  sku: string;
  slug: string;
  categoryId: string;
  price: string;         // display in KES, convert to cents on submit
  description: string;
  imageUrls: string[];
  status: string;
  isFeatured: boolean;
  stockQuantity: string;
  lowStockThreshold: string;
  metaTitle: string;
  metaDescription: string;
}

const EMPTY_FORM: ProductFormData = {
  name: '', sku: '', slug: '', categoryId: '', price: '',
  description: '', imageUrls: [''], status: 'ACTIVE',
  isFeatured: false, stockQuantity: '0', lowStockThreshold: '5',
  metaTitle: '', metaDescription: '',
};

function toForm(p: Product): ProductFormData {
  return {
    name: p.name, sku: p.sku, slug: p.slug, categoryId: p.categoryId,
    price: (p.price / 100).toString(), description: p.description,
    imageUrls: p.imageUrls.length ? p.imageUrls : [''],
    status: p.status, isFeatured: p.isFeatured,
    stockQuantity: p.stockQuantity.toString(),
    lowStockThreshold: p.lowStockThreshold.toString(),
    metaTitle: p.metaTitle ?? '', metaDescription: p.metaDescription ?? '',
  };
}

function ProductForm({
  form, setForm, categories, onSubmit, submitting, uploadingIdx, onImageUpload,
}: {
  form: ProductFormData;
  setForm: (f: ProductFormData) => void;
  categories: Category[];
  onSubmit: () => void;
  submitting: boolean;
  uploadingIdx: number | null;
  onImageUpload: (idx: number, file: File) => void;
}) {
  const fileRefs = useRef<(HTMLInputElement | null)[]>([]);

  function field(key: keyof ProductFormData, label: string, type = 'text', hint?: string) {
    return (
      <div>
        <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">{label}</label>
        {hint && <p className="text-[10px] text-gray-400 mb-1">{hint}</p>}
        <input
          type={type}
          value={form[key] as string}
          onChange={e => setForm({ ...form, [key]: e.target.value })}
          className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-primary outline-none text-sm transition-all"
        />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Basic */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
          <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">SKU *</label>
          <input type="text" value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })}
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-primary outline-none text-sm" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {field('slug', 'Slug *')}
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Category *</label>
          <select value={form.categoryId} onChange={e => setForm({ ...form, categoryId: e.target.value })}
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-primary outline-none text-sm bg-white">
            <option value="">Select category...</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Price (KES) *</label>
          <input type="number" min="0" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })}
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-primary outline-none text-sm" />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Stock Qty</label>
          <input type="number" min="0" value={form.stockQuantity} onChange={e => setForm({ ...form, stockQuantity: e.target.value })}
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-primary outline-none text-sm" />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Low Stock Alert</label>
          <input type="number" min="0" value={form.lowStockThreshold} onChange={e => setForm({ ...form, lowStockThreshold: e.target.value })}
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-primary outline-none text-sm" />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Description *</label>
        <textarea rows={4} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
          className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-primary outline-none text-sm resize-none" />
      </div>

      {/* Images */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Images *</label>
        <div className="space-y-2">
          {form.imageUrls.map((url, idx) => (
            <div key={idx} className="flex gap-2 items-center">
              {url && <img src={url} alt="" className="w-10 h-10 rounded-lg object-cover border border-gray-200 flex-shrink-0" />}
              <input
                type="text"
                value={url}
                placeholder="https://... or upload below"
                onChange={e => {
                  const urls = [...form.imageUrls];
                  urls[idx] = e.target.value;
                  setForm({ ...form, imageUrls: urls });
                }}
                className="flex-grow px-3 py-2 rounded-xl border border-gray-200 focus:border-primary outline-none text-sm"
              />
              <input
                type="file"
                accept="image/*"
                ref={el => { fileRefs.current[idx] = el; }}
                className="hidden"
                onChange={e => { if (e.target.files?.[0]) onImageUpload(idx, e.target.files[0]); }}
              />
              <button type="button" onClick={() => fileRefs.current[idx]?.click()}
                className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors text-gray-500 flex-shrink-0"
                title="Upload image">
                {uploadingIdx === idx ? <span className="text-xs">...</span> : <Upload size={15} />}
              </button>
              {form.imageUrls.length > 1 && (
                <button type="button" onClick={() => setForm({ ...form, imageUrls: form.imageUrls.filter((_, i) => i !== idx) })}
                  className="p-2 rounded-xl border border-gray-200 hover:bg-red-50 hover:text-red-500 transition-colors text-gray-400 flex-shrink-0">
                  <Trash2 size={15} />
                </button>
              )}
            </div>
          ))}
          <button type="button" onClick={() => setForm({ ...form, imageUrls: [...form.imageUrls, ''] })}
            className="text-xs text-primary hover:underline font-medium">+ Add image URL</button>
        </div>
      </div>

      {/* Status + Featured */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Status</label>
          <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-primary outline-none text-sm bg-white">
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="OUT_OF_STOCK">Out of Stock</option>
          </select>
        </div>
        <div className="flex items-center gap-3 pt-6">
          <input type="checkbox" id="featured" checked={form.isFeatured} onChange={e => setForm({ ...form, isFeatured: e.target.checked })}
            className="w-4 h-4 rounded accent-primary" />
          <label htmlFor="featured" className="text-sm font-medium text-gray-700">Featured product</label>
        </div>
      </div>

      {/* SEO */}
      <div className="border-t border-gray-100 pt-4 space-y-4">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400">SEO (Optional)</p>
        {field('metaTitle', 'Meta Title')}
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Meta Description</label>
          <textarea rows={2} value={form.metaDescription} onChange={e => setForm({ ...form, metaDescription: e.target.value })}
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-primary outline-none text-sm resize-none" />
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <button onClick={onSubmit} disabled={submitting}
          className="bg-primary hover:bg-primary/90 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-colors disabled:opacity-50">
          {submitting ? 'Saving...' : 'Save Product'}
        </button>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductFormData>(EMPTY_FORM);
  const [uploadingIdx, setUploadingIdx] = useState<number | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'products', page],
    queryFn: () => api.products.adminList({ page, limit: 15 }),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.categories.list(),
  });

  const createMutation = useMutation({
    mutationFn: (d: Parameters<typeof api.products.create>[0]) => api.products.create(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'products'] }); closeModal(); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, d }: { id: string; d: Parameters<typeof api.products.update>[1] }) => api.products.update(id, d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'products'] }); closeModal(); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.products.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'products'] }); setDeleting(null); },
  });

  function openCreate() { setEditing(null); setForm(EMPTY_FORM); setModalOpen(true); }
  function openEdit(p: Product) { setEditing(p); setForm(toForm(p)); setModalOpen(true); }
  function closeModal() { setModalOpen(false); setEditing(null); }

  async function handleImageUpload(idx: number, file: File) {
    setUploadingIdx(idx);
    try {
      const res = await api.upload.image(file) as { url: string };
      const urls = [...form.imageUrls];
      urls[idx] = res.url;
      setForm({ ...form, imageUrls: urls });
    } catch { /* ignore */ } finally { setUploadingIdx(null); }
  }

  function handleSubmit() {
    const payload = {
      name: form.name,
      sku: form.sku,
      slug: form.slug,
      categoryId: form.categoryId,
      price: Math.round(parseFloat(form.price) * 100),
      description: form.description,
      imageUrls: form.imageUrls.filter(Boolean),
      status: form.status as 'ACTIVE' | 'INACTIVE' | 'OUT_OF_STOCK',
      isFeatured: form.isFeatured,
      stockQuantity: parseInt(form.stockQuantity) || 0,
      lowStockThreshold: parseInt(form.lowStockThreshold) || 5,
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
      <div className="flex items-center justify-between mb-5 md:mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-sm text-gray-400 mt-0.5">{data?.meta.total ?? '—'} total products</p>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-3 md:px-4 py-2.5 rounded-xl font-bold text-sm transition-colors shadow-lg shadow-primary/10">
          <Plus size={16} /> <span className="hidden sm:inline">New </span>Product
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="p-8 space-y-3">
            {Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-14 bg-gray-100 rounded animate-pulse" />)}
          </div>
        ) : !data?.data.length ? (
          <div className="py-20 text-center text-gray-400 text-sm">No products yet. <button onClick={openCreate} className="text-primary font-bold hover:underline">Create one</button></div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="py-3 px-3 md:px-4 text-[10px] font-bold uppercase tracking-widest text-gray-400"></th>
                    <th className="py-3 px-3 md:px-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">Name</th>
                    <th className="py-3 px-3 md:px-4 text-[10px] font-bold uppercase tracking-widest text-gray-400 hidden md:table-cell">SKU</th>
                    <th className="py-3 px-3 md:px-4 text-[10px] font-bold uppercase tracking-widest text-gray-400 hidden lg:table-cell">Category</th>
                    <th className="py-3 px-3 md:px-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">Price</th>
                    <th className="py-3 px-3 md:px-4 text-[10px] font-bold uppercase tracking-widest text-gray-400 hidden sm:table-cell">Stock</th>
                    <th className="py-3 px-3 md:px-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">Status</th>
                    <th className="py-3 px-3 md:px-4"></th>
                  </tr>
                </thead>
                <tbody>
                  {data.data.map(product => (
                    <tr key={product.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="py-2 px-3 md:px-4 w-12">
                        <div className="w-9 h-9 md:w-10 md:h-10 rounded-lg overflow-hidden bg-gray-100">
                          {product.imageUrls[0] && <img src={product.imageUrls[0]} alt="" className="w-full h-full object-cover" />}
                        </div>
                      </td>
                      <td className="py-2 px-3 md:px-4">
                        <div className="flex items-center gap-1.5">
                          <span className="font-medium text-sm">{product.name}</span>
                          {product.isFeatured && <Star size={12} className="text-yellow-400 fill-yellow-400 flex-shrink-0" />}
                        </div>
                      </td>
                      <td className="py-2 px-3 md:px-4 font-mono text-xs text-gray-500 hidden md:table-cell">{product.sku}</td>
                      <td className="py-2 px-3 md:px-4 text-sm text-gray-500 hidden lg:table-cell">{product.category?.name ?? '—'}</td>
                      <td className="py-2 px-3 md:px-4 text-sm font-bold whitespace-nowrap">KES {(product.price / 100).toLocaleString()}</td>
                      <td className="py-2 px-3 md:px-4 text-sm hidden sm:table-cell">
                        <span className={product.stockQuantity <= product.lowStockThreshold ? 'text-red-500 font-bold' : 'text-gray-700'}>
                          {product.stockQuantity}
                        </span>
                      </td>
                      <td className="py-2 px-3 md:px-4">
                        <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full whitespace-nowrap ${STATUS_STYLES[product.status]}`}>
                          {product.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-2 px-3 md:px-4">
                        <div className="flex gap-1">
                          <button onClick={() => openEdit(product)} className="p-2 rounded-lg hover:bg-blue-50 hover:text-blue-600 text-gray-400 transition-colors">
                            <Pencil size={15} />
                          </button>
                          <button onClick={() => setDeleting(product)} className="p-2 rounded-lg hover:bg-red-50 hover:text-red-500 text-gray-400 transition-colors">
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {data.meta.totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
                <p className="text-xs text-gray-400">Page {data.meta.page} of {data.meta.totalPages}</p>
                <div className="flex gap-2">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors">
                    <ChevronLeft size={16} />
                  </button>
                  <button onClick={() => setPage(p => Math.min(data.meta.totalPages, p + 1))} disabled={page === data.meta.totalPages} className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors">
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Create / Edit Modal */}
      <Modal open={modalOpen} title={editing ? `Edit: ${editing.name}` : 'New Product'} onClose={closeModal} width="max-w-3xl">
        <ProductForm
          form={form} setForm={setForm}
          categories={categories}
          onSubmit={handleSubmit}
          submitting={isSaving}
          uploadingIdx={uploadingIdx}
          onImageUpload={handleImageUpload}
        />
      </Modal>

      {/* Delete confirm */}
      <ConfirmDialog
        open={!!deleting}
        title="Delete Product"
        message={`Are you sure you want to delete "${deleting?.name}"? This action cannot be undone.`}
        onConfirm={() => deleting && deleteMutation.mutate(deleting.id)}
        onCancel={() => setDeleting(null)}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
