import { useState, useEffect } from "react"
import { Link } from "react-router-dom"

const slides = [
  {
    id: 1,
    title: "Elevate Your Everyday",
    subtitle: "Premium picks for those who want the best",
    buttonText: "Explore Premium",
    buttonLink: "/premium",
    image: "public/assets/1174278_Shopping.jpg",
    objectPosition: "77% 29%",
    objectPositionMobile: "77% 15%",
    
  },
  {
    id: 2,
    title: "Unbox the Joy",
    subtitle: "Because every bag brings something you'll love",
    buttonText: "Start Shopping",
    buttonLink: "/cart",
    image:
      "public/assets/amazed-young-woman-shopaholic-holding-colorful-shopping-bags-look-amused-shop-buying-thi_1258-119761.avif",
    objectPosition: "20% 0%",
    objectPositionMobile: "20% 0%",
  },
  {
    id: 3,
    title: "Made by Nepali, Made in Nepal",
    subtitle: "Nepali crafted products",
    buttonText: "Shop now",
    buttonLink: "/fashion",
    image:
      "public/assets/portrat-trendy-feminine-girl-posing-with-shopping-bags-from-store-credit-card-paying-contactl_1258-127340.avif",
    objectPosition: "77% 29%",
    objectPositionMobile: "77% 15%",
    pill: "New Arrivals",
  },
  {
    id: 4,
    title: "Gear Up, Level Up",
    subtitle: "Performance wear for every game you play",
    buttonText: "Shop Sports",
    buttonLink: "/sports",
    image:
      "public/assets/01_ZONE_1_ABOUT_US_PAGE_3_HERO_BANNER_desktop_1920x.webp",
    objectPosition: "77% 29%",
    objectPositionMobile: "77% 15%",
    
  },
]

const HeroCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const goToSlide = (index) => {
    setCurrentSlide(index)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }

  return (
    <section
      className="relative right-1/2 left-1/2 -mr-[50vw] -ml-[50vw] w-screen overflow-hidden bg-black"
      aria-label="Featured offers"
    >
      <div className="relative h-125 w-full max-[768px]:h-[280px] max-[480px]:h-[200px]">
        {slides.map((slide, index) => (
          <article
            key={slide.id}
            aria-hidden={index !== currentSlide}
            className={`absolute inset-0 h-full w-full transition-opacity duration-[0.8s] ease-in-out ${
              index === currentSlide ? "opacity-100" : "opacity-0"
            }`}
          >
            <div className="relative flex h-full w-full items-center overflow-hidden">
              <div
                className="absolute inset-0 h-full w-full"
                style={{
                  "--yz-banner-object-position": slide.objectPosition,
                  "--yz-banner-object-position-mobile":
                    slide.objectPositionMobile,
                }}
              >
                <img
                  alt=""
                  className="h-full w-full object-cover object-center"
                  loading={index === 0 ? "eager" : "lazy"}
                  draggable="false"
                  decoding="async"
                  src={slide.image}
                  style={{
                    "--yz-banner-object-position": slide.objectPosition,
                    "--yz-banner-object-position-mobile":
                      slide.objectPositionMobile,
                  }}
                />
              </div>
              <div className="absolute inset-0 bg-[rgba(0,0,0,0.35)]"></div>
              <div className="relative z-[1] max-w-[550px] px-[8%] py-[40px] max-[768px]:max-w-[90%] max-[768px]:px-[5%] max-[768px]:py-[20px]">
                {slide.pill && (
                  <span
                    className="mb-[12px] inline-block rounded-[20px] bg-[rgba(255,255,255,0.2)] px-4 py-1 text-[11px] font-semibold tracking-[0.5px] text-white uppercase backdrop-blur-[4px]"
                    style={{
                      position: "relative",
                      top: "0px",
                      left: "0px",
                      display: "inline-block",
                      marginBottom: "12px",
                    }}
                  >
                    {slide.pill}
                  </span>
                )}
                <h2
                  className="m-0 mb-2 leading-[1.2] font-bold text-white max-[768px]:text-[24px] max-[480px]:text-[18px]"
                  style={{ fontSize: "32px", color: "#ffffff" }}
                >
                  {slide.title}
                </h2>
                <p className="m-0 mb-[20px] text-[16px] text-[rgba(255,255,255,0.9)] max-[480px]:mb-[12px] max-[480px]:text-[13px]">
                  {slide.subtitle}
                </p>
                <Link
                  className="inline-block rounded-[4px] bg-white px-8 py-3 text-[14px] font-semibold text-black no-underline transition-colors duration-200 hover:bg-[#eee] max-[480px]:px-5 max-[480px]:py-2 max-[480px]:text-[12px]"
                  to={slide.buttonLink}
                >
                  {slide.buttonText}
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>

      <button
        type="button"
        className="absolute top-1/2 left-[20px] z-[2] -translate-y-1/2 cursor-pointer rounded-full border-none bg-[rgba(255,255,255,0.2)] px-5 py-4 text-[28px] text-white backdrop-blur-[4px] transition-colors duration-200 hover:bg-[rgba(255,255,255,0.4)] max-[768px]:hidden"
        onClick={prevSlide}
        aria-label="Previous offer"
      >
        ‹
      </button>
      <button
        type="button"
        className="absolute top-1/2 right-[20px] z-[2] -translate-y-1/2 cursor-pointer rounded-full border-none bg-[rgba(255,255,255,0.2)] px-5 py-4 text-[28px] text-white backdrop-blur-[4px] transition-colors duration-200 hover:bg-[rgba(255,255,255,0.4)] max-[768px]:hidden"
        onClick={nextSlide}
        aria-label="Next offer"
      >
        ›
      </button>

      <div
        className="absolute bottom-4 left-1/2 z-[2] flex -translate-x-1/2 gap-2"
        role="tablist"
        aria-label="Offer navigation"
      >
        {slides.map((slide, index) => (
          <button
            key={slide.id}
            type="button"
            role="tab"
            aria-selected={index === currentSlide}
            aria-label={`Offer ${index + 1}: ${slide.title}`}
            className={`h-[10px] w-[10px] cursor-pointer rounded-full border-none bg-[rgba(255,255,255,0.4)] p-0 transition-colors duration-200 max-[768px]:h-2 max-[768px]:w-2 ${
              index === currentSlide ? "bg-white" : ""
            }`}
            onClick={() => goToSlide(index)}
          />
        ))}
      </div>
    </section>
  )
}

export default HeroCarousel
