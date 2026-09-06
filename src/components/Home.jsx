import { useState } from 'react';
import HeroCarousel from './home/HeroCarousel';
import TopBrands from './home/TopBrands';
import Categories from './home/Categories';
import AllShop from './home/AllShop';

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState("all");

  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-[1440px] px-4">
        <HeroCarousel />
        <TopBrands />
        <Categories
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />
        <AllShop
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
        />
      </div>
    </main>
  );
}