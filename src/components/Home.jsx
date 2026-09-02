import HeroCarousel from "./home/HeroCarousel";
import TopBrands from "./home/TopBrands";
import Categories from "./home/Categories";
import AllShop from "./home/AllShop";
import SuggestedProducts from "./SuggestedProducts";


const Home = () => {
  return (
    <main id="yanzee-main">
      {/* Hero Carousel */}
      <HeroCarousel />

      {/* Top Brands */}
      <div className="yz-all-shop__brands">
        <TopBrands />
      </div>

      {/* Categories */}
      <Categories />

      <SuggestedProducts/>

      {/* All Shop Section */}
      <AllShop />

    </main>
  );
};

export default Home;