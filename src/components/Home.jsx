import { useState } from 'react';
import HeroCarousel from './home/HeroCarousel';
import TopBrands from './home/TopBrands';
import Categories from './home/Categories';
import AllShop from './home/AllShop';

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState("all");

  return (
    <main className="min-h-screen bg-white">
      {/* 1. Top Hero Banner Carousel */}
      <HeroCarousel />

      {/* 2. Top Brands Infinite Marquee Scroller */}
      <TopBrands />

      {/* 3. Category Selection Bar */}
      <Categories
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      {/* 4. Filter Sidebar & Products Grid */}
      <AllShop
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
      />
    </main>
  );
}