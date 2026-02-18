import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { MusicPlayerProvider } from "./context/MusicPlayerContext";
import { lazy, Suspense } from "react";
import { Loader2 } from "lucide-react";

// Eagerly loaded (critical path)
import ProtectedRoute from "./components/ProtectedRoute";
import AuthCallback from "./pages/AuthCallback";
import MiniPlayer from "./components/MiniPlayer";

// Lazy loaded (code-split) for better initial bundle size
const Chat = lazy(() => import("./pages/Chat"));
const Index = lazy(() => import("./pages/Index"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Profile = lazy(() => import("./pages/Profile"));
const Songs = lazy(() => import("./pages/Songs"));

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="text-center space-y-4">
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin mx-auto" />
        <div className="absolute inset-0 w-12 h-12 rounded-full mx-auto animate-pulse-glow" />
      </div>
      <div className="space-y-2">
        <p className="text-sm font-medium text-foreground animate-pulse">Loading...</p>
        <p className="text-xs text-muted-foreground">Preparing your experience</p>
      </div>
    </div>
  </div>
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (was cacheTime)
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <MusicPlayerProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                {/* Auth route that handles both regular auth and OAuth callback */}
                <Route path="/auth" element={<AuthCallback />} />
                
                {/* Protected routes - require authentication */}
                <Route path="/" element={
                  <ProtectedRoute>
                    <Index />
                  </ProtectedRoute>
                } />
                <Route path="/chat" element={
                  <ProtectedRoute>
                    <Chat />
                  </ProtectedRoute>
                } />
                <Route path="/songs" element={
                  <ProtectedRoute>
                    <Songs />
                  </ProtectedRoute>
                } />
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } />
                
                {/* Redirect old login/signup routes to auth */}
                <Route path="/login" element={<AuthCallback />} />
                <Route path="/signup" element={<AuthCallback />} />
                
                {/* Catch-all route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
            <MiniPlayer />
          </BrowserRouter>
        </TooltipProvider>
        </MusicPlayerProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
