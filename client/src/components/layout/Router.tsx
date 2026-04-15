import { lazy, Suspense } from "react";
import { Switch, Route } from "wouter";
import Home from "@/features/landing/pages/Home";

const FAQ = lazy(() => import("@/features/landing/pages/FAQ"));
const Privacy = lazy(() => import("@/features/landing/pages/Privacy"));
const Terms = lazy(() => import("@/features/landing/pages/Terms"));
const Checkout = lazy(() => import("@/features/checkout/components/CheckoutPage"));
const JoinTeam = lazy(() => import("@/features/join-team/components/JoinTeam"));
const AdminLogin = lazy(() => import("@/features/admin/pages/AdminLogin"));
const AdminDashboard = lazy(() => import("@/features/admin/pages/AdminDashboard"));
const UserLogin = lazy(() => import("@/features/auth/components/UserLoginPage"));
const UserDashboard = lazy(() => import("@/features/dashboard/pages/UserDashboard"));
const NotFound = lazy(() => import("@/features/landing/pages/not-found"));

function LoadingFallback() {
  return <div className="min-h-screen flex items-center justify-center animate-pulse">جاري التحميل...</div>;
}

export function Router() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/faq"><FAQ /></Route>
        <Route path="/privacy"><Privacy /></Route>
        <Route path="/terms"><Terms /></Route>
        <Route path="/checkout/:plan"><Checkout /></Route>
        <Route path="/join-us"><JoinTeam /></Route>
        <Route path="/login"><UserLogin /></Route>
        <Route path="/dashboard"><UserDashboard /></Route>
        <Route path="/admin/login"><AdminLogin /></Route>
        <Route path="/admin"><AdminDashboard /></Route>
        <Route><NotFound /></Route>
      </Switch>
    </Suspense>
  );
}
