const categories = [
  { label: "Beauty", slug: "beauty" },
  { label: "Fragrances", slug: "fragrances" },
  { label: "Furniture", slug: "furniture" },
  { label: "Home Decoration", slug: "home-decoration" },
  { label: "Kitchen", slug: "kitchen-accessories" },
  { label: "Laptops", slug: "laptops" },
  { label: "Men's Shirts", slug: "mens-shirts" },
  { label: "Men's Shoes", slug: "mens-shoes" },
  { label: "Men's Watches", slug: "mens-watches" },
  { label: "Mobile Accessories", slug: "mobile-accessories" },
  { label: "Skin Care", slug: "skin-care" },
  { label: "Smartphones", slug: "smartphones" },
  { label: "Sports", slug: "sports-accessories" },
  { label: "Sunglasses", slug: "sunglasses" },
  { label: "Tablets", slug: "tablets" },
  { label: "Tops", slug: "tops" },
  { label: "Women's Bags", slug: "womens-bags" },
  { label: "Women's Dresses", slug: "womens-dresses" },
  { label: "Women's Jewellery", slug: "womens-jewellery" },
  { label: "Women's Shoes", slug: "womens-shoes" },
  { label: "Women's Watches", slug: "womens-watches" },
];

const Categories = ({ selectedCategory = "all", onSelectCategory }) => {
  const allCategories = [...categories, ...categories, ...categories];

  return (
    <div className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen overflow-hidden border-y border-[#eee] bg-[#f8f9fa] px-[8%] py-[30px] max-[768px]:px-[4%] max-[768px]:py-[20px]">
      <div className="mb-6">
        <h2 className="m-0 text-center text-[22px] font-bold text-[#1a1a1a]">
          Categories
        </h2>
      </div>

      <div className="relative w-full overflow-hidden">
        <div className="w-full overflow-hidden py-2">
          <div className="flex w-max animate-cat-marquee gap-[12px] max-[768px]:animate-[marqueeScroll_30s_linear_infinite] max-[768px]:gap-2 max-[480px]:animate-[marqueeScroll_25s_linear_infinite] max-[480px]:gap-[6px]">
            {allCategories.map((category, index) => {
              const isActive = selectedCategory?.toLowerCase() === category.slug;

              return (
                <div key={`${category.slug}-${index}`} className="w-auto flex-none">
                  <button
                    type="button"
                    onClick={() => onSelectCategory && onSelectCategory(category.slug)}
                    className={`inline-block rounded-[8px] border px-6 py-[10px] whitespace-nowrap transition-all duration-200 cursor-pointer max-[768px]:px-4 max-[768px]:py-2 max-[480px]:px-3 max-[480px]:py-[6px] ${
                      isActive
                        ? 'bg-black text-white border-black shadow-md font-semibold'
                        : 'bg-white text-[#1a1a1a] border-[#e5e5e5] hover:-translate-y-[2px] hover:border-[#ccc] hover:bg-[#f5f5f5] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)]'
                    }`}
                  >
                    <span
                      className={`text-[14px] font-medium whitespace-nowrap max-[768px]:text-[12px] max-[480px]:text-[11px] ${
                        isActive ? 'text-white' : 'text-[#1a1a1a]'
                      }`}
                    >
                      {category.label}
                    </span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Categories;