import { useState, useEffect } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { AuthContext } from "./authContextObject"
import { loginUser, logoutUser } from "../services/authService"
import { useMe } from "../hooks/useMe"

export function AuthProvider({ children }) {
  const qc = useQueryClient()
  const [token, setToken] = useState(() => localStorage.getItem("yanzee_token"))

  const { data: me, isLoading } = useMe(!!token)
  const currentUser = token ? me ?? null : null

  const clearSession = () => {
    localStorage.removeItem("yanzee_token")
    localStorage.removeItem("yanzee_refresh_token")
    setToken(null)
    qc.clear() // drops cached user and any user-specific data
  }

  const loginMutation = useMutation({
    mutationFn: loginUser,
    onSuccess: ({ accessToken, refreshToken, user }) => {
      localStorage.setItem("yanzee_token", accessToken)
      localStorage.setItem("yanzee_refresh_token", refreshToken)
      setToken(accessToken)
      qc.setQueryData(["me"], { ...user, name: user.fullName })
    },
  })

  const logoutMutation = useMutation({
    mutationFn: logoutUser,
    onSettled: clearSession, // runs even if the server call fails
  })

  // same return shapes as before, so Login.jsx and the header keep working
  const login = async (email, password) => {
    try {
      await loginMutation.mutateAsync({ email, password })
      return { success: true, user: qc.getQueryData(["me"]) }
    } catch (err) {
      return { success: false, error: err.message }
    }
  }

  const logout = async () => {
    try {
      await logoutMutation.mutateAsync()
    } catch {
      // clearSession already ran in onSettled
    }
  }

  useEffect(() => {
    window.addEventListener("auth:logout", clearSession)
    return () => window.removeEventListener("auth:logout", clearSession)
  }, [])

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, loading: isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}