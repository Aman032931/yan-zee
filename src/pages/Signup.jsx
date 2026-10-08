import { useState, useEffect } from "react"

import Select from "react-select"

import {
  Link,
  useNavigate,
  useLocation,
} from "react-router-dom"

import { registerUser } from "../services/authService"

import {
  getCountries,
  getStatesOfCountry,
  getCitiesOfState,
} from "@countrystatecity/countries-browser"

import {
  countryHasDistricts,
  getProvincesForCountry,
  getDistrictsForProvince,
  getCitiesForDistrict,
  getCitiesForProvince,
} from "../data/locationData"

import "../styles/auth.css"

// =====================================================
// ALLOWED COUNTRIES
// =====================================================

const ALLOWED_COUNTRIES = [
  "NP",
  "IN",
  "US",
  "SA",
  "AE",
  "KW",
  "QA",
  "BH",
  "OM",
  "LK",
]

// =====================================================
// SELECT STYLES
// =====================================================

const selectStyles = {
  control: (base, state) => ({
    ...base,
    minHeight: "48px",
    border: state.isFocused
      ? "1px solid #3b82f6"
      : "1px solid #d5d5d5",
    borderRadius: "8px",
    boxShadow: state.isFocused
      ? "0 0 0 3px rgba(59, 130, 246, 0.10)"
      : "none",
    backgroundColor: "#ffffff",
    fontFamily: "Arial, Helvetica, sans-serif",
    fontSize: "14px",
    cursor: "pointer",
  }),

  valueContainer: (base) => ({
    ...base,
    padding: "2px 12px",
  }),

  placeholder: (base) => ({
    ...base,
    color: "#aaaaaa",
  }),

  singleValue: (base) => ({
    ...base,
    color: "#222222",
  }),

  indicatorSeparator: () => ({
    display: "none",
  }),

  dropdownIndicator: (base) => ({
    ...base,
    color: "#777777",
  }),

  clearIndicator: (base) => ({
    ...base,
    color: "#999999",
  }),

  menu: (base) => ({
    ...base,
    fontFamily: "Arial, Helvetica, sans-serif",
    fontSize: "14px",
    zIndex: 99999,
  }),

  menuPortal: (base) => ({
    ...base,
    zIndex: 99999,
  }),

  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected
      ? "#2864d7"
      : state.isFocused
        ? "#f1f5ff"
        : "#ffffff",
    color: state.isSelected
      ? "#ffffff"
      : "#222222",
    cursor: "pointer",
  }),
}

// =====================================================
// SIGNUP
// =====================================================

