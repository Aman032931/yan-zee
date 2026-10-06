import { useState } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"

import { registerUser } from "../services/authService"

import "../styles/auth.css"

export default function Signup() {
  const navigate = useNavigate()
  const location = useLocation()

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  })

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setError("")
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError("Please enter a valid email address.")
      return
    }

    if (!/^\+?[0-9\s-]{7,15}$/.test(formData.phone.trim())) {
      setError("Please enter a valid phone number.")
      return
    }

    const payload = {
      fullName: formData.name.trim(),
      email: formData.email.trim(),
      password: formData.password,
      phone: formData.phone.trim(),
    }

    setIsLoading(true)
    try {
      await registerUser(payload)
      navigate("/login", {
        replace: true,
        state: { from: location.state?.from || "/" },
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* CLOSE BUTTON */}
        <button
          type="button"
          className="auth-close"
          onClick={() => navigate(location.state?.from || "/", { replace: true })}
          aria-label="Close signup"
        >
          ×
        </button>

        {/* LEFT SIDE - AI VIDEO */}
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
            <source src="/assets/yanzee-bg.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>

          <div className="auth-visual-overlay"></div>

          <div className="auth-visual-content">
            <div className="auth-seal">Y</div>
            <h2>YanZee Collection</h2>
            <p>Fashion, beauty, and more — delivered your way.</p>
          </div>

          <div className="auth-visual-bottom">
            <div className="auth-testimonial">
              <p>"New arrivals land every week, created for Nepal and beyond."</p>
              <span>— The YanZee Collection team</span>
            </div>

            <div className="auth-help">
              Need help? <a href="mailto:support@yanzee.com">support@yanzee.com</a>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE - SIGNUP */}
        <div className="auth-form-panel">
          <div className="auth-form-inner">
            <div className="mobile-brand">
              <div className="mobile-brand-seal">Y</div>
              <span>YanZee Collection</span>
            </div>

            <div className="auth-heading">
              <h1>Create your account</h1>
              <p>Become a member of YanZee Collection</p>
            </div>

            <div className="auth-tabs">
              <Link
                to="/login"
                state={{ from: location.state?.from || "/" }}
                className="auth-tab"
              >
                Login
              </Link>

              <Link to="/signup" className="auth-tab active">
                Signup
              </Link>
            </div>

            <form className="auth-form" onSubmit={handleSubmit}>
              {error && <div className="auth-error">⚠ {error}</div>}

              {/* FULL NAME */}
              <div className="auth-form-group">
                <label htmlFor="name">
                  Full Name <span className="required">*</span>
                </label>
                <div className="auth-input-wrapper">
                  <input
                    id="name"
                    type="text"
                    name="name"
                    value={formData.name}
                    placeholder="Enter your full name"
                    onChange={handleInputChange}
                    autoComplete="name"
                    required
                  />
                </div>
              </div>

              {/* EMAIL */}
              <div className="auth-form-group">
                <label htmlFor="signup-email">
                  Email <span className="required">*</span>
                </label>
                <div className="auth-input-wrapper">
                  <input
                    id="signup-email"
                    type="email"
                    name="email"
                    value={formData.email}
                    placeholder="Enter your email"
                    onChange={handleInputChange}
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              {/* PHONE */}
              <div className="auth-form-group">
                <label htmlFor="phone">
                  Phone <span className="required">*</span>
                </label>
                <div className="auth-input-wrapper">
                  <input
                    id="phone"
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    placeholder="Enter your phone number"
                    onChange={handleInputChange}
                    autoComplete="tel"
                    required
                  />
                </div>
              </div>

              {/* PASSWORD */}
              <div className="auth-form-group">
                <label htmlFor="signup-password">
                  Password <span className="required">*</span>
                </label>
                <div className="auth-input-wrapper">
                  <input
                    id="signup-password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    placeholder="Enter your password"
                    onChange={handleInputChange}
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? "👁" : "⌣"}
                  </button>
                </div>
              </div>

              {/* CONFIRM PASSWORD */}
              <div className="auth-form-group">
                <label htmlFor="confirmPassword">
                  Confirm Password <span className="required">*</span>
                </label>
                <div className="auth-input-wrapper">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    placeholder="Confirm your password"
                    onChange={handleInputChange}
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={
                      showConfirmPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showConfirmPassword ? "👁" : "⌣"}
                  </button>
                </div>
              </div>

              {/* SIGN UP */}
              <button type="submit" className="auth-submit" disabled={isLoading}>
                {isLoading ? "Creating account..." : "Sign Up"}
              </button>

              <p className="auth-switch">
                Already have an account?{" "}
                <Link
                  to="/login"
                  state={{ from: location.state?.from || "/" }}
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