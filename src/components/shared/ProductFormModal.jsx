import { useState } from 'react';

const CATEGORIES = [
  { value: 'FASHION', label: 'Fashion' },
  { value: 'SPORTS', label: 'Sports' },
  { value: 'KIDS', label: 'Kids' },
  { value: 'BEAUTY', label: 'Beauty' },
  { value: 'OUTLET', label: 'Outlet' },
  { value: 'PREMIUM', label: 'Premium' },
  { value: 'HOME_DECOR', label: 'Home Decor' },
];

const AUDIENCES = [
  { value: 'MEN', label: 'Men' },
  { value: 'WOMEN', label: 'Women' },
  { value: 'UNISEX', label: 'Unisex' },
  { value: 'BOY', label: 'Boy' },
  { value: 'GIRL', label: 'Girl' },
  { value: 'KIDS_UNISEX', label: 'Kids (unisex)' },
];

const STATUSES = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'DRAFT', label: 'Draft' },
  { value: 'OUT_OF_STOCK', label: 'Out of stock' },
];

// backend rule: letters, numbers, space, - . /
const SIZE_PATTERN = /^[A-Za-z0-9 ./-]+$/;

const inputClass =
  'w-full border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-black';
const labelClass = 'text-xs font-medium text-gray-600 block mb-1';

const emptyVariant = () => ({ size: '', stock: '' });

function toForm(product) {
  if (!product) {
    return {
      name: '',
      category: 'FASHION',
      audience: 'UNISEX',
      status: 'ACTIVE',
      price: '',
      discountPrice: '',
      description: '',
      variants: [emptyVariant()],
    };
  }
  return {
    name: product.name ?? '',
    category: product.category ?? 'FASHION',
    audience: product.audience ?? 'UNISEX',
    status: product.status ?? 'ACTIVE',
    price: product.price ?? '',
    discountPrice: product.discountPrice ?? '',
    description: product.description ?? '', // the list does not return it, so edits start empty
    variants: product.variants?.length
      ? product.variants.map((v) => ({ size: v.size, stock: v.stock, sku: v.sku ?? undefined }))
      : [emptyVariant()],
  };
}

export default function ProductFormModal({ initialData, onSave, onClose }) {
  const [form, setForm] = useState(() => toForm(initialData));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleVariantChange = (index, field) => (e) =>
    setForm((prev) => ({
      ...prev,
      variants: prev.variants.map((v, i) =>
        i === index ? { ...v, [field]: e.target.value } : v,
      ),
    }));

  const addVariant = () =>
    setForm((prev) => ({ ...prev, variants: [...prev.variants, emptyVariant()] }));

  const removeVariant = (index) =>
    setForm((prev) => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index),
    }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const price = Number(form.price);
    const discountPrice = form.discountPrice === '' ? null : Number(form.discountPrice);

    if (!(price > 0)) return setError('Price must be greater than 0.');
    if (discountPrice !== null && !(discountPrice >= 0 && discountPrice < price)) {
      return setError('Sale price must be lower than the price.');
    }

    const variants = form.variants.map((v) => ({
      ...v,
      size: String(v.size).trim(),
      stock: Number(v.stock),
    }));
    if (variants.some((v) => !v.size || !SIZE_PATTERN.test(v.size))) {
      return setError('Each size may only contain letters, numbers, spaces, - . /');
    }
    if (variants.some((v) => !Number.isInteger(v.stock) || v.stock < 0)) {
      return setError('Stock must be a whole number, 0 or more.');
    }

    const payload = {
      name: form.name.trim(),
      category: form.category,
      audience: form.audience,
      status: form.status,
      price,
      variants,
    };
    if (discountPrice !== null) payload.discountPrice = discountPrice;
    if (form.description.trim()) payload.description = form.description.trim();

    setSaving(true);
    try {
      await onSave(payload); // parent closes the modal on success
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-bold text-gray-900 mb-4">
          {initialData ? 'Edit Product' : 'Add Product'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-3">
          {error && (
            <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              ⚠ {error}
            </div>
          )}

          <div>
            <label className={labelClass}>Name *</label>
            <input required value={form.name} onChange={handleChange('name')} className={inputClass} />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <label className={labelClass}>Category *</label>
              <select value={form.category} onChange={handleChange('category')} className={inputClass}>
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Audience *</label>
              <select value={form.audience} onChange={handleChange('audience')} className={inputClass}>
                {AUDIENCES.map((a) => (
                  <option key={a.value} value={a.value}>{a.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Status *</label>
              <select value={form.status} onChange={handleChange('status')} className={inputClass}>
                {STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Price (Nrs) *</label>
              <input required type="number" min="0" step="any" value={form.price} onChange={handleChange('price')} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Sale price (Nrs)</label>
              <input type="number" min="0" step="any" value={form.discountPrice} onChange={handleChange('discountPrice')} className={inputClass} />
            </div>
          </div>

          <div>
            <label className={labelClass}>Sizes and stock *</label>
            <div className="space-y-2">
              {form.variants.map((v, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    required
                    placeholder="Size (e.g. M)"
                    value={v.size}
                    onChange={handleVariantChange(index, 'size')}
                    className={inputClass}
                  />
                  <input
                    required
                    type="number"
                    min="0"
                    step="1"
                    placeholder="Stock"
                    value={v.stock}
                    onChange={handleVariantChange(index, 'stock')}
                    className={inputClass}
                  />
                  <button
                    type="button"
                    onClick={() => removeVariant(index)}
                    disabled={form.variants.length === 1}
                    className="px-2 text-lg leading-none text-gray-400 hover:text-red-600 disabled:opacity-30 cursor-pointer"
                    aria-label="Remove size"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addVariant}
              className="mt-2 text-xs font-medium text-blue-600 hover:underline cursor-pointer"
            >
              + Add size
            </button>
          </div>

          <div>
            <label className={labelClass}>Description</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={handleChange('description')}
              className={`${inputClass} resize-none`}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-black text-white text-xs font-semibold rounded hover:bg-gray-800 transition cursor-pointer disabled:opacity-60"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}