export default function Signup() {
  const navigate = useNavigate()
  const location = useLocation()

  // =================================================
  // FORM DATA
  // =================================================

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    role: "",
    gender: "",
    country: null,
    province: null,
    district: null,
    city: null,
    password: "",
    confirmPassword: "",
  })

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  // =================================================
  // PASSWORD VISIBILITY
  // =================================================

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false)

  // =================================================
  // LOCATION OPTIONS
  // =================================================

  const [countryOptions, setCountryOptions] = useState([])
  const [provinceOptions, setProvinceOptions] = useState([])
  const [districtOptions, setDistrictOptions] = useState([])
  const [cityOptions, setCityOptions] = useState([])

  // =================================================
  // DISTRICT CHECK
  // =================================================

  const hasDistrictSelect = formData.country
    ? countryHasDistricts(formData.country.value)
    : false

  // =================================================
  // FETCH COUNTRIES
  // =================================================

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const data = await getCountries()

        const filtered = data
          .filter((country) =>
            ALLOWED_COUNTRIES.includes(country.iso2)
          )
          .map((country) => ({
            value: country.iso2,
            label: country.name,
          }))

        setCountryOptions(filtered)
      } catch (err) {
        console.error(
          "Failed to fetch countries:",
          err
        )
      }
    }

    fetchCountries()
  }, [])

  // =================================================
  // FETCH PROVINCES
  // =================================================

  useEffect(() => {
    if (!formData.country) {
      setProvinceOptions([])
      return
    }

    const countryIso = formData.country.value

    const staticProvinces =
      getProvincesForCountry(countryIso)

    if (staticProvinces?.length > 0) {
      setProvinceOptions(
        staticProvinces.map((province) => ({
          value: province,
          label: province,
        }))
      )

      return
    }

    const fetchStatesFromApi = async () => {
      try {
        const states =
          await getStatesOfCountry(countryIso)

        setProvinceOptions(
          states.map((state) => ({
            value: state.iso2 || state.name,
            label: state.name,
          }))
        )
      } catch (err) {
        console.error(
          "Failed to fetch provinces:",
          err
        )

        setProvinceOptions([])
      }
    }

    fetchStatesFromApi()
  }, [formData.country])

  // =================================================
  // FETCH DISTRICTS
  // =================================================

  useEffect(() => {
    if (
      !formData.country ||
      !formData.province ||
      !hasDistrictSelect
    ) {
      setDistrictOptions([])
      return
    }

    const countryIso = formData.country.value
    const provinceLabel = formData.province.label

    const districts =
      getDistrictsForProvince(
        countryIso,
        provinceLabel
      ) || []

    setDistrictOptions(
      districts.map((district) => ({
        value: district,
        label: district,
      }))
    )
  }, [
    formData.country,
    formData.province,
    hasDistrictSelect,
  ])

  // =================================================
  // FETCH CITIES
  // =================================================

  useEffect(() => {
    if (
      !formData.country ||
      !formData.province
    ) {
      setCityOptions([])
      return
    }

    const countryIso = formData.country.value
    const provinceLabel = formData.province.label
    const districtLabel =
      formData.district?.label

    // =============================================
    // COUNTRY WITH DISTRICTS
    // =============================================

    if (hasDistrictSelect) {
      if (!districtLabel) {
        setCityOptions([])
        return
      }

      const cities =
        getCitiesForDistrict(
          countryIso,
          provinceLabel,
          districtLabel
        ) || []

      setCityOptions(
        cities.map((city) => ({
          value: city,
          label: city,
        }))
      )

      return
    }

    // =============================================
    // PROVINCE TO CITY
    // =============================================

    const staticCities =
      getCitiesForProvince(
        countryIso,
        provinceLabel
      )

    if (staticCities?.length > 0) {
      setCityOptions(
        staticCities.map((city) => ({
          value: city,
          label: city,
        }))
      )

      return
    }

    // =============================================
    // API FALLBACK
    // =============================================

    const fetchCitiesFromApi = async () => {
      try {
        const cityData =
          await getCitiesOfState(
            countryIso,
            formData.province.value
          )

        setCityOptions(
          cityData.map((city) => ({
            value: city.name,
            label: city.name,
          }))
        )
      } catch (err) {
        console.error(
          "Failed to fetch cities:",
          err
        )

        setCityOptions([])
      }
    }

    fetchCitiesFromApi()
  }, [
    formData.country,
    formData.province,
    formData.district,
    hasDistrictSelect,
  ])

  // =================================================
  // INPUT HANDLER
  // =================================================

  const handleInputChange = (e) => {
    const { name, value } = e.target

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    setError("")
  }

  // =================================================
  // COUNTRY CHANGE
  // =================================================

  const handleCountryChange = (selected) => {
    setFormData((prev) => ({
      ...prev,
      country: selected,
      province: null,
      district: null,
      city: null,
    }))

    setProvinceOptions([])
    setDistrictOptions([])
    setCityOptions([])

    setError("")
  }

  // =================================================
  // PROVINCE CHANGE
  // =================================================

  const handleProvinceChange = (selected) => {
    setFormData((prev) => ({
      ...prev,
      province: selected,
      district: null,
      city: null,
    }))

    setDistrictOptions([])
    setCityOptions([])

    setError("")
  }

  // =================================================
  // DISTRICT CHANGE
  // =================================================

  const handleDistrictChange = (selected) => {
    setFormData((prev) => ({
      ...prev,
      district: selected,
      city: null,
    }))

    setCityOptions([])

    setError("")
  }

  // =================================================
  // SUBMIT
  // =================================================

  const handleSubmit = async (e) => {
    e.preventDefault()

    setError("")

    // =============================================
    // NAME
    // =============================================

    if (!formData.name.trim()) {
      setError("Please enter your full name.")
      return
    }

    // =============================================
    // EMAIL
    // =============================================

    if (!formData.email.trim()) {
      setError("Please enter your email address.")
      return
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError(
        "Please enter a valid email address."
      )
      return
    }

    // =============================================
    // PHONE
    // =============================================

    const phone = formData.phone.trim()

    if (!phone) {
      setError("Please enter your phone number.")
      return
    }

    if (!/^\d{10}$/.test(phone)) {
      setError(
        "Phone number must contain exactly 10 digits."
      )
      return
    }

    // =============================================
    // ACCOUNT TYPE
    // =============================================

    if (!formData.role) {
      setError(
        "Please select Customer or Shop Owner."
      )
      return
    }

    // =============================================
    // GENDER
    // =============================================

    if (!formData.gender) {
      setError("Please select your gender.")
      return
    }

    // =============================================
    // PASSWORD
    // =============================================

    if (!formData.password) {
      setError("Please enter a password.")
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.")
      return
    }

    // =============================================
    // LOCATION
    // =============================================

    if (
      !formData.country ||
      !formData.province ||
      !formData.city ||
      (hasDistrictSelect &&
        !formData.district)
    ) {
      setError(
        "Please complete your location details."
      )
      return
    }

    // =============================================
    // PAYLOAD
    // =============================================

    const payload = {
      fullName: formData.name.trim(),

      email: formData.email.trim(),

      password: formData.password,

      phone: phone,

      gender: formData.gender.toUpperCase(),

      role: formData.role,

      address: formData.address.trim(),

      city: formData.city.label,

      province: formData.province.label,

      district:
        formData.district?.label || "",

      country: formData.country.label,
    }

    setIsLoading(true)

    try {
      // ===========================================
      // CREATE ACCOUNT
      // ===========================================

      await registerUser(payload)

      /*
       * After signup we send the user to LOGIN.
       *
       * If the user selected SHOP_OWNER,
       * the login page will detect SHOP_OWNER
       * after authentication and redirect to:
       *
       * /shop-owner/setup-shop
       *
       * Customer will return to the original page.
       */

      navigate("/login", {
        replace: true,

        state: {
          from:
            location.state?.from || "/",

          backgroundLocation:
            location.state?.backgroundLocation,
        },
      })
    } catch (err) {
      setError(
        err.message ||
          "Unable to create your account."
      )
    } finally {
      setIsLoading(false)
    }
  }

  // =================================================
  // CLOSE SIGNUP
  // =================================================

  const handleClose = () => {
    navigate(
      location.state?.from || "/",
      {
        replace: true,
      }
    )
  }

  // =================================================
  // UI
  // =================================================

  return (
    <div className="auth-page">
      <div className="auth-card">

        {/* =====================================
            CLOSE BUTTON
        ====================================== */}

        <button
          type="button"
          className="auth-close"
          onClick={handleClose}
          aria-label="Close signup"
        >
          ×
        </button>

        {/* =====================================
            LEFT SIDE - AI VIDEO
        ====================================== */}

        <div className="auth-visual">

          <video
            className="auth-visual-video"
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            poster="/assets/yanzee-poster.jpg"
          >
            <source
              src="/assets/yanzee-bg.mp4"
              type="video/mp4"
            />

            Your browser does not support
            the video tag.
          </video>

          {/* VIDEO OVERLAY */}

          <div className="auth-visual-overlay"></div>

          {/* BRAND */}

          <div className="auth-visual-content">

            <div className="auth-seal">
              Y
            </div>

            <h2>
              YanZee Collection
            </h2>

            <p>
              Fashion, beauty, and more —
              delivered your way.
            </p>

          </div>

          {/* BOTTOM */}

          <div className="auth-visual-bottom">

            <div className="auth-testimonial">

              <p>
                "New arrivals land every week,
                created for Nepal and beyond."
              </p>

              <span>
                — The YanZee Collection team
              </span>

            </div>

            <div className="auth-help">
              Need help?{" "}

              <a href="mailto:support@yanzee.com">
                support@yanzee.com
              </a>
            </div>

          </div>

        </div>

        {/* =====================================
            RIGHT SIDE - SIGNUP
        ====================================== */}

        <div className="auth-form-panel">

          <div className="auth-form-inner auth-form-inner-wide">

            {/* MOBILE BRAND */}

            <div className="mobile-brand">

              <div className="mobile-brand-seal">
                Y
              </div>

              <span>
                YanZee Collection
              </span>

            </div>

            {/* HEADING */}

            <div className="auth-heading">

              <h1>
                Create your account
              </h1>

              <p>
                Become a member of
                YanZee Collection
              </p>

            </div>

            {/* TABS */}

            <div className="auth-tabs">

              <Link
                to="/login"
                state={{
                  from:
                    location.state?.from || "/",

                  backgroundLocation:
                    location.state
                      ?.backgroundLocation,
                }}
                className="auth-tab"
              >
                Login
              </Link>

              <Link
                to="/signup"
                state={{
                  from:
                    location.state?.from || "/",

                  backgroundLocation:
                    location.state
                      ?.backgroundLocation,
                }}
                className="auth-tab active"
              >
                Signup
              </Link>

            </div>

            {/* =================================
                FORM
            ================================== */}

            <form
              className="auth-form"
              onSubmit={handleSubmit}
            >

              {/* ERROR */}

              {error && (
                <div className="auth-error">
                  ⚠ {error}
                </div>
              )}

              {/* FULL NAME */}

              <div className="auth-form-group">

                <label htmlFor="name">
                  Full Name{" "}
                  <span className="required">
                    *
                  </span>
                </label>

                <div className="auth-input-wrapper">

                  <input
                    id="name"
                    type="text"
                    name="name"
                    value={formData.name}
                    placeholder="Enter your full name"
                    onChange={handleInputChange}
                    required
                  />

                </div>

              </div>

              {/* EMAIL */}

              <div className="auth-form-group">

                <label htmlFor="signup-email">
                  Email{" "}
                  <span className="required">
                    *
                  </span>
                </label>

                <div className="auth-input-wrapper">

                  <input
                    id="signup-email"
                    type="email"
                    name="email"
                    value={formData.email}
                    placeholder="Enter your email"
                    onChange={handleInputChange}
                    required
                  />

                </div>

              </div>

              {/* PHONE */}

              <div className="auth-form-group">

                <label htmlFor="phone">
                  Phone{" "}
                  <span className="required">
                    *
                  </span>
                </label>

                <div className="auth-input-wrapper">

                  <input
                    id="phone"
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    placeholder="Enter 10-digit phone number"
                    onChange={handleInputChange}
                    inputMode="numeric"
                    maxLength={10}
                    required
                  />

                </div>

              </div>

              {/* ADDRESS */}

              <div className="auth-form-group">

                <label htmlFor="address">
                  Address{" "}
                  <span className="required">
                    *
                  </span>
                </label>

                <div className="auth-input-wrapper">

                  <input
                    id="address"
                    type="text"
                    name="address"
                    value={formData.address}
                    placeholder="Street address"
                    onChange={handleInputChange}
                    required
                  />

                </div>

              </div>

              {/* ACCOUNT TYPE */}

              <div className="space-y-3">

                <label className="text-sm font-medium text-gray-700">
                  Account Type{" "}
                  <span className="text-red-500">
                    *
                  </span>
                </label>

                <div className="flex flex-col gap-3 sm:flex-row">

                  {/* CUSTOMER */}

                  <label
                    className={`flex flex-1 cursor-pointer items-center gap-2 rounded-lg border px-4 py-3 transition ${
                      formData.role === "CUSTOMER"
                        ? "border-black bg-gray-50"
                        : "border-gray-200 hover:border-gray-400"
                    }`}
                  >

                    <input
                      type="radio"
                      name="role"
                      value="CUSTOMER"
                      checked={
                        formData.role ===
                        "CUSTOMER"
                      }
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          role: e.target.value,
                        }))
                      }
                      className="h-4 w-4"
                    />

                    <span className="text-sm text-gray-700">
                      Customer
                    </span>

                  </label>

                  {/* SHOP OWNER */}

                  <label
                    className={`flex flex-1 cursor-pointer items-center gap-2 rounded-lg border px-4 py-3 transition ${
                      formData.role ===
                      "SHOP_OWNER"
                        ? "border-black bg-gray-50"
                        : "border-gray-200 hover:border-gray-400"
                    }`}
                  >

                    <input
                      type="radio"
                      name="role"
                      value="SHOP_OWNER"
                      checked={
                        formData.role ===
                        "SHOP_OWNER"
                      }
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          role: e.target.value,
                        }))
                      }
                      className="h-4 w-4"
                    />

                    <span className="text-sm text-gray-700">
                      Shop Owner
                    </span>

                  </label>

                </div>

                {/* ROLE MESSAGE */}

                {formData.role ===
                  "SHOP_OWNER" && (
                  <p className="text-xs leading-5 text-gray-500">
                    After creating your account
                    and logging in, you will be
                    taken to the shop setup page
                    to create your shop.
                  </p>
                )}

                {formData.role ===
                  "CUSTOMER" && (
                  <p className="text-xs leading-5 text-gray-500">
                    Create a customer account to
                    browse products, manage your
                    cart, wishlist, and orders.
                  </p>
                )}

              </div>

              {/* GENDER */}

              <div className="auth-form-group">

                <label>
                  Gender{" "}
                  <span className="required">
                    *
                  </span>
                </label>

                <div className="auth-gender">

                  <label>

                    <input
                      type="radio"
                      name="gender"
                      value="Male"
                      checked={
                        formData.gender ===
                        "Male"
                      }
                      onChange={
                        handleInputChange
                      }
                      required
                    />

                    <span>
                      Male
                    </span>

                  </label>

                  <label>

                    <input
                      type="radio"
                      name="gender"
                      value="Female"
                      checked={
                        formData.gender ===
                        "Female"
                      }
                      onChange={
                        handleInputChange
                      }
                      required
                    />

                    <span>
                      Female
                    </span>

                  </label>

                  <label>

                    <input
                      type="radio"
                      name="gender"
                      value="Others"
                      checked={
                        formData.gender ===
                        "Others"
                      }
                      onChange={
                        handleInputChange
                      }
                    />

                    <span>
                      Others
                    </span>

                  </label>

                </div>

              </div>

              {/* COUNTRY */}

              <div className="auth-form-group">

                <label>
                  Country
                </label>

                <Select
                  className="auth-select"
                  options={countryOptions}
                  value={formData.country}
                  onChange={
                    handleCountryChange
                  }
                  placeholder="Search or select country..."
                  isSearchable
                  isClearable
                  styles={selectStyles}
                  menuPortalTarget={
                    document.body
                  }
                />

              </div>

              {/* STATE / PROVINCE */}

              <div className="auth-form-group">

                <label>
                  State / Province
                </label>

                <Select
                  className="auth-select"
                  options={provinceOptions}
                  value={formData.province}
                  onChange={
                    handleProvinceChange
                  }
                  isDisabled={
                    !formData.country
                  }
                  placeholder={
                    formData.country
                      ? "Search or select state/province..."
                      : "Select a country first"
                  }
                  isSearchable
                  isClearable
                  styles={selectStyles}
                  menuPortalTarget={
                    document.body
                  }
                />

              </div>

              {/* DISTRICT */}

              {hasDistrictSelect && (
                <div className="auth-form-group">

                  <label>
                    District
                  </label>

                  <Select
                    className="auth-select"
                    options={
                      districtOptions
                    }
                    value={
                      formData.district
                    }
                    onChange={
                      handleDistrictChange
                    }
                    isDisabled={
                      !formData.province
                    }
                    placeholder={
                      formData.province
                        ? "Search or select district..."
                        : "Select a province first"
                    }
                    isSearchable
                    isClearable
                    styles={
                      selectStyles
                    }
                    menuPortalTarget={
                      document.body
                    }
                  />

                </div>
              )}

              {/* CITY */}

              <div className="auth-form-group">

                <label>
                  City
                </label>

                <Select
                  className="auth-select"
                  options={cityOptions}
                  value={formData.city}
                  onChange={(selected) =>
                    setFormData((prev) => ({
                      ...prev,
                      city: selected,
                    }))
                  }
                  isDisabled={
                    hasDistrictSelect
                      ? !formData.district
                      : !formData.province
                  }
                  placeholder={
                    hasDistrictSelect
                      ? formData.district
                        ? "Search or select city..."
                        : "Select a district first"
                      : formData.province
                        ? "Search or select city..."
                        : "Select a province first"
                  }
                  isSearchable
                  isClearable
                  styles={selectStyles}
                  menuPortalTarget={
                    document.body
                  }
                />

              </div>

              {/* PASSWORD */}

              <div className="auth-form-group">

                <label htmlFor="signup-password">
                  Password{" "}
                  <span className="required">
                    *
                  </span>
                </label>

                <div className="auth-input-wrapper">

                  <input
                    id="signup-password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    name="password"
                    value={formData.password}
                    placeholder="Enter your password"
                    onChange={
                      handleInputChange
                    }
                    required
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() =>
                      setShowPassword(
                        !showPassword
                      )
                    }
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {showPassword
                      ? "👁"
                      : "⌣"}
                  </button>

                </div>

              </div>

              {/* CONFIRM PASSWORD */}

              <div className="auth-form-group">

                <label htmlFor="confirmPassword">
                  Confirm Password{" "}
                  <span className="required">
                    *
                  </span>
                </label>

                <div className="auth-input-wrapper">

                  <input
                    id="confirmPassword"
                    type={
                      showConfirmPassword
                        ? "text"
                        : "password"
                    }
                    name="confirmPassword"
                    value={
                      formData.confirmPassword
                    }
                    placeholder="Confirm your password"
                    onChange={
                      handleInputChange
                    }
                    required
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() =>
                      setShowConfirmPassword(
                        !showConfirmPassword
                      )
                    }
                    aria-label={
                      showConfirmPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {showConfirmPassword
                      ? "👁"
                      : "⌣"}
                  </button>

                </div>

              </div>

              {/* SIGN UP */}

              <button
                type="submit"
                className="auth-submit"
                disabled={isLoading}
              >
                {isLoading
                  ? "Creating account..."
                  : "Sign Up"}
              </button>

              {/* LOGIN */}

              <p className="auth-switch">

                Already have an account?{" "}

                <Link
                  to="/login"
                  state={{
                    from:
                      location.state?.from ||
                      "/",

                    backgroundLocation:
                      location.state
                        ?.backgroundLocation,
                  }}
                >
                  Login to your account
                </Link>

              </p>

            </form>

          </div>

        </div>

      </div>
    </div>
  )
}