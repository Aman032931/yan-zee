import { useState, useEffect } from "react"
import { AuthContext } from "./authContextObject"
import { loginUser, logoutUser, getMe } from "../services/authService"

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem("yanzee_user")
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })

  // On app load, refresh the stored user from the server (role or name may have changed)
  useEffect(() => {
    if (!localStorage.getItem("yanzee_token")) return
    let cancelled = false
    getMe()
      .then((user) => {
        if (!cancelled) setCurrentUser({ ...user, name: user.fullName })
      })
      .catch(() => {
        // a 401 is handled in api.js; any other error keeps the stored user
      })
    return () => {
      cancelled = true
    }
  }, [])

  const login = async (email, password) => {
    try {
      const { accessToken, refreshToken, user } = await loginUser({
        email,
        password,
      })

      localStorage.setItem("yanzee_token", accessToken)
      localStorage.setItem("yanzee_refresh_token", refreshToken)

      // `name` keeps older components working if they read user.name
      const normalizedUser = { ...user, name: user.fullName }
      setCurrentUser(normalizedUser)
      return { success: true, user: normalizedUser }
    } catch (err) {
      return { success: false, error: err.message }
    }
  }

  const logout = async () => {
    try {
      await logoutUser()
    } catch {
      // even if the server call fails (expired token, offline), still log out locally
    }
    localStorage.removeItem("yanzee_token")
    localStorage.removeItem("yanzee_refresh_token")
    setCurrentUser(null)
  }

  useEffect(() => {
    const handleForcedLogout = () => setCurrentUser(null)
    window.addEventListener("auth:logout", handleForcedLogout)
    return () => window.removeEventListener("auth:logout", handleForcedLogout)
  }, [])

  return (
    <AuthContext.Provider value={{ currentUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
