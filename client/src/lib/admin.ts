const ADMIN_TOKEN_KEY = "admin_token";
const ADMIN_TOKEN_EXPIRY_KEY = "admin_token_expiry";

export function getAdminToken(): string | null {
  const token = localStorage.getItem(ADMIN_TOKEN_KEY);
  const expiry = localStorage.getItem(ADMIN_TOKEN_EXPIRY_KEY);

  if (!token) return null;

  // Check expiry
  if (expiry && Date.now() > parseInt(expiry, 10)) {
    clearAdminToken();
    return null;
  }

  return token;
}

export function setAdminToken(token: string, expiresIn?: number): void {
  localStorage.setItem(ADMIN_TOKEN_KEY, token);
  if (expiresIn) {
    localStorage.setItem(ADMIN_TOKEN_EXPIRY_KEY, String(Date.now() + expiresIn));
  }
}

export function clearAdminToken(): void {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
  localStorage.removeItem(ADMIN_TOKEN_EXPIRY_KEY);
}

export function isAdminLoggedIn(): boolean {
  return !!getAdminToken();
}

export async function adminLogout(): Promise<void> {
  const token = getAdminToken();
  if (token) {
    try {
      await fetch("/api/admin/logout", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {
      // Ignore network errors on logout
    }
  }
  clearAdminToken();
}

export async function adminFetch(url: string, options?: RequestInit): Promise<Response> {
  const token = getAdminToken();
  if (!token) {
    clearAdminToken();
    window.location.href = "/admin/login";
    return new Response(JSON.stringify({ message: "غير مصرح" }), { status: 401 });
  }

  const headers: Record<string, string> = {
    ...((options?.headers as Record<string, string>) || {}),
    Authorization: `Bearer ${token}`,
  };
  if (options?.body && typeof options.body === "string") {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(url, {
    ...options,
    headers,
    cache: "no-store",
  });

  // Auto-logout on authentication failure
  if (res.status === 401) {
    clearAdminToken();
    window.location.href = "/admin/login";
  }

  return res;
}
