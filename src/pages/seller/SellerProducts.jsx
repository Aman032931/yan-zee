import { useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { useManagedProducts } from '../../hooks/useManagedProducts';
import ProductFormModal from '../../components/shared/ProductFormModal';

const STATUS_STYLES = {
  ACTIVE: 'bg-emerald-50 text-emerald-700',
  DRAFT: 'bg-gray-100 text-gray-600',
  OUT_OF_STOCK: 'bg-red-50 text-red-700',
};

export default function SellerProducts() {
  const { shop, shopLoading } = useOutletContext();
  const { products, loading, error, addProduct, editProduct, removeProduct } =
    useManagedProducts(Boolean(shop));

  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [actionError, setActionError] = useState('');

  const openAdd = () => {
    setEditingProduct(null);
    setShowForm(true);
  };
  const openEdit = (product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  // the modal shows any error thrown here and stays open
  const handleSave = async (data) => {
    if (editingProduct) {
      await editProduct(editingProduct.id, data);
    } else {
      await addProduct(data);
    }
    setShowForm(false);
  };

  const handleDelete = async (product) => {
    if (!window.confirm(`Delete "${product.name}"?`)) return;
    setActionError('');
    try {
      await removeProduct(product.id);
    } catch (err) {
      setActionError(err.message);
    }
  };

  if (shopLoading) {
    return <p className="text-sm text-gray-500">Loading…</p>;
  }

  if (!shop) {
    return (
      <div>
        <h1 className="mb-2 text-2xl font-bold text-gray-900">My Products</h1>
        <p className="mb-4 text-sm text-gray-500">Create your shop before adding products.</p>
        <Link to="/seller" className="text-sm font-medium text-blue-600 hover:underline">
          Go to dashboard
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Products</h1>
        <button
          onClick={openAdd}
          className="bg-black text-white text-xs font-semibold px-4 py-2 rounded hover:bg-gray-800 transition cursor-pointer"
        >
          + Add Product
        </button>
      </div>

      {(error || actionError) && (
        <p className="mb-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          ⚠ {error || actionError}
        </p>
      )}

      <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
            <tr>
              <th className="text-left px-4 py-3">Product</th>
              <th className="text-left px-4 py-3">Category</th>
              <th className="text-left px-4 py-3">Price</th>
              <th className="text-left px-4 py-3">Stock</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="text-right px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="px-4 py-6 text-center text-gray-400">Loading...</td></tr>
            ) : products.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-6 text-center text-gray-400">No products yet. Add your first one.</td></tr>
            ) : (
              products.map((p) => (
                <tr key={p.id} className="border-t border-gray-100">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {p.image ? (
                        <img src={p.image} alt={p.name} className="w-10 h-10 object-contain bg-gray-50 rounded" />
                      ) : (
                        <div className="w-10 h-10 rounded bg-gray-100" />
                      )}
                      <span className="line-clamp-1 max-w-xs">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {p.category.replace(/_/g, ' ')}
                    <span className="block text-[11px] text-gray-400">{p.audience}</span>
                  </td>
                  <td className="px-4 py-3 font-semibold">
                    {p.discountPrice > 0 && p.discountPrice < p.price ? (
                      <>
                        Nrs {p.discountPrice.toLocaleString()}
                        <span className="ml-1 text-xs font-normal text-gray-400 line-through">
                          {p.price.toLocaleString()}
                        </span>
                      </>
                    ) : (
                      <>Nrs {p.price.toLocaleString()}</>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{p.totalStock}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-[2px] text-[11px] font-medium ${STATUS_STYLES[p.status] || 'bg-gray-100 text-gray-600'}`}>
                      {p.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right space-x-3 whitespace-nowrap">
                    <button onClick={() => openEdit(p)} className="text-blue-600 hover:underline text-xs font-medium cursor-pointer">Edit</button>
                    <button onClick={() => handleDelete(p)} className="text-red-600 hover:underline text-xs font-medium cursor-pointer">Delete</button>
                  </td>
                </tr>
              ))
            )}
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