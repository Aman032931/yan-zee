import { useState, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "../styles/auth.css";

function Login() {
    const navigate = useNavigate();
    const location = useLocation();

    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isVideoLoaded, setIsVideoLoaded] = useState(false);

    const videoRef = useRef(null);

    const handleClose = () =>{
        navigate(location.state?.from || "/"), {
            replace: true
        }
    }

    // =========================
    // INPUT CHANGE
    // =========================
    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        setError("");
    };

    // =========================
    // LOGIN SUBMIT
    // =========================
    const handleSubmit = (e) => {
        e.preventDefault();
        setError("");

        // Empty validation
        if (!formData.email || !formData.password) {
            setError("Please enter your email and password.");
            return;
        }

        // Email validation
        if (!/\S+@\S+\.\S+/.test(formData.email)) {
            setError("Please enter a valid email address.");
            return;
        }

        setIsLoading(true);

        console.log("Login data:", formData);

        // Temporary login logic
        setTimeout(() => {
            setIsLoading(false);
        }, 1000);
        navigate("/login", {
            replace: true,
            state: {
                from:
                    location.state?.from || "/"
            }
        })
    };

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
                            isVideoLoaded
                                ? "fade-out"
                                : "fade-in"
                        }`}
                    />

                    {/* AI VIDEO */}
                    <video
                        ref={videoRef}
                        className={`auth-visual-video ${
                            isVideoLoaded
                                ? "fade-in"
                                : "hidden"
                        }`}
                        autoPlay
                        loop
                        muted
                        playsInline
                        onLoadedData={() =>
                            setIsVideoLoaded(true)
                        }
                        poster="/assets/yanzee-poster.jpg"
                    >
                        <source
                            src="/assets/yanzee-bg.mp4"
                            type="video/mp4"
                        />
                    </video>

                    {/* Dark overlay */}
                    <div className="auth-visual-overlay"></div>


                    {/* Video text */}
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


                    {/* Bottom content */}
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


                {/* =================================================
                    RIGHT SIDE - LOGIN FORM
                ================================================== */}

                <div className="auth-form-panel">

                    <div className="auth-form-inner">

                        {/* Mobile brand */}
                        <div className="mobile-brand">

                            <div className="mobile-brand-seal">
                                Y
                            </div>

                            <span>
                                YanZee Collection
                            </span>

                        </div>


                        {/* Heading */}
                        <div className="auth-heading">

                            <h1>
                                Welcome back
                            </h1>

                            <p>
                                Sign in to your YanZee Collection account
                            </p>

                        </div>


                        {/* Login / Signup tabs */}
                        <div className="auth-tabs">

                            <Link
                                to="/login"
                                className="auth-tab active"
                            >
                                Login
                            </Link>

                            <Link
                                to="/signup"
                                state={{
                                    from: location.state?.from || "/"
                                }}
                                className="auth-tab"
                            >
                                Signup
                            </Link>

                        </div>


                        {/* Login form */}
                        <form
                            className="auth-form"
                            onSubmit={handleSubmit}
                        >

                            {/* Error */}
                            {error && (
                                <div className="auth-error">
                                    ⚠ {error}
                                </div>
                            )}


                            {/* ================= EMAIL ================= */}

                            <div className="auth-form-group">

                                <label htmlFor="email">
                                    Email address
                                </label>

                                <div className="auth-input-wrapper">

                                    {/* <span className="auth-input-icon">
                                        ✉
                                    </span> */}

                                    <input
                                        id="email"
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        placeholder="Enter your email"
                                        onChange={handleChange}
                                        autoComplete="email"
                                        required
                                    />

                                </div>

                            </div>


                            {/* ================= PASSWORD ================= */}

                            <div className="auth-form-group">

                                <label htmlFor="password">
                                    Password
                                </label>

                                <div className="auth-input-wrapper">

                                    {/* <span className="auth-input-icon">
                                        🔒
                                    </span> */}

                                    <input
                                        id="password"
                                        type={
                                            showPassword
                                                ? "text"
                                                : "password"
                                        }
                                        name="password"
                                        value={formData.password}
                                        placeholder="Enter your password"
                                        onChange={handleChange}
                                        autoComplete="current-password"
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


                            {/* ================= FORGOT PASSWORD ================= */}

                            <div className="auth-forgot">

                                <Link to="/forgot-password">
                                    Forgot password?
                                </Link>

                            </div>


                            {/* ================= LOGIN BUTTON ================= */}

                            <button
                                type="submit"
                                className="auth-submit"
                                disabled={isLoading}
                            >
                                {isLoading
                                    ? "Logging in..."
                                    : "Login"}
                            </button>


                            {/* ================= SIGNUP ================= */}

                            <p className="auth-switch">

                                Don't have an account?{" "}

                                <Link to="/signup"
                                    state={{
                                        from: location.state?.from || "/"
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
    );
}

export default Login;