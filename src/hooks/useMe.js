import { useQuery } from "@tanstack/react-query"
import { getMe } from "../services/authService"

export const useMe = (enabled = !!localStorage.getItem("yanzee_token")) =>
  useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const user = await getMe()
      return { ...user, name: user.fullName } // keeps older components working
    },
    enabled,
  })