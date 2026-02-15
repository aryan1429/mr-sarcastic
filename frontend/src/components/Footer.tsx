import { ArrowUp, Bot, Github, Heart, Music, Twitter } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

const Footer = () => {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      {/* Scroll to top button */}
      <button
        onClick={scrollToTop}
        className={`fixed bottom-6 right-6 z-40 p-3 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/25 transition-all duration-500 hover:scale-110 hover:shadow-xl hover:shadow-primary/30 active:scale-95 ${
          showScrollTop
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-10 pointer-events-none"
        }`}
        aria-label="Scroll to top"
      >
        <ArrowUp className="h-5 w-5" />
      </button>

      <footer className="bg-card/50 backdrop-blur-xl border-t border-border mt-auto relative overflow-hidden">
        {/* Decorative gradient line at top of footer */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            {/* Brand Section */}
            <div className="space-y-4 col-span-2 sm:col-span-2 md:col-span-1">
              <div className="flex items-center space-x-3 group">
                <div className="p-2 rounded-xl bg-gradient-to-br from-primary to-accent shadow-lg glow-primary group-hover:scale-110 transition-transform duration-300">
                  <Bot className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold gradient-text">Mr Sarcastic</span>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Your sarcastic AI companion that doesn't hold back. 
                Get real talk and great music recommendations.
              </p>
              <div className="flex space-x-1">
                <a href="https://github.com/aryan1429/mr-sarcastic" target="_blank" rel="noopener noreferrer" 
                   className="p-2.5 rounded-lg hover:bg-muted hover:text-primary hover:scale-110 transition-all duration-200 touch-manipulation" aria-label="GitHub">
                  <Github className="h-4 w-4" />
                </a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"
                   className="p-2.5 rounded-lg hover:bg-muted hover:text-accent hover:scale-110 transition-all duration-200 touch-manipulation" aria-label="Twitter">
                  <Twitter className="h-4 w-4" />
                </a>
                <a href="https://spotify.com" target="_blank" rel="noopener noreferrer"
                   className="p-2.5 rounded-lg hover:bg-muted hover:text-green-500 hover:scale-110 transition-all duration-200 touch-manipulation" aria-label="Spotify">
                  <Music className="h-4 w-4" />
                </a>
              </div>
            </div>

            {/* Navigation */}
            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-sm sm:text-lg font-semibold text-foreground">Navigation</h3>
              <div className="space-y-2">
                <Link to="/" className="block text-sm text-muted-foreground hover:text-foreground hover:translate-x-1 transition-all duration-200 py-0.5">
                  Home
                </Link>
                <Link to="/chat" className="block text-sm text-muted-foreground hover:text-foreground hover:translate-x-1 transition-all duration-200 py-0.5">
                  Chatbot
                </Link>
                <Link to="/songs" className="block text-sm text-muted-foreground hover:text-foreground hover:translate-x-1 transition-all duration-200 py-0.5">
                  Songs
                </Link>
                <Link to="/profile" className="block text-sm text-muted-foreground hover:text-foreground hover:translate-x-1 transition-all duration-200 py-0.5">
                  Profile
                </Link>
              </div>
            </div>

            {/* Features */}
            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-sm sm:text-lg font-semibold text-foreground">Features</h3>
              <div className="space-y-2">
                <div className="text-muted-foreground text-sm hover:text-foreground transition-colors duration-200 cursor-default">Sarcastic AI Chat</div>
                <div className="text-muted-foreground text-sm hover:text-foreground transition-colors duration-200 cursor-default">Mood Detection</div>
                <div className="text-muted-foreground text-sm hover:text-foreground transition-colors duration-200 cursor-default">Music Recommendations</div>
                <div className="text-muted-foreground text-sm hover:text-foreground transition-colors duration-200 cursor-default">Personal Profiles</div>
                <div className="text-muted-foreground text-sm hover:text-foreground transition-colors duration-200 cursor-default">Chat History</div>
              </div>
            </div>

            {/* Contact */}
            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-sm sm:text-lg font-semibold text-foreground">Support</h3>
              <div className="space-y-2">
                <div className="text-muted-foreground text-sm hover:text-foreground transition-colors duration-200 cursor-default">Help Center</div>
                <div className="text-muted-foreground text-sm hover:text-foreground transition-colors duration-200 cursor-default">Documentation</div>
                <div className="text-muted-foreground text-sm hover:text-foreground transition-colors duration-200 cursor-default">Community</div>
                <div className="text-muted-foreground text-sm hover:text-foreground transition-colors duration-200 cursor-default">Bug Reports</div>
              </div>
              <p className="text-xs text-muted-foreground">
                Join thousands of users who love our sassy AI companion!
              </p>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-border">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-3 md:space-y-0">
              <div className="text-xs sm:text-sm text-muted-foreground text-center md:text-left">
                &copy; {new Date().getFullYear()} Mr Sarcastic. Made with <Heart className="inline h-3.5 w-3.5 sm:h-4 sm:w-4 text-red-500 animate-pulse" /> for music lovers and sass enthusiasts.
              </div>
              <div className="flex space-x-4 sm:space-x-6 text-xs sm:text-sm text-muted-foreground">
                <a href="/privacy" className="hover:text-foreground transition-all duration-200 hover:underline underline-offset-4">Privacy</a>
                <a href="/terms" className="hover:text-foreground transition-all duration-200 hover:underline underline-offset-4">Terms</a>
                <a href="/contact" className="hover:text-foreground transition-all duration-200 hover:underline underline-offset-4">Contact</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;