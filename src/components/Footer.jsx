import googlePlayIcon from "../assets/google-play.svg";
import appStoreIcon from "../assets/app-store.svg";
import mada from "../assets/mada.svg";
import amex from "../assets/amex.svg";
import masterCard from "../assets/mastercard.svg";
import visa from "../assets/visa.svg";
import pravidhiLogo from "../assets/pravidhi-logo.png";

const TRUST_BADGES = [
  {
    icon: "🚀",
    title: "Fast Shipping",
    text: "Fast shipping all across the country",
    ring: "bg-red-500/15 text-red-400",
  },
  {
    icon: "✅",
    title: "Authentic Products",
    text: "100% authentic products, always",
    ring: "bg-emerald-500/15 text-emerald-400",
  },
  {
    icon: "🔒",
    title: "Secure Payment",
    text: "We ensure secure transactions",
    ring: "bg-amber-500/15 text-amber-400",
  },
  {
    icon: "📞",
    title: "24/7 Support",
    text: "We ensure quality support",
    ring: "bg-pink-500/15 text-pink-400",
  },
];

const LINK_COLUMNS = [
  {
    title: "Company",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Return Policy", href: "/returns" },
      { label: "Terms & conditions", href: "/terms" },
      { label: "Non-refundable policy", href: "/non-refundable" },
      { label: "FAQs", href: "/faqs" },
    ],
  },
  {
    title: "Brands",
    links: [
      { label: "Nike", href: "/brands/nike" },
      { label: "New Balance", href: "/brands/new-balance" },
      { label: "Adidas", href: "/brands/adidas" },
      { label: "Guess", href: "/brands/guess" },
      { label: "Tommy Hilfiger", href: "/brands/tommy-hilfiger" },
    ],
  },
  {
    title: "Fashion",
    links: [
      { label: "Clothing", href: "/fashion/clothing" },
      { label: "Shoes", href: "/fashion/shoes" },
      { label: "Accessories", href: "/fashion/accessories" },
      { label: "Bags", href: "/fashion/bags" },
      { label: "Sports", href: "/sports" },
    ],
  },
  {
    title: "Women",
    links: [
      { label: "New In", href: "/women/new-in" },
      { label: "Clothing", href: "/women/clothing" },
      { label: "Shoes", href: "/women/shoes" },
      { label: "Bags", href: "/women/bags" },
      { label: "Accessories", href: "/women/accessories" },
    ],
  },
  {
    title: "Beauty",
    links: [
      { label: "New In", href: "/beauty/new-in" },
      { label: "Makeup", href: "/beauty/makeup" },
      { label: "Fragrance", href: "/beauty/fragrance" },
      { label: "Hair care", href: "/beauty/hair-care" },
      { label: "Skincare", href: "/beauty/skincare" },
    ],
  },
  {
    title: "Premium",
    links: [
      { label: "New arrivals", href: "/premium/new-arrivals" },
      { label: "Clothing", href: "/premium/clothing" },
      { label: "Shoes", href: "/premium/shoes" },
      { label: "Bags", href: "/premium/bags" },
      { label: "Accessories", href: "/premium/accessories" },
    ],
  },
];

