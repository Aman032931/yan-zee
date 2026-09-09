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

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...form, price: Number(form.price) });
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
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
            <label className="text-xs font-medium text-gray-600 block mb-1">Image URL</label>
            <input
              value={form.image}
              onChange={handleChange('image')}
              placeholder="https://..."
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-black"
            />
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