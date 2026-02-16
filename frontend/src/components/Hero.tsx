import chatbotMascot from "@/assets/chatbot-mascot.png";
import { Button } from "@/components/ui/button";
import { ArrowRight, MessageCircle, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

const Hero = () => {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    // Use rAF for smoother first paint
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setMounted(true));
    });
  }, []);

  return (
    <section className="relative min-h-[85vh] sm:min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-card to-background"></div>
      
      {/* Animated Background Elements - hidden on low-power mobile */}
      <div className="absolute inset-0 overflow-hidden hidden sm:block">
        <div className="absolute top-1/4 left-1/4 w-48 sm:w-64 h-48 sm:h-64 bg-primary/10 rounded-full blur-3xl animate-float gpu-accelerated"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 sm:w-96 h-64 sm:h-96 bg-accent/10 rounded-full blur-3xl animate-float gpu-accelerated" style={{ animationDelay: "2s" }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 sm:w-80 h-60 sm:h-80 bg-primary/5 rounded-full blur-3xl animate-pulse-glow gpu-accelerated"></div>
        {/* Floating particles */}
        <div className="absolute top-[10%] right-[15%] w-2 h-2 bg-primary/30 rounded-full animate-float gpu-accelerated" style={{ animationDelay: "0.5s", animationDuration: "4s" }}></div>
        <div className="absolute top-[60%] left-[10%] w-3 h-3 bg-accent/20 rounded-full animate-float gpu-accelerated" style={{ animationDelay: "1.5s", animationDuration: "5s" }}></div>
        <div className="absolute top-[30%] right-[30%] w-1.5 h-1.5 bg-primary/40 rounded-full animate-float gpu-accelerated" style={{ animationDelay: "3s", animationDuration: "3.5s" }}></div>
        <div className="absolute bottom-[20%] left-[40%] w-2.5 h-2.5 bg-accent/25 rounded-full animate-float gpu-accelerated" style={{ animationDelay: "2.5s", animationDuration: "4.5s" }}></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-0">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Column - Text Content */}
          <div className="text-center lg:text-left space-y-6 sm:space-y-8">
            <div className="space-y-4">
              <div className={`inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-primary/10 border border-primary/20 text-primary font-medium text-xs sm:text-sm ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}
                style={{
                  transitionProperty: "transform, opacity",
                  transitionDuration: "700ms",
                  transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)",
                }}
              >
                <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2 animate-breathe" />
                AI-Powered Sass & Music
              </div>
              
              <h1 className={`text-4xl sm:text-5xl lg:text-7xl font-bold leading-[1.1] tracking-tight ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
                style={{
                  transitionProperty: "transform, opacity",
                  transitionDuration: "700ms",
                  transitionDelay: "200ms",
                  transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
                }}
              >
                Meet{" "}
                <span className="gradient-text bg-[length:200%_auto] animate-shimmer">Mr Sarcastic</span>
                <br />
                <span className={`text-3xl sm:text-4xl lg:text-5xl text-muted-foreground font-semibold inline-block ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
                  style={{
                    transitionProperty: "transform, opacity",
                    transitionDuration: "700ms",
                    transitionDelay: "300ms",
                    transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
                  }}
                >
                  Your Sarcastic AI Companion
                </span>
              </h1>
              
              <p className={`text-base sm:text-xl text-muted-foreground max-w-2xl mx-auto lg:mx-0 leading-relaxed ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
                style={{
                  transitionProperty: "transform, opacity",
                  transitionDuration: "700ms",
                  transitionDelay: "400ms",
                  transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
                }}
              >
                Get ready for brutally honest conversations and mood-based music recommendations from an AI with real f'ing personality unlike your ex
              </p>
            </div>

            <div className={`flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
              style={{
                transitionProperty: "transform, opacity",
                transitionDuration: "700ms",
                transitionDelay: "500ms",
                transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)",
              }}
            >
              <Link to="/chat">
                <Button variant="hero" size="lg" className="group w-full sm:w-auto text-base touch-manipulation">
                  <MessageCircle className="h-5 w-5 mr-2 group-hover:animate-wiggle" />
                  Start Chatting
                  <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1.5 transition-transform duration-300" />
                </Button>
              </Link>
              
              <Link to="/songs">
                <Button variant="outline" size="lg" className="group w-full sm:w-auto text-base touch-manipulation">
                  Discover Music
                  <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1.5 transition-transform duration-300" />
                </Button>
              </Link>
            </div>

            {/* Features Preview */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4 pt-6 sm:pt-8">
              <div className={`text-center p-3 sm:p-4 rounded-xl glass-card hover:border-primary/50 hover-lift ${mounted ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'}`}
                style={{
                  transitionProperty: "transform, opacity",
                  transitionDuration: "600ms",
                  transitionDelay: "600ms",
                  transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)",
                }}
              >
                <div className="text-xl sm:text-2xl font-bold gradient-text">500+</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Sarcastic Responses</div>
              </div>
              <div className={`text-center p-3 sm:p-4 rounded-xl glass-card hover:border-primary/50 hover-lift ${mounted ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'}`}
                style={{
                  transitionProperty: "transform, opacity",
                  transitionDuration: "600ms",
                  transitionDelay: "700ms",
                  transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)",
                }}
              >
                <div className="text-xl sm:text-2xl font-bold gradient-text">24/7</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Mood Detection</div>
              </div>
              <div className={`text-center p-3 sm:p-4 rounded-xl glass-card hover:border-primary/50 hover-lift ${mounted ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'}`}
                style={{
                  transitionProperty: "transform, opacity",
                  transitionDuration: "600ms",
                  transitionDelay: "800ms",
                  transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)",
                }}
              >
                <div className="text-xl sm:text-2xl font-bold gradient-text">1000+</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Song Picks</div>
              </div>
            </div>
          </div>

          {/* Right Column - Mascot */}
          <div className={`flex justify-center lg:justify-end order-first lg:order-last ${mounted ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}
            style={{
              transitionProperty: "transform, opacity",
              transitionDuration: "1000ms",
              transitionDelay: "300ms",
              transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)",
            }}
          >
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent rounded-full blur-2xl opacity-20 sm:opacity-30 animate-pulse-glow gpu-accelerated group-hover:opacity-40"
                style={{
                  transitionProperty: "opacity",
                  transitionDuration: "500ms",
                }}
              ></div>
              <img
                src={chatbotMascot}
                alt="Mr Sarcastic Mascot"
                className="relative z-10 w-48 h-48 sm:w-72 sm:h-72 lg:w-96 lg:h-96 object-contain animate-float gpu-accelerated drop-shadow-2xl"
                style={{
                  transitionProperty: "transform",
                  transitionDuration: "500ms",
                  transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)",
                }}
                loading="eager"
                fetchPriority="high"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-card to-transparent"></div>
    </section>
  );
};

export default Hero;