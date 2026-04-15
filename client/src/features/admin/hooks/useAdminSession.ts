import { useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { isAdminLoggedIn, adminLogout, getAdminToken } from "@/lib/admin";

const SESSION_CHECK_INTERVAL = 5 * 60 * 1000;
const INACTIVITY_TIMEOUT = 30 * 60 * 1000;

export function useAdminSession() {
  const [, setLocation] = useLocation();

  const doLogout = useCallback(async () => {
    await adminLogout();
    setLocation("/admin/login");
  }, [setLocation]);

  useEffect(() => {
    if (!isAdminLoggedIn()) { setLocation("/admin/login"); return; }

    const verifyInterval = setInterval(async () => {
      const token = getAdminToken();
      if (!token) return doLogout();
      try {
        const res = await fetch("/api/admin/verify", { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) doLogout();
      } catch {}
    }, SESSION_CHECK_INTERVAL);

    let lastActivity = Date.now();
    const resetActivity = () => { lastActivity = Date.now(); };
    window.addEventListener("mousemove", resetActivity);
    window.addEventListener("keydown", resetActivity);
    window.addEventListener("click", resetActivity);

    const idleCheck = setInterval(() => {
      if (Date.now() - lastActivity > INACTIVITY_TIMEOUT) doLogout();
    }, 60_000);

    return () => {
      clearInterval(verifyInterval); clearInterval(idleCheck);
      window.removeEventListener("mousemove", resetActivity);
      window.removeEventListener("keydown", resetActivity);
      window.removeEventListener("click", resetActivity);
    };
  }, [setLocation, doLogout]);

  return { doLogout, isAdmin: isAdminLoggedIn() };
}
