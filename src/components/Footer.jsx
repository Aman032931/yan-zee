import { useState } from "react";
import googlePlayIcon from "../assets/google-play.svg";
import appStoreIcon from "../assets/app-store.svg";
import mada from "../assets/mada.svg";
import amex from "../assets/amex.svg";
import masterCard from "../assets/mastercard.svg";
import visa from "../assets/visa.svg";
import pravidhiLogo from "../assets/pravidhi-logo.png";

const Footer = () => {
const [email, setEmail] = useState("");
const [status, setStatus] = useState("idle"); // idle | loading | success | error
const [message, setMessage] = useState("");

const scrollToTop = () => {
window.scrollTo({
top: 0,
behavior: "smooth",
});
};

const isValidEmail = (value) => /^[^\s@]+@[^\s@]+.[^\s@]+$/.test(value);

const handleSubscribe = async (e) => {
e.preventDefault();

if (!email.trim()) {
  setStatus("error");
  setMessage("Please enter your email.");
  return;
}

if (!isValidEmail(email)) {
  setStatus("error");
  setMessage("Please enter a valid email address.");
  return;
}

setStatus("loading");
setMessage("");

try {
  const res = await fetch("https://fakestoreapi.com/products", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: "Newsletter Subscription",
      email: email,
    }),
  });

  if (!res.ok) {
    throw new Error("Subscription failed");
  }

  await res.json();

  setStatus("success");
  setMessage("You're subscribed! Check your inbox for confirmation.");
  setEmail("");
} catch (err) {
  console.error("Subscription error:", err);
  setStatus("error");
  setMessage("Something went wrong. Please try again.");
}

};

return (
<footer className="w-full bg-[#fdfbfbf3] font-sans text-black">
<section className="bg-[
#f7f7f7] px-[8%] py-10 text-[#111]">
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

  <section className="mx-auto flex max-w-[1300px] items-center justify-between gap-[40px] border-b border-[#2a2a2a] px-[8%] pb-[40px] pt-[50px] max-[768px]:flex-col max-[768px]:items-stretch max-[768px]:gap-[20px] max-[600px]:px-[8%] max-[600px]:py-[30px]">
    <div className="yz-newsletter-text">
      <h3 className="m-0 mb-[6px] text-[20px] font-semibold tracking-[0.5px]">Stay in the loop</h3>
      <p className="m-0 text-[14px] text-[#aaa]">Get exclusive drops, sales & style edits in your inbox.</p>
    </div>

    <div className="w-[420px] shrink-0 max-[768px]:w-full">
      <form
        className="flex w-full max-[600px]:flex-col max-[600px]:gap-[10px]"
        onSubmit={handleSubscribe}
        noValidate
      >
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
          disabled={status === "loading"}
          className="mr-[10px] h-[48px] flex-1 rounded-[20px] border border-[#444] bg-[#fcfafa] px-4 text-[14px] text-black outline-none placeholder:text-[#666] disabled:opacity-60 max-[600px]:mr-0 max-[600px]:rounded-[4px]"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="h-[48px] cursor-pointer rounded-[20px] border-none bg-[#0e0d0d] px-8 text-[13px] font-semibold tracking-[0.5px] text-[#f8f5f5] transition-colors duration-200 hover:bg-[#333] disabled:cursor-not-allowed disabled:opacity-70 max-[600px]:rounded-[4px]"
        >
          {status === "loading" ? "SUBSCRIBING..." : "SUBSCRIBE"}
        </button>
      </form>
      {message && (
        <p
          className={`m-0 mt-[8px] text-[12px] ${
            status === "success" ? "text-green-600" : "text-red-500"
          }`}
        >
          {message}
        </p>
      )}
    </div>
  </section>

  <div className="mx-auto max-w-[1300px] px-[8%] pb-[40px] pt-[50px]">
    <nav className="grid grid-cols-6 gap-[30px] max-[1024px]:grid-cols-3 max-[1024px]:gap-[25px] max-[600px]:grid-cols-2 max-[600px]:gap-[20px]">
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

      <div className="yz-footer-column">
        <h3 className="m-0 mb-[18px] text-[13px] font-semibold tracking-[0.8px] text-white">BEAUTY</h3>
        <ul className="m-0 list-none p-0">
          <li className="mb-[10px]"><a href="/beauty/new-in" className="text-[13px] text-[#999] no-underline transition-colors duration-200 hover:text-white">New In</a></li>
          <li className="mb-[10px]"><a href="/beauty/makeup" className="text-[13px] text-[#999] no-underline transition-colors duration-200 hover:text-white">Makeup</a></li>
          <li className="mb-[10px]"><a href="/beauty/fragrance" className="text-[13px] text-[#999] no-underline transition-colors duration-200 hover:text-white">Fragrance</a></li>
          <li className="mb-[10px]"><a href="/beauty/hair-care" className="text-[13px] text-[#999] no-underline transition-colors duration-200 hover:text-white">Hair care</a></li>
          <li className="mb-2.5"><a href="/beauty/skincare" className="text-[13px] text-[#999] no-underline transition-colors duration-200 hover:text-white">Skincare</a></li>
        </ul>
      </div>

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

    <div className="mt-[40px] border-t border-[#2a2a2a] pt-[30px]">
      <h3 className="mb-4 text-[13px] font-semibold tracking-[0.8px]">SHOP ON THE GO</h3>
      <div className="flex gap-[12px] max-[600px]:flex-col max-[600px]:items-start">
        <a href="https://play.google.com/store" target="_blank" rel="noreferrer">
          <img src={googlePlayIcon} alt="Get it on Google Play" className="h-[44px] w-auto" />
        </a>
        <a href="https://apps.apple.com/" target="_blank" rel="noreferrer">
          <img src={appStoreIcon} alt="Download on the App Store" className="h-[44px] w-auto" />
        </a>
      </div>
    </div>
  </div>

  <section className="border-y border-[#2a2a2a]">
    <div className="mx-auto flex max-w-[1300px] items-center gap-[30px] px-[8%] py-[30px] max-[768px]:flex-col max-[768px]:gap-[15px] max-[768px]:text-center">
      <h3 className="m-0 text-[13px] font-semibold tracking-[0.8px]">FOLLOW US</h3>
      <div className="flex gap-3">
        <a href="https://www.facebook.com/share/1BhW88mRYs/" target="_blank" rel="noreferrer" aria-label="Facebook" className="flex h-9 w-9 items-center justify-center rounded-full border border-[#444] text-[14px] text-white no-underline transition-all duration-200 hover:border-white hover:bg-white hover:text-black">f</a>
        <a href="https://www.instagram.com/yanzee_group" target="_blank" rel="noreferrer" aria-label="Instagram" className="flex h-9 w-9 items-center justify-center rounded-full border border-[#444] text-[14px] text-white no-underline transition-all duration-200 hover:border-white hover:bg-white hover:text-black">◎</a>
        <a href="https://www.tiktok.com/@yanzee_group" target="_blank" rel="noreferrer" aria-label="TikTok" className="flex h-9 w-9 items-center justify-center rounded-full border border-[#444] text-[14px] text-white no-underline transition-all duration-200 hover:border-white hover:bg-white hover:text-black">♪</a>
      </div>
    </div>
  </section>

  <div className="border-b border-[#2a2a2a] bg-black">
    <div className="mx-auto flex max-w-325 flex-wrap items-center justify-between gap-5 px-[8%] py-7 max-[768px]:flex-col max-[768px]:gap-3.75 max-[768px]:text-center">
      <a href="/" className="text-[22px] font-bold italic tracking-[0.5px] text-white no-underline">YanZee</a>

      <div className="flex items-center gap-3 max-[600px]:flex-wrap max-[600px]:justify-center">
        <img src={visa} alt="VISA" className="h-6 w-auto object-contain" />
        <img src={masterCard} alt="MASTER" className="h-6 w-auto object-contain" />
        <img src={amex} alt="AMEX" className="h-6 w-auto object-contain" />
        <img src={mada} alt="MADA" className="h-6 w-auto object-contain" />
      </div>

      <p className="m-0 text-center text-[10px] tracking-[0.3px] text-[#888]">© 2026 Yanzee Group Of Company PVT. LTD. ALL RIGHTS RESERVED</p>

      <div className="flex items-center gap-5 max-[768px]:flex-wrap max-[768px]:justify-center">
        <a href="/" className="text-[10px] tracking-[0.3px] text-[#999] no-underline hover:text-white">Yanzee Group of Company PVT. LTD.</a>
        <button onClick={scrollToTop} className="flex cursor-pointer items-center gap-1 border-0 bg-transparent p-0 text-[13px] text-white hover:text-[#ccc]">↑ Top</button>
      </div>
    </div>
  </div>

  <div className="bg-[#050505] p-4 text-center">
    <div className="flex flex-wrap items-center justify-center gap-1.5 text-[15px] tracking-[0.3px] text-[#666]">
      <span>Powered by</span>
      <img src={pravidhiLogo} alt="Pravidhi-logo" className="h-5 w-auto object-contain" />
      <a href="https://pravidhidigitalnepal.com.np" target="_blank" rel="noreferrer" className="text-[#888] no-underline transition-colors duration-200 hover:text-white">PRAVIDHI DIGITAL INNOVATIONS NEPAL PVT LTD</a>
    </div>
  </div>
</footer>

);
};

export default Footer;