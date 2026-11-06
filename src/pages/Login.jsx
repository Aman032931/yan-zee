import { useState, useRef } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import "../styles/auth.css"
import { useAuth } from "../context/useAuth"

const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
})

function FieldError({ error }) {
  if (!error) return null
  return <p className="auth-field-error">{error.message}</p>
}

function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()

  const [showPassword, setShowPassword] = useState(false)
  const [isVideoLoaded, setIsVideoLoaded] = useState(false)

  const videoRef = useRef(null)

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  })

  const handleClose = () => {
    navigate(location.state?.from || "/", { replace: true })
  }

  // =========================
  // LOGIN SUBMIT
  // =========================
  const onSubmit = async ({ email, password }) => {
    const result = await login(email, password)

    if (!result.success) {
      setError("root.server", { message: result.error })
      return
    }

    const role = result.user?.role
    const from = location.state?.from

    // Owners and admins go to their panel, unless they were sent here
    // from another dashboard page (e.g. a protected route redirect).
    const isDashboardPath =
      from?.startsWith("/seller") || from?.startsWith("/admin")

    let destination = from || "/"
    if (!isDashboardPath) {
      if (role === "OWNER" || role === "SHOP_OWNER") destination = "/seller"
      else if (role === "ADMIN") destination = "/admin"
    }

    navigate(destination, { replace: true })
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <button
          type="button"
          className="auth-close"
          onClick={handleClose}
          aria-label="Close login"
        >
          ×
        </button>

        {/* =================================================
                    LEFT SIDE - AI VIDEO
                ================================================== */}

        <div className="auth-visual">
          {/* Poster / fallback image */}
          <img
            src="/assets/yanzee-poster.jpg"
            alt="YanZee Collection Banner"
            className={`auth-visual-poster ${
              isVideoLoaded ? "fade-out" : "fade-in"
            }`}
          />

          {/* AI VIDEO */}
          <video
            ref={videoRef}
            className={`auth-visual-video ${
              isVideoLoaded ? "fade-in" : "hidden"
            }`}
            autoPlay
            loop
            muted
            playsInline
            onLoadedData={() => setIsVideoLoaded(true)}
            poster="/assets/yanzee-poster.jpg"
          >
            <source src="/assets/yanzee-bg.mp4" type="video/mp4" />
          </video>

          {/* Dark overlay */}
          <div className="auth-visual-overlay"></div>

          {/* Video text */}
          <div className="auth-visual-content">
            <div className="auth-seal">Y</div>

            <h2>YanZee Collection</h2>

            <p>Fashion, beauty, and more — delivered your way.</p>
          </div>

          {/* Bottom content */}
          <div className="auth-visual-bottom">
            <div className="auth-testimonial">
              <p>
                "New arrivals land every week, created for Nepal and beyond."
              </p>

              <span>— The YanZee Collection team</span>
            </div>

            <div className="auth-help">
              Need help?{" "}
              <a href="mailto:support@yanzee.com">support@yanzee.com</a>
            </div>
          </div>
        </div>

        {/* =================================================
                    RIGHT SIDE - LOGIN FORM
                ================================================== */}

        <div className="auth-form-panel">
          <div className="auth-form-inner">
            {/* Mobile brand */}
            <div className="mobile-brand">
              <div className="mobile-brand-seal">Y</div>

              <span>YanZee Collection</span>
            </div>

            {/* Heading */}
            <div className="auth-heading">
              <h1>Welcome back</h1>

              <p>Sign in to your YanZee Collection account</p>
            </div>

            {/* Login / Signup tabs */}
            <div className="auth-tabs">
              <Link to="/login" className="auth-tab active">
                Login
              </Link>

              <Link
                to="/signup"
                state={{
                  from: location.state?.from || "/",
                }}
                className="auth-tab"
              >
                Signup
              </Link>
            </div>

            {/* Login form */}
            <form
              className="auth-form"
              onSubmit={handleSubmit(onSubmit)}
              noValidate
            >
              {/* Error */}
              {errors.root?.server && (
                <div className="auth-error">⚠ {errors.root.server.message}</div>
              )}

              {/* ================= EMAIL ================= */}

              <div className="auth-form-group">
                <label htmlFor="email">Email address</label>

                <div className="auth-input-wrapper">
                  <input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    autoComplete="email"
                    {...register("email")}
                  />
                </div>

                <FieldError error={errors.email} />
              </div>

              {/* ================= PASSWORD ================= */}

              <div className="auth-form-group">
                <label htmlFor="password">Password</label>

                <div className="auth-input-wrapper">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    {...register("password")}
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? "👁" : "⌣"}
                  </button>
                </div>

                <FieldError error={errors.password} />
              </div>

              {/* ================= FORGOT PASSWORD ================= */}

              <div className="auth-forgot">
                <Link to="/forgot-password">Forgot password?</Link>
              </div>

              {/* ================= LOGIN BUTTON ================= */}

              <button
                type="submit"
                className="auth-submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Logging in..." : "Login"}
              </button>

              {/* ================= SIGNUP ================= */}

              <p className="auth-switch">
                Don't have an account?{" "}
                <Link
                  to="/signup"
                  state={{
                    from: location.state?.from || "/",
                  }}
                >
                  Create account
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login