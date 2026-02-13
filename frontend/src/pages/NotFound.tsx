import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft, Bot } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-card to-background px-4">
      <div className="text-center max-w-md mx-auto space-y-6">
        {/* Animated mascot */}
        <div className="relative mx-auto w-24 h-24">
          <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-pulse-glow" />
          <div className="relative w-24 h-24 rounded-full bg-card border-2 border-primary/30 flex items-center justify-center animate-float">
            <Bot className="w-12 h-12 text-primary" />
          </div>
        </div>
        
        {/* Error code */}
        <div>
          <h1 className="text-8xl sm:text-9xl font-bold gradient-text leading-none">404</h1>
          <div className="h-1 w-16 mx-auto mt-4 bg-gradient-to-r from-primary to-accent rounded-full" />
        </div>
        
        {/* Message */}
        <div className="space-y-2">
          <h2 className="text-xl sm:text-2xl font-semibold text-foreground">
            Even my sarcasm can't find this page
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base">
            The page <code className="px-2 py-0.5 rounded bg-muted text-xs">{location.pathname}</code> doesn't exist. 
            Maybe it ran away from my roasts.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Button
            variant="default"
            size="lg"
            className="group"
            onClick={() => navigate("/")}
          >
            <Home className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
