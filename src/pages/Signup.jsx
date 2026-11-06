import { useState } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

import { registerUser } from "../services/authService"

import "../styles/auth.css"

const signupSchema = z
  .object({
    name: z.string().trim().min(1, "Full name is required"),
    email: z
      .string()
      .trim()
      .min(1, "Email is required")
      .email("Please enter a valid email address"),
    phone: z
      .string()
      .trim()
      .regex(/^\+?[0-9\s-]{7,15}$/, "Please enter a valid phone number"),
    password: z.string().min(1, "Password is required"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

function FieldError({ error }) {
  if (!error) return null
  return <p className="auth-field-error">{error.message}</p>
}

export default function Signup() {
  const navigate = useNavigate()
  const location = useLocation()

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    },
  })

  const onSubmit = async (values) => {
    try {
      await registerUser({
        fullName: values.name,
        email: values.email,
        password: values.password,
        phone: values.phone,
      })

      navigate("/login", {
        replace: true,
        state: { from: location.state?.from || "/" },
      })
    } catch (err) {
      setError("root.server", { message: err.message })
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

            <form
              className="auth-form"
              onSubmit={handleSubmit(onSubmit)}
              noValidate
            >
              {errors.root?.server && (
                <div className="auth-error">⚠ {errors.root.server.message}</div>
              )}

              {/* FULL NAME */}
              <div className="auth-form-group">
                <label htmlFor="name">
                  Full Name <span className="required">*</span>
                </label>
                <div className="auth-input-wrapper">
                  <input
                    id="name"
                    type="text"
                    placeholder="Enter your full name"
                    autoComplete="name"
                    {...register("name")}
                  />
                </div>
                <FieldError error={errors.name} />
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
                    placeholder="Enter your email"
                    autoComplete="email"
                    {...register("email")}
                  />
                </div>
                <FieldError error={errors.email} />
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
                    placeholder="Enter your phone number"
                    autoComplete="tel"
                    {...register("phone")}
                  />
                </div>
                <FieldError error={errors.phone} />
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
                    placeholder="Enter your password"
                    autoComplete="new-password"
                    {...register("password")}
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
                <FieldError error={errors.password} />
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
                    placeholder="Confirm your password"
                    autoComplete="new-password"
                    {...register("confirmPassword")}
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
                <FieldError error={errors.confirmPassword} />
              </div>

              {/* SIGN UP */}
              <button
                type="submit"
                className="auth-submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Creating account..." : "Sign Up"}
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