const SOCIALS = [
  { label: "Facebook", glyph: "f", href: "https://www.facebook.com/share/1BhW88mRYs/" },
  { label: "Instagram", glyph: "◎", href: "https://www.instagram.com/yanzee_group" },
  { label: "TikTok", glyph: "♪", href: "https://www.tiktok.com/@yanzee_group" },
];

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="w-full bg-black text-gray-300 mt-15">
      {/* ================= TRUST BADGES ================= */}
      <section className="border-b border-gray-800 px-[6%] py-10">
        <div className="mx-auto grid max-w-[1300px] grid-cols-2 gap-6 text-center md:grid-cols-4">
          {TRUST_BADGES.map((badge) => (
            <div key={badge.title} className="px-2">
              <div
                className={`mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full text-xl ${badge.ring}`}
              >
                {badge.icon}
              </div>
              <h4 className="mb-1 text-sm font-semibold text-white">
                {badge.title}
              </h4>
              <p className="m-0 text-xs text-gray-500">{badge.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ================= NEWSLETTER ================= */}
      <section className="border-b border-gray-800 px-[6%] py-8">
        <div className="mx-auto flex max-w-[1300px] flex-col items-start justify-between gap-5 md:flex-row md:items-center">
          <div>
            <h3 className="font-heading m-0 text-xl font-bold text-white">
              Stay in the loop
            </h3>
            <p className="m-0 mt-1 text-sm text-gray-500">
              Get exclusive drops, sales &amp; style edits in your inbox.
            </p>
          </div>

          <form
            className="flex w-full shrink-0 gap-2 md:w-[420px]"
            onSubmit={(e) => e.preventDefault()}
          >
            <input
              type="email"
              placeholder="Enter your email"
              required
              className="h-11 flex-1 rounded-full border border-gray-700 bg-transparent px-4 text-sm text-white outline-none placeholder:text-gray-500 focus:border-red-500"
            />
            <button
              type="submit"
              className="h-11 shrink-0 cursor-pointer rounded-full border-none bg-red-600 px-6 text-xs font-semibold tracking-widest text-white hover:bg-red-700"
            >
              SUBSCRIBE
            </button>
          </form>
        </div>
      </section>

      {/* ================= LINK COLUMNS ================= */}
      <div className="mx-auto max-w-[1300px] px-[6%] pt-12">
        <nav className="grid grid-cols-2 gap-8 sm:grid-cols-3 md:grid-cols-6">
          {LINK_COLUMNS.map((column) => (
            <div key={column.title}>
              <h3 className="m-0 mb-4 text-[12px] font-bold uppercase tracking-widest text-white">
                {column.title}
              </h3>
              <ul className="m-0 list-none space-y-2.5 p-0">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-[13px] text-gray-500 no-underline hover:text-red-500"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        {/* ================= APP + SOCIAL ================= */}
        <div className="mt-10 flex flex-wrap items-center justify-between gap-8 border-t border-gray-800 pt-8">
          <div>
            <h3 className="m-0 mb-3 text-[12px] font-bold uppercase tracking-widest text-white">
              Shop on the go
            </h3>
            <div className="flex gap-3">
              <a
                href="https://play.google.com/store"
                target="_blank"
                rel="noreferrer"
                className="flex h-11 items-center rounded-full border border-gray-700 bg-transparent px-4 hover:border-gray-500"
              >
                <img
                  src={googlePlayIcon}
                  alt="Get it on Google Play"
                  className="h-6 w-auto"
                />
              </a>
              <a
                href="https://apps.apple.com/"
                target="_blank"
                rel="noreferrer"
                className="flex h-11 items-center rounded-full border border-gray-700 bg-transparent px-4 hover:border-gray-500"
              >
                <img
                  src={appStoreIcon}
                  alt="Download on the App Store"
                  className="h-6 w-auto"
                />
              </a>
            </div>
          </div>

          <div>
            <h3 className="m-0 mb-3 text-[12px] font-bold uppercase tracking-widest text-white">
              Follow us
            </h3>
            <div className="flex gap-3">
              {SOCIALS.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={social.label}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-700 text-sm text-gray-400 no-underline hover:border-red-500 hover:text-red-500"
                >
                  {social.glyph}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ================= BOTTOM BAR ================= */}
      <div className="mt-10 border-t border-gray-800 bg-black px-[6%] py-6">
        <div className="mx-auto flex max-w-[1300px] flex-wrap items-center justify-between gap-4">
          <a
            href="/"
            className="font-heading text-xl font-bold italic text-white no-underline"
          >
            YanZee
          </a>

          <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
            <span>© 2026 YanZee Group Of Company PVT. LTD. ALL RIGHTS RESERVED.</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <img src={visa} alt="VISA" className="h-5 w-auto object-contain" />
              <img
                src={masterCard}
                alt="Mastercard"
                className="h-5 w-auto object-contain"
              />
              <img src={amex} alt="AMEX" className="h-5 w-auto object-contain" />
              <img src={mada} alt="MADA" className="h-5 w-auto object-contain" />
            </div>

            <button
              onClick={scrollToTop}
              className="cursor-pointer border-0 bg-transparent p-0 text-xs text-gray-500 hover:text-red-500"
            >
              ↑ Top
            </button>
          </div>
        </div>
      </div>

      {/* ================= POWERED BY ================= */}
      <div className="border-t border-gray-800 bg-black p-4 text-center">
        <div className="flex flex-wrap items-center justify-center gap-1.5 text-xs text-gray-600">
          <span>Powered by</span>
          <img
            src={pravidhiLogo}
            alt="Pravidhi logo"
            className="h-4 w-auto object-contain"
          />
          <a
            href="https://pravidhidigitalnepal.com.np"
            target="_blank"
            rel="noreferrer"
            className="text-gray-500 no-underline hover:text-red-500"
          >
            PRAVIDHI DIGITAL INNOVATIONS NEPAL PVT LTD
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;