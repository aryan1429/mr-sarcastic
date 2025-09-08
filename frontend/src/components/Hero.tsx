import chatbotMascot from "@/assets/chatbot-mascot.png";
import { Button } from "@/components/ui/button";
import { ArrowRight, MessageCircle, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-card to-background"></div>
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-primary/5 rounded-full blur-3xl animate-pulse-glow"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Text Content */}
          <div className="text-center lg:text-left space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary font-medium text-sm animate-bounce-in">
                <Sparkles className="h-4 w-4 mr-2" />
                AI-Powered Sass & Music Recommendations
              </div>
              
              <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
                Meet{" "}
                <span className="gradient-text">Mr Sarcastic</span>
                <br />
                Your Sarcastic AI Companion
              </h1>
              
              <p className="text-xl text-muted-foreground max-w-2xl">
                Get ready for brutally honest conversations and mood-based music recommendations from an AI with real f'ing personality unlike your ex
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link to="/chat">
                <Button variant="hero" size="lg" className="group">
                  <MessageCircle className="h-5 w-5 mr-2" />
                  Start Chatting
                  <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              
              <Link to="/songs">
                <Button variant="outline" size="lg" className="group">
                  Discover Music
                  <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>

            {/* Features Preview */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-8">
              <div className="text-center p-4 rounded-lg bg-card/50 backdrop-blur-sm border border-border hover:border-primary/50 transition-colors">
                <div className="text-2xl font-bold gradient-text">500+</div>
                <div className="text-sm text-muted-foreground">Sarcastic Responses</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-card/50 backdrop-blur-sm border border-border hover:border-primary/50 transition-colors">
                <div className="text-2xl font-bold gradient-text">24/7</div>
                <div className="text-sm text-muted-foreground">Mood Detection</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-card/50 backdrop-blur-sm border border-border hover:border-primary/50 transition-colors">
                <div className="text-2xl font-bold gradient-text">1000+</div>
                <div className="text-sm text-muted-foreground">Song Recommendations</div>
              </div>
            </div>
          </div>

          {/* Right Column - Mascot */}
          <div className="flex justify-center lg:justify-end">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent rounded-full blur-2xl opacity-30 animate-pulse-glow"></div>
              <img
                src={chatbotMascot}
                alt="Mr Sarcastic Mascot"
                className="relative z-10 w-80 h-80 lg:w-96 lg:h-96 object-contain animate-float"
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