import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { HelmetProvider } from "react-helmet-async";
import { LanguageProvider } from "@/hooks/use-language";
import Home from "@/pages/Home";
import { lazy, Suspense } from "react";

// Lazy load non-critical pages
const FAQ = lazy(() => import("@/pages/FAQ"));
const Privacy = lazy(() => import("@/pages/Privacy"));
const Terms = lazy(() => import("@/pages/Terms"));
const Checkout = lazy(() => import("@/pages/Checkout"));
const JoinTeam = lazy(() => import("@/pages/JoinTeam"));
const AdminLogin = lazy(() => import("@/pages/AdminLogin"));
const AdminDashboard = lazy(() => import("@/pages/AdminDashboard"));
const UserLogin = lazy(() => import("@/pages/UserLogin"));
const UserDashboard = lazy(() => import("@/pages/UserDashboard"));
const NotFound = lazy(() => import("@/pages/not-found"));

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="animate-pulse text-foreground">جاري التحميل...</div>
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/faq">
        <Suspense fallback={<LoadingFallback />}>
          <FAQ />
        </Suspense>
      </Route>
      <Route path="/privacy">
        <Suspense fallback={<LoadingFallback />}>
          <Privacy />
        </Suspense>
      </Route>
      <Route path="/terms">
        <Suspense fallback={<LoadingFallback />}>
          <Terms />
        </Suspense>
      </Route>
      <Route path="/checkout/:plan">
        <Suspense fallback={<LoadingFallback />}>
          <Checkout />
        </Suspense>
      </Route>
      <Route path="/join-us">
        <Suspense fallback={<LoadingFallback />}>
          <JoinTeam />
        </Suspense>
      </Route>
      <Route path="/login">
        <Suspense fallback={<LoadingFallback />}>
          <UserLogin />
        </Suspense>
      </Route>
      <Route path="/dashboard">
        <Suspense fallback={<LoadingFallback />}>
          <UserDashboard />
        </Suspense>
      </Route>
      <Route path="/admin/login">
        <Suspense fallback={<LoadingFallback />}>
          <AdminLogin />
        </Suspense>
      </Route>
      <Route path="/admin">
        <Suspense fallback={<LoadingFallback />}>
          <AdminDashboard />
        </Suspense>
      </Route>
      <Route>
        <Suspense fallback={<LoadingFallback />}>
          <NotFound />
        </Suspense>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <HelmetProvider>
      <LanguageProvider>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </QueryClientProvider>
      </LanguageProvider>
    </HelmetProvider>
  );
}

export default App;
