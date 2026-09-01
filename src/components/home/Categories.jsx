

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
    <div className="yz-section yz-section--categories">
      <div className="yz-section-head yz-section-head--solo">
        <h2>Categories</h2>
      </div>
      <div className="yz-cat-marquee-wrapper">
        <div className="yz-cat-marquee">
          <div className="yz-cat-marquee__track">
            {allCategories.map((category, index) => (
              <div key={`${category}-${index}`} className="yz-cat-marquee__tile">
                <a 
                  className="yz-cat-tile yz-cat-tile--text" 
                  href={`/category/${category.toLowerCase().replace(/ /g, '-')}`}
                >
                  <span className="yz-cat-tile__label">{category}</span>
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