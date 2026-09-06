const TAB_LABELS = {
  All: "All",
  "men's clothing": "Men's Clothing",
  "women's clothing": "Women's Clothing",
};

export default function CategoryTabs({ activeTab, onSelect }) {
  const tabs = ["All", "men's clothing", "women's clothing"];

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {tabs.map((tab) => {
        const isActive = activeTab === tab;
        return (
          <button
            key={tab}
            onClick={() => onSelect(tab)}
            className={`px-4 py-2 rounded-full text-xs font-semibold border transition cursor-pointer ${
              isActive
                ? "bg-black text-white border-black"
                : "bg-white text-gray-700 border-gray-300 hover:border-gray-500"
            }`}
          >
            {TAB_LABELS[tab]}
          </button>
        );
      })}
    </div>
  );
}