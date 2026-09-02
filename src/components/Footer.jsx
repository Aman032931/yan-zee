const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <footer className="w-full bg-[#fdfbfbf3] font-sans text-white">

      {/* ================= SERVICES ================= */}
      <section className="bg-[#f7f7f7] px-[8%] py-[40px] text-[#111]">
        <div className="mx-auto grid max-w-[1300px] grid-cols-4 gap-[30px] text-center max-[600px]:grid-cols-2 max-[600px]:gap-[20px]">

          <div className="p-[10px]">
            <div className="mb-[10px] block text-[28px]"></div>
            <h4 className="mb-[6px] text-[15px] font-semibold tracking-[0.3px]">Fast Shipping</h4>
            <p className="m-0 text-[13px] text-[#888]">Fast shipping all across the country</p>
          </div>

          <div className="p-[10px]">
            <div className="mb-[10px] block text-[28px]"></div>
            <h4 className="mb-[6px] text-[15px] font-semibold tracking-[0.3px]">Authentic products</h4>
            <p className="m-0 text-[13px] text-[#888]">100% Authentic products</p>
          </div>

          <div className="p-[10px]">
            <div className="mb-[10px] block text-[28px]"></div>
            <h4 className="mb-[6px] text-[15px] font-semibold tracking-[0.3px]">100% Secure payment</h4>
            <p className="m-0 text-[13px] text-[#888]">We ensure secure transactions</p>
          </div>

          <div className="p-[10px]">
            <div className="mb-[10px] block text-[28px]"></div>
            <h4 className="mb-[6px] text-[15px] font-semibold tracking-[0.3px]">24/7 Support center</h4>
            <p className="m-0 text-[13px] text-[#888]">We ensure quality support</p>
          </div>

        </div>
      </section>

      {/* ================= NEWSLETTER ================= */}
      <section className="mx-auto flex max-w-[1300px] items-center justify-between gap-[40px] border-b border-[#2a2a2a] px-[8%] pb-[40px] pt-[50px] max-[768px]:flex-col max-[768px]:items-stretch max-[768px]:gap-[20px] max-[600px]:px-[8%] max-[600px]:py-[30px]">
        <div className="yz-newsletter-text">
          <h3 className="m-0 mb-[6px] text-[20px] font-semibold tracking-[0.5px]">Stay in the loop</h3>
          <p className="m-0 text-[14px] text-[#aaa]">Get exclusive drops, sales & style edits in your inbox.</p>
        </div>

        <form className="flex w-[420px] shrink-0 max-[768px]:w-full max-[600px]:flex-col max-[600px]:gap-[10px]" onSubmit={(e) => e.preventDefault()}>
          <input
            type="email"
            placeholder="Enter your email"
            required
            className="mr-[10px] h-[48px] flex-1 rounded-[20px] border border-[#444] bg-[#fcfafa] px-4 text-[14px] text-white outline-none placeholder:text-[#666] max-[600px]:rounded-[4px]"
          />
          <button
            type="submit"
            className="h-[48px] cursor-pointer rounded-[20px] border-none bg-[#0e0d0d] px-8 text-[13px] font-semibold tracking-[0.5px] text-[#f8f5f5] transition-colors duration-200 hover:bg-[#e0e0e0] max-[600px]:rounded-[4px]"
          >
            SUBSCRIBE
          </button>
        </form>
      </section>

      {/* ================= MAIN FOOTER ================= */}
      <div className="mx-auto max-w-[1300px] px-[8%] pb-[10px] pt-[50px]">

        {/* FOOTER COLUMNS */}
        <nav className="grid grid-cols-6 gap-[30px] max-[1024px]:grid-cols-3 max-[1024px]:gap-[25px] max-[600px]:grid-cols-2 max-[600px]:gap-[20px]">

          {/* ABOUT US */}
          <div className="yz-footer-column">
            <h3 className="m-0 mb-[18px] text-[13px] font-semibold tracking-[0.8px] text-white">ABOUT US</h3>
            <ul className="m-0 list-none p-0">
              <li className="mb-[10px]"><a href="/about" className="text-[13px] text-[#999] no-underline transition-colors duration-200 hover:text-white">About Us</a></li>
              <li className="mb-[10px]"><a href="/privacy" className="text-[13px] text-[#999] no-underline transition-colors duration-200 hover:text-white">Privacy Policy</a></li>
              <li className="mb-[10px]"><a href="/returns" className="text-[13px] text-[#999] no-underline transition-colors duration-200 hover:text-white">Return Policy</a></li>
              <li className="mb-[10px]"><a href="/terms" className="text-[13px] text-[#999] no-underline transition-colors duration-200 hover:text-white">Terms &amp; conditions</a></li>
              <li className="mb-[10px]"><a href="/non-refundable" className="text-[13px] text-[#999] no-underline transition-colors duration-200 hover:text-white">Non-refundable policy</a></li>
              <li className="mb-[10px]"><a href="/faqs" className="text-[13px] text-[#999] no-underline transition-colors duration-200 hover:text-white">FAQs</a></li>
            </ul>
          </div>

          {/* TOP BRANDS */}
          <div className="yz-footer-column">
            <h3 className="m-0 mb-[18px] text-[13px] font-semibold tracking-[0.8px] text-white">TOP BRANDS</h3>
            <ul className="m-0 list-none p-0">
              <li className="mb-[10px]"><a href="/brands/nike" className="text-[13px] text-[#999] no-underline transition-colors duration-200 hover:text-white">Nike</a></li>
              <li className="mb-[10px]"><a href="/brands/new-balance" className="text-[13px] text-[#999] no-underline transition-colors duration-200 hover:text-white">New Balance</a></li>
              <li className="mb-[10px]"><a href="/brands/adidas" className="text-[13px] text-[#999] no-underline transition-colors duration-200 hover:text-white">Adidas</a></li>
              <li className="mb-[10px]"><a href="/brands/guess" className="text-[13px] text-[#999] no-underline transition-colors duration-200 hover:text-white">Guess</a></li>
              <li className="mb-[10px]"><a href="/brands/tommy-hilfiger" className="text-[13px] text-[#999] no-underline transition-colors duration-200 hover:text-white">Tommy Hilfiger</a></li>
            </ul>
          </div>

          {/* WOMEN FASHION */}
          <div className="yz-footer-column">
            <h3 className="m-0 mb-[18px] text-[13px] font-semibold tracking-[0.8px] text-white">WOMEN FASHION</h3>
            <ul className="m-0 list-none p-0">
              <li className="mb-[10px]"><a href="/women/clothing" className="text-[13px] text-[#999] no-underline transition-colors duration-200 hover:text-white">Clothing</a></li>
              <li className="mb-[10px]"><a href="/women/shoes" className="text-[13px] text-[#999] no-underline transition-colors duration-200 hover:text-white">Shoes</a></li>
              <li className="mb-[10px]"><a href="/women/accessories" className="text-[13px] text-[#999] no-underline transition-colors duration-200 hover:text-white">Accessories</a></li>
              <li className="mb-[10px]"><a href="/women/bags" className="text-[13px] text-[#999] no-underline transition-colors duration-200 hover:text-white">Bags</a></li>
              <li className="mb-[10px]"><a href="/women/sports" className="text-[13px] text-[#999] no-underline transition-colors duration-200 hover:text-white">Sports</a></li>
            </ul>
          </div>

          {/* MEN FASHION */}
          <div className="yz-footer-column">
            <h3 className="m-0 mb-[18px] text-[13px] font-semibold tracking-[0.8px] text-white">MEN FASHION</h3>
            <ul className="m-0 list-none p-0">
              <li className="mb-[10px]"><a href="/men/new-in" className="text-[13px] text-[#999] no-underline transition-colors duration-200 hover:text-white">New In</a></li>
              <li className="mb-[10px]"><a href="/men/clothing" className="text-[13px] text-[#999] no-underline transition-colors duration-200 hover:text-white">Clothing</a></li>
              <li className="mb-[10px]"><a href="/men/shoes" className="text-[13px] text-[#999] no-underline transition-colors duration-200 hover:text-white">Shoes</a></li>
              <li className="mb-[10px]"><a href="/men/bags" className="text-[13px] text-[#999] no-underline transition-colors duration-200 hover:text-white">Bags</a></li>
              <li className="mb-[10px]"><a href="/men/accessories" className="text-[13px] text-[#999] no-underline transition-colors duration-200 hover:text-white">Accessories</a></li>
            </ul>
          </div>

          {/* BEAUTY */}
          <div className="yz-footer-column">
            <h3 className="m-0 mb-[18px] text-[13px] font-semibold tracking-[0.8px] text-white">BEAUTY</h3>
            <ul className="m-0 list-none p-0">
              <li className="mb-[10px]"><a href="/beauty/new-in" className="text-[13px] text-[#999] no-underline transition-colors duration-200 hover:text-white">New In</a></li>
              <li className="mb-[10px]"><a href="/beauty/makeup" className="text-[13px] text-[#999] no-underline transition-colors duration-200 hover:text-white">Makeup</a></li>
              <li className="mb-[10px]"><a href="/beauty/fragrance" className="text-[13px] text-[#999] no-underline transition-colors duration-200 hover:text-white">Fragrance</a></li>
              <li className="mb-[10px]"><a href="/beauty/hair-care" className="text-[13px] text-[#999] no-underline transition-colors duration-200 hover:text-white">Hair care</a></li>
              <li className="mb-[10px]"><a href="/beauty/skincare" className="text-[13px] text-[#999] no-underline transition-colors duration-200 hover:text-white">Skincare</a></li>
            </ul>
          </div>

          {/* KIDS */}
          <div className="yz-footer-column">
            <h3 className="m-0 mb-[18px] text-[13px] font-semibold tracking-[0.8px] text-white">KIDS</h3>
            <ul className="m-0 list-none p-0">
              <li className="mb-[10px]"><a href="/kids/new-arrivals" className="text-[13px] text-[#999] no-underline transition-colors duration-200 hover:text-white">New arrivals</a></li>
              <li className="mb-[10px]"><a href="/kids/clothing" className="text-[13px] text-[#999] no-underline transition-colors duration-200 hover:text-white">Clothing</a></li>
              <li className="mb-[10px]"><a href="/kids/shoes" className="text-[13px] text-[#999] no-underline transition-colors duration-200 hover:text-white">Shoes</a></li>
              <li className="mb-[10px]"><a href="/kids/bags" className="text-[13px] text-[#999] no-underline transition-colors duration-200 hover:text-white">Bags</a></li>
              <li className="mb-[10px]"><a href="/kids/accessories" className="text-[13px] text-[#999] no-underline transition-colors duration-200 hover:text-white">Accessories</a></li>
            </ul>
          </div>

        </nav>

        {/* ================= APP ================= */}
        <div className="mt-[40px] border-t border-[#2a2a2a] pt-[30px]">
          <h3 className="mb-4 text-[13px] font-semibold tracking-[0.8px]">SHOP ON THE GO</h3>
          <div className="flex gap-[12px] max-[600px]:flex-col max-[600px]:items-start">
            <a
              href="https://play.google.com/store"
              target="_blank"
              rel="noreferrer"
            >
              <img
                src="/badges/google-play.svg"
                alt="Get it on Google Play"
                className="h-[44px] w-auto"
              />
            </a>
            <a
              href="https://apps.apple.com/"
              target="_blank"
              rel="noreferrer"
            >
              <img
                src="/badges/app-store.svg"
                alt="Download on the App Store"
                className="h-[44px] w-auto"
              />
            </a>
          </div>
        </div>

      </div>

      {/* ================= SOCIAL MEDIA ================= */}
      <section className="border-y border-[#2a2a2a]">
        <div className="mx-auto flex max-w-[1300px] items-center gap-[30px] px-[8%] py-[20px] max-[768px]:flex-col max-[768px]:gap-[15px] max-[768px]:text-center">
          <h3 className="m-0 text-[13px] font-semibold tracking-[0.8px]">FOLLOW US</h3>
          <div className="flex gap-[12px]">
            <a
              href="https://www.facebook.com/share/1BhW88mRYs/"
              target="_blank"
              rel="noreferrer"
              aria-label="Facebook"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[#444] text-[14px] text-white no-underline transition-all duration-200 hover:border-white hover:bg-white hover:text-black"
            >
              f
            </a>
            <a
              href="https://www.instagram.com/yanzee_group"
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[#444] text-[14px] text-white no-underline transition-all duration-200 hover:border-white hover:bg-white hover:text-black"
            >
              ◎
            </a>
            <a
              href="https://www.tiktok.com/@yanzee_group"
              target="_blank"
              rel="noreferrer"
              aria-label="TikTok"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[#444] text-[14px] text-white no-underline transition-all duration-200 hover:border-white hover:bg-white hover:text-black"
            >
              ♪
            </a>
          </div>
        </div>
      </section>

      {/* ================= BOTTOM BAR ================= */}
      <div className="border-b border-[#2a2a2a]">
        <div className="mx-auto flex max-w-[1300px] flex-wrap items-center justify-between gap-[20px] px-[8%] py-[22px] max-[768px]:flex-col max-[768px]:gap-[15px] max-[768px]:text-center">

          {/* BRAND */}
          <a href="/" className="text-[22px] font-bold italic tracking-[0.5px] text-white no-underline">
            YanZee
          </a>

          {/* PAYMENT METHODS */}
          <div className="flex items-center gap-2 max-[600px]:flex-wrap max-[600px]:justify-center">
            <span className="rounded-[3px] bg-white px-3 py-[6px] text-[9px] font-bold tracking-[0.5px] text-black">VISA</span>
            <span className="rounded-[3px] bg-white px-3 py-[6px] text-[9px] font-bold tracking-[0.5px] text-black">MASTER</span>
            <span className="rounded-[3px] bg-white px-3 py-[6px] text-[9px] font-bold tracking-[0.5px] text-black">AMEX</span>
            <span className="rounded-[3px] bg-white px-3 py-[6px] text-[9px] font-bold tracking-[0.5px] text-black">MADA</span>
          </div>

          {/* COPYRIGHT */}
          <p className="m-0 text-center text-[10px] tracking-[0.3px] text-[#888]">© 2026 Yanzee Group Of Company PVT. LTD. ALL RIGHTS RESERVED</p>

          {/* RIGHT */}
          <div className="flex items-center gap-[20px] max-[768px]:flex-wrap max-[768px]:justify-center">
            <a href="/" className="text-[10px] tracking-[0.3px] text-[#999] no-underline hover:text-white">Yanzee Group of Company PVT. LTD.</a>
            <button onClick={scrollToTop} className="flex cursor-pointer items-center gap-1 border-0 bg-transparent p-0 text-[13px] text-white hover:text-[#ccc]">↑ Top</button>
          </div>

        </div>
      </div>

      {/* ================= POWERED BY ================= */}
      <div className="bg-[#050505] p-4 text-center">
        <p className="m-0 text-[11px] tracking-[0.3px] text-[#666]">
          Powered by{" "}
          <a
            href="https://pravidhidigitalnepal.com.np"
            target="_blank"
            rel="noreferrer"
            className="text-[#888] no-underline transition-colors duration-200 hover:text-white"
          >
            PRAVIDHI DIGITAL INNOVATIONS NEPAL PVT LTD
          </a>
        </p>
      </div>

    </footer>
  );
};

export default Footer;