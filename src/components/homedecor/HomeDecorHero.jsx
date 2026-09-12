export default function HomeDecorHero() {
  return (
    <div className="relative w-full h-175 overflow-hidden">
      <img src="https://picsum.photos/id/1080/1600/700" alt="Home Decor & Appliances" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative z-10 h-full flex flex-col justify-center px-8 md:px-14 max-w-xl">
        <span className="text-red-500 text-xs font-bold tracking-widest uppercase mb-3">Live Beautifully 2026</span>
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">Home Decor & Appliances</h1>
        <p className="text-white/90 text-sm md:text-base mb-6">Furniture, kitchen essentials, lighting, and smart appliances to elevate every room.</p>
        <button className="bg-red-600 hover:bg-red-700 transition text-white text-sm font-semibold px-6 py-3 rounded-full w-fit cursor-pointer">Shop the home</button>
      </div>
    </div>
  );
}