import { Bot, Github, Heart, Music, Twitter } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-card/50 backdrop-blur-xl border-t border-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
          {/* Brand Section */}
          <div className="space-y-4 col-span-2 sm:col-span-2 md:col-span-1">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-primary to-accent shadow-lg glow-primary">
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
                 className="p-2.5 rounded-lg hover:bg-muted transition-colors touch-manipulation" aria-label="GitHub">
                <Github className="h-4 w-4" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"
                 className="p-2.5 rounded-lg hover:bg-muted transition-colors touch-manipulation" aria-label="Twitter">
                <Twitter className="h-4 w-4" />
              </a>
              <a href="https://spotify.com" target="_blank" rel="noopener noreferrer"
                 className="p-2.5 rounded-lg hover:bg-muted transition-colors touch-manipulation" aria-label="Spotify">
                <Music className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-sm sm:text-lg font-semibold text-foreground">Navigation</h3>
            <div className="space-y-2">
              <Link to="/" className="block text-sm text-muted-foreground hover:text-foreground transition-colors py-0.5">
                Home
              </Link>
              <Link to="/chat" className="block text-sm text-muted-foreground hover:text-foreground transition-colors py-0.5">
                Chatbot
              </Link>
              <Link to="/songs" className="block text-sm text-muted-foreground hover:text-foreground transition-colors py-0.5">
                Songs
              </Link>
              <Link to="/profile" className="block text-sm text-muted-foreground hover:text-foreground transition-colors py-0.5">
                Profile
              </Link>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-sm sm:text-lg font-semibold text-foreground">Features</h3>
            <div className="space-y-2">
              <div className="text-muted-foreground text-sm">Sarcastic AI Chat</div>
              <div className="text-muted-foreground text-sm">Mood Detection</div>
              <div className="text-muted-foreground text-sm">Music Recommendations</div>
              <div className="text-muted-foreground text-sm">Personal Profiles</div>
              <div className="text-muted-foreground text-sm">Chat History</div>
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-sm sm:text-lg font-semibold text-foreground">Support</h3>
            <div className="space-y-2">
              <div className="text-muted-foreground text-sm">Help Center</div>
              <div className="text-muted-foreground text-sm">Documentation</div>
              <div className="text-muted-foreground text-sm">Community</div>
              <div className="text-muted-foreground text-sm">Bug Reports</div>
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
              <a href="/privacy" className="hover:text-foreground transition-colors">Privacy</a>
              <a href="/terms" className="hover:text-foreground transition-colors">Terms</a>
              <a href="/contact" className="hover:text-foreground transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;