// Simple category data with just text (no images for cleaner look)
const categories = [
  "Makeup",
  "Skincare",
  "Hair Care",
  "Fragrances",
  "Bath & Body",
  "K-Beauty",
  "Travel Minis",
  "Bestsellers",
  "Gift Sets",
  "Nail Care",
  "Tops & Tees",
  "New In",
  "Dresses",
  "Handbags",
  "Premium",
  "Just In",
];

const Categories = () => {
  // Duplicate for smooth infinite scroll
  const allCategories = [...categories, ...categories, ...categories];

  return (
    <div className="overflow-hidden border-y border-[#eee] bg-[#f8f9fa] px-[8%] py-[30px] max-[768px]:px-[4%] max-[768px]:py-[20px]">
      <div className="mb-6">
        <h2 className="m-0 text-center text-[22px] font-bold text-[#1a1a1a]">
          Categories
        </h2>
      </div>
      <div className="relative w-full overflow-hidden">
        <div className="w-full overflow-hidden py-2">
          <div className="flex w-max animate-cat-marquee gap-[12px] max-[768px]:animate-[marqueeScroll_30s_linear_infinite] max-[768px]:gap-2 max-[480px]:animate-[marqueeScroll_25s_linear_infinite] max-[480px]:gap-[6px]">
            {allCategories.map((category, index) => (
              <div key={`${category}-${index}`} className="w-auto flex-none">
                <a
                  className="inline-block rounded-[8px] border border-[#e5e5e5] bg-white px-6 py-[10px] whitespace-nowrap no-underline transition-all duration-200 hover:-translate-y-[2px] hover:border-[#ccc] hover:bg-[#f5f5f5] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] max-[768px]:px-4 max-[768px]:py-2 max-[480px]:px-3 max-[480px]:py-[6px]"
                  href={`/category/${category.toLowerCase().replace(/ /g, '-')}`}
                >
                  <span className="text-[14px] font-medium text-[#1a1a1a] whitespace-nowrap max-[768px]:text-[12px] max-[480px]:text-[11px]">
                    {category}
                  </span>
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Categories;