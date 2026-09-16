import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const CATEGORY_LABELS = {
  "men's clothing": "Men's Clothing",
  "women's clothing": "Women's Clothing",
  jewelery: "Jewelery",
  electronics: "Electronics",
};

const CATEGORY_COLORS = {
  "Men's Clothing": "#7c3aed",
  "Women's Clothing": "#06b6d4",
  "Jewelery": "#f59e0b",
  "Electronics": "#10b981",
};

export default function SalesByCategoryChart({ products, title = "Products by Category" }) {
  const counts = products.reduce((acc, p) => {
    const label = CATEGORY_LABELS[p.category] || p.category;
    acc[label] = (acc[label] || 0) + 1;
    return acc;
  }, {});

  const data = Object.entries(counts).map(([name, value]) => ({ name, value }));

  return (
    <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-5">
      <h3 className="text-sm font-semibold text-gray-800 mb-4">{title}</h3>
      {data.length === 0 ? (
        <p className="text-xs text-gray-400 py-8 text-center">No products to chart yet.</p>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={70}
              outerRadius={100}
              paddingAngle={3}
            >
              {data.map((entry) => (
                <Cell key={entry.name} fill={CATEGORY_COLORS[entry.name] || "#999"} />
              ))}
            </Pie>
            <Tooltip />
            <Legend layout="vertical" align="right" verticalAlign="middle" iconType="circle" />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}