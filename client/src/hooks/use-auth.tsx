import { useQuery } from "@tanstack/react-query";

export interface UserProfile {
  _id: string;
  email: string;
  phone?: string;
  name: string;
  role: string;
}

export function useAuth() {
  const token = typeof window !== "undefined" ? localStorage.getItem("userToken") : null;
  const isLoggedIn = !!token;

  const getAuthHeaders = () => {
    return { "Authorization": `Bearer ${token}` };
  };

  const { data: profileData, isLoading, isError, refetch } = useQuery({
    queryKey: ["/api/auth/me"],
    queryFn: async () => {
      if (!token) return null;
      const res = await fetch("/api/auth/me", { headers: getAuthHeaders() });
      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem("userToken");
        }
        return null;
      }
      return res.json();
    },
    enabled: isLoggedIn,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const user = profileData?.user as UserProfile | undefined;

  const logout = () => {
    localStorage.removeItem("userToken");
    window.location.href = "/";
  };

  return {
    isLoggedIn,
    user,
    isLoading,
    isError,
    logout,
    getAuthHeaders,
    refetchProfile: refetch
  };
}
