import  { useState, useEffect } from "react";

const slides = [
  {
    id: 1,
    title: "DeliveryPartner",
    subtitle: "Timely Products Delivery with Pathao",
    buttonText: "Delivery Partner",
    buttonLink: "/categories",
    image: "https://res.cloudinary.com/dgzackqok/image/upload/v1781505460/yanzee-store/local/admin/ytvcbq14abw0efr7hsbg.jpg",
    objectPosition: "20% 0%",
    objectPositionMobile: "20% 0%",
  },
  {
    id: 2,
    title: "Made by Nepali, Made in Nepal",
    subtitle: "Nepali crafted products",
    buttonText: "Shop Now",
    buttonLink: "https://www.yan-zee.com/fashion/category/made-in-nepal",
    image: "https://res.cloudinary.com/dgzackqok/image/upload/v1781633967/yanzee-store/local/admin/ewlsoudvclra7j0oa7xt.png",
    objectPosition: "77% 29%",
    objectPositionMobile: "77% 15%",
    pill: "New Arrivals",
  },
];

const HeroCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  return (
    <section className="yz-hero-carousel yz-hero-carousel--promo" aria-label="Featured offers">
      <div className="yz-hero-carousel__track">
        {slides.map((slide, index) => (
          <article
            key={slide.id}
            className={`yz-hero-carousel__slide ${index === currentSlide ? "is-active" : ""}`}
            aria-hidden={index !== currentSlide}
          >
            <div className="yz-hero yz-hero--overlay yz-hero--layout yz-hero-carousel__panel yz-hero--dark">
              <div
                className="yz-hero__bg"
                style={{
                  "--yz-banner-object-position": slide.objectPosition,
                  "--yz-banner-object-position-mobile": slide.objectPositionMobile,
                }}
              >
                <img
                  alt=""
                  className="yz-hero__photo"
                  loading={index === 0 ? "eager" : "lazy"}
                  draggable="false"
                  decoding="async"
                  src={slide.image}
                  style={{
                    "--yz-banner-object-position": slide.objectPosition,
                    "--yz-banner-object-position-mobile": slide.objectPositionMobile,
                  }}
                />
              </div>
              <div className="yz-hero__overlay"></div>
              <div className="yz-hero__content yz-hero__content--yanzee">
                {slide.pill && (
                  <span
                    className="yz-feature-card__pill"
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
                <h2 className="yz-hero__title" style={{ fontSize: "32px", color: "#ffffff" }}>
                  {slide.title}
                </h2>
                <p className="yz-hero__subtitle">{slide.subtitle}</p>
                <a className="yz-hero__btn" href={slide.buttonLink}>
                  {slide.buttonText}
                </a>
              </div>
            </div>
          </article>
        ))}
      </div>

      <button
        type="button"
        className="yz-hero-carousel__arrow yz-hero-carousel__arrow--prev"
        onClick={prevSlide}
        aria-label="Previous offer"
      >
        ‹
      </button>
      <button
        type="button"
        className="yz-hero-carousel__arrow yz-hero-carousel__arrow--next"
        onClick={nextSlide}
        aria-label="Next offer"
      >
        ›
      </button>

      <div className="yz-hero-carousel__dots" role="tablist" aria-label="Offer navigation">
        {slides.map((slide, index) => (
          <button
            key={slide.id}
            type="button"
            role="tab"
            aria-selected={index === currentSlide}
            aria-label={`Offer ${index + 1}: ${slide.title}`}
            className={index === currentSlide ? "is-active" : ""}
            onClick={() => goToSlide(index)}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroCarousel;