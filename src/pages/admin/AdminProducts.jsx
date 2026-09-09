import { useState } from 'react';
import { useManagedProducts } from '../../hooks/useManagedProducts';
import ProductFormModal from '../../components/shared/ProductFormModal';

export default function AdminProducts() {
  const { products, loading, addProduct, updateProduct, deleteProduct } = useManagedProducts();
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const openAdd = () => { setEditingProduct(null); setShowForm(true); };
  const openEdit = (product) => { setEditingProduct(product); setShowForm(true); };

  const handleSave = (data) => {
    if (editingProduct) {
      updateProduct(editingProduct.id, data);
    } else {
      addProduct(data);
    }
    setShowForm(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">All Products</h1>
        <button
          onClick={openAdd}
          className="bg-black text-white text-xs font-semibold px-4 py-2 rounded hover:bg-gray-800 transition cursor-pointer"
        >
          + Add Product
        </button>
      </div>

      <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded px-3 py-2 mb-4">
        Changes here are local to this session and won't persist on refresh until connected to a real backend.
      </p>

      <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
            <tr>
              <th className="text-left px-4 py-3">Product</th>
              <th className="text-left px-4 py-3">Category</th>
              <th className="text-left px-4 py-3">Price</th>
              <th className="text-right px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="px-4 py-6 text-center text-gray-400">Loading...</td></tr>
            ) : products.map((p) => (
              <tr key={p.id} className="border-t border-gray-100">
                <td className="px-4 py-3 flex items-center gap-3">
                  <img src={p.image} alt={p.title} className="w-10 h-10 object-contain bg-gray-50 rounded" />
                  <span className="line-clamp-1 max-w-xs">{p.title}</span>
                </td>
                <td className="px-4 py-3 text-gray-500">{p.category}</td>
                <td className="px-4 py-3 font-semibold">Nrs {p.price.toLocaleString()}</td>
                <td className="px-4 py-3 text-right space-x-3">
                  <button onClick={() => openEdit(p)} className="text-blue-600 hover:underline text-xs font-medium cursor-pointer">Edit</button>
                  <button onClick={() => deleteProduct(p.id)} className="text-red-600 hover:underline text-xs font-medium cursor-pointer">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <ProductFormModal
          initialData={editingProduct}
          onSave={handleSave}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
}