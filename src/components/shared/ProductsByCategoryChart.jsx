import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const CATEGORY_LABELS = {
  "men's clothing": "Men's Clothing",
  "women's clothing": "Women's Clothing",
  jewelery: "Jewelery",
  electronics: "Electronics",
};

export default function ProductsByCategoryChart({ products, title = "Products by Category" }) {
  const counts = products.reduce((acc, p) => {
    const label = CATEGORY_LABELS[p.category] || p.category;
    acc[label] = (acc[label] || 0) + 1;
    return acc;
  }, {});

  const data = Object.entries(counts).map(([category, count]) => ({ category, count }));

  return (
    <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-5">
      <h3 className="text-sm font-semibold text-gray-800 mb-4">{title}</h3>
      {data.length === 0 ? (
        <p className="text-xs text-gray-400 py-8 text-center">No products to chart yet.</p>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="category" tick={{ fontSize: 11 }} interval={0} angle={-15} textAnchor="end" height={50} />
            <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey="count" fill="#000000" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}