import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Github, Twitter, Music, Bot, Heart } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-card/50 backdrop-blur-lg border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
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
            <div className="flex space-x-2">
              <Button variant="ghost" size="icon" asChild>
                <a href="https://github.com" target="_blank" rel="noopener noreferrer">
                  <Github className="h-4 w-4" />
                </a>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
                  <Twitter className="h-4 w-4" />
                </a>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <a href="https://spotify.com" target="_blank" rel="noopener noreferrer">
                  <Music className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>

          {/* Navigation */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Navigation</h3>
            <div className="space-y-2">
              <Link to="/" className="block text-muted-foreground hover:text-foreground transition-colors">
                Home
              </Link>
              <Link to="/chat" className="block text-muted-foreground hover:text-foreground transition-colors">
                Chatbot
              </Link>
              <Link to="/songs" className="block text-muted-foreground hover:text-foreground transition-colors">
                Songs
              </Link>
              <Link to="/profile" className="block text-muted-foreground hover:text-foreground transition-colors">
                Profile
              </Link>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Features</h3>
            <div className="space-y-2">
              <div className="text-muted-foreground text-sm">Sarcastic AI Chat</div>
              <div className="text-muted-foreground text-sm">Mood Detection</div>
              <div className="text-muted-foreground text-sm">Music Recommendations</div>
              <div className="text-muted-foreground text-sm">Personal Profiles</div>
              <div className="text-muted-foreground text-sm">Chat History</div>
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Get Started</h3>
            <div className="space-y-3">
              <Link to="/auth/signup">
                <Button variant="outline" className="w-full">
                  Sign Up Free
                </Button>
              </Link>
              <Link to="/auth/login">
                <Button variant="ghost" className="w-full">
                  Login
                </Button>
              </Link>
            </div>
            <p className="text-xs text-muted-foreground">
              Join thousands of users who love our sassy AI companion!
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-muted-foreground">
              © 2024 Mr Sarcastic. Made with <Heart className="inline h-4 w-4 text-red-500" /> for music lovers and sass enthusiasts.
            </div>
            <div className="flex space-x-6 text-sm text-muted-foreground">
              <a href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</a>
              <a href="/terms" className="hover:text-foreground transition-colors">Terms of Service</a>
              <a href="/contact" className="hover:text-foreground transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;