export default function StatCard({ label, value, sublabel, color }) {
  return (
    <div className={`rounded-lg p-5 text-white shadow-sm ${color}`}>
      <p className="text-xs font-semibold uppercase tracking-wide text-white/80 mb-1">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
      {sublabel && <p className="text-xs text-white/80 mt-1">{sublabel}</p>}
    </div>
  );
}