import { useState } from 'react';
import HeroCarousel from '../components/home/HeroCarousel';
import TopBrands from '../components/home/TopBrands';
import Categories from '../components/home/Categories';
import AllShop from '../components/home/AllShop';

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState("all");

  return (
    <main className="min-h-screen bg-yz-bg">
      <div className="mx-auto max-w-360 px-4">
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