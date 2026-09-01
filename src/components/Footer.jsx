

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <footer className="yz-footer">

      {/* ================= SERVICES ================= */}
      <section className="yz-services">
        <div className="yz-services-grid">

          <div className="yz-service">
            <div className="yz-service-icon"></div>
            <h4>Fast Shipping</h4>
            <p>Fast shipping all across the country</p>
          </div>

          <div className="yz-service">
            <div className="yz-service-icon"></div>
            <h4>Authentic products</h4>
            <p>100% Authentic products</p>
          </div>

          <div className="yz-service">
            <div className="yz-service-icon"></div>
            <h4>100% Secure payment</h4>
            <p>We ensure secure transactions</p>
          </div>

          <div className="yz-service">
            <div className="yz-service-icon"></div>
            <h4>24/7 Support center</h4>
            <p>We ensure quality support</p>
          </div>

        </div>
      </section>

      {/* ================= NEWSLETTER ================= */}
      <section className="yz-newsletter">
        <div className="yz-newsletter-text">
          <h3>Stay in the loop</h3>
          <p>Get exclusive drops, sales & style edits in your inbox.</p>
        </div>

        <form className="yz-newsletter-form" onSubmit={(e) => e.preventDefault()}>
          <input
            type="email"
            placeholder="Enter your email"
            required
          />
          <button type="submit">SUBSCRIBE</button>
        </form>
      </section>

      {/* ================= MAIN FOOTER ================= */}
      <div className="yz-main-footer">

        {/* FOOTER COLUMNS */}
        <nav className="yz-footer-columns">

          {/* ABOUT US */}
          <div className="yz-footer-column">
            <h3>ABOUT US</h3>
            <ul>
              <li><a href="/about">About Us</a></li>
              <li><a href="/privacy">Privacy Policy</a></li>
              <li><a href="/returns">Return Policy</a></li>
              <li><a href="/terms">Terms &amp; conditions</a></li>
              <li><a href="/non-refundable">Non-refundable policy</a></li>
              <li><a href="/faqs">FAQs</a></li>
            </ul>
          </div>

          {/* TOP BRANDS */}
          <div className="yz-footer-column">
            <h3>TOP BRANDS</h3>
            <ul>
              <li><a href="/brands/nike">Nike</a></li>
              <li><a href="/brands/new-balance">New Balance</a></li>
              <li><a href="/brands/adidas">Adidas</a></li>
              <li><a href="/brands/guess">Guess</a></li>
              <li><a href="/brands/tommy-hilfiger">Tommy Hilfiger</a></li>
            </ul>
          </div>

          {/* WOMEN FASHION */}
          <div className="yz-footer-column">
            <h3>WOMEN FASHION</h3>
            <ul>
              <li><a href="/women/clothing">Clothing</a></li>
              <li><a href="/women/shoes">Shoes</a></li>
              <li><a href="/women/accessories">Accessories</a></li>
              <li><a href="/women/bags">Bags</a></li>
              <li><a href="/women/sports">Sports</a></li>
            </ul>
          </div>

          {/* MEN FASHION */}
          <div className="yz-footer-column">
            <h3>MEN FASHION</h3>
            <ul>
              <li><a href="/men/new-in">New In</a></li>
              <li><a href="/men/clothing">Clothing</a></li>
              <li><a href="/men/shoes">Shoes</a></li>
              <li><a href="/men/bags">Bags</a></li>
              <li><a href="/men/accessories">Accessories</a></li>
            </ul>
          </div>

          {/* BEAUTY */}
          <div className="yz-footer-column">
            <h3>BEAUTY</h3>
            <ul>
              <li><a href="/beauty/new-in">New In</a></li>
              <li><a href="/beauty/makeup">Makeup</a></li>
              <li><a href="/beauty/fragrance">Fragrance</a></li>
              <li><a href="/beauty/hair-care">Hair care</a></li>
              <li><a href="/beauty/skincare">Skincare</a></li>
            </ul>
          </div>

          {/* KIDS */}
          <div className="yz-footer-column">
            <h3>KIDS</h3>
            <ul>
              <li><a href="/kids/new-arrivals">New arrivals</a></li>
              <li><a href="/kids/clothing">Clothing</a></li>
              <li><a href="/kids/shoes">Shoes</a></li>
              <li><a href="/kids/bags">Bags</a></li>
              <li><a href="/kids/accessories">Accessories</a></li>
            </ul>
          </div>

        </nav>

        {/* ================= APP ================= */}
        <div className="yz-app-section">
          <h3>SHOP ON THE GO</h3>
          <div className="yz-store-buttons">
            <a
              href="https://play.google.com/store"
              target="_blank"
              rel="noreferrer"
            >
              <img
                src="/badges/google-play.svg"
                alt="Get it on Google Play"
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
              />
            </a>
          </div>
        </div>

      </div>

      {/* ================= SOCIAL MEDIA ================= */}
      <section className="yz-follow">
        <div className="yz-follow-inner">
          <h3>FOLLOW US</h3>
          <div className="yz-social-icons">
            <a
              href="https://www.facebook.com/share/1BhW88mRYs/"
              target="_blank"
              rel="noreferrer"
              aria-label="Facebook"
            >
              f
            </a>
            <a
              href="https://www.instagram.com/yanzee_group"
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
            >
              ◎
            </a>
            <a
              href="https://www.tiktok.com/@yanzee_group"
              target="_blank"
              rel="noreferrer"
              aria-label="TikTok"
            >
              ♪
            </a>
          </div>
        </div>
      </section>

      {/* ================= BOTTOM BAR ================= */}
      <div className="yz-bottom-bar">
        <div className="yz-bottom-inner">

          {/* BRAND */}
          <a href="/" className="yz-footer-brand">
            YanZee
          </a>

          {/* PAYMENT METHODS */}
          <div className="yz-payments">
            <span>VISA</span>
            <span>MASTER</span>
            <span>AMEX</span>
            <span>MADA</span>
          </div>

          {/* COPYRIGHT */}
          <p>© 2026 Yanzee Group Of Company PVT. LTD. ALL RIGHTS RESERVED</p>

          {/* RIGHT */}
          <div className="yz-bottom-actions">
            <a href="/">Yanzee Group of Company PVT. LTD.</a>
            <button onClick={scrollToTop}>↑ Top</button>
          </div>

        </div>
      </div>

      {/* ================= POWERED BY ================= */}
      <div className="yz-powered">
        <p>
          Powered by{" "}
          <a
            href="https://pravidhidigitalnepal.com.np"
            target="_blank"
            rel="noreferrer"
          >
            PRAVIDHI DIGITAL INNOVATIONS NEPAL PVT LTD
          </a>
        </p>
      </div>

    </footer>
  );
};

export default Footer;