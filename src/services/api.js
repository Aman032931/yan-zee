const BASE_URL = import.meta.env.VITE_API_URL

const ACCESS_KEY = "yanzee_token"
const REFRESH_KEY = "yanzee_refresh_token"

const NETWORK_ERROR = "Cannot reach the server. Please try again."

let refreshPromise = null

function clearSession() {
  localStorage.removeItem(ACCESS_KEY)
  localStorage.removeItem(REFRESH_KEY)
  localStorage.removeItem("yanzee_user")
}

// Calls /auth/refresh with the refresh token as a Bearer token.
async function refreshTokens() {
  const refreshToken = localStorage.getItem(REFRESH_KEY)

  let res
  try {
    res = await fetch(`${BASE_URL}/auth/refresh`, {
  method: "POST",
  credentials: "include",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ refreshToken }),
});
  } catch {
    throw new Error(NETWORK_ERROR) // network problem, not a rejected session
  }

  const json = await res.json().catch(() => null)

  if (!res.ok || !json?.data?.accessToken) {
    const error = new Error(json?.message || "Session expired")
    error.rejected = true // the server refused the refresh token
    throw error
  }

  localStorage.setItem(ACCESS_KEY, json.data.accessToken)
  if (json.data.refreshToken) {
    localStorage.setItem(REFRESH_KEY, json.data.refreshToken)
  }
  return json.data.accessToken
}

// Many requests can fail at once; they all share ONE refresh call.
function refreshOnce() {
  if (!refreshPromise) {
    refreshPromise = refreshTokens().finally(() => {
      refreshPromise = null
    })
  }
  return refreshPromise
}

async function sendRequest(path, { method, body, auth }, tokenOverride) {
  const token = tokenOverride ?? localStorage.getItem(ACCESS_KEY)
  try {
    return await fetch(`${BASE_URL}${path}`, {
      method,
      credentials: "include",
      headers: {
        ...(body ? { "Content-Type": "application/json" } : {}),
        ...(auth && token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new Error(NETWORK_ERROR)
  }
}

export async function apiRequest(
  path,
  { method = "GET", body, auth = true } = {}
) {
  const options = { method, body, auth }

  let res = await sendRequest(path, options)

  // Access token expired: refresh once, then retry the original request once.
  if (res.status === 401 && auth && localStorage.getItem(REFRESH_KEY)) {
    try {
      const newToken = await refreshOnce()
      res = await sendRequest(path, options, newToken)
    } catch (err) {
      if (err.rejected) {
        clearSession()
        window.dispatchEvent(new Event("auth:logout"))
        throw new Error("Session expired. Please log in again.", { cause: err })
      }
      throw err
    }
  }

  const data = await res.json().catch(() => null)

  if (!res.ok) {
    const error = new Error(data?.message || `Request failed (${res.status})`)
    error.status = res.status
    throw error
  }
  return data
}
