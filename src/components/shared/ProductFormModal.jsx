import { useState } from 'react';

export default function ProductFormModal({ initialData, onSave, onClose }) {
  const [form, setForm] = useState(
    initialData || {
      title: '',
      category: "men's clothing",
      price: '',
      image: '',
      description: '',
    }
  );
  const [imageError, setImageError] = useState('');

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setImageError('Please choose an image file.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setImageError('Image must be under 2MB.');
      return;
    }

    setImageError('');
    const reader = new FileReader();
    reader.onload = () => {
      // Stored as a local data URL for now — no real upload endpoint exists yet.
      // Swap this for a real upload (returning a hosted URL) once the backend supports it.
      setForm((prev) => ({ ...prev, image: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...form, price: Number(form.price) });
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-bold text-gray-900 mb-4">
          {initialData ? 'Edit Product' : 'Add Product'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">Title</label>
            <input
              required
              value={form.title}
              onChange={handleChange('title')}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-black"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">Category</label>
            <select
              value={form.category}
              onChange={handleChange('category')}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-black"
            >
              <option value="men's clothing">Men's Clothing</option>
              <option value="women's clothing">Women's Clothing</option>
              <option value="jewelery">Jewelery</option>
              <option value="electronics">Electronics</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">Price (Nrs)</label>
            <input
              required
              type="number"
              min="0"
              value={form.price}
              onChange={handleChange('price')}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-black"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">Product Photo</label>

            {form.image && (
              <div className="mb-2 w-24 h-24 bg-gray-50 border border-gray-200 rounded overflow-hidden flex items-center justify-center">
                <img src={form.image} alt="Preview" className="max-w-full max-h-full object-contain" />
              </div>
            )}

            <input
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="w-full border border-gray-300 rounded px-3 py-2 text-xs outline-none file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:bg-black file:text-white file:text-xs file:cursor-pointer cursor-pointer"
            />
            {imageError && <p className="text-xs text-red-600 mt-1">{imageError}</p>}
            <p className="text-[11px] text-gray-400 mt-1">
              Stored locally for this session only — real image hosting isn't connected yet.
            </p>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={handleChange('description')}
              rows={3}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-black resize-none"
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
              className="px-4 py-2 bg-black text-white text-xs font-semibold rounded hover:bg-gray-800 transition cursor-pointer"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}