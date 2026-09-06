export default function PremiumHero() {
  return (
    <div className="relative w-full h-[420px] rounded-lg overflow-hidden mb-8">
      <img
        src="https://picsum.photos/id/1027/1600/700"
        alt="Premium Collection"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-teal-900/50" />
      <div className="relative z-10 h-full flex flex-col justify-center px-8 md:px-14 max-w-xl">
        <span className="text-red-400 text-xs font-bold tracking-widest uppercase mb-3">
          The Luxury Edit
        </span>
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
          Premium Collection
        </h1>
        <p className="text-white/90 text-sm md:text-base mb-6">
          Iconic watches, fine jewellery, and designer pieces — authenticity guaranteed.
        </p>
        <button className="bg-red-600 hover:bg-red-700 transition text-white text-sm font-semibold px-6 py-3 rounded-full w-fit cursor-pointer">
          Explore luxury
        </button>
      </div>
    </div>
  );
}